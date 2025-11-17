// Professional cloud storage solution using JSONBin.io
// Free tier: 10k requests/month, perfect for product management

const STORAGE_CONFIG = {
  // Create your free bin at: https://jsonbin.io
  // Then replace with your bin ID and API key
  binId: '6759a1c0acd3cb34a8b8f2e1', // Replace with your bin ID
  apiKey: '$2a$10$cYqVWbKC7YhzZ8L5EkZHe.XFN5rE8qGBx8cYvHj7L9kZMQ4pC5vZK', // Replace with your API key
  apiUrl: 'https://api.jsonbin.io/v3'
};

// Save products to cloud (works across all domains)
async function saveToCloud(products) {
  try {
    showNotification('📤 Publishing to cloud...', 'info');
    
    // Save to localStorage first for immediate local effect
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    
    // Save to cloud storage
    const response = await fetch(`${STORAGE_CONFIG.apiUrl}/b/${STORAGE_CONFIG.binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': STORAGE_CONFIG.apiKey,
        'X-Bin-Versioning': 'false' // Don't keep versions to save space
      },
      body: JSON.stringify({ products, lastUpdated: new Date().toISOString() })
    });

    if (!response.ok) {
      throw new Error(`Cloud save failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Saved to cloud:', result);
    showNotification('✅ Published! Visible on all devices in 5 seconds.', 'success');
    return true;

  } catch (error) {
    console.error('Cloud save error:', error);
    // Fallback to localStorage only
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    showNotification('⚠️ Saved locally only. Check internet connection.', 'warning');
    return false;
  }
}

// Load products from cloud
async function loadFromCloud() {
  try {
    const response = await fetch(`${STORAGE_CONFIG.apiUrl}/b/${STORAGE_CONFIG.binId}/latest`, {
      headers: {
        'X-Master-Key': STORAGE_CONFIG.apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load from cloud');
    }

    const data = await response.json();
    if (data.record && data.record.products) {
      return data.record.products;
    }
    return null;

  } catch (error) {
    console.warn('Cloud load failed:', error);
    return null;
  }
}

// Alias for backward compatibility
async function saveToGitHub(products) {
  return await saveToCloud(products);
}

// Initialize - merge URL params with localStorage
function initializeProducts() {
  // Check for products in URL (for cross-domain sync)
  const urlParams = new URLSearchParams(window.location.search);
  const syncData = urlParams.get('sync');
  
  if (syncData) {
    try {
      // Decode from base64 (handle Unicode properly)
      const base64String = atob(syncData);
      const utf8Bytes = Uint8Array.from(base64String, c => c.charCodeAt(0));
      const jsonString = new TextDecoder().decode(utf8Bytes);
      const products = JSON.parse(jsonString);
      
      localStorage.setItem('dealsuknow_products', JSON.stringify(products));
      console.log('Synced products from URL');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error('Failed to sync from URL:', e);
    }
  }
}

// Call on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProducts);
} else {
  initializeProducts();
}

// Export for use in admin.js
window.saveToGitHub = saveToGitHub;
window.GITHUB_CONFIG = GITHUB_CONFIG;
