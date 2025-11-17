// GitHub API Configuration
const GITHUB_CONFIG = {
  owner: 'lufihubs',
  repo: 'dealsuknow',
  branch: 'main',
  filePath: 'products.json',
  // You need to create a GitHub Personal Access Token with 'repo' scope
  // Go to: https://github.com/settings/tokens/new
  // Then replace 'YOUR_GITHUB_TOKEN' below
  token: 'YOUR_GITHUB_TOKEN' // REPLACE THIS!
};

// Save products to GitHub (triggers Netlify rebuild)
async function saveToGitHub(products) {
  try {
    showNotification('Saving to GitHub...', 'info');
    
    // Get current file to get its SHA (required for updates)
    const getResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!getResponse.ok) {
      throw new Error('Failed to fetch current file');
    }

    const fileData = await getResponse.json();
    
    // Encode new content as base64
    const content = JSON.stringify(products, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    // Update file on GitHub
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update products - ${new Date().toISOString()}`,
          content: base64Content,
          sha: fileData.sha,
          branch: GITHUB_CONFIG.branch
        })
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || 'Failed to update file');
    }

    showNotification('✅ Saved to GitHub! Site will update in ~1 minute.', 'success');
    return true;

  } catch (error) {
    console.error('GitHub save error:', error);
    showNotification('❌ GitHub save failed: ' + error.message, 'danger');
    return false;
  }
}

// Export for use in admin.js
window.saveToGitHub = saveToGitHub;
window.GITHUB_CONFIG = GITHUB_CONFIG;
