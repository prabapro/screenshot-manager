# Screenshot Manager API Documentation

## Environment Variables Setup

### Local Development (.dev.vars file)

Create a `.dev.vars` file in the root directory:

```bash
AUTH_PASSWORD=your-password-here
JWT_SECRET=your-long-random-jwt-secret-min-32-chars
```

> [!NOTE]
> Wrangle having issues injecting env vars from Infisical. Hence use manual `.dev.vars` file by copying vars from Infisical dashboard.

**Generate a secure JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Cloudflare Dashboard (Production)

Set these as encrypted environment variables in the Cloudflare Workers dashboard:

1. Go to your Worker → Settings → Variables
2. Add the following variables:
   - `AUTH_PASSWORD` - Your admin password (encrypted)
   - `JWT_SECRET` - Your JWT secret (encrypted)

The R2 bucket binding is already configured in `wrangler.toml`.

---

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

---

## Local Development

### Start Development Server

```bash
npm run dev
```

This will start:

- Vite dev server on `http://localhost:3000`
- Wrangler dev server on `http://127.0.0.1:8788`

### Development Mode Features

In development mode (when running locally):

- Mock data is used instead of actual R2 operations
- Responses include `__dev_mode: true` flag
- Metadata updates are simulated (not persisted)
- Useful for testing API structure without R2 setup

---

## Production Deployment

### Deploy to Cloudflare Pages

```bash
npm run pages:deploy
```

Make sure environment variables are set in the Cloudflare dashboard before deploying.

---

## File Structure

```
functions/
├── api/
│   └── [[route]].js          # Main API router (with PATCH route)
├── config/
│   └── constants.js          # Configuration constants (with metadata config)
├── handlers/
│   ├── auth.js              # Login/logout handlers
│   └── screenshots.js       # Screenshot CRUD + metadata handlers
├── middleware/
│   └── auth.js              # JWT authentication middleware
└── utils/
    ├── jwt.js               # JWT creation/validation
    ├── metadata.js          # Metadata validation/sanitization (NEW)
    └── response.js          # Standardized API responses
```

---

## Metadata Configuration

Current metadata limits (configured in `functions/config/constants.js`):

```javascript
export const METADATA = {
  ALLOWED_FIELDS: ['description', 'tags'],
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 50,
  MAX_SIZE_BYTES: 2048, // R2 custom metadata limit
};
```

You can adjust these limits as needed, but keep in mind:

- R2 has a hard limit of 2KB for custom metadata per object
- Larger metadata means less room for other fields
- Consider your use case when setting limits

---

## Security Notes

- JWT tokens expire after 24 hours
- All passwords should be stored as encrypted secrets in CF dashboard
- JWT_SECRET should be at least 32 characters long
- CORS is enabled for all origins (configure as needed for production)
- All protected routes require valid JWT token in Authorization header
- Metadata is validated and sanitized before storage

---

## Troubleshooting

### "R2 bucket not configured" error

- Make sure the R2 bucket binding is in `wrangler.toml`
- Verify the bucket name matches in your Cloudflare dashboard

### "Invalid or expired token" error

- Token may have expired (24 hour limit)
- Token may be malformed
- JWT_SECRET may not match between environments
- Login again to get a new token

### "Invalid credentials" error

- Check username is exactly "admin"
- Verify AUTH_PASSWORD matches your environment variable
- Make sure environment variables are set in CF dashboard for production

### "Invalid metadata" error

- Check that metadata follows the validation rules
- Ensure description doesn't exceed 500 characters
- Ensure you have no more than 10 tags
- Ensure each tag doesn't exceed 50 characters
- Check that total metadata size is under 2KB
- Verify tags is an array, not a string

### Metadata not persisting in development

- This is expected! Development mode uses mock data
- To test actual R2 metadata, deploy to Cloudflare or use `wrangler dev` with remote R2 binding
