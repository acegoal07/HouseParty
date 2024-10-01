window.addEventListener('load', function () {
   const disableExplicitButton = this.document.querySelector('button#disable-explicit-button');
   const enableExplicitButton = this.document.querySelector('button#enable-explicit-button');
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