// functions/api/[[route]].js

import { handleLogin, handleLogout } from '../handlers/auth.js';
import {
  handleListScreenshots,
  handleGetScreenshot,
  handleDeleteScreenshot,
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
