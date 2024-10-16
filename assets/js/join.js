window.addEventListener('load', () => {
   const loadingIcon = document.querySelector('div#loading-icon');
   // Add event listener to the join party form
   document.querySelector('form#join-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove("hidden");
      const sessionCodeInput = event.target.querySelector('input#party-code');
      const sessionCode = sessionCodeInput.value;
      const noSessionFoundError = document.querySelector('span#no-session-found-error');
      noSessionFoundError.style.display = 'none';

      fetch(`assets/php/website/databasePartyHandlers.php?type=checkPartyExistsUser&partyId=${sessionCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            window.location.href = `/houseparty/party.html?session_code=${sessionCode}`;
         } else {
            noSessionFoundError.style.display = 'block';
         }
         loadingIcon.classList.add("hidden");
      });
      sessionCodeInput.value = '';
   });
});