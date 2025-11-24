//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let loadingIcon;
let pollingInterval;
let noPartyFoundError;
let partyCodeInput;

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   fetch(`api/website/database.php?${new URLSearchParams({ type: 'validateSession' })}`);
}

function startPolling() {
   pollingFunction();
   pollingInterval = setInterval(pollingFunction, 1000);
}

function stopPolling() {
   clearInterval(pollingInterval);
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
globalThis.addEventListener('load', () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon = document.querySelector('div#loading-icon');
   noPartyFoundError = document.querySelector('p#no-party-found-error');
   partyCodeInput = document.querySelector('input#party-code');

   //////////////// Page polling ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   /////////////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });

   //////////////// Join Form //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('form#join-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      noPartyFoundError.classList.add('hide');
      let partyCode = partyCodeInput.value;
      event.target.reset();

      if (partyCode !== '') {
         partyCode = partyCode.trim();
      }

      if (partyCode === '') {
         noPartyFoundError.classList.remove('hide');
         loadingIcon.classList.add("hide");
         return;
      }

      fetch(`api/website/database.php?type=validateParty&party_id=${encodeURIComponent(partyCode)}`, {
         method: 'GET'
      })
         .then(response => response.json())
         .then(data => {
            if (data.party_exists) {
               globalThis.location.href = `party.html?session_code=${encodeURIComponent(partyCode)}`;
            } else {
               noPartyFoundError.classList.remove('hide');
            }
            loadingIcon.classList.add("hide");
         })
         .catch(error => {
            console.error('Join Error:', error);
            loadingIcon.classList.add("hide");
         });
   });
});