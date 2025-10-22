//////////////// Imports ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { deleteCookie, getCookie, extendCookie } from '@/assets/js/util/cookies.js';

//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let pollingInterval;
let logoutButton;

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   if (getCookie('session_id') === null) {
      logoutButton.classList.add('hide');
   } else {
      const urlParams = new URLSearchParams({
         type: 'validateSession',
         session_id: `${getCookie('session_id')}`
      });
      fetch(`api/website/database.php?${urlParams}`)
         .then((response) => {
            return response.json();
         })
         .then((data) => {
            if (data.validated) {
               logoutButton.classList.remove('hide');
            } else {
               logoutButton.classList.add('hide');
               deleteCookie({ name: 'session_id' });
            }
            if (data.extended) {
               extendCookie({ name: 'session_id', days: 0.5 });
            }
         })
         .catch(() => {
            logoutButton.classList.add('hide');
            deleteCookie({ name: 'session_id' });
         });
   }
}

function startPolling() {
   pollingFunction();
   pollingInterval = setInterval(pollingFunction, 1000);
}

function stopPolling() {
   clearInterval(pollingInterval);
}

//////////////// Main Body /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', async () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   logoutButton = document.querySelector('button#logout-button');

   //////////////// Page polling ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   //////////////// Party manager button ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('button#party-manager-button').addEventListener('click', () => {
      if (getCookie('session_id') === null) {
         globalThis.location.href = `https://accounts.spotify.com/authorize?${new URLSearchParams({
            client_id: '67fa8a1f5eec455495394d8429fede37',
            response_type: 'code',
            redirect_uri: 'https://beta.acegoal07.dev/api/website/spotifyLogin.php',
            scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private user-read-email',
            show_dialog: true
         })}`;
      } else {
         globalThis.location.href = './dashboard.html';
      }
   });

   //////////////// Logout button //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   logoutButton.addEventListener('click', () => {
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'logoutUser',
            session_id: getCookie('session_id')
         })
      })
         .then(() => {
            deleteCookie({ name: 'session_id' });
            globalThis.location.reload();
         });
   });

   /////////////////////// Stop Polling while off the page /////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         stopPolling();
      } else {
         startPolling();
      }
   });

   /////////////////////// Final setup /////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('div#loading-icon').classList.add('hide');
});