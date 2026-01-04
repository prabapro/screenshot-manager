// functions/config/constants.js

export const AUTH = {
  USERNAME: 'prabapro',
  TOKEN_EXPIRY: 24 * 60 * 60, // 24 hours in seconds
  ALGORITHM: 'HS256',
};

export const API_ROUTES = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  SCREENSHOTS: '/api/screenshots',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  MISSING_CREDENTIALS: 'Username and password are required',
  UNAUTHORIZED: 'Unauthorized - Invalid or missing token',
  INVALID_TOKEN: 'Invalid or expired token',
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  INVALID_METADATA: 'Invalid metadata',
  METADATA_TOO_LARGE: 'Metadata exceeds size limit',
};

export const METADATA = {
  // R2 custom metadata has a 2KB limit
  MAX_SIZE_BYTES: 2048,

  // Allowed metadata fields and their constraints
  FIELDS: {
    description: {
      type: 'string',
      maxLength: 500,
      required: false,
    },
    tags: {
      type: 'array',
      maxCount: 20,
      maxTagLength: 50,
      required: false,
    },
    category: {
      type: 'string',
      maxLength: 50,
      required: false,
    },
    notes: {
      type: 'string',
      maxLength: 1000,
      required: false,
    },
  },
};
