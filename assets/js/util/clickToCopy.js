document.addEventListener('DOMContentLoaded', () => {
   // Loop through all elements with the class 'click-to-copy' or 'click-to-copy-target'
   document.querySelectorAll('.click-to-copy, .click-to-copy-target').forEach(button => {
      // Add an event listener to the button that copies the text to the clipboard
      button.addEventListener('click', () => {
         // Get the text to copy based on the button's class
         let copyText = '';
         if (button.classList.contains('click-to-copy-target')) {
            const targetId = button.getAttribute('copy-target');
            const targetElement = document.getElementById(targetId);
            copyText = targetElement ? targetElement.textContent : '';
         } else {
            copyText = button.getAttribute('copy-data');
         }
         // Remove any leading or trailing whitespace
         copyText = copyText.trim();
         // If the text exists, copy it to the clipboard and show a copy message
         if (copyText !== '' && copyText) {
            navigator.clipboard.writeText(copyText).then(() => {
               if (!document.querySelector('div.copy-toast')) {
                  showCopyMessage();
               }
            }).catch(error => {
               console.error('Failed to copy: ', error);
            });
         }
      });
   });

   /**
    * showCopyMessage
    * Creates a message element and appends it to the body to indicate that the text has been copied
    */
   function showCopyMessage() {
      const message = document.createElement('div');
      message.className = 'copy-toast';
      message.textContent = 'Copied!';
      document.body.appendChild(message);

      setTimeout(() => {
         message.remove();
      }, 2500);
   }
});