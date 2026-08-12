const cartGrid = document.getElementById('cart-grid');
const emptyMsg = document.getElementById('empty-cart-msg');
const comprarBtn = document.getElementById('comprar-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalItems = document.getElementById('modal-items');
const modalTotalAmount = document.getElementById('modal-total-amount');
const confirmarBtn = document.getElementById('confirmar-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Ícono genérico único para todas las tarjetas del carrito (simplificación,
// el carrito no guarda qué ícono tenía cada producto en Farmacia)
const GENERIC_ICON = `<svg viewBox="0 0 80 100" class="product-icon">
  <rect x="30" y="5" width="20" height="10" rx="2" fill="#1C86C4"/>
  <rect x="20" y="18" width="40" height="75" rx="8" fill="#EAF6FA" stroke="#7FCBE0" stroke-width="3"/>
  <rect x="25" y="40" width="30" height="20" fill="#B9DDE8"/>
</svg>`;

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
    card.innerHTML = `
      <div class="card-image">
        <span class="qty-badge">x${item.qty}</span>
        ${GENERIC_ICON}
      </div>
      <span class="brand">${item.brand || 'Genérico'}</span>
      <h3 class="product-name">${item.name}</h3>
      <div class="price-row"><span class="price">${item.price}</span></div>
    `;
    cartGrid.appendChild(card);
  });
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

// Clic afuera del modal (en el overlay) lo cierra
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Confirmar compra -> va a pagos.html (los datos siguen en localStorage)
confirmarBtn.addEventListener('click', () => {
  window.location.href = 'pagos.html';
});

// Buscador (redirige a Farmacia, ahí sí filtra)
function goSearch() {
  window.location.href = 'farmacia.html';
}
searchBtn.addEventListener('click', goSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goSearch();
});

renderCart();