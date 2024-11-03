window.addEventListener('load', () => {
   const sessionCode = new URLSearchParams(window.location.search).get('session_code');
   const loadingIcon = document.querySelector('div#loading-icon');
   if (!sessionCode) {
      window.location.href = '/houseparty/join.html';
   }

   function pagePolling() {
      fetch(`assets/php/website/databasePartyHandlers.php?type=checkPartyExistsUser&partyId=${sessionCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (!data.partyExists) {
            window.location.href = '/houseparty/join.html';
         }
      });
   }
   pagePolling();
   setInterval(pagePolling, 1500);

   document.querySelector('form#join-party-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const searchInputElement = document.querySelector('input#search-term');
      const searchInput = searchInputElement.value;
      searchInputElement.value = '';
      fetch(`assets/php/website/spotifyHandler.php?type=searchSongByName&searchTerm=${searchInput}&partyId=${sessionCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         console.log(data);
      });
   });

   loadingIcon.classList.add('hidden');
});