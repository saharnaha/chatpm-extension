chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Execute a content script to get the content of the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: function () {
          // Capture the content of the current tab's page
          var pageContent = document.documentElement.innerHTML;

          function extractDOCSModelChunk(text) {
            // Define a regular expression to match the DOCS_modelChunk variable
            const regex = /DOCS_modelChunk = (\[.*?\]);/s;
            
            // Use the regular expression to find the variable content
            const match = regex.exec(text);
          
            if (match && match[1]) {
              // Parse the JSON content of the variable
              const modelChunk = JSON.parse(match[1]);
              return modelChunk;
            } else {
              // Return null if the variable content is not found
              return null;
            }
          }

          // Send the content back to the extension popup
          chrome.runtime.sendMessage({ content: pageContent, parsed: extractDOCSModelChunk(pageContent) });
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


  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.parsed) {
      // Log or process the page content as needed
       console.log(message.parsed);
    }
  });