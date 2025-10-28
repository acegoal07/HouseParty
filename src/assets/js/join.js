//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let pollingInterval;
let loadingIcon;

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   fetch(`api/website/database.php?${new URLSearchParams({
      type: 'validateSession'
   })}`);
}

function startPolling() {
   pollingFunction();
   pollingInterval = setInterval(pollingFunction, 1000);
}

function stopPolling() {
   clearInterval(pollingInterval);
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon = document.querySelector('div#loading-icon');

   //////////////// Page polling ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   //////////////// Join Form //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

      fetch(`api/website/database.php?type=validateParty&party_id=${partyCode}`, {
         method: 'GET'
      })
         .then(response => response.json())
         .then(data => {
            if (data.party_exists) {
               globalThis.location.href = `party.html?session_code=${partyCode}`;
            } else {
               noPartyFoundError.classList.remove('hide');
            }
            loadingIcon.classList.add("hide");
         })
         .catch(error => {
            console.error('Join Error:', error);
         });
      PartyCodeInput.value = '';
   });

   /////////////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });
});