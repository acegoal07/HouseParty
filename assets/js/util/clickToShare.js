window.addEventListener('load', () => {
   // Loop through all elements with the class 'click-to-share'
   document.querySelectorAll('.click-to-share').forEach((button) => {
      // If the user agent is not a mobile device or the share API is not supported, hide the button
      if (!navigator.userAgent.includes('Mobile') && typeof navigator.share === 'undefined') {
         button.classList.add('hidden');
      }
      // Otherwise, add an event listener to the button that shares the party URL
      else {
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
      }
   });
});