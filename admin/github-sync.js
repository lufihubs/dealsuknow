// Professional GitHub integration for automatic deployment
// This uses GitHub Actions workflow to update products automatically

const GITHUB_CONFIG = {
  owner: 'lufihubs',
  repo: 'dealsuknow',
  branch: 'main',
  filePath: 'products.json',
  // GitHub Personal Access Token - get from: https://github.com/settings/tokens
  // Token needs 'repo' scope
  token: 'ghp_EnterYourTokenHere123456789' // CHANGE THIS!
};

// Check if token is configured
function isTokenConfigured() {
  return GITHUB_CONFIG.token && 
         GITHUB_CONFIG.token !== 'ghp_EnterYourTokenHere123456789' && 
         GITHUB_CONFIG.token.startsWith('ghp_');
}

// Save products to GitHub repository (triggers Netlify auto-deploy)
async function saveToGitHub(products) {
  try {
    if (!isTokenConfigured()) {
      throw new Error('SETUP_REQUIRED');
    }

    showNotification('📤 Publishing to GitHub...', 'info');
    
    // Step 1: Get current file SHA (required by GitHub API)
    const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch file: ${getResponse.status}`);
    }

    const fileData = await getResponse.json();
    
    // Step 2: Update file on GitHub
    const content = JSON.stringify(products, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));
    
    const updateResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
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

    // Step 3: Also save to localStorage for immediate preview
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    
    console.log('✅ Published to GitHub successfully');
    showNotification('✅ Published! Netlify will deploy in ~30 seconds.', 'success');
    return true;

  } catch (error) {
    if (error.message === 'SETUP_REQUIRED') {
      return 'SETUP_REQUIRED';
    }
    
    console.error('GitHub publish error:', error);
    showNotification('❌ Publish failed: ' + error.message, 'danger');
    
    // Fallback: save to localStorage
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    return false;
  }
}

// Load products from GitHub
async function loadFromGitHub() {
  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = atob(data.content);
    return JSON.parse(content);

  } catch (error) {
    console.warn('GitHub load failed:', error);
    return null;
  }
}

// Export functions
window.saveToGitHub = saveToGitHub;
window.loadFromGitHub = loadFromGitHub;
window.isTokenConfigured = isTokenConfigured;
window.GITHUB_CONFIG = GITHUB_CONFIG;
