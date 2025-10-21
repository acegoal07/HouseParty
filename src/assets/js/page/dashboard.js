import { getCookie, extendCookie, deleteCookie } from '@/assets/js/util/cookies.js';
import QrCreator from '@/assets/js/util/qrcode.js';
import '@/assets/js/util/modalHandler.js';
import '@/assets/js/util/collapsibleHandler.js';
import '@/assets/js/util/clickToCopy.js';
import '@/assets/js/util/clickToShare.js';

window.addEventListener('load', () => {
   //////////////// Set default values //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('input#party-duration').value = 4;
   //////////////// Variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const loadingIcon = document.querySelector('div#loading-icon');
   const settings = document.querySelector('div#settings');
   const createParty = document.querySelector('div#create-party');
   const enableExplicitButton = document.querySelector('button#enable-explicit-content');
   const disableExplicitButton = document.querySelector('button#disable-explicit-content');
   const enableDuplicateBlockerButton = document.querySelector('button#enable-duplicate-blocker');
   const disableDuplicateBlockerButton = document.querySelector('button#disable-duplicate-blocker');
   //////////////// Countdown timer ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   let partyExpiresAt;
   function updateTimestamp() {
      if (!partyExpiresAt) {
         return;
      }
      const date = new Date(partyExpiresAt);
      const timeString = date.toLocaleTimeString(undefined, {
         hour: '2-digit',
         minute: '2-digit',
         hour12: true
      });
      const dateString = date.toLocaleDateString(undefined, {
         year: 'numeric',
         month: 'numeric',
         day: 'numeric'
      });
      document.querySelector("div#expires-at-time").textContent = `${timeString}`;
      document.querySelector("div#expires-at-date").textContent = `${dateString}`;
   }
   //////////////// Page polling ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   function pagePolling() {
      // Check if the session ID cookie exists
      if (getCookie('session_id') === null) {
         deleteCookie({ name: 'session_id' });
         globalThis.location.href = './';
         return;
      }
      // Check if the party exists, retrieve the required data and validate the user session
      const urlParams = new URLSearchParams({
         type: 'validateSession',
         session_id: `${getCookie('session_id')}`,
         session_data: true
      });

      fetch(`api/website/database.php?${urlParams}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         // If the session is not validated, redirect to the homepage
         if (!data.validated) {
            deleteCookie({ name: 'session_id' });
            globalThis.location.href = './';
         }
         // Extend the session if needed
         if (data.extended) {
            extendCookie({ name: 'session_id', days: 0.5 });
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
               document.querySelector('button#copy-party-url').setAttribute('copy-data', `${websiteUrl}${party.party_id}`);
               document.querySelector('button#share-party-url').setAttribute('share-url', `${websiteUrl}${party.party_id}`);
               if (document.querySelector('div#party-qrcode').childElementCount > 0) {
                  document.querySelector('div#party-qrcode').innerHTML = '';
               }
               QrCreator.render({
                  text: `${websiteUrl}${party.party_id}`,
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
            settings.classList.remove('hide');
         } else {
            // No active party, show create party section, hide settings and make sure all modals are closed
            document.dispatchEvent(new Event('closeCurrentModal'));
            if (!settings.classList.contains('hide')) { settings.classList.add('hide'); }
            createParty.classList.remove('hide');
         }
         // Remove the loading icon
         if (!loadingIcon.classList.contains('hide')) {
            loadingIcon.classList.add('hide');
         }
      }).catch(error => {
         // deleteCookie({ name: 'session_id' });
         // globalThis.location.href = './';
         console.log(error)
      });
   }
   pagePolling();
   setInterval(pagePolling, 1500);
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
            session_id: getCookie('session_id'),
            party_ends_in: document.querySelector('input#party-duration').value,
            explicit: document.querySelector('input#explicit-checkbox').checked ? 1 : 0,
            duplicate_blocker: document.querySelector('input#duplicate-blocker-checkbox').checked ? 1 : 0
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            event.target.reset();
            globalThis.location.reload();
         } else {
            deleteCookie({ name: 'session_id' });
            globalThis.location.href = './';
         }
      }).catch(error => {
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
            session_id: getCookie('session_id'),
            extend_by: partyDuration
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            event.target.reset();
            loadingIcon.classList.remove('hide');
         }
      }).catch(error => {
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
            session_id: getCookie('session_id'),
            explicit: 0
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            disableExplicitButton.classList.add('hide');
            enableExplicitButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      }).catch(error => {
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
            session_id: getCookie('session_id'),
            explicit: 1
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            enableExplicitButton.classList.add('hide');
            disableExplicitButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      }).catch(error => {
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
            session_id: getCookie('session_id'),
            duplicate_blocker: 0
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            disableDuplicateBlockerButton.classList.add('hide');
            enableDuplicateBlockerButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      }).catch(error => {
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
            session_id: getCookie('session_id'),
            duplicate_blocker: 1
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            enableDuplicateBlockerButton.classList.add('hide');
            disableDuplicateBlockerButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      }).catch(error => {
         console.error('Enable Duplicate Blocker Error:', error);
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
            type: 'deleteParty',
            session_id: getCookie('session_id')
         })
      }).then(response => response.json()).then(data => {
         if (data.success) {
            globalThis.location.reload();
         }
      }).catch(error => {
         console.error('End Party Error:', error);
      });
   });
});