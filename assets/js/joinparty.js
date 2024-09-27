window.addEventListener('load', () => {
   document.querySelector('form#join-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const partyCode = document.querySelector('input#party-code').value;
      console.log(`HousePartyDebug: Joining party with code ${partyCode}`);
   });
});