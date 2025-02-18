window.addEventListener('load', () => {
   const loadingIcon = document.querySelector('div#loading-icon');
   switch (new URLSearchParams(window.location.search).get('')) {
      case '1':
         document.querySelector('div#main-error').classList.remove('hide');
         loadingIcon.classList.add('hide');
         break;
      case '2':
         document.querySelector('div#development-error').classList.remove('hide');
         loadingIcon.classList.add('hide');
         break;
      case '3':
         document.querySelector('div#premium-account-error').classList.remove('hide');
         loadingIcon.classList.add('hide');
         break;
      case '4':
         document.querySelector('div#request-limit-error').classList.remove('hide');
         loadingIcon.classList.add('hide');
         break;
      default:
         window.location.href = './';
         return;
   }
});