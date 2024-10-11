window.addEventListener('load', () => {
   const urlParams = new URLSearchParams(window.location.search);
   const sessionCode = urlParams.get('session_code');

   if (!sessionCode) {
      window.location.href = '/houseparty/join.html';
   }

   function pagePolling() {
      fetch(`assets/php/website/databasePartyHandlers.php?type=partyExistsByPartyId&partyId=${sessionCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (!data.partyExists) {
            window.location.href = '/houseparty/join.html';
         }
      });
   }
   pagePolling();
   setInterval(pagePolling, 1500);
});