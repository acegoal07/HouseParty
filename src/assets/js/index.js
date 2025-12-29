// Initialize variables
let loadingIcon;
let logoutButton;
let loggedIn = false;

// Set up EventSource listeners
const eventSource = new EventSource('api/v2/user/sse/sessionInfo.php', { withCredentials: true });

eventSource.addEventListener('init', () => {
   loadingIcon.classList.add('hide');
   logoutButton.classList.remove('hide');
   loggedIn = true;
});

eventSource.addEventListener('invalidSessionId', () => {
   logoutButton.classList.add('hide');
   loggedIn = false;
   eventSource.close();
});

eventSource.addEventListener('noSessionId', () => {
   loadingIcon.classList.add('hide');
   eventSource.close();
});

globalThis.addEventListener('load', () => {
   // Get DOM elements
   logoutButton = document.querySelector('button#logout-button');
   loadingIcon = document.querySelector('div#loading-icon');

   // Set up button event listeners
   document.querySelector('button#party-manager-button').addEventListener('click', () => {
      if (loggedIn) {
         loadingIcon.classList.remove('hide');
         fetch(`api/v2/user/hasParty.php?`, {
            method: 'GET'
         })
            .then(response => response.json())
            .then(data => {
               if (data.has_active_party) {
                  globalThis.location.href = './dashboard.html';
               } else {
                  globalThis.location.href = './create.html';
               }
            })
            .catch((error) => {
               console.error('Error:', error);
            });
      } else {
         globalThis.location.href = `https://accounts.spotify.com/authorize?${new URLSearchParams({
            client_id: '67fa8a1f5eec455495394d8429fede37',
            response_type: 'code',
            redirect_uri: 'https://houseparty.acegoal07.dev/api/v2/user/login.php',
            scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private user-read-email',
            show_dialog: true
         })}`;
      }
   });

   logoutButton.addEventListener('click', () => {
      loadingIcon.classList.remove('hide');
      fetch(`api/v2/user/logout.php`, {
         method: 'post',
         headers: {
            'Content-Type': 'application/json'
         }
      })
         .then(response => response.json())
         .then(data => {
            if (data.success) {
               loggedIn = false;
               logoutButton.classList.add('hide');
               eventSource.close();
            }
         })
         .then(() => {
            loadingIcon.classList.add('hide');
         })
         .catch(() => {
            console.error('Logout failed');
         });
   });
});