# House Party - Server scripts documentation

Go back to the main [README](../../../README.md)

## Contents

- [House Party - Server scripts documentation](#house-party---server-scripts-documentation)
  - [Contents](#contents)
  - [serverManagement](#servermanagement)

<hr>

## serverManagement
This script has various server management tasks that are run via cron jobs.

- **cleanupExpiredData**: Deletes expired parties, sessions, and users without active sessions or parties. This task is set to run every minute.
- **refreshAccessTokens**: Refreshes Spotify access tokens for parties whose tokens are expiring within the next 15 minutes. This task is set to run every 10 minutes.
