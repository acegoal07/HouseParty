# House Party - Website API Documentation

Go back to the main [README](../../../README.md)

## Contents

- [House Party - Website API Documentation](#house-party---website-api-documentation)
  - [Contents](#contents)
  - [Database API](#database-api)
    - [`checkLoggedInUser`](#checkloggedinuser)
    - [`checkPartyExists`](#checkpartyexists)
    - [`createParty`](#createparty)
    - [`deleteParty`](#deleteparty)
    - [`updatePartyExplicit`](#updatepartyexplicit)
    - [`updatePartyDuplicateBlocker`](#updatepartyduplicateblocker)
    - [`extendPartyDuration`](#extendpartyduration)
  - [Spotify API](#spotify-api)
    - [`getCurrentlyPlaying`](#getcurrentlyplaying)
    - [`searchSongByName`](#searchsongbyname)
    - [`addSongToQueue`](#addsongtoqueue)

<hr>

## Database API

This API manages all interactions with the website's database.

<hr>

### `checkLoggedInUser`

Check if a users session id is valid and returns data about the user if it is depending on what's requested.

**Request Type:** `GET`

**Inputs:**
- `session_id` - The session ID of the user.
- `session_data` - Boolean indicating if the session data should be returned.

**Returns:**
TBD

<hr>

### `checkPartyExists`

Check if a party exists and check session validation if session_id is provided.

**Request Type:** `GET`

**Inputs:**
- `party_id` - The ID of the party.
- `session_id` (optional) - The session ID of the user.

**Returns:**
TBD

<hr>

### `createParty`

Creates a new party in the database.

**Request Type:** `POST`

**Inputs:**

- `session_id` - The session ID of the user.
- `party-ends_in` - The duration for which the party will last.
- `duplicate_blocker` - Boolean indicating if duplicate songs are blocked.
- `explicit` - Boolean indicating if the party has explicit content.

**Returns:**

- `success` - Boolean indicating if the party was successfully created.

<hr>

### `deleteParty`

Deletes a party from the database.

**Request Type:** `POST`

**Inputs:**

- `party_id` - The ID of the party to be deleted.
- `session_id` - The session ID of the user.

**Returns:**

- `success` - Boolean indicating if the party was successfully deleted.

<hr>

### `updatePartyExplicit`

Updates the explicit setting of a party.

**Request Type:** `POST`

**Inputs:**

- `party_id` - The ID of the party.
- `session_id` - The session ID of the user.
- `explicit` - Boolean indicating the new explicit setting.

**Returns:**

- `success` - Boolean indicating if the explicit setting was successfully updated.

<hr>

### `updatePartyDuplicateBlocker`

Updates the duplicate blocker setting of a party.

**Request Type:** `POST`

**Inputs:**

- `party_id` - The ID of the party.
- `session_id` - The session ID of the user.
- `duplicate_blocker` - Boolean indicating the new duplicate blocker setting.

**Returns:**

- `success` - Boolean indicating if the duplicate blocker setting was successfully updated.

<hr>

### `extendPartyDuration`

Extends the duration of a party.

**Request Type:** `POST`

**Inputs:**

- `party_id` - The ID of the party.
- `session_id` - The session ID of the user.
- `extend_by` - The amount of time to extend the party by.

**Returns:**

- `success` - Boolean indicating if the party duration was successfully extended.

<hr>

## Spotify API

This API facilitates interactions with the Spotify API and manages database operations required to support the party functionality.

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
  - `code 5:` Song was explicit and explicit content is not allowed