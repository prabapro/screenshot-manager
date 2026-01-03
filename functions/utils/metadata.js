// functions/utils/metadata.js

import { METADATA } from '../config/constants.js';

/**
 * Validate metadata fields
 * @param {Object} metadata - Metadata to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateMetadata(metadata) {
  const errors = [];

  if (!metadata || typeof metadata !== 'object') {
    return { valid: false, errors: ['Metadata must be an object'] };
  }

  // Validate description
  if (metadata.description !== undefined) {
    if (typeof metadata.description !== 'string') {
      errors.push('Description must be a string');
    } else if (metadata.description.length > METADATA.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description must not exceed ${METADATA.MAX_DESCRIPTION_LENGTH} characters`,
      );
    }
  }

  // Validate tags
  if (metadata.tags !== undefined) {
    if (!Array.isArray(metadata.tags)) {
      errors.push('Tags must be an array');
    } else {
      if (metadata.tags.length > METADATA.MAX_TAGS) {
        errors.push(`Maximum ${METADATA.MAX_TAGS} tags allowed`);
      }

      // Validate each tag
      metadata.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > METADATA.MAX_TAG_LENGTH) {
          errors.push(
            `Tag "${tag}" exceeds maximum length of ${METADATA.MAX_TAG_LENGTH} characters`,
          );
        } else if (tag.length === 0) {
          errors.push('Tags cannot be empty strings');
        }
      });

      // Check for duplicate tags
      const uniqueTags = new Set(metadata.tags.map((tag) => tag.toLowerCase()));
      if (uniqueTags.size !== metadata.tags.length) {
        errors.push('Duplicate tags are not allowed');
      }
    }
  }

  // Check for unknown fields
  const allowedFields = METADATA.ALLOWED_FIELDS;
  const providedFields = Object.keys(metadata);
  const unknownFields = providedFields.filter(
    (field) => !allowedFields.includes(field),
  );

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(', ')}`);
  }

  // Validate total metadata size (R2 has 2KB limit)
  const metadataString = JSON.stringify(metadata);
  const metadataSize = new TextEncoder().encode(metadataString).length;

  if (metadataSize > METADATA.MAX_SIZE_BYTES) {
    errors.push(
      `Metadata size (${metadataSize} bytes) exceeds maximum allowed size of ${METADATA.MAX_SIZE_BYTES} bytes`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize metadata
 * @param {Object} metadata - Metadata to sanitize
 * @returns {Object} Sanitized metadata
 */
export function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const sanitized = {};

  // Sanitize description
  if (metadata.description !== undefined && metadata.description !== null) {
    const desc = String(metadata.description).trim();
    if (desc.length > 0) {
      sanitized.description = desc.slice(0, METADATA.MAX_DESCRIPTION_LENGTH);
    }
  }

  // Sanitize tags
  if (Array.isArray(metadata.tags)) {
    const cleanTags = metadata.tags
      .filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
      .map((tag) => tag.trim().slice(0, METADATA.MAX_TAG_LENGTH))
      .filter((tag, index, self) => {
        // Remove duplicates (case-insensitive)
        const lowerTag = tag.toLowerCase();
        return self.findIndex((t) => t.toLowerCase() === lowerTag) === index;
      })
      .slice(0, METADATA.MAX_TAGS);

    if (cleanTags.length > 0) {
      sanitized.tags = cleanTags;
    }
  }

  return sanitized;
}

/**
 * Parse metadata from R2 object
 * @param {Object} r2Object - R2 object with customMetadata
 * @returns {Object} Parsed metadata
 */
export function parseMetadata(r2Object) {
  if (!r2Object || !r2Object.customMetadata) {
    return {};
  }

  const metadata = {};

  // Parse description
  if (r2Object.customMetadata.description) {
    metadata.description = r2Object.customMetadata.description;
  }

  // Parse tags (stored as JSON string)
  if (r2Object.customMetadata.tags) {
    try {
      const tags = JSON.parse(r2Object.customMetadata.tags);
      if (Array.isArray(tags)) {
        metadata.tags = tags;
      }
    } catch (error) {
      console.error('Failed to parse tags:', error);
    }
  }

  return metadata;
}

/**
 * Prepare metadata for R2 storage
 * @param {Object} metadata - Metadata object
 * @returns {Object} R2-compatible customMetadata object
 */
export function prepareForR2(metadata) {
  const r2Metadata = {};

  // Store description as-is
  if (metadata.description) {
    r2Metadata.description = metadata.description;
  }

  // Store tags as JSON string
  if (metadata.tags && Array.isArray(metadata.tags)) {
    r2Metadata.tags = JSON.stringify(metadata.tags);
  }

  return r2Metadata;
}

/**
 * Merge existing metadata with new metadata
 * @param {Object} existingMetadata - Current metadata
 * @param {Object} newMetadata - New metadata to merge
 * @returns {Object} Merged metadata
 */
export function mergeMetadata(existingMetadata, newMetadata) {
  const merged = { ...existingMetadata };

  // Update description if provided
  if (newMetadata.description !== undefined) {
    if (newMetadata.description === null || newMetadata.description === '') {
      delete merged.description;
    } else {
      merged.description = newMetadata.description;
    }
  }

  // Update tags if provided
  if (newMetadata.tags !== undefined) {
    if (
      newMetadata.tags === null ||
      (Array.isArray(newMetadata.tags) && newMetadata.tags.length === 0)
    ) {
      delete merged.tags;
    } else {
      merged.tags = newMetadata.tags;
    }
  }

  return merged;
}
