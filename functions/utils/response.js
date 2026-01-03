// functions/utils/response.js

import { HTTP_STATUS } from '../config/constants.js';

/**
 * Create a standardized JSON response
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @param {Object} headers - Additional headers
 * @returns {Response}
 */
export function jsonResponse(data, status = HTTP_STATUS.OK, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

/**
 * Create a success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function successResponse(
  data = null,
  message = 'Success',
  status = HTTP_STATUS.OK,
) {
  return jsonResponse(
    {
      success: true,
      message,
      data,
    },
    status,
  );
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {*} details - Additional error details
 * @returns {Response}
 */
export function errorResponse(
  message,
  status = HTTP_STATUS.BAD_REQUEST,
  details = null,
) {
  const payload = {
    success: false,
    error: message,
  };

  if (details) {
    payload.details = details;
  }

  return jsonResponse(payload, status);
}

/**
 * Handle CORS preflight requests
 * @returns {Response}
 */
export function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
