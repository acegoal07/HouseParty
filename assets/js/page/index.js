window.addEventListener('load', () => {
   const partyManagerButton = document.querySelector('button#party-manager-button');
   const logoutButton = document.querySelector('button#logout-button');
   const loadingIcon = document.querySelector('div#loading-icon');
   // Check if the user is already logged in and display the appropriate button
   function checkCookies() {
      if (getCookie('refresh_token') !== null && getCookie('host_id') !== null) {
         logoutButton.classList.remove('hide');
      } else {
         deleteCookie({ name: 'host_id' });
         deleteCookie({ name: 'refresh_token' });
         logoutButton.classList.add('hide');
      }
   }
   checkCookies();
   setInterval(checkCookies, 1000);
   //Extend cookies periodically
   function extendCookiesPeriodically() {
      extendCookie({ name: 'refresh_token', days: 1 });
      extendCookie({ name: 'host_id', days: 1 });
   }
   extendCookiesPeriodically();
   setInterval(extendCookiesPeriodically, 15 * 60 * 1000);
   // Add event listener to the party manager button
   partyManagerButton.addEventListener('click', () => {
      if (getCookie('refresh_token') !== null && getCookie('host_id') !== null) {
         window.location.href = './dashboard.html';
      } else {
         const queryParams = new URLSearchParams({
            client_id: '67fa8a1f5eec455495394d8429fede37',
            response_type: 'code',
            redirect_uri: 'https://aw1443.brighton.domains/housepartyv2/assets/php/website/spotifyLogin.php',
            scope: 'user-read-playback-state user-modify-playback-state user-read-private user-read-email user-read-currently-playing',
            show_dialog: true
         });
         window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
      }
   });
   // Add event listener to the logout button
   logoutButton.addEventListener('click', () => {
      loadingIcon.classList.remove('hide');
      deleteCookie({ name: 'host_id' });
      deleteCookie({ name: 'refresh_token' });
      window.location.reload();
   });
   // Remove the loading icon
   loadingIcon.classList.add('hide');
});