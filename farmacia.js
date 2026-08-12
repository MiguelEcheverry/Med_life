// ===== Sugerencias de búsqueda (alimentan el autocompletado) =====
const SUGGESTIONS = [
  "nivea protector solar",
  "nivea crema facial",
  "nivea sun kids",
  "nivea sensitive",
  "nivea q10 anti-edad",
  "acetaminofén",
  "ibuprofeno",
  "alcohol antiséptico",
  "vitamina c",
  "protector solar la roche posay",
  "crema hidratante",
  "jabón antibacterial",
  "suero fisiológico",
  "multivitamínico"
];

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const suggestionsBox = document.getElementById('suggestions-box');
const contextMessage = document.getElementById('context-message');
const productGrid = document.getElementById('product-grid');
const cartCountEl = document.getElementById('cart-count');

const allCards = Array.from(productGrid.querySelectorAll('.product-card'));

// ===== Autocompletado =====
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  suggestionsBox.innerHTML = '';

  if (q.length === 0) {
    suggestionsBox.classList.remove('active');
    return;
  }

  const matches = SUGGESTIONS.filter(s => s.toLowerCase().includes(q));

  if (matches.length === 0) {
    suggestionsBox.classList.remove('active');
    return;
  }

  matches.forEach(match => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = match;
    item.addEventListener('click', () => {
      searchInput.value = match;
      suggestionsBox.classList.remove('active');
      runSearch(match);
    });
    suggestionsBox.appendChild(item);
  });

  suggestionsBox.classList.add('active');
});

document.addEventListener('click', (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
    suggestionsBox.classList.remove('active');
  }
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    suggestionsBox.classList.remove('active');
    runSearch(searchInput.value);
  }
});

searchBtn.addEventListener('click', () => runSearch(searchInput.value));

// ===== Coincidencia flexible: frase exacta, o todas las palabras (largas) presentes =====
function matchesQuery(haystack, query) {
  if (haystack.includes(query)) return true;
  const words = query.split(/\s+/).filter(w => w.length >= 3);
  if (words.length === 0) return false;
  return words.every(w => haystack.includes(w));
}

// ===== Búsqueda / filtrado de productos mostrados =====
function runSearch(query) {
  const q = query.trim().toLowerCase();

  if (q.length === 0) {
    resetToRecommended();
    return;
  }

  let visibleCount = 0;

  allCards.forEach(card => {
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const brand = (card.querySelector('.brand')?.textContent || '').toLowerCase();
    const match = matchesQuery(name + ' ' + brand, q);
    card.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  contextMessage.innerHTML =
    `RESULTADOS : ${query.toUpperCase()} <button id="reset-search" class="reset-search">✕ Ver recomendados</button>`;

  document.getElementById('reset-search').addEventListener('click', resetToRecommended);

  let noResultsEl = document.getElementById('no-results');
  if (visibleCount === 0) {
    if (!noResultsEl) {
      noResultsEl = document.createElement('p');
      noResultsEl.id = 'no-results';
      noResultsEl.className = 'no-results';
      noResultsEl.textContent = 'No se encontraron productos para tu búsqueda.';
      productGrid.after(noResultsEl);
    }
  } else if (noResultsEl) {
    noResultsEl.remove();
  }
}

function resetToRecommended() {
  allCards.forEach(card => card.style.display = '');
  contextMessage.textContent = 'PRODUCTOS RECOMENDADOS PARA TI';
  searchInput.value = '';
  const noResultsEl = document.getElementById('no-results');
  if (noResultsEl) noResultsEl.remove();
}

// ===== Carrito con cantidades (localStorage, lo leerá carrito.html más adelante) =====
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('medlife_cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('medlife_cart', JSON.stringify(cart));
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalQty;
}

function getQtyFor(name) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  return item ? item.qty : 0;
}

function addToCart(card) {
  const name = card.querySelector('.product-name')?.textContent.trim();
  const priceText = card.querySelector('.price')?.textContent.trim();
  const brand = card.querySelector('.brand')?.textContent.trim() || 'Genérico';
  if (!name || !priceText) return;

  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: priceText, brand, qty: 1 });
  }
  saveCart(cart);
  card.querySelector('.remove-btn').classList.remove('hidden');
}

function removeFromCart(card) {
  const name = card.querySelector('.product-name')?.textContent.trim();
  if (!name) return;

  let cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (!existing) return;

  existing.qty -= 1;
  if (existing.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
    card.querySelector('.remove-btn').classList.add('hidden');
  }
  saveCart(cart);
}

productGrid.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    addToCart(card);
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 300);
  });
});

productGrid.querySelectorAll('.remove-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    removeFromCart(card);
  });
});

// Al cargar: mostrar conteo real y qué botones "restar" deben verse
const initialCart = getCart();
cartCountEl.textContent = initialCart.reduce((sum, item) => sum + item.qty, 0);

allCards.forEach(card => {
  const name = card.querySelector('.product-name')?.textContent.trim();
  if (getQtyFor(name) > 0) {
    card.querySelector('.remove-btn').classList.remove('hidden');
  }
});