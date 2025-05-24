window.addEventListener('DOMContentLoaded', () => {
   // Ignore the button if the share API is not supported
   if (navigator.userAgent.includes('Mobile') && typeof navigator.share !== 'undefined') {
      // Loop through all elements with the class 'click-to-share'
      document.querySelectorAll('.click-to-share').forEach((button) => {
         button.classList.remove('hide');
         button.addEventListener('click', () => {
            navigator.share({
               title: button.getAttribute('share-title'),
               text: button.getAttribute('share-text'),
               url: button.getAttribute('share-url')
            }).catch((error) => {
               console.error('Error sharing:', error);
            });
         });
      });
   }
});