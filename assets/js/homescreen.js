window.addEventListener('load', () => {
   document.querySelector('button#join-party').addEventListener('click', () => {
      console.log('HousePartyDebug: Joining party');
   });
   document.querySelector('button#spotify-login').addEventListener('click', () => {
      const queryParams = new URLSearchParams({
         client_id: '67fa8a1f5eec455495394d8429fede37',
         response_type: 'code',
         redirect_uri: 'http://localhost/houseparty/assets/php/spotifyLogin.php',
         scope: 'user-read-playback-state user-modify-playback-state',
         show_dialog: true
      }).toString();
      console.log('HousePartyDebug: Redirecting to Spotify login page');
      window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
   });
   document.querySelector('button#add-test-song').addEventListener('click', () => {
      const token = `Bearer ` + getCookie('access_token');
      console.log('HousePartyDebug: Adding test song to queue');
      fetch('https://api.spotify.com/v1/me/player/queue?uri=spotify:track:4iV5W9uYEdYUVa79Axb7Rh', {
         method: 'POST',
         headers: {
            'Authorization': token
         }
      }).then(response => {
         console.log(response);
      });
   });
});

/**
 * getCookie
 * Get's the value of the cookie with the provided name
 * @param {String} name The name of the cookie
 * @returns {any} The value of the cookie
 */
function getCookie(name) {
   const nameEQ = name + "=";
   for (let cookie of document.cookie.split(';')) {
      while (cookie.startsWith(' ')) {
         cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.startsWith(nameEQ)) {
         return cookie.substring(nameEQ.length, cookie.length);
      }
   }
   return null;
}