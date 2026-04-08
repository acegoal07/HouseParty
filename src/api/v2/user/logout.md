# logout Endpoint

Return to the [User API README](README.md) or [API v2 README](../README.md).

---

## Summary
Logs out the currently authenticated user by invalidating their session.

---

| Method | Endpoint                              | Auth Required | Description                       |
|--------|---------------------------------------|---------------|-----------------------------------|
| POST   | `/api/v2/user/logout.php`             | Yes (cookie)  | Invalidates the user's session    |

**Required Cookie:**
- `session_id` – The user's session identifier

---

## Usage

**Example Request:**
```http
POST /api/v2/user/logout.php
Cookie: session_id=your-session-id
```

---

## Responses

| HTTP Code | When/Why                                 | Example/Schema |
|-----------|------------------------------------------|----------------|
| 200       | User is authenticated; logout successful  | `{ "success": true }` |
| 401       | No/invalid/expired session id             | See below      |
| 403       | User is authenticated but forbidden       | See below      |
| 405       | Method not allowed (not POST)             | See below      |

### 200 Success
```json
{
  "success": true
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