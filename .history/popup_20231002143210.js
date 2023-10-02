chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Execute a content script to get the content of the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: function () {
          // Capture the content of the current tab's page
          var pageContent = document.documentElement.innerHTML;

          function extractPageContent(page) {
            // Define a regular expression to match all occurrences of DOCS_modelChunk variables
            const regex = /DOCS_modelChunk = (\[.*?\]);/gs;
          
            // Use the regular expression to find all variable content
            const matches = [];
            let match;
            while ((match = regex.exec(page)) !== null) {
              // Parse the JSON content of each variable and add it to the matches array
              const modelChunk = JSON.parse(match[1]);
              matches.push(modelChunk);
            }
          
            // Initialize an array to store the 's' attributes from the first objects
            const content = [];
          
            // Loop through the matches and extract 's' attributes from the first objects
            for (const modelChunk of matches) {
              if (Array.isArray(modelChunk) && modelChunk.length > 0 && modelChunk[0].s) {
                content.push(modelChunk[0].s);
              }
            }
          
            // Concatenate all the 's' attributes into a single text
            const concatenatedText = content.join(' ');
          
            // Return the concatenated string
            return concatenatedText;
          }

          // Send the content back to the extension popup
          chrome.runtime.sendMessage({ parsed: extractPageContent(pageContent) });
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