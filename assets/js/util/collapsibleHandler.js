window.addEventListener("load", () => {
   document.querySelectorAll('.collapsible-item').forEach((item) => {
      item.addEventListener('click', (event) => {
         if (item.classList.contains('open') && (event.target.classList.contains('collapsible-item') || event.target.classList.contains('collapsible-title') || event.target.classList.contains('collapsible-icon'))) {
            item.classList.remove('open');
         } else {
            item.classList.add('open');
         }
      });
   });
});