//////////////// Imports ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import '@/assets/js/util/qrcode.js';
import '@/assets/js/util/modalHandler.js';
import '@/assets/js/util/collapsibleHandler.js';
import '@/assets/js/util/clickToCopy.js';
import '@/assets/js/util/clickToShare.js';

//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let pollingInterval;
let partyId;
let loadingIcon;
let searchForm;
let searchResults;
let backToTop;
let noResults;
let explicitToggle;

//////////////// Add song to queue function ////////////////////////////////////////////////////////////////////////////////////////////////////////
function addSongToQueue(event, song, artists) {
   if (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))) {
      loadingIcon.classList.remove('hide');
      fetch(`api/website/spotify.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'addSongToQueue',
            song_id: song.uri,
            party_id: partyId
         })
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               document.dispatchEvent(new CustomEvent('openModal', {
                  detail: {
                     target: 'add-to-queue-successfully-modal',
                     callback: () => {
                        document.querySelector('#add-queue-successfully-song-name').textContent = `${song.name} by ${artists}`;
                     }
                  }
               }));
            } else {
               switch (data.response_code) {
                  case 2:
                     document.dispatchEvent(new CustomEvent('openModal', {
                        detail: {
                           target: 'add-to-queue-duplicate-modal',
                           callback: () => {
                              document.querySelector('#add-queue-duplicate-song-name').textContent = `${song.name} by ${artists}`;
                           }
                        }
                     }));
                     break;
                  case 3:
                     document.dispatchEvent(new CustomEvent('openModal', {
                        detail: {
                           target: 'add-to-queue-not-playing-modal'
                        }
                     }));
                     break;
                  case 4:
                     document.dispatchEvent(new CustomEvent('openModal', {
                        detail: {
                           target: 'too-many-requests-modal'
                        }
                     }));
                     break;
                  case 5:
                     document.dispatchEvent(new CustomEvent('openModal', {
                        detail: {
                           target: 'add-to-queue-explicit-blocked-modal'
                        }
                     }));
                     break;
                  default:
                     document.dispatchEvent(new CustomEvent('openModal', {
                        detail: {
                           target: 'add-to-queue-failed-modal'
                        }
                     }));
                     break;
               }
            }
            loadingIcon.classList.add('hide');
         })
         .catch(error => {
            console.error('Add Song Error:', error);
         });
   }
}

//////////////// Search function ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function search() {
   loadingIcon.classList.remove('hide');
   for (const child of searchResults.querySelectorAll('.search-results-item')) {
      child.remove();
   }
   const searchInputElement = searchForm.querySelector('input');
   const searchInput = searchInputElement.value || searchResults.dataset.currentSearch;
   searchResults.dataset.currentSearch = searchInput;
   searchInputElement.value = '';
   if (!searchInput || searchInput.trim() === '') {
      noResults.classList.remove('hide');
      backToTop.classList.add('hide');
      loadingIcon.classList.add('hide');
      return;
   }
   fetch(`api/website/spotify.php?${new URLSearchParams({
      type: 'searchSongByName',
      search_term: encodeURIComponent(searchInput),
      party_id: partyId
   })}`, {
      method: 'GET'
   })
      .then(response => response.json())
      .then(data => {
         // Handle rate limiting
         if (data.response_code === 1) {
            return document.dispatchEvent(new CustomEvent('openModal', {
               detail: {
                  target: 'too-many-requests-modal'
               }
            }));
         }

         // Check if there are no results
         const tracks = Object.values(data.tracks);
         if (tracks.length === 0) {
            noResults.classList.remove('hide');
            backToTop.classList.add('hide');
         } else {
            noResults.classList.add('hide');
            backToTop.classList.remove('hide');
         }

         // Loop through the tracks and create the result elements
         for (const song of tracks) {
            // Get the artist text
            let charCount = 0;
            const artistsList = [];
            let remainingArtistsCount = 0;

            for (let i = 0; i < song.artists.length; i++) {
               const artistName = song.artists[i].name;
               if (charCount + artistName.length <= 30) {
                  artistsList.push(artistName);
                  charCount += artistName.length;
               } else {
                  remainingArtistsCount = song.artists.length - i;
                  break;
               }
            }

            let artists = artistsList.join(', ');
            if (remainingArtistsCount > 0) {
               artists += `, and ${remainingArtistsCount} more`;
            }

            // Create the result container
            const resultContainer = document.createElement('div');
            resultContainer.className = 'search-results-item';

            // Create the song cover image
            const songCover = document.createElement('img');
            songCover.src = song.album.images[0].url;
            songCover.alt = `${song.name} by ${artists} album cover`;
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
               explicitIcon.setAttribute('class', 'search-results-explicit-icon');
               explicitIcon.setAttribute('viewBox', '0 0 16 16');

               const explicitIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
               explicitIconPath.setAttribute('d', 'M2.5 0A2.5 2.5 0 0 0 0 2.5v11A2.5 2.5 0 0 0 2.5 16h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 13.5 0zm4.326 10.88H10.5V12h-5V4.002h5v1.12H6.826V7.4h3.457v1.073H6.826z');
               explicitIcon.appendChild(explicitIconPath);
               songTitle.appendChild(explicitIcon);
            }

            // Create the song artist
            const songArtist = document.createElement('p');
            songArtist.className = 'search-results-artists';

            songArtist.textContent = artists;
            resultInfoContainer.appendChild(songArtist);

            // Append the result info container to the result container
            resultContainer.appendChild(resultInfoContainer);

            // Create the add icon
            const addIcon = document.createElement('button');
            addIcon.className = 'add-song-button';
            addIcon.setAttribute('aria-label', `Add ${song.name} by ${artists} to the queue`);

            const addIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            addIconSvg.setAttribute('viewBox', '0 0 512 512');
            addIcon.appendChild(addIconSvg);

            const addIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            addIconPath.setAttribute('d', 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z');
            addIconSvg.appendChild(addIconPath);

            // Add event listener to the add icon
            addIcon.addEventListener('click', (event) => addSongToQueue(event, song, artists));

            // Append the add icon to the result container
            resultContainer.appendChild(addIcon);

            // Add spotify logo with link to song
            const spotifyLink = document.createElement('a');
            spotifyLink.href = song.external_urls.spotify;
            spotifyLink.target = '_blank';
            spotifyLink.rel = 'noopener noreferrer';
            spotifyLink.className = 'spotify-link';
            spotifyLink.setAttribute('aria-label', `Open ${song.name} by ${artists} in Spotify`);

            const spotifySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            spotifySvg.setAttribute('viewBox', '0 0 16 16');
            spotifyLink.appendChild(spotifySvg);

            const spotifyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            spotifyPath.setAttribute('d', 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288');
            spotifySvg.appendChild(spotifyPath);

            // Append the spotify link to the result container
            resultContainer.appendChild(spotifyLink);

            // Append the result container to the search results
            searchResults.appendChild(resultContainer);
         }

         loadingIcon.classList.add('hide');
      })
      .catch(error => {
         console.error('Search Error:', error);
      });
}

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   fetch(`api/website/database.php?${new URLSearchParams({
      type: 'validatePartyAndSession',
      party_id: partyId
   })}`, {
      method: 'GET'
   }).then(response => response.json()).then(data => {
      if (!data.party_exists) {
         globalThis.location.href = './join.html';
      }
      if (document.querySelector('div#party-qrcode').childElementCount === 0) {
         const websiteUrl = `${globalThis.location.origin}/party.html?session_code=`;
         document.querySelector('span#party-code').textContent = partyId;
         document.querySelector('button#copy-party-url').dataset.copyData = `${websiteUrl}${encodeURIComponent(partyId)}`;
         document.querySelector('button#share-party-url').dataset.shareUrl = `${websiteUrl}${encodeURIComponent(partyId)}`;
         QrCreator.render({
            text: `${websiteUrl}${encodeURIComponent(partyId)}`,
            radius: 0.5,
            ecLevel: 'H',
            fill: '#fff',
            size: 125
         }, document.querySelector('div#party-qrcode'));
      }
      if (data.explicit !== explicitToggle) {
         explicitToggle = data.explicit;
         if (searchResults.querySelectorAll('.search-results-item').length > 0) {
            search();
         }
      }
   }).catch(error => {
      console.error('Page Polling Error:', error);
   });
}

function startPolling() {
   pollingFunction();
   pollingInterval = setInterval(pollingFunction, 1000);
}

function stopPolling() {
   clearInterval(pollingInterval);
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   partyId = new URLSearchParams(globalThis.location.search).get('session_code')?.trim();
   loadingIcon = document.querySelector('div#loading-icon');
   if (!partyId) {
      globalThis.location.href = './join.html';
   }
   searchForm = document.querySelector('form#search-song-form');
   searchResults = document.querySelector('div#search-results');
   noResults = document.querySelector('span#no-results');
   backToTop = document.querySelector('button#back-to-top');

   //////////////// Page polling //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   //////////////// Search submit //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      search();
   });

   /////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });

   /////////////// Back to Top ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('#back-to-top').addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo(0, 0);
      document.firstElementChild.focus();
   });

   /////////////// Finishing up ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon.classList.add('hide');
});