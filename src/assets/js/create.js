//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let loadingIcon;
let pollingInterval;
let partyDurationInput;
let explicitCheckbox;
let duplicateBlockerCheckbox;

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   // Check if the party exists, retrieve the required data and validate the user session
   fetch(`api/website/database.php?${new URLSearchParams({
      type: 'validateSession',
      partial_data: 'true'
   })}`, {
      method: 'GET'
   })
      .then(response => response.json())
      .then(data => {
         if (!data.validated) { return globalThis.location.href = './'; }
         if (data.active_party) { return globalThis.location.href = './dashboard.html'; }
      })
      .catch(() => {
         return globalThis.location.href = './';
      });
}

function startPolling() {
   pollingFunction();
   pollingInterval = setInterval(pollingFunction, 1000);
}

function stopPolling() {
   clearInterval(pollingInterval);
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
globalThis.addEventListener("load", () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon = document.getElementById("loading-icon");
   partyDurationInput = document.getElementById("party-duration");
   explicitCheckbox = document.getElementById("explicit-checkbox");
   duplicateBlockerCheckbox = document.getElementById("duplicate-blocker-checkbox");

   //////////////// Page polling ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   /////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });

   //////////////// Create party form //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector("form#create-party").addEventListener("submit", (event) => {
      event.preventDefault();
      loadingIcon.classList.remove("hide");

      fetch(`api/website/database.php`, {
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

   //////////////// Hide loading icon //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon.classList.add("hide");
});