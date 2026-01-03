// functions/utils/metadata.js

import { METADATA } from '../config/constants.js';

/**
 * Validate metadata object
 * @param {Object} metadata - Metadata object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateMetadata(metadata) {
  const errors = [];

  if (!metadata || typeof metadata !== 'object') {
    errors.push('Metadata must be an object');
    return { valid: false, errors };
  }

  // Check for unknown fields
  const allowedFields = Object.keys(METADATA.FIELDS);
  const providedFields = Object.keys(metadata);
  const unknownFields = providedFields.filter(
    (field) => !allowedFields.includes(field),
  );

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(', ')}`);
  }

  // Validate description
  if (metadata.description !== undefined) {
    if (typeof metadata.description !== 'string') {
      errors.push('Description must be a string');
    } else if (
      metadata.description.length > METADATA.FIELDS.description.maxLength
    ) {
      errors.push(
        `Description exceeds maximum length of ${METADATA.FIELDS.description.maxLength} characters`,
      );
    }
  }

  // Validate tags
  if (metadata.tags !== undefined) {
    if (!Array.isArray(metadata.tags)) {
      errors.push('Tags must be an array');
    } else {
      // Validate each tag
      metadata.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > METADATA.FIELDS.tags.maxTagLength) {
          errors.push(
            `Tag "${tag}" exceeds maximum length of ${METADATA.FIELDS.tags.maxTagLength} characters`,
          );
        }
      });

      // Check total number of tags
      if (metadata.tags.length > METADATA.FIELDS.tags.maxCount) {
        errors.push(
          `Number of tags exceeds maximum of ${METADATA.FIELDS.tags.maxCount}`,
        );
      }
    }
  }

  // Validate category
  if (metadata.category !== undefined) {
    if (typeof metadata.category !== 'string') {
      errors.push('Category must be a string');
    } else if (metadata.category.length > METADATA.FIELDS.category.maxLength) {
      errors.push(
        `Category exceeds maximum length of ${METADATA.FIELDS.category.maxLength} characters`,
      );
    }
  }

  // Validate notes
  if (metadata.notes !== undefined) {
    if (typeof metadata.notes !== 'string') {
      errors.push('Notes must be a string');
    } else if (metadata.notes.length > METADATA.FIELDS.notes.maxLength) {
      errors.push(
        `Notes exceed maximum length of ${METADATA.FIELDS.notes.maxLength} characters`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize metadata by trimming strings and removing empty values
 * @param {Object} metadata - Metadata object to sanitize
 * @returns {Object} Sanitized metadata
 */
export function sanitizeMetadata(metadata) {
  const sanitized = {};

  // Sanitize description
  if (metadata.description !== undefined) {
    const trimmed = metadata.description.trim();
    if (trimmed) {
      sanitized.description = trimmed;
    }
  }

  // Sanitize tags - remove empty, trim, deduplicate
  if (metadata.tags !== undefined && Array.isArray(metadata.tags)) {
    const cleanTags = metadata.tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

    if (cleanTags.length > 0) {
      sanitized.tags = cleanTags;
    }
  }

  // Sanitize category
  if (metadata.category !== undefined) {
    const trimmed = metadata.category.trim();
    if (trimmed) {
      sanitized.category = trimmed;
    }
  }

  // Sanitize notes
  if (metadata.notes !== undefined) {
    const trimmed = metadata.notes.trim();
    if (trimmed) {
      sanitized.notes = trimmed;
    }
  }

  return sanitized;
}

/**
 * Convert metadata to R2 custom metadata format
 * R2 custom metadata values must be strings
 * @param {Object} metadata - Metadata object
 * @returns {Object} R2-compatible custom metadata
 */
export function toR2Metadata(metadata) {
  const r2Metadata = {};

  if (metadata.description) {
    r2Metadata.description = metadata.description;
  }

  if (metadata.tags && metadata.tags.length > 0) {
    // Store tags as comma-separated string
    r2Metadata.tags = metadata.tags.join(',');
  }

  if (metadata.category) {
    r2Metadata.category = metadata.category;
  }

  if (metadata.notes) {
    r2Metadata.notes = metadata.notes;
  }

  return r2Metadata;
}

/**
 * Convert R2 custom metadata to application format
 * @param {Object} r2Metadata - R2 custom metadata object
 * @returns {Object} Application metadata format
 */
export function fromR2Metadata(r2Metadata) {
  if (!r2Metadata) {
    return {};
  }

  const metadata = {};

  if (r2Metadata.description) {
    metadata.description = r2Metadata.description;
  }

  if (r2Metadata.tags) {
    // Convert comma-separated string back to array
    metadata.tags = r2Metadata.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  if (r2Metadata.category) {
    metadata.category = r2Metadata.category;
  }

  if (r2Metadata.notes) {
    metadata.notes = r2Metadata.notes;
  }

  return metadata;
}

/**
 * Merge existing metadata with updates
 * @param {Object} existing - Existing metadata
 * @param {Object} updates - Metadata updates
 * @returns {Object} Merged metadata
 */
export function mergeMetadata(existing, updates) {
  return {
    ...existing,
    ...updates,
  };
}

/**
 * Calculate approximate size of metadata in bytes
 * Used to check against R2's 2KB limit
 * @param {Object} metadata - Metadata object
 * @returns {number} Approximate size in bytes
 */
export function getMetadataSize(metadata) {
  const r2Metadata = toR2Metadata(metadata);
  const jsonString = JSON.stringify(r2Metadata);
  return new Blob([jsonString]).size;
}

/**
 * Check if metadata size is within R2 limits
 * @param {Object} metadata - Metadata object
 * @returns {Object} { valid: boolean, size: number, limit: number }
 */
export function checkMetadataSize(metadata) {
  const size = getMetadataSize(metadata);
  const limit = METADATA.MAX_SIZE_BYTES;

  return {
    valid: size <= limit,
    size,
    limit,
  };
}
