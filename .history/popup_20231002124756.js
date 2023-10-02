chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Execute a content script to get the content of the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: function () {
          // Capture the content of the current tab's page
          var pageContent = document.documentElement.outerHTML;
  
          // Send the content back to the extension popup
          chrome.runtime.sendMessage({ content: pageContent });
        },
      },
      function (result) {
        // Handle any errors if needed
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      }
    );
  });