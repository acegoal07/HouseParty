# House Party - User API Documentation

Go back to the main [README](../README.md)

## Contents
- [House Party - User API Documentation](#house-party---user-api-documentation)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Endpoints Summary](#endpoints-summary)
  - [hasParty](#hasparty)
    - [Example Request](#example-request)
    - [Success Response](#success-response)
    - [Error Responses](#error-responses)
  - [login](#login)
  - [logout](#logout)
    - [Example Request](#example-request-1)
    - [Success Response](#success-response-1)
    - [Error Responses](#error-responses-1)

## Overview
The User API provides endpoints for managing user sessions and party associations in the House Party application. It allows clients to check if a user is in a party, log in, and log out.

## Endpoints Summary
| Endpoint                | Method | Description                                 |
|-------------------------|--------|---------------------------------------------|
| `/hasParty.php`         | GET    | Check if user is in an active party         |
| `/login.php`            | POST   | Log in a user (see below)                   |
| `/logout.php`           | POST   | Log out and invalidate user session         |

---
## hasParty
Checks if a user is currently associated with an active party session.

**Endpoint:** `/api/v2/user/hasParty.php`  
**Method:** `GET`  
**Required Cookies:**
- `session_id`: The user's session identifier.

---
### Example Request
```http
GET /api/v2/user/hasParty.php
Cookie: session_id=your-session-id
```

---
### Success Response
**HTTP 200**
```json
{
  "success": true,
  "active_party": true
}
```

---
### Error Responses
**HTTP 401** (No valid session id)
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "No session id provided"
  }
}
```
**HTTP 401** (Invalid/expired session)
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "Invalid session"
  }
}
```
**HTTP 403** (Forbidden)
```json
{
  "success": false,
  "error": {
    "type": "forbidden",
    "message": "Access to this resource is forbidden"
  }
}
```
**HTTP 405** (Method not allowed)
```json
{
  "success": false,
  "error": {
    "type": "forbiddenMethod",
    "message": "Method not allowed"
  }
}
```
**HTTP 500** (Database error)
```json
{
  "success": false,
  "error": {
    "type": "database",
    "message": "The database error message here"
  }
}
```

---
## login
Work is still ongoing for this endpoint. Documentation will be added soon.

---
## logout
Logs out the user by invalidating their session.

**Endpoint:** `/api/v2/user/logout.php`  
**Method:** `POST`  
**Required Cookies:**
- `session_id`: The user's session identifier.

---
### Example Request
```http
POST /api/v2/user/logout.php
Cookie: session_id=your-session-id
```

---
### Success Response
**HTTP 200**
```json
{
  "success": true
}
```

---
### Error Responses
**HTTP 401** (No valid session id)
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "No session id provided"
  }
}
```
**HTTP 401** (Invalid/expired session)
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "Invalid session"
  }
}
```
**HTTP 403** (Forbidden)
```json
{
  "success": false,
  "error": {
    "type": "forbidden",
    "message": "Access to this resource is forbidden"
  }
}
```
**HTTP 405** (Method not allowed)
```json
{
  "success": false,
  "error": {
    "type": "forbiddenMethod",
    "message": "Method not allowed"
  }
}
```