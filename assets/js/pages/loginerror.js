window.addEventListener('load', () => {
   const loadingIcon = document.querySelector('div#loading-icon');
   switch (new URLSearchParams(window.location.search).get('error')) {
      case '1':
         document.querySelector('div#main-error').classList.remove('hidden');
         loadingIcon.classList.add('hidden');
         break;
      case '2':
         document.querySelector('div#development-error').classList.remove('hidden');
         loadingIcon.classList.add('hidden');
         break;
      case '3':
         document.querySelector('div#premium-account-error').classList.remove('hidden');
         loadingIcon.classList.add('hidden');
         break;
      default:
         window.location.href = '/houseparty/';
         return;
   }
});