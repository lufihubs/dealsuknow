function uid() { return 'p' + Date.now() + Math.random().toString(36).slice(2,7); }

const SESSION_KEY = 'dealsuknow_admin_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let products = [];
let csrfToken = '';

// Sanitize input to prevent XSS attacks
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Sanitize HTML output
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate URL to prevent javascript: or data: schemes
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Generate CSRF token
async function generateCsrfToken() {
  const randomData = crypto.getRandomValues(new Uint8Array(32));
  const hashBuffer = await crypto.subtle.digest('SHA-256', randomData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check authentication and session validity
function checkAuth() {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionData) {
    window.location.href = 'index.html';
    return false;
  }
  
  try {
    const session = JSON.parse(sessionData);
    const timePassed = Date.now() - session.timestamp;
    
    if (!session.authenticated || timePassed > SESSION_TIMEOUT) {
      sessionStorage.removeItem(SESSION_KEY);
      alert('Session expired. Please login again.');
      window.location.href = 'index.html';
      return false;
    }
    
    // Update timestamp on activity
    session.timestamp = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (e) {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
    return false;
  }
}

// Initial auth check
if (!checkAuth()) {
  throw new Error('Authentication required');
}

document.addEventListener('DOMContentLoaded', async () => {
  // Generate CSRF token
  csrfToken = await generateCsrfToken();
  
  // Check auth periodically
  setInterval(checkAuth, 60000); // Check every minute
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem(SESSION_KEY);
      // Don't clear localStorage - keep products data
      window.location.href = 'index.html';
    }
  });

  loadProducts();

  const form = document.getElementById('product-form');
  const cancelBtn = document.getElementById('cancel-edit');
  const downloadBtn = document.getElementById('download-json');
  const imageFileInput = document.getElementById('image-file');
  const imageHiddenInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeImageBtn = document.getElementById('remove-image');
  const platformSelect = document.getElementById('platform');
  const urlLabel = document.getElementById('url-label');
  const urlInput = document.getElementById('url');

  // Handle platform selection
  platformSelect.addEventListener('change', () => {
    const platform = platformSelect.value;
    const icons = {
      amazon: '<i class="fab fa-amazon me-1"></i>',
      shopify: '<i class="fab fa-shopify me-1"></i>',
      tiktok: '<i class="fab fa-tiktok me-1"></i>'
    };
    const placeholders = {
      amazon: 'https://www.amazon.com/...',
      shopify: 'https://yourstore.myshopify.com/...',
      tiktok: 'https://shop.tiktok.com/...'
    };
    urlLabel.innerHTML = `${icons[platform]}Product URL`;
    urlInput.placeholder = placeholders[platform];
  });

  // Handle image file upload
  imageFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'danger');
      imageFileInput.value = '';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Image size must be less than 2MB', 'danger');
      imageFileInput.value = '';
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      imageHiddenInput.value = base64Image;
      previewImg.src = base64Image;
      imagePreview.style.display = 'block';
      showNotification('Image uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showNotification('Failed to read image file', 'danger');
    };
    reader.readAsDataURL(file);
  });

  // Remove image
  removeImageBtn.addEventListener('click', () => {
    imageFileInput.value = '';
    imageHiddenInput.value = '';
    previewImg.src = '';
    imagePreview.style.display = 'none';
  });

  // Load existing products from localStorage or products.json
  function loadProducts() {
    // Try localStorage first (for immediate edits)
    const localProducts = localStorage.getItem('dealsuknow_products');
    if (localProducts) {
      try {
        products = JSON.parse(localProducts);
        if (products.length > 0) {
          console.log('✅ Loaded from localStorage:', products.length, 'products');
          renderProductsList();
          return;
        }
      } catch (e) {
        console.warn('Failed to parse localStorage products', e);
      }
    }

    // Fallback to products.json
    fetch('../products.json?t=' + Date.now()) // Cache bust
      .then(r => r.json())
      .then(data => {
        products = data || [];
        localStorage.setItem('dealsuknow_products', JSON.stringify(products));
        console.log('✅ Loaded from products.json:', products.length, 'products');
        renderProductsList();
      })
      .catch(err => {
        console.warn('No products.json found or error loading:', err);
        products = [];
        renderProductsList();
      });
  }

  // Auto-save products to localStorage (instant updates)
  function autoSaveProducts() {
    try {
      localStorage.setItem('dealsuknow_products', JSON.stringify(products));
      console.log('Products saved:', products.length);
      showNotification(`✓ Saved! ${products.length} product(s) in your store.`, 'success');
    } catch (e) {
      console.error('Failed to save:', e);
      showNotification('Failed to save changes. Check console for details.', 'danger');
    }
  }

  // Render products list with edit/delete buttons
  function renderProductsList() {
    const container = document.getElementById('products-list');
    const noProducts = document.getElementById('no-products');
    const count = document.getElementById('product-count');
    
    count.textContent = products.length;
    container.innerHTML = '';

    if (products.length === 0) {
      noProducts.style.display = 'block';
      return;
    }

    noProducts.style.display = 'none';

    products.forEach((p, index) => {
      const item = document.createElement('div');
      item.className = 'list-group-item product-item';
      
      // Escape all output to prevent XSS
      const safeTitle = escapeHtml(p.title || '');
      const safePrice = escapeHtml(p.price || '');
      const safeBadge = escapeHtml(p.badge || '');
      const safeImage = escapeHtml(p.image || '');
      
      item.innerHTML = `
        <div class="row align-items-center">
          <div class="col-auto">
            <img src="${safeImage}" alt="${safeTitle}" class="product-thumb" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
          </div>
          <div class="col">
            <h6 class="mb-1">${safeTitle}</h6>
            <small class="text-muted">$${safePrice}</small>
            ${safeBadge ? `<span class="badge bg-danger ms-2">${safeBadge}</span>` : ''}
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${index})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${index})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  // Add or update product
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Verify auth before submitting
    if (!checkAuth()) return;
    
    const editIndex = document.getElementById('edit-index').value;
    
    // Get and sanitize inputs
    const title = sanitizeInput(document.getElementById('title').value.trim());
    const imageUrl = document.getElementById('image').value.trim();
    const productUrl = document.getElementById('url').value.trim();
    const price = sanitizeInput(document.getElementById('price').value.trim());
    const badge = sanitizeInput(document.getElementById('badge').value.trim());
    const platform = document.getElementById('platform').value;
    
    // Validate inputs
    if (!title || title.length < 3) {
      showNotification('Title must be at least 3 characters', 'danger');
      return;
    }
    
    if (!imageUrl) {
      showNotification('Please upload a product image', 'danger');
      return;
    }
    
    // Validate image is either base64 or valid URL
    if (!imageUrl.startsWith('data:image/') && !isValidUrl(imageUrl)) {
      showNotification('Invalid image. Please upload an image file', 'danger');
      return;
    }
    
    if (!isValidUrl(productUrl)) {
      showNotification('Invalid Amazon URL. Must start with http:// or https://', 'danger');
      return;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      showNotification('Invalid price. Must be a positive number', 'danger');
      return;
    }
    
    const product = {
      id: document.getElementById('edit-id').value || uid(),
      title: title,
      image: imageUrl,
      url: productUrl,
      price: price,
      badge: badge,
      platform: platform
    };

    if (editIndex !== '') {
      // Update existing
      products[parseInt(editIndex)] = product;
      showNotification('Product updated successfully!', 'success');
    } else {
      // Add new
      products.push(product);
      showNotification('Product added successfully!', 'success');
    }

    resetForm();
    renderProductsList();
    
    // Auto-save immediately
    setTimeout(() => {
      autoSaveProducts();
    }, 500);
    
    // Scroll to products list to show the update
    setTimeout(() => {
      document.getElementById('products-list').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });

  // Edit product
  window.editProduct = function(index) {
    const p = products[index];
    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-index').value = index;
    document.getElementById('title').value = p.title;
    document.getElementById('image').value = p.image;
    document.getElementById('url').value = p.url;
    document.getElementById('price').value = p.price;
    document.getElementById('badge').value = p.badge || '';
    document.getElementById('platform').value = p.platform || 'amazon';
    
    // Trigger platform change to update UI
    platformSelect.dispatchEvent(new Event('change'));
    
    // Show image preview if exists
    if (p.image) {
      previewImg.src = p.image;
      imagePreview.style.display = 'block';
    }
    
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('submit-text').textContent = 'Update Product';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Delete product
  window.deleteProduct = function(index) {
    if (confirm('Are you sure you want to delete this product?')) {
      const deletedProduct = products[index];
      products.splice(index, 1);
      renderProductsList();
      showNotification(`"${deletedProduct.title}" deleted successfully!`, 'warning');
      
      // Auto-save immediately
      setTimeout(() => {
        autoSaveProducts();
      }, 500);
    }
  };

  // Cancel edit
  cancelBtn.addEventListener('click', resetForm);

  function resetForm() {
    form.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-index').value = '';
    imageFileInput.value = '';
    imageHiddenInput.value = '';
    previewImg.src = '';
    imagePreview.style.display = 'none';
    document.getElementById('platform').value = 'amazon';
    platformSelect.dispatchEvent(new Event('change'));
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('submit-text').textContent = 'Add Product';
    cancelBtn.style.display = 'none';
  }

  // Manual Download JSON (backup)
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.json';
    a.click();
    showNotification('Backup downloaded successfully!', 'info');
  });

  // Publish to GitHub - Professional deployment
  document.getElementById('sync-github').addEventListener('click', async () => {
    if (products.length === 0) {
      alert('❌ No products to publish!\n\nAdd some products first.');
      return;
    }

    // Call the GitHub sync function (handles token prompt automatically)
    try {
      await window.saveToGitHub(products);
    } catch (error) {
      console.error('Publish failed:', error);
      alert('❌ Publish failed: ' + error.message);
    }
  });

  // Reset GitHub token
  document.getElementById('reset-token').addEventListener('click', () => {
    if (confirm('Reset your GitHub token? You will need to enter it again next time you publish.')) {
      localStorage.removeItem('github_token');
      showNotification('Token cleared! Enter new token on next publish.', 'info');
    }
  });

  // Clear storage and reset to default
  document.getElementById('clear-storage').addEventListener('click', () => {
    if (confirm('This will reset to the default products.json from the server. Continue?')) {
      localStorage.removeItem('dealsuknow_products');
      showNotification('Storage cleared! Reloading...', 'warning');
      setTimeout(() => location.reload(), 1000);
    }
  });

  // Show notification
  function showNotification(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
  }
});