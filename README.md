<p align="center">
  <img src="src/assets/images/HousePartyLogo.png" width="350" height="350"/>
</p>

# House Party - Opening your Spotify queue to your party
This is my final year project for computer science in this project I am aiming to make a website that allows people to let other people add songs to their spotify playlist without the person needing a spotify account or app installed. This is done by using the Spotify Web API and the website acts as a middleman between the user and the Spotify API.

# Documentation
- [API Documentation](src/api/README.md)
- [JS Documentation](src/assets/js/README.md)

# External Libraries Used
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [qr-creator](https://github.com/nimiq/qr-creator)
- [BootStrap Icons](https://getbootstrap.com/)
- [google fonts](https://fonts.google.com/specimen/Roboto)

# Database Design
[dbdiagram.io version](database_design.txt)
- ```users```
  - ```host_id``` - The id of the spotify user (Primary key) 
  - ```refresh_token``` - The refresh token of the spotify user
- ```sessions```
  - ```session_id``` - The session id of the user (Primary key)
  - ```host_id``` - The id of the spotify user
  - ```expires_at``` - Timestamp for when the session expires
- ```parties```
  - ```party_id``` - Id which is going to be used to join the party (Primary key)
  - ```host_id``` - The id of the spotify user
  - ```access_token``` - Token used to send api request for the host
  - ```token_expires_at``` - Timestamp the access token will expire at used to determine when to refresh the access token
  - ```party_expires_at``` - Timestamp for when the party expires and needs to be closed
  - ```explicit``` - Whether or not to allow explicit songs to be added
  - ```duplicate_blocker``` - whether or not to allow duplicate songs to be added to the queue
  - ```permanent``` - whether or not the party is permanent and doesn't expire