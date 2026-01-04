// functions/api/[[route]].js

import { handleLogin, handleLogout } from '../handlers/auth.js';
import {
  handleListScreenshots,
  handleGetScreenshot,
  handleDeleteScreenshot,
  handleUpdateMetadata,
  handleDeleteMetadata,
} from '../handlers/screenshots.js';
import { authenticate, isErrorResponse } from '../middleware/auth.js';
import { errorResponse, corsResponse } from '../utils/response.js';
import {
  API_ROUTES,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from '../config/constants.js';

/**
 * Main request handler for all API routes
 */
export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return corsResponse();
    }

    // ========================================
    // Public Routes (No Authentication)
    // ========================================

    // POST /api/auth/login
    if (method === 'POST' && pathname === API_ROUTES.AUTH_LOGIN) {
      return handleLogin(request, env);
    }

    // POST /api/auth/logout
    if (method === 'POST' && pathname === API_ROUTES.AUTH_LOGOUT) {
      return handleLogout();
    }

    // ========================================
    // Protected Routes (Require Authentication)
    // ========================================

    // Authenticate request
    const authResult = await authenticate(request, env);

    // Check if authentication failed
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    // User is authenticated, proceed with protected routes
    const user = authResult;

    // GET /api/screenshots - List all screenshots
    if (method === 'GET' && pathname === API_ROUTES.SCREENSHOTS) {
      return handleListScreenshots(env);
    }

    // PATCH /api/screenshots/:key/metadata - Update screenshot metadata
    // Must come BEFORE the GET handler to avoid conflict
    if (
      method === 'PATCH' &&
      pathname.match(/^\/api\/screenshots\/[^/]+\/metadata$/)
    ) {
      const key = pathname
        .replace(`${API_ROUTES.SCREENSHOTS}/`, '')
        .replace('/metadata', '');
      if (!key) {
        return errorResponse(
          'Screenshot key is required',
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      // Parse request body for metadata
      let metadata;
      try {
        const body = await request.text();
        console.log('Received body:', body); // Debug log

        if (!body || body.trim() === '') {
          return errorResponse(
            'Request body is required',
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        const parsedBody = JSON.parse(body);
        metadata = parsedBody.metadata;
        console.log('Parsed metadata:', metadata); // Debug log
      } catch (error) {
        console.error('JSON parse error:', error);
        return errorResponse(
          'Invalid JSON in request body',
          HTTP_STATUS.BAD_REQUEST,
          error.message,
        );
      }

      if (
        !metadata ||
        typeof metadata !== 'object' ||
        Array.isArray(metadata)
      ) {
        return errorResponse(
          'Metadata must be a valid object',
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      return handleUpdateMetadata(decodeURIComponent(key), metadata, env);
    }

    // DELETE /api/screenshots/:key/metadata - Delete screenshot metadata
    // Must come BEFORE the DELETE screenshot handler
    if (
      method === 'DELETE' &&
      pathname.match(/^\/api\/screenshots\/[^/]+\/metadata$/)
    ) {
      const key = pathname
        .replace(`${API_ROUTES.SCREENSHOTS}/`, '')
        .replace('/metadata', '');
      if (!key) {
        return errorResponse(
          'Screenshot key is required',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      return handleDeleteMetadata(decodeURIComponent(key), env);
    }

    // GET /api/screenshots/:key - Get screenshot details
    if (method === 'GET' && pathname.startsWith(`${API_ROUTES.SCREENSHOTS}/`)) {
      const key = pathname.replace(`${API_ROUTES.SCREENSHOTS}/`, '');
      if (!key) {
        return errorResponse(
          'Screenshot key is required',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      return handleGetScreenshot(decodeURIComponent(key), env);
    }

    // DELETE /api/screenshots/:key - Delete screenshot
    if (
      method === 'DELETE' &&
      pathname.startsWith(`${API_ROUTES.SCREENSHOTS}/`)
    ) {
      const key = pathname.replace(`${API_ROUTES.SCREENSHOTS}/`, '');
      if (!key) {
        return errorResponse(
          'Screenshot key is required',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      return handleDeleteScreenshot(decodeURIComponent(key), env);
    }

    // ========================================
    // Route Not Found
    // ========================================

    return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  } catch (error) {
    console.error('API Error:', error);
    return errorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
}
