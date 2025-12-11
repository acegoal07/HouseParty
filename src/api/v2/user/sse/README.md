
# House Party - User SSE API Documentation

Go back to the main [README](../../README.md)

## Contents
- [House Party - User SSE API Documentation](#house-party---user-sse-api-documentation)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Endpoint Summary](#endpoint-summary)
  - [sessionInfo](#sessioninfo)
    - [data\_level Options](#data_level-options)
    - [Example Request](#example-request)
    - [Success Events](#success-events)
      - [Event: `init`](#event-init)
      - [Event: `party_update`](#event-party_update)
    - [Error Events](#error-events)
      - [Event: `forbiddenMethod`](#event-forbiddenmethod)
      - [Event: `unauthorized`](#event-unauthorized)
      - [Event: `serverError`](#event-servererror)

## Overview
This API provides real-time updates to the client using Server-Sent Events (SSE). SSE is a simple, efficient way for the server to push data to the browser over HTTP. It is used to keep the user's session alive and optionally deliver party information updates. 

## Endpoint Summary
| Endpoint                              | Method | Description                                 |
|---------------------------------------|--------|---------------------------------------------|
| `/api/v2/user/sse/sessionInfo.php`    | GET    | SSE for session and party info updates      |

## sessionInfo
Provides SSE for real-time updates on the user's session and party details.

**Endpoint:** `/api/v2/user/sse/sessionInfo.php`
**Method:** `GET`
**Required Cookies:**
- `session_id`: The user's session identifier.

**Query Parameters:**
| Name        | Type     | Description                                                                  |
|-------------|----------|------------------------------------------------------------------------------|
| data_level  | string   | Level of detail for session info. Possible values: `none`, `minimal`, `full` |

---
### data_level Options
- `none`: Only validates and keeps the session alive. No party info included. *(Default)*
- `minimal`: Includes basic party info (whether user has an active party).
- `full`: Includes all generic party info (no sensitive data).

---
### Example Request
```http
GET /api/v2/user/sse/sessionInfo.php?data_level=full
Cookie: session_id=your-session-id
Accept: text/event-stream
```

---
### Success Events
#### Event: `init`
Sent upon successful connection and session validation.

**Full `data_level` response example:**
```json
{
  "active_party": true,
  "party": {
    "party_id": "123456",
    "party_expires_at": "2024-12-31T23:59:59Z",
    "explicit": false,
    "duplicate_blocker": true
  }
}
```
**Minimal `data_level` response example:**
```json
{
  "active_party": true
}
```
**None `data_level` response example:**
```json
{}
```

#### Event: `party_update`
Sent whenever there is an update to the party information.

**partyStatusChange response example** (for `minimal` or `full`):
```json
{
  "active_party": true
}
```

**partyIdUpdate response example** (for `full`):
```json
{
  "party_id": "123456"
}
```

**partyExpiresAtUpdate response example** (for `full`):
```json
{
  "party_expires_at": "2024-12-31T23:59:59Z"
}
```

**duplicateBlockerUpdate response example** (for `full`):
```json
{
  "duplicate_blocker": true
}
```

**explicitUpdate response example** (for `full`):
```json
{
  "explicit": true
}
```

---
### Error Events
#### Event: `forbiddenMethod`
Sent when a non-GET method is used.
```json
{
  "error": {
    "type": "forbiddenMethod",
    "message": "Method not allowed"
  }
}
```

#### Event: `unauthorized`
Sent when there is no session id provided.
```json
{
  "error": {
    "type": "unauthorized",
    "message": "No session id provided"
  }
}
```

Sent when the session is invalid or expired.
```json
{
  "error": {
    "type": "unauthorized",
    "message": "Invalid session"
  }
}
```

#### Event: `serverError`
Sent when an error occurs which prevents the server from fulfilling the request.
```json
{}
```