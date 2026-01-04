# Screenshot Manager

Screenshot Manager with CloudFlare Worker & R2

## Getting Started

1. Clone the repo
2. Run `pnpm install`
3. Run `pnpm dev:env` to initiate Infisical & import the secrets into `.dev.vars`
4. Run `pnpm dev` to start the development server. This will start:
   - Vite dev server on `http://localhost:3000`
   - Wrangler dev server on `http://127.0.0.1:8788`

### Development Mode Features

In development mode (when running locally):

- Mock data is used instead of actual R2 operations
- Responses include `__dev_mode: true` flag
- Metadata updates are simulated (not persisted)
- Useful for testing API structure without R2 setup

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

## Docs

- [API Endpoints](/docs/API.md)
