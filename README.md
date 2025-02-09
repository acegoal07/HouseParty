<p align="center">
  <img src="assets/images/HousePartyLogo.png" width="350" height="350"/>
</p>

# House Party - Opening your Spotify queue to your party
This is my final year project for computer science in this project I am aiming to make a website that allows people to let other people add songs to their spotify playlist without the person needing a spotify account or app installed. This is done by using the Spotify Web API and the website acts as a middleman between the user and the Spotify API.
# Documentation
- PHP
  - [Website API documentation](assets/php/website/README.md)
  - [Server scripts documentation](assets/php/server/README.md)
- JS
  - [Pages documentation](assets/js/page/README.md)
  - [Utility documentation](assets/js/util/README.md)
# External Libraries Used
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [qr-code.js](https://davidshimjs.github.io/qrcodejs/)
- [font-awesome](https://fontawesome.com/)
- [BootStrap Icons](https://getbootstrap.com/)
- [google fonts](https://fonts.google.com/specimen/Roboto)
# Database Layout
- ```parties```
  - ```party_id``` - Id which is going to be used to join the party (Primary key)
  - ```host_id``` - The id of the spotify user
  - ```access_token``` - Token used to send api request for the host
  - ```refresh_token``` - Token used to refresh the access token after it expires after 1 hour
  - ```token_expires_at``` - Timestamp the access token will expire at used to determine when to refresh the access token
  - ```party_expires_at``` - Timestamp for when the party expires and needs to be closed 
  - ```explicit``` - Whether or not to allow explicit songs to be added
  - ```duplicate_blocker``` - whether or not to allow duplicate songs to be added to the queue