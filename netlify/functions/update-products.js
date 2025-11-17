// Secure Netlify Function to update GitHub
// Token stored as environment variable, never exposed to browser

const fetch = require('node-fetch');

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
    // Get GitHub token from environment variable (set in Netlify dashboard)
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured. Add it in Netlify dashboard.');
    }

    // Parse request body
    const { products } = JSON.parse(event.body);

    // Validate products array
    if (!Array.isArray(products)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid products data' })
      };
    }

    const GITHUB_CONFIG = {
      owner: 'lufihubs',
      repo: 'dealsuknow',
      branch: 'main',
      filePath: 'products.json'
    };

    // Step 1: Get current file SHA
    const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Netlify-Function'
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch file: ${getResponse.status}`);
    }

    const fileData = await getResponse.json();
    
    // Step 2: Update file on GitHub
    const content = JSON.stringify(products, null, 2);
    const contentBase64 = Buffer.from(content).toString('base64');
    
    const updateResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Function'
      },
      body: JSON.stringify({
        message: `Update products - ${new Date().toLocaleString()}`,
        content: contentBase64,
        sha: fileData.sha,
        branch: GITHUB_CONFIG.branch
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || 'GitHub update failed');
    }

    const result = await updateResponse.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Products published to GitHub',
        count: products.length,
        commit: result.commit.sha
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
