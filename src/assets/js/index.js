//////////////// Variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let pollingInterval;
let logoutButton;
let loadingIcon;
let loggedIn = false;

//////////////// Polling functions /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pollingFunction() {
   const urlParams = new URLSearchParams({
      type: 'validateSession'
   });
   fetch(`api/website/database.php?${urlParams}`)
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         if (data.validated) {
            logoutButton.classList.remove('hide');
            loggedIn = true;
         } else {
            logoutButton.classList.add('hide');
            loggedIn = false;
         }
      })
      .catch(() => {
         logoutButton.classList.add('hide');
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
window.addEventListener('load', async () => {
   //////////////// Set variables //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   logoutButton = document.querySelector('button#logout-button');
   loadingIcon = document.querySelector('div#loading-icon');

   //////////////// Page polling ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   startPolling();

   //////////////// Party manager button ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelector('button#party-manager-button').addEventListener('click', () => {
      if (loggedIn) {
         globalThis.location.href = './dashboard.html';
      } else {
         globalThis.location.href = `https://accounts.spotify.com/authorize?${new URLSearchParams({
            client_id: '67fa8a1f5eec455495394d8429fede37',
            response_type: 'code',
            redirect_uri: 'https://houseparty.acegoal07.dev/api/website/spotifyLogin.php',
            scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private user-read-email',
            show_dialog: true
         })}`;
      }
   });

   //////////////// Logout button //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   logoutButton.addEventListener('click', () => {
      loadingIcon.classList.remove('hide');
      fetch(`api/website/database.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            type: 'logoutUser'
         })
      })
         .then(() => {
            loadingIcon.classList.add('hide');
         })
         .catch(() => {
            loadingIcon.classList.add('hide');
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
   loadingIcon.classList.add('hide');
});