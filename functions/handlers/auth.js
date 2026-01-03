// functions/handlers/auth.js

import { createToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { AUTH, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Handle login request
 * @param {Request} request - Request object
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>}
 */
export async function handleLogin(request, env) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return errorResponse(
        ERROR_MESSAGES.MISSING_CREDENTIALS,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate credentials
    if (username !== AUTH.USERNAME || password !== env.AUTH_PASSWORD) {
      return errorResponse(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Generate JWT token
    const token = await createToken(
      { username: AUTH.USERNAME },
      env.JWT_SECRET,
    );

    // Return success response with token
    return successResponse(
      {
        token,
        username: AUTH.USERNAME,
        expiresIn: AUTH.TOKEN_EXPIRY,
      },
      'Login successful',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Handle logout request
 * @returns {Response}
 */
export function handleLogout() {
  // For JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency
  return successResponse(null, 'Logout successful', HTTP_STATUS.OK);
}
