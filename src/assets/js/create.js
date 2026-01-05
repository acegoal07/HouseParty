// Imports
import '@/assets/js/util/modalHandler.js';

// Initialize variables
let loadingIcon;
let partyDurationInput;
let explicitCheckbox;
let duplicateBlockerCheckbox;

// Set up EventSource listeners
const eventSource = new EventSource('api/v2/user/sse/sessionInfo.php?datalevel=minimal', { withCredentials: true });

eventSource.addEventListener('init', event => {
   const data = JSON.parse(event.data);
   if (data.active_party) {
      globalThis.location.href = './dashboard.html';
      return;
   }
   loadingIcon.classList.add('hide');
});

eventSource.addEventListener('invalidSessionId', () => {
   globalThis.location.href = './';
});

eventSource.addEventListener('noSessionId', () => {
   globalThis.location.href = './';
});

eventSource.addEventListener('partyUpdate', event => {
   const data = JSON.parse(event.data);

   if (data.type === 'partyStatusChange' && data.active_party) {
      globalThis.location.href = './dashboard.html';
   }
});

globalThis.addEventListener('load', () => {
   // Get DOM elements
   loadingIcon = document.querySelector("#loading-icon");
   partyDurationInput = document.querySelector("#party-duration");
   explicitCheckbox = document.querySelector("#explicit-checkbox");
   duplicateBlockerCheckbox = document.querySelector("#duplicate-blocker-checkbox");

   // Handle Create Party Form submission
   document.querySelector("form#create-party").addEventListener("submit", (event) => {
      event.preventDefault();
      loadingIcon.classList.remove("hide");
      fetch(`api/v2/party/createParty.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            party_ends_in: partyDurationInput.value,
            explicit: explicitCheckbox.checked,
            duplicate_blocker: duplicateBlockerCheckbox.checked
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               globalThis.location.href = `./dashboard.html`;
            } else {
               if (data.error.type === 'unauthorized') {
                  globalThis.location.href = `./`;
                  return;
               }

               document.dispatchEvent(new CustomEvent('openModal', {
                  detail: {
                     target: data.error.type === 'rateLimitReached' ? 'too-many-requests-modal' : 'unknown-error-modal'
                  }
               }));
            }
         })
         .catch(error => {
            console.error('Create Party Error:', error);
         });
   });
});