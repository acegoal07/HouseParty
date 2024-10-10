window.addEventListener('load', () => {
   if (!getCookie('refresh_token') || !getCookie('host_id')) {
      deleteCookie('refresh_token');
      deleteCookie('host_id');
      window.location.href = '/houseparty/';
   }
   const disableExplicitButton = this.document.querySelector('button#disable-explicit-button');
   const enableExplicitButton = this.document.querySelector('button#enable-explicit-button');
   // Check if the user has an active party and display the appropriate form
   const urlParams = new URLSearchParams({
      type: 'partyExistsByHostId',
      hostId: `${getCookie('host_id')}`
   });
   function pagePolling() {
      fetch(`assets/php/website/databasePartyHandlers.php?${urlParams}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            if (document.querySelector('div#party-qrcode').childElementCount === 0) {
               const websiteUrl = `https://aw1443.brighton.domains/houseparty/party.html?session_code=`;
               this.document.querySelector('span#party-code').textContent = data.partyId;
               this.document.querySelector('span#party-url').textContent = `${websiteUrl}${data.partyId}`;
               new QRCode(document.querySelector('div#party-qrcode'), {
                  text: `${websiteUrl}${data.partyId}`,
                  width: 150,
                  height: 150
               });
            }
            if (data.explicit) {
               if (!document.querySelector('button#enable-explicit-button').classList.contains('hidden')) { document.querySelector('button#enable-explicit-button').classList.add('hidden'); }
               document.querySelector('button#disable-explicit-button').classList.remove('hidden');
            } else {
               if (!document.querySelector('button#disable-explicit-button').classList.contains('hidden')) { document.querySelector('button#disable-explicit-button').classList.add('hidden'); }
               document.querySelector('button#enable-explicit-button').classList.remove('hidden');
            }
            if (!document.querySelector('form#start-party-form').classList.contains('hidden')) { document.querySelector('form#start-party-form').classList.add('hidden'); }
            document.querySelector('div#manage-party-buttons').classList.remove('hidden');
         } else {
            if (!document.querySelector('div#manage-party-buttons').classList.contains('hidden')) { document.querySelector('div#manage-party-buttons').classList.add('hidden'); }
            document.querySelector('form#start-party-form').classList.remove('hidden');
         }
      });
   }
   pagePolling();
   setInterval(() => pagePolling(), 1500);
   // Handle the form submission for creating a new party
   this.document.querySelector('form#start-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const partyDuration = document.querySelector('input#party-duration').value * 3600;
      const explicitAllowed = document.querySelector('input#explicit-allowed').checked ? 1 : 0;
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=createParty&hostId=${getCookie('host_id')}&refresh_token=${getCookie('refresh_token')}&party_ends_in=${partyDuration}&explicit=${explicitAllowed}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            window.location.reload();
         }
      });
   });
   // Handle the button press for show join party info
   this.document.querySelector('button#show-party-join-info').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#join-party-info');
      modal.style.animation = "modal-open 0.6s forwards";
      modal.style.display = 'flex';
   });
   // Handle the button press for hiding join party info
   this.document.querySelector('span#hide-party-join-info').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#join-party-info');
      modal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         modal.style.display = 'none';
      }, 600);
   });
   // Handle the button press for copying the party code
   this.document.querySelector('button#copy-party-code').addEventListener('click', (event) => {
      event.preventDefault();
      const partyCode = document.querySelector('span#party-code').textContent;
      navigator.clipboard.writeText(partyCode);
   });
   // Handle the button press for copying the party URL
   this.document.querySelector('button#copy-party-url').addEventListener('click', (event) => {
      event.preventDefault();
      const partyUrl = document.querySelector('span#party-url').textContent;
      navigator.clipboard.writeText(partyUrl);
   });
   // Handle the button press for extending the party modal
   this.document.querySelector('button#extend-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#extend-party');
      modal.style.animation = "modal-open 0.6s forwards";
      modal.style.display = 'flex';
   });
   // Handle the button press for closing the extend party modal
   this.document.querySelector('span#hide-extend-party').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#extend-party');
      modal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         modal.style.display = 'none';
      }, 600);
   });
   // Handle the button press for extending the party
   this.document.querySelector('form#extend-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const partyDuration = document.querySelector('input#extend-duration').value * 3600;
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=extendPartyDuration&hostId=${getCookie('host_id')}&party_ends_in=${partyDuration}`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            const modal = document.querySelector('div#extend-party');
            modal.style.animation = "modal-close 0.6s forwards";
            setTimeout(function () {
               modal.style.display = 'none';
            }, 600);
         }
      });
   });
   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('host_id')}&explicit=0`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            document.querySelector('button#disable-explicit-button').classList.add('hidden');
            document.querySelector('button#enable-explicit-button').classList.remove('hidden');
         }
      });
   });
   // Handle the button press for enabling explicit songs
   enableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      fetch(`assets/php/website/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('host_id')}&explicit=1`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            document.querySelector('button#enable-explicit-button').classList.add('hidden');
            document.querySelector('button#disable-explicit-button').classList.remove('hidden');
         }
      });
   });
   // Handle the button press for ending the party
   this.document.querySelector('button#end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#confirm-end-party');
      modal.style.animation = "modal-open 0.6s forwards";
      modal.style.display = 'flex';
   });
   // Handle the button press for closing the end party modal
   this.document.querySelector('span#hide-confirm-end-party').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#confirm-end-party');
      modal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         modal.style.display = 'none';
      }, 600);
   });
   // Handle the button press for confirming the end of the party
   this.document.querySelector('button#confirm-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      fetch(`assets/php/website/databasePartyHandlers.php`, {
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
   // Handle the button press for cancelling the end of the party
   this.document.querySelector('button#cancel-end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector('div#confirm-end-party');
      modal.style.animation = "modal-close 0.6s forwards";
      setTimeout(function () {
         modal.style.display = 'none';
      }, 600);
   });
});