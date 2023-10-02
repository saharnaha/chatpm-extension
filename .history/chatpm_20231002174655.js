
function injectIfram(iframeId) {
  // remove welcome container first
  const welcomeContainer = document.getElementById('welcome-container');
  if (welcomeContainer) {
    welcomeContainer.style.display = 'none';
  }

  // Create a new iframe element
  const iframe = document.createElement('iframe');

  // Set the src attribute of the iframe
  iframe.src = `https://www.chatbase.co/chatbot-iframe/${iframeId}`;
  iframe.className = 'chat-iframe'
  // Optionally, set other attributes or styles for the iframe as needed
  iframe.frameborder = '0'; // Remove iframe border

  // Append the iframe to a container element in your document
  document.body.appendChild(iframe);
}

// Function to fetch content and update the iframe
function fetchContentAndSetIframe() {
  // Fetch content and perform API request as before
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Execute a content script to get the content of the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: function () {
          // Capture the content of the current tab's page
          var pageContent = document.documentElement.innerHTML;

          function extractPageContent(pageContent) {
            // Define a regular expression to match all occurrences of DOCS_modelChunk variables
            const regex = /DOCS_modelChunk = (\[.*?\]);/gs;
          
            // Use the regular expression to find all variable content
            const matches = [];
            let match;
            while ((match = regex.exec(pageContent)) !== null) {
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
            return { text: concatenatedText, title: document.title };
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
}
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.parsed) {
      // Log or process the page content as needed
      const apiUrl = 'https://f5de-212-235-51-193.ngrok-free.app/chatbot/create';
      const url = sender.tab.url;
      const docIdMatch = url.match(/\/d\/([^/]+)/);
      const docId = docIdMatch ? docIdMatch[1] : '';

      const requestData = {
        chatbotName: message.parsed.title,
        sourceText: message.parsed.text,
        specId: docId
      };

      console.log('sending request with body: ', requestData);
  
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('POST request successful:', data);

          injectIfram(data.id);
        })
        .catch((error) => {
          console.error('Error making POST request:', error);
        });
    }
  });

const fetchContentButton = document.getElementById('fetchContentButton');
fetchContentButton.addEventListener('click', fetchContentAndSetIframe);