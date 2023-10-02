chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "logDocument" });
  });

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "logDocument") {
      // Get the current document of the active tab's page
      var currentDocument = document;
  
      // Log the document to the console
      console.log(currentDocument);
    }
  });