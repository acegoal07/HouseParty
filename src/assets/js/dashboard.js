//////////////// Imports ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import '@/assets/js/util/qrcode.js';
import '@/assets/js/util/modalHandler.js';
import '@/assets/js/util/collapsibleHandler.js';
import '@/assets/js/util/clickToCopy.js';
import '@/assets/js/util/clickToShare.js';

//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let pollingInterval;
let loadingIcon;
let dashboard;
let createParty;
let enableExplicitButton;
let disableExplicitButton;
let enableDuplicateBlockerButton;
let disableDuplicateBlockerButton;
let partyExpiresAt

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   // Check if the party exists, retrieve the required data and validate the user session
   fetch(`api/website/database.php?${new URLSearchParams({
      type: 'validateSession',
      session_data: true
   })}`, {
      method: 'GET'
   })
      .then(response => response.json())
      .then(data => {
         // If the session is not validated, redirect to the homepage
         if (!data.validated) {
            globalThis.location.href = './';
         }
         // If there is an active party, update the UI accordingly
         if (data.active_party) {
            const party = data.parties[0];

            // Set QR code and party info
            if (document.querySelector('div#party-qrcode').childElementCount === 0 || document.querySelector('span#party-code').textContent !== party.party_id) {
               partyExpiresAt = new Date(party.party_expires_at);
               updateTimestamp();
               const websiteUrl = `${globalThis.location.origin}/party.html?session_code=`;
               document.querySelector('span#party-code').textContent = party.party_id;
               document.querySelector('button#copy-party-url').dataset.copyText = `${websiteUrl}${encodeURIComponent(party.party_id)}`;
               document.querySelector('button#share-party-url').dataset.shareUrl = `${websiteUrl}${encodeURIComponent(party.party_id)}`;
               if (document.querySelector('div#party-qrcode').childElementCount > 0) {
                  document.querySelector('div#party-qrcode').innerHTML = '';
               }
               QrCreator.render({
                  text: `${websiteUrl}${encodeURIComponent(party.party_id)}`,
                  radius: 0.5,
                  ecLevel: 'H',
                  fill: '#fff',
                  size: 125
               }, document.querySelector('div#party-qrcode'));
            }

            // Update the party expiration time if it has changed
            if (party.party_expires_at !== partyExpiresAt) {
               partyExpiresAt = party.party_expires_at;
               updateTimestamp();
            }

            // Update explicit content button states
            if (party.explicit) {
               enableExplicitButton.classList.add('hide');
               disableExplicitButton.classList.remove('hide');
            } else {
               disableExplicitButton.classList.add('hide');
               enableExplicitButton.classList.remove('hide');
            }

            // Update duplicate blocker button states
            if (party.duplicate_blocker) {
               enableDuplicateBlockerButton.classList.add('hide');
               disableDuplicateBlockerButton.classList.remove('hide');
            } else {
               disableDuplicateBlockerButton.classList.add('hide');
               enableDuplicateBlockerButton.classList.remove('hide');
            }

            // Show settings and hide create party section
            if (!createParty.classList.contains('hide')) { createParty.classList.add('hide'); }
            dashboard.classList.remove('hide');
         } else {
            // No active party, show create party section, hide settings and make sure all modals are closed
            document.dispatchEvent(new Event('closeCurrentModal'));
            if (!dashboard.classList.contains('hide')) { dashboard.classList.add('hide'); }
            createParty.classList.remove('hide');
         }
         // Remove the loading icon
         if (!loadingIcon.classList.contains('hide')) {
            loadingIcon.classList.add('hide');
         }
      })
      .catch(() => {
         globalThis.location.href = './';
      });
}

function startPolling() {
   pollingFunction();
   pollingInterval = setInterval(pollingFunction, 1000);
}

function stopPolling() {
   clearInterval(pollingInterval);
}

//////////////// Update Timestamp //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateTimestamp() {
   if (!partyExpiresAt) {
      return;
   }
   const date = new Date(partyExpiresAt);
   document.querySelector("div#expires-at-time").textContent = `${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`;
   document.querySelector("div#expires-at-date").textContent = `${date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })}`;
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', () => {
   //////////////// Set default values /////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('input#party-duration').value = 4;

   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon = document.querySelector('div#loading-icon');
   dashboard = document.querySelector('div#dashboard');
   createParty = document.querySelector('div#create-party');
   enableExplicitButton = document.querySelector('button#enable-explicit-content');
   disableExplicitButton = document.querySelector('button#disable-explicit-content');
   enableDuplicateBlockerButton = document.querySelector('button#enable-duplicate-blocker');
   disableDuplicateBlockerButton = document.querySelector('button#disable-duplicate-blocker');

   //////////////// Page polling ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   //////////////// Create party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the form submission for creating a new party
   document.querySelector('form#party-creation-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'createParty',
            party_ends_in: document.querySelector('input#party-duration').value,
            explicit: document.querySelector('input#explicit-checkbox').checked ? 1 : 0,
            duplicate_blocker: document.querySelector('input#duplicate-blocker-checkbox').checked ? 1 : 0
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               event.target.reset();
               globalThis.location.reload();
            } else {
               globalThis.location.href = './';
            }
         })
         .catch(error => {
            console.error('Create Party Error:', error);
         });
   });

   //////////////// Extend party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the form submission for extending the party
   document.querySelector('form#extend-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      const partyDuration = document.querySelector('input#extend-party-duration').value;
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'extendPartyDuration',
            extend_by: partyDuration
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               event.target.reset();
               loadingIcon.classList.remove('hide');
            }
         })
         .catch(error => {
            console.error('Extend Party Error:', error);
         });
   });

   //////////////// Explicit enable/disable buttons //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'updatePartyExplicit',
            explicit: 0
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               disableExplicitButton.classList.add('hide');
               enableExplicitButton.classList.remove('hide');
               loadingIcon.classList.add('hide');
            }
         })
         .catch(error => {
            console.error('Disable Explicit Error:', error);
         });
   });

   // Handle the button press for enabling explicit songs
   enableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'updatePartyExplicit',
            explicit: 1
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               enableExplicitButton.classList.add('hide');
               disableExplicitButton.classList.remove('hide');
               loadingIcon.classList.add('hide');
            }
         })
         .catch(error => {
            console.error('Enable Explicit Error:', error);
         });
   });

   //////////////// Duplicate blocker enable/disable buttons //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for disabling duplicate blocker
   disableDuplicateBlockerButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'updatePartyDuplicateBlocker',
            duplicate_blocker: 0
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               disableDuplicateBlockerButton.classList.add('hide');
               enableDuplicateBlockerButton.classList.remove('hide');
               loadingIcon.classList.add('hide');
            }
         })
         .catch(error => {
            console.error('Disable Duplicate Blocker Error:', error);
         });
   });

   // Handle the button press for enabling duplicate blocker
   enableDuplicateBlockerButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'updatePartyDuplicateBlocker',
            duplicate_blocker: 1
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               enableDuplicateBlockerButton.classList.add('hide');
               disableDuplicateBlockerButton.classList.remove('hide');
               loadingIcon.classList.add('hide');
            }
         })
         .catch(error => {
            console.error('Enable Duplicate Blocker Error:', error);
         });
   });

   //////////////// Generate new party ID //////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for generating a new party ID
   document.querySelector('button#confirm-generate-new-party-id-button').addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'generateNewPartyId'
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               globalThis.location.reload();
            }
         })
         .catch(error => {
            console.error('Generate New Party ID Error:', error);
         });
   });

   //////////////// End party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for confirming the end of the party
   document.querySelector('button#confirm-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'deleteParty'
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               globalThis.location.reload();
            }
         })
         .catch(error => {
            console.error('End Party Error:', error);
         });
   });

   /////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });
});