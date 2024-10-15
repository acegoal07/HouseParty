window.addEventListener('load', () => {
   // Check if the user is already logged in and display the appropriate button
   if (getCookie('refresh_token') !== null && getCookie('host_id') !== null) {
      this.document.querySelector('a#go-to-dashboard-button').classList.remove('hidden');
      this.document.querySelector('button#logout-button').classList.remove('hidden');
   } else {
      deleteCookie({ name: 'host_id' });
      deleteCookie({ name: 'refresh_token' });
      this.document.querySelector('button#spotify-login-button').classList.remove('hidden');
   }
   // Add event listener to the Spotify login button
   this.document.querySelector('button#spotify-login-button').addEventListener('click', () => {
      const queryParams = new URLSearchParams({
         client_id: '67fa8a1f5eec455495394d8429fede37',
         response_type: 'code',
         redirect_uri: 'https://aw1443.brighton.domains/houseparty/assets/php/website/spotifyLogin.php',
         scope: 'user-read-playback-state user-modify-playback-state user-read-private user-read-email user-read-currently-playing',
         show_dialog: true
      });
      window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
   });
   // Add event listener to the logout button
   this.document.querySelector('button#logout-button').addEventListener('click', () => {
      deleteCookie({ name: 'host_id' });
      deleteCookie({ name: 'refresh_token' });
      window.location.reload();
   });
   // Hide the loading icon
   this.document.querySelector('div#loading-icon').classList.add('hidden');
});