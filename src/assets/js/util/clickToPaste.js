document.addEventListener('DOMContentLoaded', () => {
   if (navigator.clipboard?.readText) {
      for (const target of document.querySelectorAll('.click-to-paste')) {
         target.classList.remove('hide');
         target.addEventListener('click', () => {
            navigator.clipboard.readText()
               .then(pasteData => {
                  pasteData = pasteData.trim();

                  if (!pasteData || pasteData == '') {
                     return;
                  }

                  const pasteTarget = document.querySelector(`#${target.dataset.pasteTarget}`);
                  if ('value' in target) {
                     pasteTarget.value = pasteData;
                  } else {
                     pasteTarget.innerHTML = pasteData;
                  }
               });
         });
      }
   }
});