// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "fillForm") {
    console.log("Filling form...");
    autoFillForm();
  }
});

// Main function to auto-fill the form
async function autoFillForm() {
  console.log('Running autoFillForm');
  const fields = document.querySelectorAll('input[type="text"], textarea');
  
  for (const field of fields) {
  const fieldType = getFieldType(field);
  console.log('Processing field:', field, 'Field type:', fieldType);
  let value = await getValueForField(fieldType);
  
  if (value !== null && value !== undefined) {
    fillField(field, value);
    addEnhanceButton(field, fieldType);
  }
  }
}

// Function to add "Enhance with AI" button
function addEnhanceButton(field, fieldType) {
  const button = document.createElement('button');
  button.textContent = 'Enhance with AI';
  button.className = 'enhance-ai-button';
  
  button.addEventListener('click', async () => {
  try {
    button.disabled = true;
    button.textContent = 'Enhancing...';
    await enhanceField(field, fieldType);
    button.textContent = 'Enhanced!';
  } catch (error) {
    console.error('Error enhancing field:', error);
    button.textContent = 'Enhancement failed';
  } finally {
    setTimeout(() => {
    button.disabled = false;
    button.textContent = 'Enhance with AI';
    }, 2000);
  }
  });

  // Insert the button after the field
  field.parentNode.insertBefore(button, field.nextSibling);
}

// Function to enhance a single field
async function enhanceField(field, fieldType) {
  const jobDescription = getJobDescription(); // Define this function below
  const currentValue = field.value;

  const prompt = `Given the job description: "${jobDescription}", 
          please revise and improve the following ${fieldType} for a job application: "${currentValue}"`;

  const enhancedValue = await callChatGPT(prompt);
  field.value = enhancedValue;
  
  // Trigger any listeners on the page
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function getJobDescription() {
  // Placeholder for job description retrieval logic
  return `At Singtel, our mission is to Empower Every Generation. We are dedicated to fostering an equitable and forward-thinking work environment where our employees experience a strong sense of Belonging, to make meaningful Impact and Grow both personally and professionally. By joining Singtel, you will be part of a caring, inclusive and diverse workforce that creates positive impact and a sustainable future for all.

  Be a Part of Something BIG! 
  
  As a Software Engineer Intern at the Consumer Business Group IT Prepaid team, your role includes crafting applications tailored for both cloud-based and data center environments to cater to web and mobile platforms. You'll leverage engineering best practices to ensure that the applications you develop uphold the highest quality standards and adhere to established development guidelines.
  
  Primarily utilizing either one of Java, ECMAScript or mobile technologies, with additional specialized services scripted in languages like Golang, and Python, you'll wield a diverse set of programming tools. Your expertise will extend to grasping service implementation methodologies, accommodating both consistent and eventually consistent data models through a mix of synchronous and asynchronous techniques.

  Beyond coding proficiency, you'll possess a keen understanding of resource optimization and concurrency principles. Your contributions will extend to the design, development, and upkeep of robust, scalable backend systems and services. Whether in the cloud or on-premises, you'll navigate modern solutions and architectural paradigms to ensure optimal functionality and performance across software applications.
  
  Make an Impact by:
    Develop the applications according to the instruction and design
    Support development testing, deployment and production
  Skills for Success:
    Currently pursuing a Degree in Computer Science, Computer Engineering, Information Technology, Information Systems, Software Engineering, or related areas
    Familiarity with Modern Java, ECMAScript (JavaScript / TypeScript), Spring Framework, React / React Native, Build Tools, Unit Test
    Knowledge in ticking systems, documentation systems, testing methodologies
    Good communication skills, take ownership, able to work in teams;`;
}

// Determine the type of field based on its attributes
function getFieldType(field) {
  const name = field.name.toLowerCase();
  const id = field.id.toLowerCase();
  const type = field.type.toLowerCase();

  if (type === 'text' || field.tagName === 'TEXTAREA') {
    if (name.includes('name') || id.includes('name')){
      if (name.includes('First') || id.includes('firstname')) return 'firstname';
      if (name.includes('Last') || id.includes('lastname')) return 'lastname';
      return 'name';
    } 
    if (name.includes('email') || id.includes('email')) return 'email';
    if (name.includes('country') || id.includes('country')) return 'country';
    if (name.includes('phone') || id.includes('phone')) return 'phone';
    if (name.includes('contact') || id.includes('contact')) return 'phone';
    if (name.includes('address') || id.includes('address')) return 'address';
    if (name.includes('summary') || id.includes('summary') || name.includes('objective') || id.includes('objective')) return 'summary';
  }

  if (type === 'select-one') {
    if (name.includes('country') || id.includes('country')) return 'country';
    // Add more cases for other select fields
  }
  
  if (type === 'file' && (name.includes('resume') || id.includes('resume'))) return 'resume';
    
  return 'unknown';
}

function getResume() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({action: "getResume"}, (response) => {
      resolve(response.resume);
    });
  });
}

// Get the appropriate value for each field type
async function getValueForField(fieldType) {
  const resumeData = await getResume();
  return resumeData[fieldType] || null;
}
// Fill the field with the provided value
function fillField(field, value) {
  if (field.tagName === 'SELECT') {
    // For select fields, find the option that best matches the value
    const options = Array.from(field.options);
    const bestMatch = options.reduce((prev, curr) => {
      return (curr.text.toLowerCase().includes(value.toLowerCase())) ? curr : prev;
    });
    field.value = bestMatch.value;
  } else if (field.type === 'file') {
    // For file fields, we can't set the value directly, so we dispatch a change event
    field.dispatchEvent(new Event('change', { bubbles: true }));

  } else {
    field.value = value;
  }

  // Dispatch an input event to trigger any listeners on the page
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

