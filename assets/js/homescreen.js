window.addEventListener('load', () => {
   document.querySelector('button#join-party').addEventListener('click', () => {
      console.log('HousePartyDebug: Joining party');
   });
   document.querySelector('button#spotify-login').addEventListener('click', () => {
      const queryParams = new URLSearchParams({
         client_id: '67fa8a1f5eec455495394d8429fede37',
         response_type: 'code',
         redirect_uri: 'https://acegoal07.dev',
         scope: 'user-read-playback-state user-modify-playback-state',
         show_dialog: true
      }).toString();
      console.log('HousePartyDebug: Redirecting to Spotify login page');
      window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
   });
});