document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const loadingEl = document.getElementById('loading');
  const productsEl = document.getElementById('products');
  const noProductsEl = document.getElementById('no-products');
  const errorEl = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');

  // Fallback to products.json
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  // Add cache-busting parameter to always get fresh data
  console.log('Fetching products.json...');
  fetch(`products.json?t=${Date.now()}`, { 
    signal: controller.signal,
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
    .then(r => {
      clearTimeout(timeoutId);
      console.log('Response received:', r.status, r.statusText);
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      return r.json();
    })
    .then(data => {
      console.log('Products loaded:', data);
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      // Save to localStorage for future use
      localStorage.setItem('dealsuknow_products', JSON.stringify(data));
      loadingEl.style.display = 'none';
      renderProducts(data);
    })
    .catch(err => {
      clearTimeout(timeoutId);
      console.error('Failed to load products:', err);
      loadingEl.style.display = 'none';
      if (err.name === 'AbortError') {
        errorText.textContent = 'Request timed out. Please refresh the page.';
        errorEl.style.display = 'block';
      } else {
        errorText.textContent = `Error loading products: ${err.message}. Please refresh the page.`;
        errorEl.style.display = 'block';
      }
    });

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Validate URL
  function isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function renderProducts(products) {
    const container = document.getElementById('products');
    const noProductsEl = document.getElementById('no-products');
    const loadingEl = document.getElementById('loading');
    
    container.innerHTML = '';
    loadingEl.style.display = 'none';
    
    if (!products || products.length === 0) {
      noProductsEl.style.display = 'block';
      return;
    }

    console.log('Rendering', products.length, 'products...');

    products.forEach(p => {
      // Validate and sanitize product data
      if (!p || typeof p !== 'object') return;
      
      // Handle both old and new field names
      const productUrl = p.url || p.amazonLink || p.link;
      const productTitle = p.title || p.name;
      
      if (!isValidUrl(productUrl) || !isValidUrl(p.image)) return;

      const col = document.createElement('div');
      col.className = 'col-sm-6 col-md-4 col-lg-3';

      const card = document.createElement('div');
      card.className = 'card h-100 shadow-sm';

      const img = document.createElement('img');
      img.src = escapeHtml(p.image);
      img.alt = escapeHtml(productTitle || 'Product');
      img.className = 'card-img-top';
      img.loading = 'lazy'; // Performance optimization
      img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';
      };

      const body = document.createElement('div');
      body.className = 'card-body d-flex flex-column';

      const title = document.createElement('h5');
      title.className = 'card-title';
      title.textContent = escapeHtml(productTitle || 'Untitled');

      const price = document.createElement('p');
      price.className = 'mt-auto mb-2 fw-bold';
      const priceValue = parseFloat(p.price);
      price.textContent = !isNaN(priceValue) && priceValue > 0 ? `$${priceValue.toFixed(2)}` : '';

      const btnWrap = document.createElement('div');
      btnWrap.className = 'd-grid gap-2';

      const btn = document.createElement('a');
      btn.href = escapeHtml(productUrl);
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer nofollow';
      
      // Platform-specific button styling
      const platform = p.platform || 'amazon';
      const platformConfig = {
        amazon: {
          class: 'btn btn-warning btn-buy',
          icon: 'fab fa-amazon',
          text: 'Buy on Amazon',
          gradient: 'linear-gradient(90deg, #FF9900, #FF7A00)'
        },
        shopify: {
          class: 'btn btn-success btn-buy',
          icon: 'fab fa-shopify',
          text: 'Buy on Shopify',
          gradient: 'linear-gradient(90deg, #96bf48, #5e8e3e)'
        },
        tiktok: {
          class: 'btn btn-dark btn-buy',
          icon: 'fab fa-tiktok',
          text: 'Buy on TikTok',
          gradient: 'linear-gradient(90deg, #000000, #ee1d52)'
        }
      };
      
      const config = platformConfig[platform];
      btn.className = config.class;
      btn.style.background = config.gradient;
      btn.style.border = 'none';
      btn.style.color = 'white';
      btn.innerHTML = `<i class="${config.icon} me-2"></i>${config.text}`;

      if (p.badge && p.badge.trim()) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-danger position-absolute m-2';
        badge.textContent = escapeHtml(p.badge.trim());
        card.appendChild(badge);
      }

      body.appendChild(title);
      body.appendChild(price);
      btnWrap.appendChild(btn);
      body.appendChild(btnWrap);

      card.appendChild(img);
      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    });

    // Show products container after rendering
    container.style.display = '';
    console.log('Products rendered successfully');
  }
});