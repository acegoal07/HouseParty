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
      loadingIcon.classList.add('hide');
      return;
   }
   fetch(`api/website/spotify.php?${new URLSearchParams({
      type: 'searchSongByName',
      search_term: searchInput,
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
         } else {
            noResults.classList.add('hide');
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
               explicitIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
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
            const addIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            addIcon.setAttribute('class', 'search-results-add-song-icon');
            addIcon.setAttribute('viewBox', '0 0 512 512');
            addIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            addIcon.tabIndex = 0;
            addIcon.setAttribute('aria-label', `Add ${song.name} by ${artists} to the queue`);
            addIcon.setAttribute('role', 'button');

            const addIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            addIconPath.setAttribute('d', 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z');
            addIcon.appendChild(addIconPath);

            // Add event listener to the add icon
            addIcon.addEventListener('keydown', (event) => addSongToQueue(event, song, artists));
            addIcon.addEventListener('click', (event) => addSongToQueue(event, song, artists));

            // Append the add icon to the result container
            resultContainer.appendChild(addIcon);

            // Add spotify logo with link to song
            const spotifyLogoLink = document.createElement('a');
            spotifyLogoLink.href = song.external_urls.spotify;
            spotifyLogoLink.target = '_blank';
            spotifyLogoLink.rel = 'noopener noreferrer';
            spotifyLogoLink.className = 'search-results-spotify-logo-link';
            spotifyLogoLink.ariaLabel = `Open ${song.title} by ${artists} in Spotify`;

            const spotifyLogo = document.createElement('img');
            spotifyLogo.src = 'assets/images/Primary_Logo_White_CMYK.svg';
            spotifyLogo.alt = 'Spotify logo';
            spotifyLogo.className = 'search-results-spotify-logo';
            spotifyLogo.href = song.external_urls.spotify;
            spotifyLogoLink.appendChild(spotifyLogo);

            resultContainer.appendChild(spotifyLogoLink);

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
         document.querySelector('button#copy-party-url').setAttribute('copy-data', `${websiteUrl}${partyId}`);
         document.querySelector('button#share-party-url').setAttribute('share-url', `${websiteUrl}${partyId}`);
         QrCreator.render({
            text: `${websiteUrl}${partyId}`,
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

   //////////////// Page polling //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   //////////////// Search submit //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      search();
   });

   /////////////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });

   /////////////// Finishing up ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   loadingIcon.classList.add('hide');
});