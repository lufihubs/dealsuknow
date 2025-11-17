function uid() { return 'p' + Date.now() + Math.random().toString(36).slice(2,7); }

const SESSION_KEY = 'dealsuknow_admin_session';
let products = [];

// Check authentication
if (sessionStorage.getItem(SESSION_KEY) !== 'authenticated') {
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = 'index.html';
    }
  });

  loadProducts();

  const form = document.getElementById('product-form');
  const cancelBtn = document.getElementById('cancel-edit');
  const downloadBtn = document.getElementById('download-json');

  // Load existing products from products.json
  function loadProducts() {
    fetch('../products.json')
      .then(r => r.json())
      .then(data => {
        products = data || [];
        renderProductsList();
      })
      .catch(err => {
        console.warn('No products.json found or error loading:', err);
        products = [];
        renderProductsList();
      });
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
      item.innerHTML = `
        <div class="row align-items-center">
          <div class="col-auto">
            <img src="${p.image}" alt="${p.title}" class="product-thumb">
          </div>
          <div class="col">
            <h6 class="mb-1">${p.title}</h6>
            <small class="text-muted">£${p.price}</small>
            ${p.badge ? `<span class="badge bg-danger ms-2">${p.badge}</span>` : ''}
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
    
    const editIndex = document.getElementById('edit-index').value;
    const product = {
      id: document.getElementById('edit-id').value || uid(),
      title: document.getElementById('title').value.trim(),
      image: document.getElementById('image').value.trim(),
      url: document.getElementById('url').value.trim(),
      price: document.getElementById('price').value.trim(),
      badge: document.getElementById('badge').value.trim()
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
    
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('submit-text').textContent = 'Update Product';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Delete product
  window.deleteProduct = function(index) {
    if (confirm('Are you sure you want to delete this product?')) {
      products.splice(index, 1);
      renderProductsList();
      showNotification('Product deleted successfully!', 'danger');
    }
  };

  // Cancel edit
  cancelBtn.addEventListener('click', resetForm);

  function resetForm() {
    form.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-index').value = '';
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('submit-text').textContent = 'Add Product';
    cancelBtn.style.display = 'none';
  }

  // Download JSON
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.json';
    a.click();
    showNotification('products.json downloaded! Upload it to replace the old file.', 'info');
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