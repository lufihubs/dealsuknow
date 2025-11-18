// Direct GitHub API integration - works from mobile!
// Token stored in browser (you only enter it once)

const GITHUB_CONFIG = {
  owner: 'lufihubs',
  repo: 'dealsuknow',
  branch: 'main',
  filePath: 'products.json'
};

// Get token from localStorage
function getToken() {
  return localStorage.getItem('github_token');
}

// Save token to localStorage
function saveToken(token) {
  localStorage.setItem('github_token', token);
}

// Save products directly to GitHub (works on mobile!)
async function saveToGitHub(products) {
  try {
    let token = getToken();
    
    // First time - ask for token
    if (!token) {
      showNotification('First time setup needed...', 'info');
      token = prompt(
        'GitHub Token Setup (one-time only):\n\n' +
        '1. Open: github.com/settings/tokens/new\n' +
        '2. Check "repo" scope\n' +
        '3. Generate and paste token here:\n\n' +
        'Token will be saved securely in your browser.'
      );
      
      if (!token || !token.startsWith('ghp_')) {
        throw new Error('Invalid token. Must start with ghp_');
      }
      
      saveToken(token);
      showNotification('Token saved! Publishing now...', 'success');
    }
    
    showNotification('Publishing to GitHub...', 'info');
    
    // Step 1: Get current file SHA
    const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getResponse.ok) {
      if (getResponse.status === 401) {
        localStorage.removeItem('github_token');
        throw new Error('Token invalid. Please refresh and try again.');
      }
      throw new Error(`Failed to fetch file: ${getResponse.status}`);
    }

    const fileData = await getResponse.json();
    
    // Step 2: Update file
    const content = JSON.stringify(products, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));
    
    const updateResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
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
    
    // Save to localStorage too
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    
    console.log('✅ Published to GitHub successfully');
    showNotification('✅ Published! Site updating in ~30 sec...', 'success');
    return true;

  } catch (error) {
    console.error('Publish error:', error);
    
    // Fallback: save locally
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    showNotification('❌ Publish failed: ' + error.message, 'danger');
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
window.GITHUB_CONFIG = GITHUB_CONFIG;
