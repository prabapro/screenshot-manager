// src/utils/formatters.js

/**
 * Format date to human-readable string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const { includeTime = false, relative = false } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return 'Invalid date';
  }

  // Relative time (e.g., "2 hours ago")
  if (relative) {
    return getRelativeTime(dateObj);
  }

  // Standard formatting
  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('en-US', dateOptions);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date} date - Date to calculate relative time from
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) {
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  }
  if (diffMonth > 0) {
    return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  }
  if (diffWeek > 0) {
    return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  }
  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || bytes < 0) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
}

/**
 * Format screenshot filename (remove extension and special chars)
 * @param {string} filename - Screenshot filename
 * @returns {string} Formatted name
 */
export function formatScreenshotName(filename) {
  if (!filename) return 'Untitled';

  // Remove file extension
  const name = filename.replace(/\.[^/.]+$/, '');

  // Replace special characters with spaces
  return name.replace(/[-_]/g, ' ').trim();
}
