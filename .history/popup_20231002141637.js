chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Execute a content script to get the content of the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: function () {
          // Capture the content of the current tab's page
          var pageContent = document.documentElement.innerHTML;

          function extractAllDOCSModelChunks(text) {
            // Define a regular expression to match all occurrences of DOCS_modelChunk variables
            const regex = /DOCS_modelChunk = (\[.*?\]);/gs;
          
            // Use the regular expression to find all variable content
            const matches = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
              // Parse the JSON content of each variable and add it to the matches array
              const modelChunk = JSON.parse(match[1]);
              matches.push(modelChunk);
            }
          
            // Return an array of all matched DOCS_modelChunk data
            return matches;
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
       console.log("parsed: ", message.parsed);
    }
  });