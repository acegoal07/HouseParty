window.addEventListener('load', () => {
   if (!getCookie('refresh_token') || !getCookie('host_id')) {
      deleteCookie({ name: 'refresh_token' });
      deleteCookie({ name: 'host_id' });
      window.location.href = '/houseparty/';
   }
   document.querySelector('input#extend-duration').value = 4;
   document.querySelector('input#party-duration').value = 4;
   //////////////// Variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const disableExplicitButton = document.querySelector('button#disable-explicit-button');
   const enableExplicitButton = document.querySelector('button#enable-explicit-button');
   const loadingIcon = document.querySelector('div#loading-icon');
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
      const urlParams = new URLSearchParams({
         type: 'checkPartyExistsHost',
         hostId: `${getCookie('host_id')}`,
         refreshToken: `${getCookie('refresh_token')}`
      });
      fetch(`assets/php/website/databasePartyHandlers.php?${urlParams}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            if (!data.refreshTokenValid) {
               deleteCookie({ name: 'refresh_token' });
               deleteCookie({ name: 'host_id' });
               window.location.href = '/houseparty/';
            }
            if (document.querySelector('div#party-qrcode').childElementCount === 0) {
               partyExpiresAt = new Date(data.partyExpiresAt);
               updateTimestamp();
               const websiteUrl = `https://aw1443.brighton.domains/houseparty/party.html?session_code=`;
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
               if (!enableExplicitButton.classList.contains('hidden')) { enableExplicitButton.classList.add('hidden'); }
               disableExplicitButton.classList.remove('hidden');
            } else {
               if (!disableExplicitButton.classList.contains('hidden')) { disableExplicitButton.classList.add('hidden'); }
               enableExplicitButton.classList.remove('hidden');
            }
            if (!document.querySelector('form#start-party-form').classList.contains('hidden')) { document.querySelector('form#start-party-form').classList.add('hidden'); }
            document.querySelector('div#manage-party-buttons').classList.remove('hidden');
         } else {
            document.dispatchEvent(new Event('closeCurrentModal'));
            if (!document.querySelector('div#manage-party-buttons').classList.contains('hidden')) { document.querySelector('div#manage-party-buttons').classList.add('hidden'); }
            document.querySelector('form#start-party-form').classList.remove('hidden');
         }
         if (!loadingIcon.classList.contains('hidden')) {
            loadingIcon.classList.add('hidden');
         }
      });
   }
   pagePolling();
   setInterval(pagePolling, 1500);
   //////////////// Create party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the form submission for creating a new party
   document.querySelector('form#start-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hidden');
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=createParty&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&partyEndsIn=${document.querySelector('input#party-duration').value}&explicit=${document.querySelector('input#explicit-allowed').checked ? 1 : 0}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            window.location.reload();
            loadingIcon.classList.add('hidden');
         }
      });
   });
   //////////////// Extend party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the form submission for extending the party
   document.querySelector('form#extend-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hidden');
      const partyDuration = document.querySelector('input#extend-duration').value;
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=extendPartyDuration&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&extendBy=${partyDuration}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            document.dispatchEvent(new CustomEvent('closeCurrentModal', {
               detail: {
                  callback: () => {
                     loadingIcon.classList.remove('hidden');
                  }
               }
            }));
         }
      });
   });
   //////////////// Explicit enable/disable buttons //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hidden');
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&explicit=0`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            disableExplicitButton.classList.add('hidden');
            enableExplicitButton.classList.remove('hidden');
            loadingIcon.classList.add('hidden');
         }
      });
   });
   // Handle the button press for enabling explicit songs
   enableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hidden');
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}&explicit=1`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            enableExplicitButton.classList.add('hidden');
            disableExplicitButton.classList.remove('hidden');
            loadingIcon.classList.add('hidden');
         }
      });
   });
   //////////////// End party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Handle the button press for confirming the end of the party
   document.querySelector('button#confirm-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hidden');
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=deleteParty&hostId=${getCookie('host_id')}&refreshToken=${getCookie('refresh_token')}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            window.location.reload();
            loadingIcon.classList.add('hidden');
         }
      });
   });
});