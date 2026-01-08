document.addEventListener('DOMContentLoaded', () => {
   for (const target of document.querySelectorAll('.click-to-copy')) {
      target.addEventListener('click', () => {
         const copyText = (Object.hasOwn(target.dataset, 'copyTarget') ? document.querySelector(`#${target.dataset.copyTarget}`).textContent : target.dataset.copyText).trim()
         if (copyText === '' || !copyText || target.classList.contains('copied')) {
            return;
         }

         navigator.clipboard.writeText(copyText)
            .then(() => {
               target.classList.add('copied');

               setTimeout(() => {
                  target.classList.remove('copied');
               }, 2500)
            });
      });
   }
});