# Screenshot Manager API Documentation

## API Endpoints

### Public Endpoints

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}

# Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "username": "admin",
    "expiresIn": 86400
  }
}
```

#### Logout

```bash
POST /api/auth/logout
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### Protected Endpoints (Require JWT Token)

#### List All Screenshots

```bash
GET /api/screenshots
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Screenshots retrieved successfully",
  "data": {
    "screenshots": [
      {
        "key": "SCR-20251130-s46.png",
        "size": 123456,
        "uploaded": "2024-11-30T12:00:00.000Z",
        "etag": "abc123...",
        "url": "https://ss.prabapro.me/SCR-20251130-s46.png",
        "metadata": {
          "description": "Homepage design mockup",
          "tags": ["design", "homepage", "mockup"]
        }
      }
    ],
    "count": 1,
    "truncated": false
  }
}
```

#### Get Screenshot Details

```bash
GET /api/screenshots/:key
Authorization: Bearer <token>

# Example:
GET /api/screenshots/SCR-20251130-s46.png
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Screenshot details retrieved successfully",
  "data": {
    "key": "SCR-20251130-s46.png",
    "size": 123456,
    "uploaded": "2024-11-30T12:00:00.000Z",
    "etag": "abc123...",
    "url": "https://ss.prabapro.me/SCR-20251130-s46.png",
    "metadata": {
      "description": "Homepage design mockup",
      "tags": ["design", "homepage", "mockup"]
    }
  }
}
```

#### Update Screenshot Metadata

```bash
PATCH /api/screenshots/:key
Authorization: Bearer <token>
Content-Type: application/json

{
  "metadata": {
    "description": "Updated description for the screenshot",
    "tags": ["tag1", "tag2", "tag3"]
  }
}

# Example:
PATCH /api/screenshots/SCR-20251130-s46.png
Authorization: Bearer <token>
Content-Type: application/json

{
  "metadata": {
    "description": "Homepage design mockup - final version",
    "tags": ["design", "homepage", "mockup", "final"]
  }
}

# Response:
{
  "success": true,
  "message": "Screenshot metadata updated successfully",
  "data": {
    "key": "SCR-20251130-s46.png",
    "metadata": {
      "description": "Homepage design mockup - final version",
      "tags": ["design", "homepage", "mockup", "final"]
    }
  }
}
```

**Metadata Update Notes:**

- The update is a **merge operation** - you can update description, tags, or both
- To remove description: send `"description": ""` or `"description": null`
- To remove all tags: send `"tags": []` or `"tags": null`
- Existing metadata that's not included in the request remains unchanged

**Metadata Validation Rules:**

- `description`: String, max 500 characters
- `tags`: Array of strings, max 10 tags
- Each tag: max 50 characters
- Tags are case-sensitive but duplicates (case-insensitive) are removed
- Total metadata size: max 2KB (R2 limit)

#### Delete Screenshot

```bash
DELETE /api/screenshots/:key
Authorization: Bearer <token>

# Example:
DELETE /api/screenshots/SCR-20251130-s46.png
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Screenshot deleted successfully",
  "data": {
    "key": "SCR-20251130-s46.png"
  }
}
```

**Note:** Deleting a screenshot automatically removes all associated metadata.

---

## Testing with cURL

### 1. Login and Get Token

```bash
curl -X POST http://127.0.0.1:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-password"
  }'
```

Save the token from the response for subsequent requests.

### 2. List Screenshots

```bash
curl -X GET http://127.0.0.1:8788/api/screenshots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Screenshot Details

```bash
curl -X GET "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Update Screenshot Metadata

**Add/Update both description and tags:**

```bash
curl -X PATCH "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "description": "Screenshot of the new feature implementation",
      "tags": ["feature", "implementation", "UI"]
    }
  }'
```

**Update only description:**

```bash
curl -X PATCH "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "description": "Updated description only"
    }
  }'
```

**Update only tags:**

```bash
curl -X PATCH "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "tags": ["new-tag-1", "new-tag-2"]
    }
  }'
```

**Remove description:**

```bash
curl -X PATCH "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "description": ""
    }
  }'
```

**Remove all tags:**

```bash
curl -X PATCH "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "tags": []
    }
  }'
```

### 5. Delete Screenshot

```bash
curl -X DELETE "http://127.0.0.1:8788/api/screenshots/mock-123-ies.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Metadata Examples

### Basic Metadata

```json
{
  "metadata": {
    "description": "Login page design",
    "tags": ["UI", "login", "authentication"]
  }
}
```

### Description Only

```json
{
  "metadata": {
    "description": "Error state for failed API calls"
  }
}
```

### Tags Only

```json
{
  "metadata": {
    "tags": ["bug", "critical", "production"]
  }
}
```

### Minimal Metadata

```json
{
  "metadata": {
    "tags": ["misc"]
  }
}
```

---

## Error Responses

### Invalid Metadata Format

```json
{
  "success": false,
  "error": "Invalid metadata",
  "details": [
    "Tags must be an array",
    "Description must not exceed 500 characters"
  ]
}
```

### Screenshot Not Found

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized - Invalid or missing token"
}
```

### Metadata Too Large

```json
{
  "success": false,
  "error": "Invalid metadata",
  "details": [
    "Metadata size (2150 bytes) exceeds maximum allowed size of 2048 bytes"
  ]
}
```
