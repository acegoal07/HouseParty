window.addEventListener('load', () => {
   const disableExplicitButton = this.document.querySelector('button#disable-explicit-button');
   const enableExplicitButton = this.document.querySelector('button#enable-explicit-button');
   // Check if the user has an active party and display the appropriate form
   const urlParams = new URLSearchParams({
      type: 'partyExists',
      hostId: `${getCookie('spotify_user_id')}`
   });
   fetch(`https://aw1443.brighton.domains/houseparty/assets/php/databasePartyHandlers.php?${urlParams}`, {
      method: 'GET'
   }).then(response => response.json()).then(data => {
      if (data.partyExists) {
         document.querySelector('div#manage-party-buttons').classList.remove('hidden');
      } else {
         if (data.explicit) {
            document.querySelector('button#disable-explicit-button').classList.remove('hidden');
         } else {
            document.querySelector('button#enable-explicit-button').classList.remove('hidden');
         }
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
   // Handle the button press for extending the party
   this.document.querySelector('button#extend-party-button').addEventListener('click', (event) => {
      event.preventDefault();
   });
   // Handle the button press for disabling explicit songs
   disableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
   });
   // Handle the button press for enabling explicit songs
   enableExplicitButton.addEventListener('click', (event) => {
      event.preventDefault();
   });
   // Handle the button press for ending the party
   this.document.querySelector('button#end-party-button').addEventListener('click', (event) => {
      event.preventDefault();
   });
});