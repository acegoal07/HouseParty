# hasParty Endpoint

Return to the [User API README](README.md) or [API v2 README](../README.md).

---

## Summary
Checks if the currently authenticated user is associated with an active party session.

---

| Method | Endpoint                              | Auth Required | Description                       |
|--------|---------------------------------------|---------------|-----------------------------------|
| GET    | `/api/v2/user/hasParty.php`           | Yes (cookie)  | Returns party status for the user |

**Required Cookie:**
- `session_id` – The user's session identifier

---

## Usage

**Example Request:**
```http
GET /api/v2/user/hasParty.php
Cookie: session_id=your-session-id
```

---

## Responses

| HTTP Code | When/Why                                 | Example/Schema |
|-----------|------------------------------------------|----------------|
| 200       | User is authenticated; request successful | `{ "success": true, "active_party": true }` |
| 401       | No/invalid/expired session id             | See below      |
| 403       | User is authenticated but forbidden       | See below      |
| 405       | Method not allowed (not GET)              | See below      |
| 500       | Internal/database error                   | See below      |

### 200 Success
```json
{
  "success": true,
  "active_party": true
}
```

### 401 Unauthorized (No valid session id)
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "No session id provided"
  }
}
```

### 401 Unauthorized (Invalid/expired session)
```json
{
  "success": false,
  "error": {
    "type": "unauthorized",
    "message": "Invalid session"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "type": "forbidden",
    "message": "Access to this resource is forbidden"
  }
}
```

### 405 Method Not Allowed
```json
{
  "success": false,
  "error": {
    "type": "forbiddenMethod",
    "message": "Method not allowed"
  }
}
```

### 500 Database Error
```json
{
  "success": false,
  "error": {
    "type": "database",
    "message": "The database error message here"
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