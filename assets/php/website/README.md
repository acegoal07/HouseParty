# House Party - Website API Documentation

Go back to the main [README](../../../README.md)

## Contents

- [House Party - Website API Documentation](#house-party---website-api-documentation)
  - [Contents](#contents)
  - [Database API](#database-api)
    - [`checkPartyExistsHost`](#checkpartyexistshost)
    - [`partyExistsByPartyId`](#partyexistsbypartyid)
    - [`createParty`](#createparty)
    - [`deleteParty`](#deleteparty)
    - [`updatePartyExplicit`](#updatepartyexplicit)
    - [`updatePartyDuplicateBlocker`](#updatepartyduplicateblocker)
    - [`extendPartyDuration`](#extendpartyduration)
  - [Spotify Middleman API](#spotify-middleman-api)
    - [`getCurrentlyPlaying`](#getcurrentlyplaying)
    - [`searchSongByName`](#searchsongbyname)
    - [`addSongToQueue`](#addsongtoqueue)

<hr>

## Database API

This API manages all interactions with the website's database.

<hr>

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

<hr>

### `partyExistsByPartyId`

Checks whether a party exists for a given party ID and returns data about it if it does.

**Request Type:** `GET`

**Inputs:**

- `partyId` - The ID of the party.

**Returns:**

- `partyExists` - Boolean indicating if the party exists.
- `explicit` - Boolean indicating if the party has explicit content.

<hr>

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

<hr>

### `deleteParty`

Deletes a party from the database.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party to be deleted.
- `hostId` - The ID of the host.
- `refreshToken` - The refresh token for authentication.

**Returns:**

- `success` - Boolean indicating if the party was successfully deleted.

<hr>

### `updatePartyExplicit`

Updates the explicit setting of a party.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party.
- `refreshToken` - The refresh token for authentication.
- `explicit` - Boolean indicating the new explicit setting.

**Returns:**

- `success` - Boolean indicating if the explicit setting was successfully updated.

<hr>

### `updatePartyDuplicateBlocker`

Updates the duplicate blocker setting of a party.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party.
- `refreshToken` - The refresh token for authentication.
- `duplicateBlocker` - Boolean indicating the new duplicate blocker setting.

**Returns:**

- `success` - Boolean indicating if the duplicate blocker setting was successfully updated.

<hr>

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

<hr>

### `getCurrentlyPlaying`

Gets the currently playing song on the hosts Spotify.

**Request Type:** `GET`

**Inputs:**

- `partyId` - The ID of the party.

**Returns:**

- `song info` - The song information of the currently playing song.

<hr>

### `searchSongByName`

Searches for a song by name on Spotify.

**Request Type:** `GET`

**Inputs:**

- `partyId` - The ID of the party.
- `searchTerm` - The name of the song to search for.

**Returns:**

- `totalTracks` - The total number of tracks found.
- `tracks` - An array of track objects.
- `code` - A number that signifies what happened with the function.
  - `code 0:` Action failed due to exceeding API rate limit
  - `code 1:` Search successful

<hr>

### `addSongToQueue`

Adds a song to the queue of the party.

**Request Type:** `POST`

**Inputs:**

- `partyId` - The ID of the party.
- `songId` - The ID of the song to add.

**Returns:**

- `success` - Boolean indicating if the song was successfully added to the queue.
- `responseCode` - A number that signifies what happened with the function.
  - `code 0:` Function failed
  - `code 1:` Song added to queue
  - `code 2:` Song already in queue
  - `code 3:` Failed to add due to the music not being played
  - `code 4:` Action failed due to exceeding API rate limit
