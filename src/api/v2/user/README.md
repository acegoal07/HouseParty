# House Party - User API Documentation

Go back to the main [README](../README.md)

## Overview
The User API provides endpoints for managing user sessions and party associations in the House Party application. It allows clients to check if a user is in a party, log in, and log out.

## Endpoints Summary
| Endpoint                | Method | Description                                 |
|-------------------------|--------|---------------------------------------------|
| `/hasParty.php`         | GET    | Check if user is in an active party         |
| `/login.php`            | POST   | Log in a user (see below)                   |
| `/logout.php`           | POST   | Log out and invalidate user session         |

## Contents
- [House Party - User API Documentation](#house-party---user-api-documentation)
  - [Overview](#overview)
  - [Endpoints Summary](#endpoints-summary)
  - [Contents](#contents)
  - [hasParty](#hasparty)
    - [Example Request](#example-request)
    - [Success Response](#success-response)
    - [Error Responses](#error-responses)
  - [login](#login)
    - [Example Request](#example-request-1)
    - [Example Success Response](#example-success-response)
    - [Example Error Response](#example-error-response)
  - [logout](#logout)
    - [Example Request](#example-request-2)
    - [Success Response](#success-response-1)
    - [Error Responses](#error-responses-1)

## hasParty
Checks if a user is currently associated with an active party session.

**Endpoint:** `/api/v2/user/hasParty.php`  
**Method:** `GET`  
**Required Cookies:**
- `session_id`: The user's session identifier.

### Example Request
```http
GET /api/v2/user/hasParty.php
Cookie: session_id=your-session-id
```

### Success Response
**HTTP 200**
```json
{
  "success": true,
  "active_party": true
}
```

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

## login
Authenticates a user and creates a session.

**Endpoint:** `/api/v2/user/login.php`  
**Method:** `POST`

> **Note:** Please document request parameters, authentication flow, and response structure for the login endpoint. Example below:

### Example Request
```http
POST /api/v2/user/login.php
Content-Type: application/json
{
  "username": "your-username",
  "password": "your-password"
}
```

### Example Success Response
**HTTP 200**
```json
{
  "success": true,
  "session_id": "generated-session-id"
}
```

### Example Error Response
**HTTP 401**
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "Invalid credentials"
  }
}
```

## logout
Logs out the user by invalidating their session.

**Endpoint:** `/api/v2/user/logout.php`  
**Method:** `POST`  
**Required Cookies:**
- `session_id`: The user's session identifier.

### Example Request
```http
POST /api/v2/user/logout.php
Cookie: session_id=your-session-id
```

### Success Response
**HTTP 200**
```json
{
  "success": true
}
```

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