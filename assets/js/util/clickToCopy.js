document.addEventListener('load', () => {
   const copyButtons = document.querySelectorAll('.click-to-copy, .click-to-copy-target');

   copyButtons.forEach(button => {
      button.addEventListener('click', () => {
         if (document.querySelector('div.copy-toast') !== null) {
            return;
         }

         let copyText = '';
         if (button.classList.contains('click-to-copy-target')) {
            const targetId = button.getAttribute('copy-target');
            const targetElement = document.getElementById(targetId);
            copyText = targetElement ? targetElement.textContent : '';
         } else {
            copyText = button.getAttribute('copy-data');
         }

         if (copyText) {
            navigator.clipboard.writeText(copyText).then(() => {
               showCopyMessage();
            }).catch(err => {
               console.error('Failed to copy: ', err);
            });
         }
      });
   });

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