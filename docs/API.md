# Screenshot Manager API Setup

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
        "key": "ss/SCR-20251130-s46.png",
        "size": 123456,
        "uploaded": "2024-11-30T12:00:00.000Z",
        "etag": "abc123...",
        "url": "https://ss.prabapro.me/ss/SCR-20251130-s46.png"
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
GET /api/screenshots/ss%2FSCR-20251130-s46.png
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Screenshot details retrieved successfully",
  "data": {
    "key": "ss/SCR-20251130-s46.png",
    "size": 123456,
    "uploaded": "2024-11-30T12:00:00.000Z",
    "etag": "abc123...",
    "url": "https://ss.prabapro.me/ss/SCR-20251130-s46.png",
    "customMetadata": {}
  }
}
```

#### Delete Screenshot

```bash
DELETE /api/screenshots/:key
Authorization: Bearer <token>

# Example:
DELETE /api/screenshots/ss%2FSCR-20251130-s46.png
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Screenshot deleted successfully",
  "data": {
    "key": "ss/SCR-20251130-s46.png"
  }
}
```

---

## Testing with cURL

### 1. Login and Get Token

```bash
curl -X POST https://ss-ui.prabapro.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-password"
  }'
```

Save the token from the response.

### 2. List Screenshots

```bash
curl -X GET https://ss-ui.prabapro.me/api/screenshots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Screenshot Details

```bash
curl -X GET "https://ss-ui.prabapro.me/api/screenshots/ss%2FSCR-20251130-s46.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Delete Screenshot

```bash
curl -X DELETE "https://ss-ui.prabapro.me/api/screenshots/ss%2FSCR-20251130-s46.png" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
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

### Test API Locally

```bash
# Login
curl -X POST http://127.0.0.1:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'

# List screenshots
curl -X GET http://127.0.0.1:8788/api/screenshots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Deployment

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
│   └── [[route]].js          # Main API router
├── config/
│   └── constants.js          # Configuration constants
├── handlers/
│   ├── auth.js              # Login/logout handlers
│   └── screenshots.js       # Screenshot CRUD handlers
├── middleware/
│   └── auth.js              # JWT authentication middleware
└── utils/
    ├── jwt.js               # JWT creation/validation
    └── response.js          # Standardized API responses
```

---

## Security Notes

- JWT tokens expire after 24 hours
- All passwords should be stored as encrypted secrets in CF dashboard
- JWT_SECRET should be at least 32 characters long
- CORS is enabled for all origins (configure as needed for production)
- All protected routes require valid JWT token in Authorization header

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
