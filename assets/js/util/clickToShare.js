window.addEventListener('load', () => {
   document.querySelectorAll('.click-to-share').forEach((button) => {
      if (!navigator.userAgent.includes('Mobile')) {
         button.classList.add('hidden');
      }

      button.addEventListener('click', () => {
         navigator.share({
            title: 'House Party',
            text: 'Join my party on House Party!',
            url: button.getAttribute('data-party-url')
         })
            .catch((error) => {
               console.error('Error sharing:', error);
            });
      });
   });
});