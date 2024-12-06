window.addEventListener('load', () => {
   const sessionCode = new URLSearchParams(window.location.search).get('session_code');
   const loadingIcon = document.querySelector('div#loading-icon');
   if (!sessionCode) {
      console.log(sessionCode);
      window.location.href = '/houseparty/join.html';
   }
   const searchForm = document.querySelector('form#search-song-form');
   const searchResults = document.querySelector('div#search-results');
   let explicitToggle;
   //////////////// Page polling //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   function pagePolling() {
      fetch(`assets/php/website/databasePartyHandlers.php?type=checkPartyExistsUser&partyId=${sessionCode}`, {
         method: 'GET'
      }).then(response => response.json()).then(data => {
         if (!data.partyExists) {
            console.log(data);
            window.location.href = '/houseparty/join.html';
         }
         if (document.querySelector('div#party-qrcode').childElementCount === 0) {
            const websiteUrl = `https://aw1443.brighton.domains/houseparty/party.html?session_code=`;
            document.querySelector('span#party-code').textContent = sessionCode;
            document.querySelector('button#copy-party-url').setAttribute('copy-data', `${websiteUrl}${sessionCode}`);
            document.querySelector('button#share-party-url').setAttribute('data-party-url', `${websiteUrl}${sessionCode}`);
            new QRCode(document.querySelector('div#party-qrcode'), {
               text: `${websiteUrl}${sessionCode}`,
               width: 150,
               height: 150
            });
         }
         if (data.explicit !== explicitToggle) {
            document.querySelector('p.explicit-indicator').textContent = data.explicit ? 'enabled' : 'disabled';
            explicitToggle = data.explicit;
            if (searchResults.hasChildNodes()) {
               searchFunction();
            }
         }
      });
   }
   pagePolling();
   setInterval(pagePolling, 1500);
   //////////////// Search submit //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchFunction();
   });
   function searchFunction() {
      loadingIcon.classList.remove('hidden');
      while (searchResults.firstChild) { searchResults.removeChild(searchResults.firstChild); }
      const searchInputElement = document.querySelector('input#search-term');
      const searchInput = searchInputElement.value || searchResults.getAttribute('data-current-search');
      searchResults.setAttribute('data-current-search', searchInput);
      searchInputElement.value = '';
      if (!searchInput || searchInput.replaceAll(' ', '') === '') {
         loadingIcon.classList.add('hidden');
         return;
      }
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
               resultContainer.tabIndex = 0;

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

               // Add the explicit icon if the song is explicit
               if (song.explicit) {
                  const explicitIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  explicitIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                  explicitIcon.setAttribute('class', 'search-results-explicit-icon');
                  explicitIcon.setAttribute('viewBox', '0 0 16 16');

                  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  path.setAttribute('d', 'M2.5 0A2.5 2.5 0 0 0 0 2.5v11A2.5 2.5 0 0 0 2.5 16h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 13.5 0zm4.326 10.88H10.5V12h-5V4.002h5v1.12H6.826V7.4h3.457v1.073H6.826z');
                  explicitIcon.appendChild(path);
                  songTitle.appendChild(explicitIcon);
               }

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

               addIcon.addEventListener('click', () => {
                  loadingIcon.classList.remove('hidden');
                  fetch(`assets/php/website/spotifyHandler.php`, {
                     method: 'post',
                     headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     body: `type=addSongToQueue&songId=${song.uri}&partyId=${sessionCode}`
                  }).then(response => response.json()).then(data => {
                     loadingIcon.classList.add('hidden');
                     if (data.duplicate && data.success) {
                        document.dispatchEvent(new CustomEvent('openModal', {
                           detail: {
                              target: 'add-to-queue-duplicate-modal',
                              callback: () => {
                                 document.querySelector('#add-queue-duplicate-song-name').textContent = `${song.name} by ${artistsList.join(', ')}`;
                              }
                           }
                        }));
                     } else if (!data.duplicate && data.success) {
                        document.dispatchEvent(new CustomEvent('openModal', {
                           detail: {
                              target: 'add-to-queue-successfully-modal',
                              callback: () => {
                                 document.querySelector('#add-queue-successfully-song-name').textContent = `${song.name} by ${artistsList.join(', ')}`;
                              }
                           }
                        }));
                     } else {
                        document.dispatchEvent(new CustomEvent('openModal', {
                           detail: {
                              target: 'add-to-queue-failed-modal'
                           }
                        }));
                     }
                  });
               });

               // Append the add icon to the result container
               resultContainer.appendChild(addIcon);

               // Append the result container to the search results
               searchResults.appendChild(resultContainer);
            }
         }
         loadingIcon.classList.add('hidden');
      });
   }

   loadingIcon.classList.add('hidden');
});