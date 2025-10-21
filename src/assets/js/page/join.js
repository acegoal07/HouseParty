import { deleteCookie, getCookie, extendCookie } from '@/assets/js/util/cookies.js';

window.addEventListener('load', () => {
   // Loading icon element
   const loadingIcon = document.querySelector('div#loading-icon');
   // Check users session id if they are logged in
   let checkInterval;
   function checkLoggedInUser() {
      if (getCookie('session_id') === null) {
         clearInterval(checkInterval);
      } else {
         const urlParams = new URLSearchParams({
            type: 'validateSession',
            session_id: `${getCookie('session_id')}`
         });
         fetch(`api/website/database.php?${urlParams}`)
            .then((response) => {
               return response.json();
            }).then((data) => {
               if (!data.validated) {
                  deleteCookie({ name: 'session_id' });
               }
               if (data.extended) {
                  extendCookie({ name: 'session_id', days: 0.5 });
               }
            }).catch(() => {
               deleteCookie({ name: 'session_id' });
               clearInterval(checkInterval);
            });
      }
   }
   if (getCookie('session_id') !== null) {
      checkLoggedInUser();
      checkInterval = setInterval(checkLoggedInUser, 1000);
   }
   // Handle Join Form Submission
   document.querySelector('form#join-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      const noPartyFoundError = document.querySelector('span#no-party-found-error');
      noPartyFoundError.classList.add('hide');
      const PartyCodeInput = event.target.querySelector('input#party-code');
      let partyCode = PartyCodeInput.value;

      if (partyCode !== '') {
         partyCode = partyCode.trim();
      }

      if (partyCode === '') {
         noPartyFoundError.classList.remove('hide');
         loadingIcon.classList.add("hide");
         PartyCodeInput.value = '';
         return;
      }

      fetch(`api/website/database.php?type=checkPartyExists&party_id=${partyCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            globalThis.location.href = `party.html?session_code=${partyCode}`;
         } else {
            noPartyFoundError.classList.remove('hide');
         }
         loadingIcon.classList.add("hide");
      }).catch(error => {
         console.error('Join Error:', error);
      });
      PartyCodeInput.value = '';
   });
});