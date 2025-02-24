window.addEventListener('load', () => {
   //////////////// Set default values //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('input#party-duration').value = 4;
   //////////////// Variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const loadingIcon = document.querySelector('div#loading-icon');
   const startPartyForm = document.querySelector('form#party-creation-form');
   const settings = document.querySelector('div#settings');
   const createParty = document.querySelector('div#create-party');
   const enableExplicitButton = document.querySelector('button#enable-explicit-content');
   const disableExplicitButton = document.querySelector('button#disable-explicit-content');
   const enableDuplicateBlockerButton = document.querySelector('button#enable-duplicate-blocker');
   const disableDuplicateBlockerButton = document.querySelector('button#disable-duplicate-blocker');
   //////////////// Countdown timer //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
   //////////////// Page polling //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   function pagePolling() {
      // Check if the user is logged in
      if (!getCookie('refresh_token') || !getCookie('host_id')) {
         deleteCookie({ name: 'refresh_token' });
         deleteCookie({ name: 'host_id' });
         window.location.href = './';
      }
      // Check if the party exists and retrieve the required data
      const urlParams = new URLSearchParams({
         type: 'checkPartyExistsHost',
         hostId: `${getCookie('host_id')}`,
         refreshToken: `${getCookie('refresh_token')}`
      });
      fetch(`assets/php/website/databaseHandler.php?${urlParams}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            if (!data.refreshTokenValid) {
               deleteCookie({ name: 'refresh_token' });
               deleteCookie({ name: 'host_id' });
               window.location.href = './';
            }
            if (document.querySelector('div#party-qrcode').childElementCount === 0) {
               partyExpiresAt = new Date(data.partyExpiresAt);
               updateTimestamp();
               const websiteUrl = `${window.location.origin}/houseparty/party.html?session_code=`;
               document.querySelector('span#party-code').textContent = data.partyId;
               document.querySelector('button#copy-party-url').setAttribute('copy-data', `${websiteUrl}${data.partyId}`);
               document.querySelector('button#share-party-url').setAttribute('data-party-url', `${websiteUrl}${data.partyId}`);
               new QRCode(document.querySelector('div#party-qrcode'), {
                  text: `${websiteUrl}${data.partyId}`,
                  width: 150,
                  height: 150
               });
            }
            if (data.partyExpiresAt !== partyExpiresAt) {
               partyExpiresAt = data.partyExpiresAt;
               updateTimestamp();
            }
            if (data.explicit) {
               enableExplicitButton.classList.add('hide');
               disableExplicitButton.classList.remove('hide');
            } else {
               disableExplicitButton.classList.add('hide');
               enableExplicitButton.classList.remove('hide');
            }
            if (data.duplicateBlocker) {
               enableDuplicateBlockerButton.classList.add('hide');
               disableDuplicateBlockerButton.classList.remove('hide');
            } else {
               disableDuplicateBlockerButton.classList.add('hide');
               enableDuplicateBlockerButton.classList.remove('hide');
            }
            if (!createParty.classList.contains('hide')) { createParty.classList.add('hide'); }
            settings.classList.remove('hide');
         } else {
            // document.dispatchEvent(new Event('closeCurrentModal'));
            if (!settings.classList.contains('hide')) { settings.classList.add('hide'); }
            createParty.classList.remove('hide');
         }
         if (!loadingIcon.classList.contains('hide')) {
            loadingIcon.classList.add('hide');
         }
      }).catch(error => {
         console.error('Page Polling Error:', error);
      });
   }
   pagePolling();
   setInterval(pagePolling, 1500);
   //////////////// Extend cookies periodically //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   function extendCookiesPeriodically() {
      extendCookie({ name: 'refresh_token', days: 1 });
      extendCookie({ name: 'host_id', days: 1 });
   }
   extendCookiesPeriodically();
   setInterval(extendCookiesPeriodically, 15 * 60 * 1000);
   //////////////// Create party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the form submission for creating a new party
   startPartyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=createParty&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&partyEndsIn=${document.querySelector('input#party-duration').value}&explicit=${document.querySelector('input#explicit-checkbox').checked ? 1 : 0}&duplicateBlocker=${document.querySelector('input#duplicate-blocker-checkbox').checked ? 1 : 0}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            event.target.reset();
            window.location.reload();
         } else {
            deleteCookie({ name: 'refresh_token' });
            deleteCookie({ name: 'host_id' });
            window.location.href = '/houseparty/';
         }
      });
   });
   //////////////// Extend party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the form submission for extending the party
   document.querySelector('form#extend-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      const partyDuration = document.querySelector('input#extend-party-duration').value;
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=extendPartyDuration&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&extendBy=${partyDuration}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            event.target.reset();
            loadingIcon.classList.remove('hide');
         }
      });
   });
   //////////////// Explicit enable/disable buttons //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&explicit=0`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            disableExplicitButton.classList.add('hide');
            enableExplicitButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      });
   });
   // Handle the button press for enabling explicit songs
   enableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&explicit=1`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            enableExplicitButton.classList.add('hide');
            disableExplicitButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      });
   });
   //////////////// Duplicate blocker enable/disable buttons //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for disabling duplicate blocker
   disableDuplicateBlockerButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyDuplicateBlocker&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&duplicateBlocker=0`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            disableDuplicateBlockerButton.classList.add('hide');
            enableDuplicateBlockerButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      });
   });
   // Handle the button press for enabling duplicate blocker
   enableDuplicateBlockerButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyDuplicateBlocker&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&duplicateBlocker=1`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            enableDuplicateBlockerButton.classList.add('hide');
            disableDuplicateBlockerButton.classList.remove('hide');
            loadingIcon.classList.add('hide');
         }
      });
   });
   //////////////// End party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for confirming the end of the party
   document.querySelector('button#confirm-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      fetch(`assets/php/website/databaseHandler.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=deleteParty&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            window.location.reload();
         }
      });
   });
});