//////////////// Imports ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import '@/assets/js/util/qrcode.js';
import '@/assets/js/util/modalHandler.js';
import '@/assets/js/util/collapsibleHandler.js';
import '@/assets/js/util/clickToCopy.js';
import '@/assets/js/util/clickToShare.js';

//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let loadingIcon;
let pollingInterval;

let partyExpiresAt;

let partyIdDisplay;
let partyUrlLink;
let partyUrlDisplay;
let partyLinkClickToShare;
let qrCodeDisplay;

let partyExtensionInput;

let enableExplicitButton;
let disableExplicitButton;

let enableDuplicateBlockerButton;
let disableDuplicateBlockerButton;

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   // Check if the party exists, retrieve the required data and validate the user session
   fetch(`api/website/database.php?${new URLSearchParams({
      type: 'validateSession',
      party_data: true
   })}`, {
      method: 'GET'
   })
      .then(response => response.json())
      .then(data => {
         if (!data.validated) { return globalThis.location.href = './'; }
         if (!data.active_party) { return globalThis.location.href = './create.html'; }

         if (data.party.party_id !== partyIdDisplay.textContent || qrCodeDisplay.childElementCount === 0) {
            partyExpiresAt = data.party.expires_at;
            updateTimestamp();

            partyIdDisplay.textContent = data.party.party_id;

            const partyUrl = `${globalThis.location.origin}/party.html?session_code=${encodeURIComponent(data.party.party_id)}`;

            partyUrlDisplay.textContent = partyUrl;
            partyUrlLink.href = partyUrl;
            partyLinkClickToShare.dataset.shareUrl = partyUrl;

            if (qrCodeDisplay.childElementCount > 0) {
               qrCodeDisplay.removeChild(qrCodeDisplay.firstChild);
            }
            QrCreator.render({
               text: `${partyUrl}`,
               radius: 0.5,
               ecLevel: 'H',
               fill: '#fff',
               size: 125
            }, qrCodeDisplay);
         }

         // Update the party expiration time if it has changed
         if (data.party.party_expires_at !== partyExpiresAt) {
            partyExpiresAt = data.party.party_expires_at;
            updateTimestamp();
         }

         // Update explicit content button states
         if (data.party.explicit) {
            enableExplicitButton.classList.add('hide');
            disableExplicitButton.classList.remove('hide');
         } else {
            disableExplicitButton.classList.add('hide');
            enableExplicitButton.classList.remove('hide');
         }

         // Update duplicate blocker button states
         if (data.party.duplicate_blocker) {
            enableDuplicateBlockerButton.classList.add('hide');
            disableDuplicateBlockerButton.classList.remove('hide');
         } else {
            disableDuplicateBlockerButton.classList.add('hide');
            enableDuplicateBlockerButton.classList.remove('hide');
         }
      }).then(() => {
         // Hide loading icon after first successful poll
         if (!loadingIcon.classList.contains('hide')) {
            loadingIcon.classList.add('hide');
         }
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

//////////////// Update Timestamp //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateTimestamp() {
   if (!partyExpiresAt) { return; }
   const date = new Date(partyExpiresAt);
   document.querySelector("div#expires-at-time").textContent = `${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`;
   document.querySelector("div#expires-at-date").textContent = `${date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })}`;
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
globalThis.addEventListener("load", () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon = document.querySelector("#loading-icon");

   partyIdDisplay = document.querySelector("#party-id");
   partyUrlLink = document.querySelector("#party-url-link");
   partyUrlDisplay = document.querySelector("#party-url");
   partyLinkClickToShare = document.querySelector("#party-url-link-share");
   qrCodeDisplay = document.querySelector("#party-qrcode");

   partyExtensionInput = document.querySelector("#party-extension-input");

   enableExplicitButton = document.querySelector("#enable-explicit-content");
   disableExplicitButton = document.querySelector("#disable-explicit-content");

   enableDuplicateBlockerButton = document.querySelector("#enable-duplicate-blocker");
   disableDuplicateBlockerButton = document.querySelector("#disable-duplicate-blocker");

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

   //////////////// Extend party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('form#extend-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'extendPartyDuration',
            extend_by: partyExtensionInput.value
         })
      })
         .then(response => response.json())
         .then(data => {
            event.target.reset();
            if (data.success) {
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
});