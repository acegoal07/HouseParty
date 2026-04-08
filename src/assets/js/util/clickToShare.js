document.addEventListener('DOMContentLoaded', () => {
   // Ignore the button if the share API is not supported
   if (!navigator.userAgent.includes('Mobile') && navigator.share === undefined) { return; }
   // Loop through all elements with the class 'click-to-share'
   for (const button of document.querySelectorAll('.click-to-share')) {
      button.classList.remove('hide');
      button.addEventListener('click', () => {
         navigator.share({
            title: button.dataset.shareTitle,
            text: button.dataset.shareText,
            url: button.dataset.shareUrl
         }).catch(error => {
            console.error('Error sharing:', error);
         });
      });
   }
});