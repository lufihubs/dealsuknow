document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  fetch('products.json')
    .then(r => r.json())
    .then(data => renderProducts(data))
    .catch(err => {
      console.error('Failed to load products.json', err);
      document.getElementById('no-products').style.display = 'block';
    });

  function renderProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    if (!products || products.length === 0) {
      document.getElementById('no-products').style.display = 'block';
      return;
    }

    products.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-sm-6 col-md-4 col-lg-3';

      const card = document.createElement('div');
      card.className = 'card h-100 shadow-sm';

      const img = document.createElement('img');
      img.src = p.image;
      img.alt = p.title;
      img.className = 'card-img-top';

      const body = document.createElement('div');
      body.className = 'card-body d-flex flex-column';

      const title = document.createElement('h5');
      title.className = 'card-title';
      title.textContent = p.title;

      const price = document.createElement('p');
      price.className = 'mt-auto mb-2 fw-bold';
      price.textContent = p.price ? `£${p.price}` : '';

      const btnWrap = document.createElement('div');
      btnWrap.className = 'd-grid gap-2';

      const btn = document.createElement('a');
      btn.className = 'btn btn-success btn-buy';
      btn.href = p.url;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Buy on Amazon';

      if (p.badge) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-danger position-absolute m-2';
        badge.textContent = p.badge;
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
  }
});