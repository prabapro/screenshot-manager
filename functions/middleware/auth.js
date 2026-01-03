// functions/middleware/auth.js

import { verifyToken, extractToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request context
 * @param {Request} request - Request object
 * @param {Object} env - Environment variables
 * @returns {Promise<Object|Response>} User object or error response
 */
export async function authenticate(request, env) {
  try {
    // Extract token from Authorization header
    const token = extractToken(request);

    if (!token) {
      return errorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Verify token
    const payload = await verifyToken(token, env.JWT_SECRET);

    if (!payload) {
      return errorResponse(
        ERROR_MESSAGES.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Return user info from token
    return {
      username: payload.username,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Check if the result is an error response
 * @param {*} result - Result from authenticate
 * @returns {boolean}
 */
export function isErrorResponse(result) {
  return result instanceof Response;
}
