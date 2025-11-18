// Direct GitHub API integration - works from mobile!
// Token stored in browser (you only enter it once)

const GITHUB_CONFIG = {
  owner: 'lufihubs',
  repo: 'dealsuknow',
  branch: 'main',
  filePath: 'products.json'
};

// Simple notification helper
function showNotification(message, type = 'info') {
  const colors = {
    success: '#198754',
    error: '#dc3545',
    info: '#0d6efd'
  };
  
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: 500;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 3000);
}

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
  console.log('🚀 saveToGitHub called with', products.length, 'products');
  
  // Prevent multiple simultaneous publishes
  if (window.isPublishing) {
    alert('⏳ Already publishing... please wait!');
    return false;
  }
  window.isPublishing = true;
  
  try {
    let token = getToken();
    console.log('🔑 Token exists:', !!token);
    
    // First time - ask for token
    if (!token) {
      console.log('📝 Prompting for token...');
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
      console.log('✅ Token saved!');
      alert('✅ Token saved! Publishing now...');
    }
    
    console.log('📤 Publishing to GitHub...');
    
    // Retry logic for 409 conflicts
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
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
          if (updateResponse.status === 409) {
            // Conflict - retry
            retries--;
            console.log(`⚠️ Conflict, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          const error = await updateResponse.json();
          throw new Error(error.message || 'GitHub update failed');
        }
        
        success = true;
        
      } catch (error) {
        if (retries === 1) throw error;
        retries--;
        console.log(`⚠️ Error, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!success) {
      throw new Error('Failed after multiple retries');
    }
    
    // Save to localStorage too
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    
    console.log('✅ Published to GitHub successfully');
    alert('✅ Published! Your site will update in ~30 seconds.\n\nRefresh the main site to see changes.');
    return true;

  } catch (error) {
    console.error('Publish error:', error);
    
    // Fallback: save locally
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    alert('❌ Publish failed: ' + error.message + '\n\nSaved locally. Try again later.');
    return false;
  } finally {
    window.isPublishing = false;
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

console.log('✅ github-sync.js loaded - saveToGitHub is ready');
