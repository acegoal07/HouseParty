window.addEventListener('load', () => {
   document.querySelector('a#spotify-login').addEventListener('click', () => {
      const queryParams = new URLSearchParams({
         client_id: '67fa8a1f5eec455495394d8429fede37',
         response_type: 'code',
         redirect_uri: 'http://localhost/houseparty/assets/php/spotifyLogin.php',
         scope: 'user-read-playback-state user-modify-playback-state',
         show_dialog: true
      }).toString();
      window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
   });
   document.querySelector('a#add-test-song').addEventListener('click', () => {
      const token = `Bearer ` + getCookie('access_token');
      fetch('https://api.spotify.com/v1/me/player/queue?uri=spotify:track:4iV5W9uYEdYUVa79Axb7Rh', {
         method: 'POST',
         headers: {
            'Authorization': token
         }
      }).then(response => {
         console.log(response);
      });
   });
   document.querySelector('a#go-to-dashboard').addEventListener('click', () => {
      console.log('HousePartyDebug: Redirecting to dashboard');
   });
   if (getCookie('access_token') !== null) {
      document.querySelector('a#spotify-login').style.display = 'none';
      document.querySelector('a#add-test-song').style.display = 'block';
      document.querySelector('a#go-to-dashboard').style.display = 'block';
   } else {
      document.querySelector('a#spotify-login').style.display = 'block';
      document.querySelector('a#add-test-song').style.display = 'none';
      document.querySelector('a#go-to-dashboard').style.display = 'none';
   }
});