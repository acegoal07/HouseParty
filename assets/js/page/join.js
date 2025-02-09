window.addEventListener('load', () => {
   const loadingIcon = document.querySelector('div#loading-icon');
   document.querySelector('form#join-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hide');
      const noPartyFoundError = document.querySelector('span#no-party-found-error');
      noPartyFoundError.classList.add('hide');
      const PartyCodeInput = event.target.querySelector('input#party-code');
      let partyCode = PartyCodeInput.value;

      if (partyCode !== '') {
         partyCode = partyCode.trim();
      }

      if (partyCode === '') {
         noPartyFoundError.classList.remove('hide');
         loadingIcon.classList.add("hide");
         PartyCodeInput.value = '';
         return;
      }

      fetch(`assets/php/website/databasePartyHandlers.php?type=checkPartyExistsUser&partyId=${partyCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (data.partyExists) {
            window.location.href = `/houseparty/party.html?session_code=${partyCode}`;
         } else {
            noPartyFoundError.classList.remove('hide');
         }
         loadingIcon.classList.add("hide");
      }).catch(error => {
         console.error('Join Error:', error);
      });
      PartyCodeInput.value = '';
   });
});