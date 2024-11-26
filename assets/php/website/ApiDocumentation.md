<div style="text-align: center;">
  <img src="../../../assets/images/HousePartyLogo.png" alt="House Party Logo">
</div>

# House Party - API Documentation

## Contents

- [House Party - API Documentation](#house-party---api-documentation)
  - [Contents](#contents)
  - [Database API](#database-api)
    - [`checkPartyExistsHost`](#checkpartyexistshost)
    - [`partyExistsByPartyId`](#partyexistsbypartyid)
    - [`createParty`](#createparty)
    - [`deleteParty`](#deleteparty)
    - [`updatePartyExplicit`](#updatepartyexplicit)
    - [`extendPartyDuration`](#extendpartyduration)
  - [Spotify Middleman API](#spotify-middleman-api)
    - [`getCurrentlyPlaying`](#getcurrentlyplaying)
    - [`searchSongByName`](#searchsongbyname)
    - [`addSongToQueue`](#addsongtoqueue)

<hr>

## Database API

This API manages all interactions with the website's database.

### `checkPartyExistsHost`

Checks whether a party exists for a given host ID and returns data about it if it does.

**Request Type:** `GET`

**Inputs:**

- `hostId` - The ID of the host.
- `refreshToken` - The refresh token for authentication.

**Returns:**

- `partyExists` - Boolean indicating if the party exists.
- `refreshTokenValid` - Boolean indicating if the refresh token is valid.
- `explicit` - Boolean indicating if the party has explicit content.
- `partyId` - The ID of the party.
- `partyExpiresAt` - The expiration time of the party.

### `partyExistsByPartyId`

Checks whether a party exists for a given party ID and returns data about it if it does.

**Request Type:** `GET`

**Inputs:**

- `partyId` - The ID of the party.

**Returns:**

- `partyExists` - Boolean indicating if the party exists.
- `explicit` - Boolean indicating if the party has explicit content.

### `createParty`

Creates a new party in the database.

**Request Type:** `POST`

**Inputs:**

- `hostId` - The ID of the host.
- `refreshToken` - The refresh token for authentication.
- `partyEndsIn` - The duration for which the party will last.
- `explicit` - Boolean indicating if the party has explicit content.

**Returns:**

- `success` - Boolean indicating if the party was successfully created.

### `deleteParty`

Deletes a party from the database.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party to be deleted.
- `hostId` - The ID of the host.
- `refreshToken` - The refresh token for authentication.

**Returns:**

- `success` - Boolean indicating if the party was successfully deleted.

### `updatePartyExplicit`

Updates the explicit setting of a party.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party.
- `refreshToken` - The refresh token for authentication.
- `explicit` - Boolean indicating the new explicit setting.

**Returns:**

- `success` - Boolean indicating if the explicit setting was successfully updated.

### `extendPartyDuration`

Extends the duration of a party.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party.
- `refreshToken` - The refresh token for authentication.
- `extendBy` - The amount of time to extend the party by.

**Returns:**

- `success` - Boolean indicating if the party duration was successfully extended.

<hr>

## Spotify Middleman API

This API facilitates interactions with the Spotify API and manages database operations for specific data requirements.

### `getCurrentlyPlaying`

Gets the currently playing song on the hosts Spotify.

**Request Type:** `GET`

**Inputs:**

- `partyId` - The ID of the party.

**Returns:**

- `song info` - The song information of the currently playing song.

### `searchSongByName`

Searches for a song by name on Spotify.

**Request Type:** `GET`

**Inputs:**

- `partyId` - The ID of the party.
- `searchTerm` - The name of the song to search for.

**Returns:**

- `totalTracks` - The total number of tracks found.
- `tracks` - An array of track objects.

### `addSongToQueue`

Adds a song to the queue of the party.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party.
- `songId` - The ID of the song to add.
