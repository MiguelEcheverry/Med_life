const emptyState = document.getElementById('empty-state');
const successState = document.getElementById('success-state');
const checkoutState = document.getElementById('checkout-state');
const paymentItems = document.getElementById('payment-items');
const pagoForm = document.getElementById('pago-form');
const formError = document.getElementById('form-error');

const DOMICILIO = 6900;

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
  return Number((priceText || '').replace(/[^\d]/g, '')) || 0;
}

function formatPrice(n) {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

function showState(state) {
  emptyState.style.display = 'none';
  successState.style.display = 'none';
  checkoutState.style.display = 'none';

  if (state === 'empty') emptyState.style.display = 'block';
  if (state === 'success') successState.style.display = 'block';
  if (state === 'checkout') checkoutState.style.display = 'block';
}

function render() {
  const cart = getCart();

  if (cart.length === 0) {
    showState('empty');
    return;
  }

  showState('checkout');
  paymentItems.innerHTML = '';

  let totalProductos = 0;
  let totalOriginal = 0;

  cart.forEach(item => {
    const unit = priceToNumber(item.price);
    const unitOld = item.priceOld ? priceToNumber(item.priceOld) : unit;
    totalProductos += unit * item.qty;
    totalOriginal += unitOld * item.qty;

    const row = document.createElement('div');
    row.className = 'payment-item';
    row.innerHTML = `
      <div class="item-image">
        ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
        ${item.iconSVG || ''}
      </div>
      <div class="item-info">
        <h4 class="item-name">${item.name}</h4>
        <div class="item-price">${item.price}</div>
        ${item.priceOld ? `<div class="item-price-old">${item.priceOld}</div>` : ''}
        <span class="item-tag">¡Aprovecha!</span>
      </div>
      <div class="item-qty">
        <button class="qty-minus">−</button>
        <span>${item.qty}</span>
        <button class="qty-plus">+</button>
      </div>
      <button class="remove-x">×</button>
    `;

    row.querySelector('.qty-plus').addEventListener('click', () => changeQty(item.name, 1));
    row.querySelector('.qty-minus').addEventListener('click', () => changeQty(item.name, -1));
    row.querySelector('.remove-x').addEventListener('click', () => removeItem(item.name));

    paymentItems.appendChild(row);
  });

  const ahorro = totalOriginal - totalProductos;
  const total = totalProductos + DOMICILIO;

  document.getElementById('sum-productos').textContent = formatPrice(totalOriginal);
  document.getElementById('sum-ahorro').textContent = ahorro > 0 ? '-' + formatPrice(ahorro) : formatPrice(0);
  document.getElementById('sum-domicilio').textContent = formatPrice(DOMICILIO);
  document.getElementById('sum-total').textContent = formatPrice(total);
}

function changeQty(name, delta) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
  saveCart(cart);
  render();
}

function removeItem(name) {
  const cart = getCart().filter(i => i.name !== name);
  saveCart(cart);
  render();
}

// El botón "CONFIRMAR METODO DE PAGO" solo hace scroll al formulario (misma página)
document.querySelector('.confirmar-metodo-btn').addEventListener('click', () => {
  document.getElementById('email-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Cupón: solo visual por ahora, sin funcionalidad real
document.querySelector('.redimir-btn').addEventListener('click', () => {
  // Intencionalmente sin función todavía
});

// Envío del formulario de pago
pagoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formError.textContent = '';

  const requiredIds = ['email-input', 'address-input', 'card-number', 'card-exp', 'card-cvc', 'card-name'];
  const missing = requiredIds.some(id => !document.getElementById(id).value.trim());

  if (missing) {
    formError.textContent = 'Completa todos los campos para continuar.';
    return;
  }

  // Pago "exitoso": se vacía el carrito y se muestra la confirmación
  localStorage.removeItem('medlife_cart');
  showState('success');
});

render();