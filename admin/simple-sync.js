// Simple solution: Use URL parameters to share products across domains
// Products are stored in localStorage AND encoded in URL for cross-domain access

// Get products from URL if available (cross-domain sharing)
function getProductsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('products');
  
  if (encoded) {
    try {
      const decoded = decodeURIComponent(encoded);
      const products = JSON.parse(atob(decoded));
      return products;
    } catch (e) {
      console.error('Failed to parse URL products:', e);
    }
  }
  return null;
}

// Save products with simple sync
function simpleSaveProducts(products) {
  // Save to localStorage
  localStorage.setItem('dealsuknow_products', JSON.stringify(products));
  
  // Create shareable URL
  const encoded = btoa(JSON.stringify(products));
  const shareUrl = `${window.location.origin}?products=${encodeURIComponent(encoded)}`;
  
  console.log('Products saved locally');
  console.log('Share URL:', shareUrl);
  
  return shareUrl;
}

// Auto-sync products to main site
async function autoSyncToMainSite(products) {
  try {
    // Use postMessage API for cross-domain communication
    const mainSiteUrl = window.location.origin.replace('/admin', '');
    
    // Open main site in hidden iframe to sync
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = mainSiteUrl;
    
    iframe.onload = () => {
      iframe.contentWindow.postMessage({
        type: 'SYNC_PRODUCTS',
        products: products
      }, mainSiteUrl);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        showNotification('✅ Products synced to main site!', 'success');
      }, 1000);
    };
    
    document.body.appendChild(iframe);
    
  } catch (error) {
    console.error('Sync error:', error);
    // Fallback: Just save locally
    localStorage.setItem('dealsuknow_products', JSON.stringify(products));
    showNotification('✅ Products saved locally!', 'success');
  }
}

window.simpleSaveProducts = simpleSaveProducts;
window.autoSyncToMainSite = autoSyncToMainSite;
window.getProductsFromUrl = getProductsFromUrl;
