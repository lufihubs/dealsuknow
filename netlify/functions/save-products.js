const fs = require('fs').promises;
const path = require('path');

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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { products, token } = JSON.parse(event.body);

    // Simple authentication - change this to your secret
    const SECRET_TOKEN = 'dealsuknow_secret_2024';
    
    if (token !== SECRET_TOKEN) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Validate products array
    if (!Array.isArray(products)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid products data' })
      };
    }

    // In Netlify, we can't write to the static files directory
    // Instead, we'll return the products and use localStorage as fallback
    // For a real solution, you'd need a database or external storage service
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Products saved',
        count: products.length,
        note: 'Using localStorage - products are saved in browser only'
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
