// functions/utils/jwt.js

import { AUTH } from '../config/constants.js';

/**
 * Base64URL encode
 */
function base64UrlEncode(buffer) {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate HMAC signature
 */
async function sign(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );

  return base64UrlEncode(signature);
}

/**
 * Verify HMAC signature
 */
async function verify(message, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const signatureBytes = base64UrlDecode(signature);

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(message),
  );
}

/**
 * Create a JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @returns {Promise<string>} JWT token
 */
export async function createToken(payload, secret) {
  const header = {
    alg: AUTH.ALGORITHM,
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + AUTH.TOKEN_EXPIRY,
  };

  const encodedHeader = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(header)),
  );
  const encodedPayload = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(tokenPayload)),
  );

  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(message, secret);

  return `${message}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
export async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const isValid = await verify(message, signature, secret);
    if (!isValid) {
      return null;
    }

    // Decode payload
    const payloadJson = new TextDecoder().decode(
      base64UrlDecode(encodedPayload),
    );
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Request object
 * @returns {string|null} Token or null
 */
export function extractToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
