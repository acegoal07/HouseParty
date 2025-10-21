# House Party - Server scripts documentation

Go back to the main [README](../../../README.md)

## Contents

- [House Party - Server scripts documentation](#house-party---server-scripts-documentation)
  - [Contents](#contents)
  - [autoClearExpiredPartiesSessions](#autoclearexpiredpartiessessions)
  - [autoSessionCleanUp](#autosessioncleanup)
  - [autoSpotifyRefreshToken](#autospotifyrefreshtoken)

<hr>

## autoClearExpiredPartiesSessions

This script runs every 1 minute to clear out expired parties and sessions so there would not be sessions that run over their designated time period.

## autoSessionCleanUp
This script runs every 1 minutes to clean up old sessions and orphaned users from the database to keep it optimized and prevent bloat.

## autoSpotifyRefreshToken

This script runs every 15 minutes to check for expired Spotify tokens and for tokens that are going to expire within 15 minutes and refresh them if they are.