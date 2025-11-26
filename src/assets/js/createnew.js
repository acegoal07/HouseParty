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
      return globalThis.location.href = './dashboard.html';
   }
   loadingIcon.classList.add('hide');
});

eventSource.addEventListener('partyStatusChange', event => {
   const data = JSON.parse(event.data);
   if (data.active_party) {
      return globalThis.location.href = './dashboard.html';
   }
});

eventSource.addEventListener('invalidSessionId', () => {
   return globalThis.location.href = './';
});

eventSource.addEventListener('noSessionId', () => {
   return globalThis.location.href = './';
});

globalThis.addEventListener('load', () => {
   // Get DOM elements
   loadingIcon = document.getElementById("loading-icon");
   partyDurationInput = document.getElementById("party-duration");
   explicitCheckbox = document.getElementById("explicit-checkbox");
   duplicateBlockerCheckbox = document.getElementById("duplicate-blocker-checkbox");

   // Handle Create Party Form submission
   document.querySelector("form#create-party").addEventListener("submit", (event) => {
      event.preventDefault();
      loadingIcon.classList.remove("hide");

      fetch(`api/v1/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'createParty',
            party_ends_in: partyDurationInput.value,
            explicit: explicitCheckbox.checked ? 1 : 0,
            duplicate_blocker: duplicateBlockerCheckbox.checked ? 1 : 0
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               event.target.reset();
               return globalThis.location.href = `./dashboard.html`;
            } else {
               loadingIcon.classList.add("hide");
            }
         })
         .catch(error => {
            console.error('Create Party Error:', error);
         });
   });
});