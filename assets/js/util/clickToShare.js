window.addEventListener('DOMContentLoaded', () => {
   // Ignore the button if the share API is not supported
   if (navigator.userAgent.includes('Mobile') && typeof navigator.share !== 'undefined') {
      // Loop through all elements with the class 'click-to-share'
      document.querySelectorAll('.click-to-share').forEach((button) => {
         button.classList.remove('hide');
         button.addEventListener('click', () => {
            navigator.share({
               title: 'House Party',
               text: 'Join my party on House Party!',
               url: button.getAttribute('data-party-url')
            }).catch((error) => {
               console.error('Error sharing:', error);
            });
         });
      });
   }
});