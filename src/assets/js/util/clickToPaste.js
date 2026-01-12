document.addEventListener('DOMContentLoaded', () => {
   if (navigator.clipboard?.readText) {
      for (const target of document.querySelectorAll('.click-to-paste')) {
         target.classList.remove('hide');
         target.addEventListener('click', () => {
            navigator.clipboard.readText()
               .then((pasteData) => {
                  pasteData = pasteData.trim();

                  if (!pasteData || pasteData == '') {
                     return;
                  }

                  document.querySelector(`#${target.dataset.pasteTarget}`).value = pasteData;
               });
         });
      }
   }
});