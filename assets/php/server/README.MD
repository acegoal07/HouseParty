# House Party - Server scripts documentation

Go back to the main [README](../../../README.md)

## Contents

- [House Party - Server scripts documentation](#house-party---server-scripts-documentation)
  - [Contents](#contents)
  - [autoClearExpiredPartiesSessions](#autoclearexpiredpartiessessions)
  - [autoSpotifyRefreshToken](#autospotifyrefreshtoken)

<hr>

## autoClearExpiredPartiesSessions

This script runs every 1 minute to clear out expired parties and sessions so there would not be sessions that run over their designated time period.

> **Note:** This script is not currently implemented in the server and instead the current version is using a database event that runs every second but performs the same action.

## autoSpotifyRefreshToken

This script runs every 15 minutes to check for expired Spotify tokens and for tokens that are going to expire within 15 minutes and refresh them if they are.
