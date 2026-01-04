// functions/handlers/screenshots.js

import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import {
  validateMetadata,
  sanitizeMetadata,
  toR2Metadata,
  fromR2Metadata,
  mergeMetadata,
  checkMetadataSize,
} from '../utils/metadata.js';

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

    // Format the response with metadata
    const screenshots = await Promise.all(
      listed.objects.map(async (obj) => {
        // For list view, we need to get full object to retrieve metadata
        const fullObject = await bucket.head(obj.key);

        return {
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded.toISOString(),
          etag: obj.etag,
          url: `https://ss.prabapro.me/${obj.key}`,
          metadata: fromR2Metadata(fullObject?.customMetadata || {}),
        };
      }),
    );

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
        metadata: fromR2Metadata(object.customMetadata || {}),
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
 * Update screenshot metadata
 * @param {string} key - Screenshot key
 * @param {Object} metadata - New metadata
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>}
 */
export async function handleUpdateMetadata(key, metadata, env) {
  try {
    console.log('handleUpdateMetadata called with:', { key, metadata });

    // Sanitize metadata first
    const sanitized = sanitizeMetadata(metadata);
    console.log('Sanitized metadata:', sanitized);

    // Validate metadata
    const validation = validateMetadata(sanitized);
    if (!validation.valid) {
      console.log('Validation failed:', validation.errors);
      return errorResponse(
        ERROR_MESSAGES.INVALID_METADATA,
        HTTP_STATUS.BAD_REQUEST,
        validation.errors,
      );
    }

    // Check metadata size
    const sizeCheck = checkMetadataSize(sanitized);
    if (!sizeCheck.valid) {
      return errorResponse(
        ERROR_MESSAGES.METADATA_TOO_LARGE,
        HTTP_STATUS.BAD_REQUEST,
        {
          size: sizeCheck.size,
          limit: sizeCheck.limit,
          message: `Metadata size (${sizeCheck.size} bytes) exceeds R2 limit (${sizeCheck.limit} bytes)`,
        },
      );
    }

    const bucket = env.screenshots;

    if (!bucket) {
      return errorResponse(
        'R2 bucket not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Check if object exists and get current metadata
    const existingObject = await bucket.head(key);
    if (!existingObject) {
      return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Get current metadata
    const currentMetadata = fromR2Metadata(existingObject.customMetadata || {});

    // Merge with new metadata
    const updatedMetadata = mergeMetadata(currentMetadata, sanitized);

    // Get the actual file to re-upload with new metadata
    const fileObject = await bucket.get(key);
    if (!fileObject) {
      return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Re-upload with updated metadata
    await bucket.put(key, fileObject.body, {
      httpMetadata: fileObject.httpMetadata,
      customMetadata: toR2Metadata(updatedMetadata),
    });

    // Get updated object to return
    const updated = await bucket.head(key);

    return successResponse(
      {
        key: updated.key,
        size: updated.size,
        uploaded: updated.uploaded.toISOString(),
        etag: updated.etag,
        url: `https://ss.prabapro.me/${updated.key}`,
        metadata: fromR2Metadata(updated.customMetadata || {}),
      },
      'Metadata updated successfully',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('Update metadata error:', error);
    return errorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
}

/**
 * Delete screenshot metadata (clear all metadata fields)
 * @param {string} key - Screenshot key
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>}
 */
export async function handleDeleteMetadata(key, env) {
  try {
    console.log('handleDeleteMetadata called with:', { key });

    const bucket = env.screenshots;

    if (!bucket) {
      return errorResponse(
        'R2 bucket not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Check if object exists
    const existingObject = await bucket.head(key);
    if (!existingObject) {
      return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Get the actual file to re-upload without metadata
    const fileObject = await bucket.get(key);
    if (!fileObject) {
      return errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Re-upload without custom metadata
    await bucket.put(key, fileObject.body, {
      httpMetadata: fileObject.httpMetadata,
      customMetadata: {}, // Empty metadata
    });

    return successResponse(
      {
        key,
        metadata: {},
      },
      'Metadata deleted successfully',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('Delete metadata error:', error);
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

    // Delete object from R2 (this also deletes metadata)
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
