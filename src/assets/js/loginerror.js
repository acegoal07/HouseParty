globalThis.addEventListener('load', () => {
   switch (new URLSearchParams(globalThis.location.search).get('error')) {
      case 'unknown':
         document.querySelector('div#unknown-error').classList.remove('hide');
         break;
      case 'rateLimitReached':
         document.querySelector('div#rate-limit-reached-error').classList.remove('hide');
         break;
      case 'notAuthorised':
         document.querySelector('div#not-authorised-error').classList.remove('hide');
         break;
      case 'premiumAccountRequired':
         document.querySelector('div#premium-account-required-error').classList.remove('hide');
         break;
      default:
         globalThis.location.href = './';
         return;
   }
   document.querySelector('div#loading-icon').classList.add('hide');
});