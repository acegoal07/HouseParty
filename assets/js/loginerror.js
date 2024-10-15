window.addEventListener('load', function () {
   const urlParams = new URLSearchParams(window.location.search);
   const errorMessage = urlParams.get('error');

   if (!errorMessage) {
      window.location.href = '/houseparty/';
   }

   if (errorMessage === '1') {
      this.document.querySelector('div#main-error').classList.remove('hidden');
   } else if (errorMessage === '2') {
      this.document.querySelector('div#development-error').classList.remove('hidden');
   } else if (errorMessage === '3') {
      this.document.querySelector('div#premium-account-error').classList.remove('hidden');
   } else {
      this.window.location.href = '/houseparty/';
   }

   this.document.querySelector('div#loading-icon').classList.add('hidden');
});