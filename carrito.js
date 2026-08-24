const cartGrid = document.getElementById('cart-grid');
const emptyMsg = document.getElementById('empty-cart-msg');
const comprarBtn = document.getElementById('comprar-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalItems = document.getElementById('modal-items');
const modalTotalAmount = document.getElementById('modal-total-amount');
const confirmarBtn = document.getElementById('confirmar-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('medlife_cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('medlife_cart', JSON.stringify(cart));
}

function priceToNumber(priceText) {
  return Number(priceText.replace(/[^\d]/g, '')) || 0;
}

function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO');
}

// Reconstruye la tarjeta EXACTAMENTE igual a como se ve en Farmacia,
// usando todos los datos que farmacia.js guardó al añadir el producto.
function renderCart() {
  const cart = getCart();
  cartGrid.innerHTML = '';

  if (cart.length === 0) {
    cartGrid.style.display = 'none';
    emptyMsg.style.display = 'block';
    comprarBtn.disabled = true;
    return;
  }

  cartGrid.style.display = 'grid';
  emptyMsg.style.display = 'none';
  comprarBtn.disabled = false;

  cart.forEach(item => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.name = item.name;
    card.innerHTML = `
      <div class="card-image">
        ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
        <button class="remove-btn">−</button>
        <button class="add-btn">+</button>
        <span class="qty-label">x${item.qty}</span>
        ${item.iconSVG || ''}
      </div>
      ${item.promoText ? `<div class="promo-banner">${item.promoText}</div>` : ''}
      <span class="brand">${item.brand || 'Genérico'}</span>
      <h3 class="product-name">${item.name}</h3>
      <div class="price-row">
        <span class="price">${item.price}</span>
        ${item.priceOld ? `<span class="price-old">${item.priceOld}</span>` : ''}
      </div>
      <div class="meta-row"><span>${item.mlText || ''}</span><span class="delivery">${item.deliveryText || ''}</span></div>
      ${item.ratingText ? `<div class="rating">${item.ratingText}</div>` : ''}
    `;

    card.querySelector('.add-btn').addEventListener('click', () => {
      changeQty(item.name, 1);
    });
    card.querySelector('.remove-btn').addEventListener('click', () => {
      changeQty(item.name, -1);
    });

    cartGrid.appendChild(card);
  });
}

function changeQty(name, delta) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }
  saveCart(cart);
  renderCart();
}

function openModal() {
  const cart = getCart();
  if (cart.length === 0) return;

  modalItems.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const unitPrice = priceToNumber(item.price);
    total += unitPrice * item.qty;

    const row = document.createElement('div');
    row.className = 'modal-item';
    row.innerHTML = `
      <span class="modal-item-name">${item.name}</span>
      <span class="modal-item-qty">x${item.qty}</span>
      <span class="modal-item-price">${formatPrice(unitPrice * item.qty)}</span>
    `;
    modalItems.appendChild(row);
  });

  modalTotalAmount.textContent = formatPrice(total);
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

comprarBtn.addEventListener('click', openModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

confirmarBtn.addEventListener('click', () => {
  window.location.href = 'pagos.html';
});

function filterCart(query) {
  const q = query.trim().toLowerCase();
  const cards = cartGrid.querySelectorAll('.product-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const brand = (card.querySelector('.brand')?.textContent || '').toLowerCase();
    const match = q.length === 0 || name.includes(q) || brand.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  let noMatchEl = document.getElementById('no-match-cart');
  if (visibleCount === 0 && cards.length > 0) {
    if (!noMatchEl) {
      noMatchEl = document.createElement('p');
      noMatchEl.id = 'no-match-cart';
      noMatchEl.className = 'empty-cart-msg';
      noMatchEl.textContent = 'Ningún producto de tu carrito coincide con la búsqueda.';
      cartGrid.after(noMatchEl);
    }
  } else if (noMatchEl) {
    noMatchEl.remove();
  }
}

searchInput.addEventListener('input', () => filterCart(searchInput.value));
searchBtn.addEventListener('click', () => filterCart(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') filterCart(searchInput.value);
});

renderCart();