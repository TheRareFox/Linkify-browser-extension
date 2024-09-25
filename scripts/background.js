chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension installed");
  });

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getResume") {
    getResume().then(resume => {
      sendResponse({resume: resume});
    });
    return true;  // Will respond asynchronously
  }
  else if (request.action === "storeResume") {
    storeResume(request.resume);
  }
  else if (request.action === "getJobDescription") {
    getJobDescription().then(jobDescription => {
      sendResponse({jobDescription: jobDescription});
    });
    return true;  // Will respond asynchronously
  }
});

// Function to get resume data from storage
function getResume() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userResume'], function(result) {
      resolve(result.userResume);
    });
  });
}


// Function to store resume data in storage
function storeResume(resume) {
  chrome.storage.local.set({userResume: resume});
}

// Function to get job description from storage
function getJobDescription() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['jobDescription'], function(result) {
      resolve(result.jobDescription);
    });
  });
}