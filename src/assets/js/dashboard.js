// Imports
import '@/assets/js/util/qrcode.js';
import '@/assets/js/util/modalHandler.js';
import '@/assets/js/util/collapsibleHandler.js';
import '@/assets/js/util/clickToCopy.js';
import '@/assets/js/util/clickToShare.js';

// Initialize variables
let loadingIcon;

let partyExpiresAt;
let partyExpiresAtTime;
let partyExpiresAtDate;

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

// Set up EventSource listeners 
const eventSource = new EventSource('api/v2/user/sse/sessionInfo.php?datalevel=full', { withCredentials: true });

eventSource.addEventListener('init', event => {
   const data = JSON.parse(event.data);
   if (!data.active_party) {
      return globalThis.location.href = './create.html';
   }

   partyExpiresAt = data.party.party_expires_at;
   updateTimestamp();

   partyIdDisplay.textContent = data.party.party_id;

   const partyUrl = `${globalThis.location.origin}/party.html?session_code=${encodeURIComponent(data.party.party_id)}`;

   partyUrlDisplay.textContent = partyUrl;
   partyUrlLink.href = partyUrl;
   partyLinkClickToShare.dataset.shareUrl = partyUrl;

   QrCreator.render({
      text: `${partyUrl}`,
      radius: 0.5,
      ecLevel: 'H',
      fill: '#fff',
      size: 125
   }, qrCodeDisplay);

   if (data.party.explicit) {
      enableExplicitButton.classList.add('hide');
      disableExplicitButton.classList.remove('hide');
   } else {
      disableExplicitButton.classList.add('hide');
      enableExplicitButton.classList.remove('hide');
   }

   if (data.party.duplicate_blocker) {
      enableDuplicateBlockerButton.classList.add('hide');
      disableDuplicateBlockerButton.classList.remove('hide');
   } else {
      disableDuplicateBlockerButton.classList.add('hide');
      enableDuplicateBlockerButton.classList.remove('hide');
   }

   loadingIcon.classList.add('hide');
});

eventSource.addEventListener('partyUpdate', event => {
   const data = JSON.parse(event.data);

   if (!data.party || !data.active_party) {
      return globalThis.location.href = './create.html';
   }

   if (data.party.party_expires_at !== partyExpiresAt) {
      partyExpiresAt = data.party.party_expires_at;
      updateTimestamp();
   }

   if (data.party.party_id !== partyIdDisplay.textContent) {
      partyIdDisplay.textContent = data.party.party_id;

      const partyUrl = `${globalThis.location.origin}/party.html?session_code=${encodeURIComponent(data.party.party_id)}`;

      partyUrlDisplay.textContent = partyUrl;
      partyUrlLink.href = partyUrl;
      partyLinkClickToShare.dataset.shareUrl = partyUrl;

      qrCodeDisplay.removeChild(qrCodeDisplay.firstChild);

      QrCreator.render({
         text: `${partyUrl}`,
         radius: 0.5,
         ecLevel: 'H',
         fill: '#fff',
         size: 125
      }, qrCodeDisplay);
   }

   if (data.party.explicit) {
      enableExplicitButton.classList.add('hide');
      disableExplicitButton.classList.remove('hide');
   } else {
      disableExplicitButton.classList.add('hide');
      enableExplicitButton.classList.remove('hide');
   }

   if (data.party.duplicate_blocker) {
      enableDuplicateBlockerButton.classList.add('hide');
      disableDuplicateBlockerButton.classList.remove('hide');
   } else {
      disableDuplicateBlockerButton.classList.add('hide');
      enableDuplicateBlockerButton.classList.remove('hide');
   }

   loadingIcon.classList.add('hide');
});

eventSource.addEventListener('partyStatusChange', event => {
   const data = JSON.parse(event.data);
   if (data.active_party) {
      return globalThis.location.href = './create.html';
   }
});

eventSource.addEventListener('invalidSessionId', () => {
   return globalThis.location.href = './';
});

eventSource.addEventListener('noSessionId', () => {
   return globalThis.location.href = './';
});

// Update timestamp display
function updateTimestamp() {
   if (!partyExpiresAt) { return; }
   const date = new Date(partyExpiresAt);
   partyExpiresAtTime.textContent = `${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`;
   partyExpiresAtDate.textContent = `${date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })}`;
}

globalThis.addEventListener('load', () => {
   // Get DOM elements
   loadingIcon = document.querySelector("#loading-icon");

   partyExpiresAtTime = document.querySelector("div#expires-at-time");
   partyExpiresAtDate = document.querySelector("div#expires-at-date");

   partyIdDisplay = document.querySelector("#party-id");
   partyUrlLink = document.querySelector("#party-url-link");
   partyUrlDisplay = document.querySelector("#party-url");
   partyLinkClickToShare = document.querySelector("#party-url-link-share");
   qrCodeDisplay = document.querySelector("#party-qrcode");

   partyExtensionInput = document.querySelector("input#party-extension");

   enableExplicitButton = document.querySelector("#enable-explicit-content");
   disableExplicitButton = document.querySelector("#disable-explicit-content");

   enableDuplicateBlockerButton = document.querySelector("#enable-duplicate-blocker");
   disableDuplicateBlockerButton = document.querySelector("#disable-duplicate-blocker");

   // Handle Extend Party Form submission
   document.querySelector('form#extend-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/v2/party/extendParty.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            hours: partyExtensionInput.value
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               event.target.reset();
            }
         })
         .catch(error => {
            console.error('Extend Party Error:', error);
         });
   });

   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/v2/party/updateExplicit.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            explicit: false
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               disableExplicitButton.classList.add('hide');
               enableExplicitButton.classList.remove('hide');
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
      fetch(`api/v2/party/updateExplicit.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            explicit: true
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               enableExplicitButton.classList.add('hide');
               disableExplicitButton.classList.remove('hide');
            }
         })
         .catch(error => {
            console.error('Enable Explicit Error:', error);
         });
   });

   // Handle the button press for disabling duplicate blocker
   disableDuplicateBlockerButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`api/v2/party/updateDuplicateBlocker.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            duplicate_blocker: false
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               disableDuplicateBlockerButton.classList.add('hide');
               enableDuplicateBlockerButton.classList.remove('hide');
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
      fetch(`api/v2/party/updateDuplicateBlocker.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            duplicate_blocker: true
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

   // Handle the button press for generating a new party ID
   document.querySelector('button#confirm-generate-new-party-id-button').addEventListener('click', (event) => {
      event.preventDefault();
      document.dispatchEvent(new Event('closeCurrentModal'));
      loadingIcon.classList.remove('hide');
      fetch(`api/v2/party/generateNewPartyId.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         }
      })
         .catch(error => {
            console.error('Generate New Party ID Error:', error);
         });
   });

   // Handle the button press for confirming the end of the party
   document.querySelector('button#confirm-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      document.dispatchEvent(new Event('closeCurrentModal'));
      loadingIcon.classList.remove('hide');
      fetch(`api/v2/party/endParty.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         }
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               return globalThis.location.href = './create.html';
            }
         })
         .catch(error => {
            console.error('End Party Error:', error);
         });
   });
});