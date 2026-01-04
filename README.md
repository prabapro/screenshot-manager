# Screenshot Manager

Screenshot Manager with CloudFlare Worker Pages & R2 Storage

## Getting Started

1. Clone the repo
2. Run `pnpm install`
3. Run `pnpm dev:env` to initiate Infisical & import the secrets into `.dev.vars`
4. **Authenticate with Wrangler**: Run `wrangler login` to authenticate with your Cloudflare account
5. Run `pnpm dev` to start the development server. This will start:
   - Vite dev server on `http://localhost:3000`
   - Wrangler dev server on `http://127.0.0.1:8788` with remote R2 access

### Development Mode with Production R2

The development server connects directly to your production R2 bucket using the `remote = true` flag in `wrangler.toml`. This means:

- ✅ All operations (read, write, delete) work on the actual production bucket
- ✅ No mock data - you see real screenshots and metadata
- ✅ Perfect for testing since you're the only user
- ⚠️ **Important**: Changes you make in dev are permanent (they modify the production bucket)

**Configuration:**

```toml
# wrangler.toml
r2_buckets = [
  {binding = "screenshots", bucket_name = "screenshots", remote = true}
]
```

**Requirements:**

- Must be authenticated with Wrangler (`wrangler login`)
- R2 bucket must exist in your Cloudflare account
- Proper environment variables must be set in `.dev.vars`

## Deployment

```bash
npm run pages:deploy
```

## Security Notes

- JWT tokens expire after 24 hours
- All passwords should be stored as encrypted secrets in CF dashboard
- JWT_SECRET should be at least 32 characters long.
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- CORS is enabled for all origins (configure as needed for production)
- All protected routes require valid JWT token in Authorization header
- Metadata is validated and sanitized before storage

## Troubleshooting

### "R2 bucket not configured" error

- Make sure the R2 bucket binding is in `wrangler.toml` with `remote = true`
- Verify the bucket name matches in your Cloudflare dashboard
- Ensure you're authenticated with Wrangler (`wrangler login`)
- Check that the bucket exists in your Cloudflare account

### Empty screenshots array despite having files

- Verify files exist in the bucket: `wrangler r2 object list screenshots`
- Check that `remote = true` is set in the R2 bucket binding
- Ensure you're logged in to the correct Cloudflare account
- Restart the dev server after making changes to `wrangler.toml`

### "Invalid or expired token" error

- Token may have expired (24 hour limit)
- Token may be malformed
- JWT_SECRET may not match between environments
- Login again to get a new token

### "Invalid credentials" error

- Check username is exactly `prabapro`
- Verify AUTH_PASSWORD matches your environment variable
- Make sure environment variables are set in CF dashboard for production

### "Invalid metadata" error

- Check that metadata follows the validation rules
- Ensure description doesn't exceed 500 characters
- Ensure you have no more than 20 tags
- Ensure each tag doesn't exceed 50 characters
- Check that total metadata size is under 2KB
- Verify tags is an array, not a string

### Wrangler authentication issues

- Run `wrangler login` to authenticate
- Make sure you have access to the Cloudflare account with the R2 bucket
- Check that the bucket name in `wrangler.toml` matches your actual bucket

## Docs

- [API Endpoints](/docs/API.md)
