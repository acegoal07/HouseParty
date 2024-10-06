window.addEventListener('load', () => {
   // Add event listener to the join party form to prevent default form submission and then handle sending the session code to the server
   document.querySelector('form#join-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const sessionCodeInput = event.target.querySelector('input#party-code');
      const sessionCode = sessionCodeInput.value;
      const noSessionFoundError = document.querySelector('span#no-session-found-error');
      noSessionFoundError.style.display = 'none';

      const urlParams = new URLSearchParams({
         type: 'partyExistsById',
         partyId: sessionCode
      });

      fetch(`assets/php/databasePartyHandlers.php?${urlParams}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            window.location.href = `/houseparty/party.html?session_code=${sessionCode}`;
         } else {
            noSessionFoundError.style.display = 'block';
         }
      });
      sessionCodeInput.value = '';
   });
});