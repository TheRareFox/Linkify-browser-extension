
// Function to get resume data from background script
function getResumeData() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({action: "getResume"}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.resume);
      }
    });
  });
}

// Function to get job description from background script
function getJobDescription() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({action: "getJobDescription"}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.jobDescription);
      }
    }
    );
  });
}

// Function to store resume data in background script
function storeResume(resume) {
  chrome.runtime.sendMessage({action: "storeResume", resume: resume});
}

document.addEventListener('DOMContentLoaded', function() {
  
  document.getElementById('fillForm').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      console.log("Fill form requested");
      chrome.tabs.sendMessage(tabs[0].id, {action: "fillForm"});
    });
  });

  const resumeData = getResumeData();

  for (const key in resumeData) {
    if (resumeData.hasOwnProperty(key)) {
      localStorage.setItem(key, resumeData[key]);
    }
  }

  const autofillButton = document.getElementById('autofillButton');
  const jobDescriptionButton = document.getElementById('jobDescriptionButton');
  const profileButton = document.getElementById('profileButton');
  const editprofileButton = document.getElementById('editProfile');
  
  const autofillView = document.getElementById('autofill');
  const jobDescriptionView = document.getElementById('jobDescription');
  const profileView = document.getElementById('profile');
  const editProfileView = document.getElementById('profileForm');
  
  autofillButton.addEventListener('click', function() {
    showView(autofillView);
  });
  
  jobDescriptionButton.addEventListener('click', function() {
    showView(jobDescriptionView);

  });
  
  profileButton.addEventListener('click', function() {
    showView(profileView);
    displayProfile();
  });

  editprofileButton.addEventListener('click', function() {
    showEdit(editProfileView);
  });

  
  function showView(view) {
    // Hide all views
    autofillView.style.display = 'none';
    jobDescriptionView.style.display = 'none';
    profileView.style.display = 'none';
    
    // Show the selected view
    view.style.display = 'block';
  }

  function showEdit(view) {
    if (view.style.display === 'none') {
      view.style.display = 'block';
      const name = localStorage.getItem('profileName');
      const email = localStorage.getItem('profileEmail');
      const phone = localStorage.getItem('profilePhone');
      document.getElementById('name').value = name;
      document.getElementById('email').value = email;
      document.getElementById('phone').value = phone;    
    } else {
      view.style.display = 'none';
    }
  }

  // Handle profile form submission
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Store profile information in local storage
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('phone', phone);

    // Display the stored profile
    displayProfile();
  });

  function displayProfile() {

    if (name || email || phone) {
      document.getElementById('profileForm').style.display = 'none';
      document.getElementById('profileDisplay').style.display = 'block';
      document.getElementById('profileName').textContent = localStorage.getItem('name');
      document.getElementById('profileEmail').textContent = localStorage.getItem('email');
      document.getElementById('profilePhone').textContent = localStorage.getItem('phone');
      document.getElementById('profileCountry').textContent = localStorage.getItem('country');
      document.getElementById('profileAddress').textContent = localStorage.getItem('address');
      document.getElementById('profileSummary').textContent = localStorage.getItem('summary');
      document.getElementById('profileResume').textContent = localStorage.getItem('resume');
    } else {
      document.getElementById('profileForm').style.display = 'block';
      document.getElementById('profileDisplay').style.display = 'none';
    }
  }

// Initial display of profile if already stored
displayProfile();
});