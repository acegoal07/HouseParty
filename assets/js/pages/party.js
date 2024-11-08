window.addEventListener('load', () => {
   const sessionCode = new URLSearchParams(window.location.search).get('session_code');
   const loadingIcon = document.querySelector('div#loading-icon');
   if (!sessionCode) {
      window.location.href = '/houseparty/join.html';
   }
   //////////////// Page polling //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
   //////////////// Search submit //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('form#search-song-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadingIcon.classList.remove('hidden');
      const searchResults = document.querySelector('div#search-results');
      while (searchResults.firstChild) { searchResults.removeChild(searchResults.firstChild); }
      const searchInputElement = document.querySelector('input#search-term');
      const searchInput = searchInputElement.value;
      if (!searchInput) {
         loadingIcon.classList.add('hidden');
         return;
      }
      searchInputElement.value = '';
      fetch(`assets/php/website/spotifyHandler.php?type=searchSongByName&searchTerm=${searchInput}&partyId=${sessionCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         const tracks = data.tracks;
         for (const key in tracks) {
            if (tracks.hasOwnProperty(key)) {
               const song = tracks[key];

               // Create the result container
               const resultContainer = document.createElement('div');
               resultContainer.className = 'search-results-item';
               resultContainer.tabIndex = 0; // Make the result container focusable

               // Create the song cover image
               const songCover = document.createElement('img');
               songCover.src = song.album.images[0].url;
               songCover.alt = `${song.name} cover`;
               songCover.className = 'search-results-cover';
               resultContainer.appendChild(songCover);

               // Create the result info container
               const resultInfoContainer = document.createElement('div');
               resultInfoContainer.className = 'search-results-info-container';

               // Create the song title
               const songTitle = document.createElement('p');
               songTitle.className = 'search-results-title';
               songTitle.textContent = song.name;
               resultInfoContainer.appendChild(songTitle);

               // Create the song artist
               const songArtist = document.createElement('p');
               songArtist.className = 'search-results-creators';
               const artistsList = song.artists.map(artist => artist.name);
               songArtist.textContent = artistsList.join(', ');
               resultInfoContainer.appendChild(songArtist);

               // Append the result info container to the result container
               resultContainer.appendChild(resultInfoContainer);

               // Create the an svg icon without using inner html
               const addIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
               addIcon.setAttribute('class', 'search-results-add-song-icon');
               addIcon.setAttribute('viewBox', '0 0 512 512');
               addIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

               const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
               path.setAttribute('d', 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z');
               addIcon.appendChild(path);

               // Append the add icon to the result container
               resultContainer.appendChild(addIcon);

               // Append the result container to the search results
               searchResults.appendChild(resultContainer);
            }
         }
         loadingIcon.classList.add('hidden');
      });
   });

   loadingIcon.classList.add('hidden');
});