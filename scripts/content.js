chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fillForm") {
      // This is where you'll add logic to fill the form
      console.log("Auto-fill requested");
    }
  });