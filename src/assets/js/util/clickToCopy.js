document.addEventListener('DOMContentLoaded', () => {
   // Get and loop through all instances of click to copy
   for (const target of document.querySelectorAll('.click-to-copy')) {
      // Add click event listener to click to copy targets
      target.addEventListener('click', () => {
         // Get click to copy data either from target or attributes
         const copyText = (Object.hasOwn(target.dataset, 'copyTarget') ? document.querySelector(`#${target.dataset.copyTarget}`).textContent : target.dataset.copyText).trim();
         // If copy text is empty or copied attribute has already been added to the click to copy ignore click
         if (copyText === '' || !copyText || target.classList.contains('copied')) {
            return;
         }

         // Copy data to clipboard
         navigator.clipboard.writeText(copyText)
            .then(() => {
               // Add copied class
               target.classList.add('copied');

               // Wait for animation to finish and then remove copied class
               setTimeout(() => {
                  target.classList.remove('copied');
               }, 2500)
            });
      });
   }
});