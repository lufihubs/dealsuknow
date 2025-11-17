// Netlify serverless function for secure authentication
// This provides server-side validation (much more secure than client-side)

const crypto = require('crypto');

// Store this in Netlify environment variables for production!
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'c5f0aa3a85d4c8ef9c059e6b7e9e25d5e8a9b5f3d2c1e0a9b8c7d6e5f4a3b2c1';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-random-secret-in-production';

// Simple JWT creation (use jsonwebtoken package for production)
function createToken(username) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    username,
    exp: Date.now() + (30 * 60 * 1000) // 30 minutes
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  
  return `${header}.${payload}.${signature}`;
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, passwordHash } = JSON.parse(event.body);

    // Validate inputs
    if (!username || !passwordHash) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing credentials' })
      };
    }

    // Check credentials
    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      const token = createToken(username);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          message: 'Authentication successful'
        })
      };
    } else {
      // Add delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid credentials'
        })
      };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};