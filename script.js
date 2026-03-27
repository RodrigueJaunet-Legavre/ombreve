/* ── CART ─────────────────────────────────────────── */
const CART_KEY = 'ombreve_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== id));
  } else {
    saveCart(cart);
  }
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
  // If we're on panier.html, re-render
  if (document.getElementById('cartItems')) renderCart();
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ── SCROLL ANIMATIONS ────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-up, .fade-in, .slide-left, .slide-right')
  .forEach(el => observer.observe(el));

/* ── NAV SCROLL ───────────────────────────────────── */
const nav = document.querySelector('.nav');
const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── HAMBURGER ────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
    })
  );
}

/* ── ADD TO CART (boutique + produit) ─────────────── */
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    // Lire le produit depuis la carte parente ou la page produit
    const card = btn.closest('.product-card');
    let name, price, img, cat;

    if (card) {
      // Boutique : lire depuis la carte
      name  = (card.querySelector('.product-card__name a') || card.querySelector('.product-card__name'))?.textContent.trim() || 'Produit';
      price = parseInt((card.querySelector('.product-card__price')?.textContent || '0').replace(/[^0-9]/g, ''));
      img   = card.querySelector('.product-card__visual img')?.src || '';
      cat   = card.querySelector('.product-card__cat')?.textContent.trim() || '';
    } else {
      // Page produit
      name  = document.querySelector('.product-name')?.textContent.trim().replace(/\s+/g, ' ') || 'Produit';
      price = parseInt((document.querySelector('.product-price')?.textContent || '0').replace(/[^0-9]/g, ''));
      img   = document.querySelector('.gallery-main__img')?.src || '';
      cat   = document.querySelector('.tag')?.textContent.trim() || '';
    }

    addToCart({ id: slugify(name), name, price, img, cat });

    // Feedback visuel
    const original = btn.textContent;
    btn.textContent = '✓ Ajouté';
    btn.style.background = 'rgba(100,180,120,0.15)';
    btn.style.color = '#7dcfa0';
    btn.style.borderColor = 'rgba(100,180,120,0.3)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 1800);
  });
});

/* ── SIZE SELECTOR ────────────────────────────────── */
document.querySelectorAll('.size-btn:not(.unavailable)').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ── COLOR SELECTOR ───────────────────────────────── */
document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

/* ── CONTACT FORM ─────────────────────────────────── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    if (success) { form.style.display = 'none'; success.style.display = 'block'; }
  });
}

/* ── PANIER PAGE ──────────────────────────────────── */
function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartTotal');
  const emptyEl   = document.getElementById('cartEmpty');
  const summaryEl = document.getElementById('cartSummary');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyEl)   emptyEl.style.display  = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }
  if (emptyEl)   emptyEl.style.display   = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item__img">
        <img src="${item.img}" alt="${item.name}" />
      </div>
      <div class="cart-item__info">
        <p class="cart-item__cat">${item.cat}</p>
        <h3 class="cart-item__name">${item.name}</h3>
        <p class="cart-item__price-unit">${item.price} €</p>
      </div>
      <div class="cart-item__qty">
        <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
      </div>
      <div class="cart-item__subtotal">${item.price * item.qty} €</div>
      <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" aria-label="Supprimer">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 200 ? 0 : 12;
  const total    = subtotal + shipping;

  if (totalEl) totalEl.innerHTML = `
    <div class="total-row"><span>Sous-total</span><span>${subtotal} €</span></div>
    <div class="total-row"><span>Livraison</span><span>${shipping === 0 ? '<em>Offerte</em>' : shipping + ' €'}</span></div>
    <div class="total-row total-row--final"><span>Total TTC</span><span>${total} €</span></div>
  `;
}

// Init
updateCartUI();
if (document.getElementById('cartItems')) renderCart();
