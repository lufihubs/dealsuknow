// Secure GitHub integration via Netlify Functions
// No tokens in browser - all authentication handled server-side

const GITHUB_CONFIG = {
  owner: 'lufihubs',
  repo: 'dealsuknow',
  branch: 'main',
  filePath: 'products.json'
};

// Save products via Netlify Function (secure)
async function saveToGitHub(products) {
  try {
    showNotification('📤 Publishing to GitHub...', 'info');
    
    // Call Netlify Function (token stored securely in environment)
    const response = await fetch('/.netlify/functions/update-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ products })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error: ${response.status}`);
    }

    const result = await response.json();
    
    // Save to localStorage for immediate preview
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    
    console.log('✅ Published:', result);
    showNotification('✅ Published! Netlify deploying now...', 'success');
    return true;

  } catch (error) {
    console.error('Publish error:', error);
    
    // Fallback: localStorage only
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    showNotification('⚠️ Saved locally only.', 'warning');
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
