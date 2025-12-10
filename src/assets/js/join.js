// Initialize variables
let loadingIcon;
let noPartyFoundError;
let partyCodeInput;

// Set up EventSource listeners 
const eventSource = new EventSource('api/v2/user/sse/sessionInfo.php', { withCredentials: true });

eventSource.addEventListener('init', () => {
   loadingIcon.classList.add('hide');
});

eventSource.addEventListener('invalidSessionId', () => {
   eventSource.close();
});

eventSource.addEventListener('noSessionId', () => {
   loadingIcon.classList.add('hide');
   eventSource.close();
});

globalThis.addEventListener('load', () => {
   // Get DOM elements
   loadingIcon = document.querySelector('div#loading-icon');
   noPartyFoundError = document.querySelector('p#no-party-found-error');
   partyCodeInput = document.querySelector('input#party-code');

   // Handle Join Form submission
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

      fetch(`api/v2/party/partyExists.php?party_id=${encodeURIComponent(partyCode)}`, {
         method: 'GET'
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               if (data.party_exists) {
                  return globalThis.location.href = `party.html?party_id=${encodeURIComponent(partyCode)}`;
               } else {
                  noPartyFoundError.classList.remove('hide');
               }
            }
            loadingIcon.classList.add("hide");
         })
         .catch(error => {
            console.error('Join Error:', error);
            loadingIcon.classList.add("hide");
         });
   });

});