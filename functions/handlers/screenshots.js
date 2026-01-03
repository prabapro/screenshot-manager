// functions/handlers/screenshots.js

import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * List all screenshots from R2 bucket
 * @param {Object} env - Environment variables (contains R2 bucket binding)
 * @returns {Promise<Response>}
 */
export async function handleListScreenshots(env) {
  try {
    const bucket = env.screenshots;

    if (!bucket) {
      return errorResponse(
        'R2 bucket not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // List all objects in the bucket
    const listed = await bucket.list();

    // Format the response
    const screenshots = listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      etag: obj.etag,
      url: `https://ss.prabapro.me/${obj.key}`,
    }));

    return successResponse(
      {
        screenshots,
        count: screenshots.length,
        truncated: listed.truncated,
      },
      'Screenshots retrieved successfully',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('List screenshots error:', error);
    return errorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
}

/**
 * Get a single screenshot details
 * @param {string} key - Screenshot key
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>}
 */
export async function handleGetScreenshot(key, env) {
  try {
    const bucket = env.screenshots;

    if (!bucket) {
      return errorResponse(
        'R2 bucket not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Get object from R2
    const object = await bucket.head(key);

    if (!object) {
      return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      {
        key: object.key,
        size: object.size,
        uploaded: object.uploaded.toISOString(),
        etag: object.etag,
        url: `https://ss.prabapro.me/${object.key}`,
        customMetadata: object.customMetadata || {},
      },
      'Screenshot details retrieved successfully',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('Get screenshot error:', error);
    return errorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
}

/**
 * Delete a screenshot from R2 bucket
 * @param {string} key - Screenshot key
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>}
 */
export async function handleDeleteScreenshot(key, env) {
  try {
    const bucket = env.screenshots;

    if (!bucket) {
      return errorResponse(
        'R2 bucket not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Check if object exists
    const exists = await bucket.head(key);
    if (!exists) {
      return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Delete object from R2
    await bucket.delete(key);

    return successResponse(
      { key },
      'Screenshot deleted successfully',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('Delete screenshot error:', error);
    return errorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
}
