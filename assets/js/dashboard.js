window.addEventListener('load', () => {
   const disableExplicitButton = this.document.querySelector('button#disable-explicit-button');
   const enableExplicitButton = this.document.querySelector('button#enable-explicit-button');
   // Check if the user has an active party and display the appropriate form
   const urlParams = new URLSearchParams({
      type: 'partyExistsByHostId',
      hostId: `${getCookie('spotify_user_id')}`
   });
   fetch(`assets/php/databasePartyHandlers.php?${urlParams}`, {
      method: 'GET'
   }).then(response => response.json()).then(data => {
      if (data.partyExists) {
         if (data.explicit) {
            document.querySelector('button#disable-explicit-button').classList.remove('hidden');
         } else {
            document.querySelector('button#enable-explicit-button').classList.remove('hidden');
         }
         document.querySelector('div#manage-party-buttons').classList.remove('hidden');
      } else {
         document.querySelector('form#start-party-form').classList.remove('hidden');
      }
   });
   // Handle the form submission for creating a new party
   this.document.querySelector('form#start-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const partyDuration = document.querySelector('input#party-duration').value;
      const explicitAllowed = document.querySelector('input#explicit-allowed').checked;
      console.log(partyDuration, explicitAllowed);
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
   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      fetch(`assets/php/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('spotify_user_id')}&explicit=0`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            window.location.reload();
         }
      });
   });
   // Handle the button press for enabling explicit songs
   enableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
      fetch(`assets/php/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: `type=updatePartyExplicit&hostId=${getCookie('spotify_user_id')}&explicit=1`
      }).then(response => response.json()).then(data => {
         if (data.success) {
            window.location.reload();
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
      fetch(`assets/php/databasePartyHandlers.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: 'type=deleteParty&hostId=' + getCookie('spotify_user_id')
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