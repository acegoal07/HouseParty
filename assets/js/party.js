window.addEventListener('load', () => {
   const urlParams = new URLSearchParams(window.location.search);
   const sessionCode = urlParams.get('session_code');

   if (!sessionCode) {
      window.location.href = '/houseparty/join.html';
   }

   fetch(`assets/php/databasePartyHandlers.php?type=partyExistsById&partyId=${sessionCode}`, {
      method: 'GET'
   }).then(response => response.json()).then(data => {
      if (!data.partyExists) {
         window.location.href = '/houseparty/join.html';
      }
   });

   console.log(sessionCode);
});