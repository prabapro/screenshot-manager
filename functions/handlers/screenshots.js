// functions/handlers/screenshots.js

import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Get mock screenshots for development
 */
function getMockScreenshots() {
  return [
    {
      key: 'mock-123-ies.png',
      size: 242370,
      uploaded: '2025-11-30T07:02:11.430Z',
      etag: 'c12f683797fae585ebe6365645bd8ba5',
      url: 'https://ss.prabapro.me/mock-123-ies.png',
    },
    {
      key: 'mock-456-s2v.png',
      size: 162488,
      uploaded: '2025-11-30T13:59:54.305Z',
      etag: '6b90173de84b0a7cf8b060c42c79ac9f',
      url: 'https://ss.prabapro.me/mock-456-s2v.png',
    },
    {
      key: 'mock-678-sj4.png',
      size: 191211,
      uploaded: '2025-12-14T14:19:33.278Z',
      etag: '306b679d1ba3cd5256bd6f5ddca13b01',
      url: 'https://ss.prabapro.me/mock-678-sj4.png',
    },
  ];
}

/**
 * Check if running in development mode
 */
function isDevelopment(env) {
  // Check if we're in local development
  // Wrangler sets different env vars in dev vs prod
  return !env.CF_PAGES || env.ENVIRONMENT === 'development';
}

/**
 * List all screenshots from R2 bucket
 * @param {Object} env - Environment variables (contains R2 bucket binding)
 * @returns {Promise<Response>}
 */
export async function handleListScreenshots(env) {
  try {
    // Use mock data in development
    if (isDevelopment(env)) {
      const screenshots = getMockScreenshots();
      return successResponse(
        {
          screenshots,
          count: screenshots.length,
          truncated: false,
          __dev_mode: true, // Flag to indicate mock data
        },
        'Screenshots retrieved successfully (DEV MODE - Mock Data)',
        HTTP_STATUS.OK,
      );
    }

    // Production: Use actual R2 bucket
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
    // Use mock data in development
    if (isDevelopment(env)) {
      const mockScreenshots = getMockScreenshots();
      const screenshot = mockScreenshots.find((s) => s.key === key);

      if (!screenshot) {
        return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(
        {
          ...screenshot,
          customMetadata: {},
          __dev_mode: true,
        },
        'Screenshot details retrieved successfully (DEV MODE - Mock Data)',
        HTTP_STATUS.OK,
      );
    }

    // Production: Use actual R2 bucket
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
    // Use mock response in development
    if (isDevelopment(env)) {
      const mockScreenshots = getMockScreenshots();
      const exists = mockScreenshots.find((s) => s.key === key);

      if (!exists) {
        return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(
        {
          key,
          __dev_mode: true,
          __note: 'Mock deletion - no actual file deleted',
        },
        'Screenshot deleted successfully (DEV MODE - Mock)',
        HTTP_STATUS.OK,
      );
    }

    // Production: Use actual R2 bucket
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
