window.addEventListener('load', () => {
   if (!getCookie('refresh_token') || !getCookie('host_id')) {
      deleteCookie({ name: 'refresh_token' });
      deleteCookie({ name: 'host_id' });
      window.location.href = '/houseparty/';
   }
   document.querySelector('input#extend-duration').value = 4;
   document.querySelector('input#party-duration').value = 4;
   const disableExplicitButton = document.querySelector('button#disable-explicit-button');
   const enableExplicitButton = document.querySelector('button#enable-explicit-button');
   const loadingIcon = document.querySelector('div#loading-icon');
   //////////////// Countdown timer //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   let partyExpiresAt;
   let countdownInterval;
   function updateCountdown() {
      const now = new Date();
      const timeDifference = partyExpiresAt - now;
      if (timeDifference <= 0) {
         document.getElementById("countdown-timer").innerText = "00:00:00";
         clearInterval(countdownInterval);
         return;
      }
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      document.getElementById("countdown-timer").innerText =
         `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
            if (document.querySelector('div#party-qrcode').childElementCount === 0) {
               // Get the party details and display them
               partyExpiresAt = new Date(data.partyExpiresAt);
               // const options = {
               //    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
               //    year: 'numeric',
               //    month: 'long',
               //    day: 'numeric',
               //    hour: 'numeric',
               //    minute: 'numeric',
               //    second: 'numeric',
               //    hour12: true
               // };
               // const formatter = new Intl.DateTimeFormat('en-US', options);
               // const localPartyExpiresAt = formatter.format(partyExpiresAt);
               countdownInterval = setInterval(updateCountdown, 1000);
               updateCountdown();
               const websiteUrl = `https://aw1443.brighton.domains/houseparty/party.html?session_code=`;
               document.querySelector('span#party-code').textContent = data.partyId;
               document.querySelector('button#copy-party-url').setAttribute('copy-data', `${websiteUrl}${data.partyId}`);
               new QRCode(document.querySelector('div#party-qrcode'), {
                  text: `${websiteUrl}${data.partyId}`,
                  width: 150,
                  height: 150
               });
            }
            if (data.refreshTokenValid === false) {
               deleteCookie({ name: 'refresh_token' });
               deleteCookie({ name: 'host_id' });
               window.location.href = '/houseparty/';
            }
            if (data.partyExpiresAt !== partyExpiresAt) {
               partyExpiresAt = new Date(data.partyExpiresAt);
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
   //////////////// How it works //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const howItWorksModal = document.querySelector('div#how-it-works-modal');
   // Handle the button press for showing how this works
   document.querySelector('button#show-how-it-works-modal').addEventListener('click', (event) => {
      event.preventDefault();
      howItWorksModal.style.animation = "modal-open 0.6s forwards";
      howItWorksModal.style.display = 'flex';
   });
   // Handle the button press for hiding how this works
   document.querySelector('span#hide-how-it-works-modal').addEventListener('click', (event) => {
      event.preventDefault();
      howItWorksModal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         howItWorksModal.style.display = 'none';
      }, 600);
   });
   //////////////// Join party info //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const joinPartyInfoModal = document.querySelector('div#join-party-info-modal');
   // Handle the button press for showing join party info modal
   document.querySelector('button#show-party-join-info-modal').addEventListener('click', (event) => {
      event.preventDefault();
      joinPartyInfoModal.style.animation = "modal-open 0.6s forwards";
      joinPartyInfoModal.style.display = 'flex';
   });
   // Handle the button press for hiding join party info
   document.querySelector('span#hide-party-join-info-modal').addEventListener('click', (event) => {
      event.preventDefault();
      joinPartyInfoModal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         joinPartyInfoModal.style.display = 'none';
      }, 600);
   });
   // Handle the button press for copying the party code
   document.querySelector('button#copy-party-code').addEventListener('click', (event) => {
      event.preventDefault();
      const partyCode = document.querySelector('span#party-code').textContent;
      navigator.clipboard.writeText(partyCode);
   });
   // Handle the button press for copying the party URL
   document.querySelector('button#copy-party-url').addEventListener('click', (event) => {
      event.preventDefault();
      const partyUrl = document.querySelector('button#copy-party-url').getAttribute('copy-data');
      navigator.clipboard.writeText(partyUrl);
   });
   //////////////// Extend party //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const extendPartyModal = document.querySelector('div#extend-party-modal');
   // Handle the button press for showing the extend party modal
   document.querySelector('button#show-extend-party-modal').addEventListener('click', (event) => {
      event.preventDefault();
      extendPartyModal.style.animation = "modal-open 0.6s forwards";
      extendPartyModal.style.display = 'flex';
   });
   // Handle the button press for closing the extend party modal
   document.querySelector('span#hide-extend-party-modal').addEventListener('click', (event) => {
      event.preventDefault();
      extendPartyModal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         extendPartyModal.style.display = 'none';
      }, 600);
   });
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
            extendPartyModal.style.animation = "modal-close 0.6s forwards";
            setTimeout(function () {
               extendPartyModal.style.display = 'none';
            }, 600);
            loadingIcon.classList.remove('hidden');
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
   const confirmEndPartyModal = document.querySelector('div#confirm-end-party-modal');
   // Handle the button press for showing the end party confirm modal
   document.querySelector('button#show-confirm-end-party-modal').addEventListener('click', (event) => {
      event.preventDefault();
      confirmEndPartyModal.style.animation = "modal-open 0.6s forwards";
      confirmEndPartyModal.style.display = 'flex';
   });
   // Handle the button press for closing the end party confirm modal
   document.querySelector('span#hide-confirm-end-party-modal').addEventListener('click', (event) => {
      event.preventDefault();
      confirmEndPartyModal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         confirmEndPartyModal.style.display = 'none';
      }, 600);
   });
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
   // Handle the button press for cancelling the end of the party
   document.querySelector('button#cancel-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      confirmEndPartyModal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         confirmEndPartyModal.style.display = 'none';
      }, 600);
   });
});