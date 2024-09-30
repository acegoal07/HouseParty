window.addEventListener('load', () => {
   // Add event listener to the join party form to prevent default form submission and then handle sending the session code to the server
   document.querySelector('form#join-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const sessionCodeInput = event.target.querySelector('input#party-code');
      const sessionCode = sessionCodeInput.value;
      sessionCodeInput.value = '';
      console.log(sessionCode);
   });
});