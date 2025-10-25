const WHATSAPP_NUMBER = "6003519694"; // Replace with your number  

const PRODUCTS = [
  { id:1, title:"Black Hoodie", price:1299, category:"boys", img:"/files/blackhoodies.png", sizes:["S","M","L","XL"] },
  { id:2, title:"Black Printed Tee", price:899, category:"boys", img:"/files/blackprinted.png", sizes:["S","M","L","XL"] },
  { id:3, title:"Blue Shirt", price:999, category:"men", img:"/files/blue-shirt.png", sizes:["S","M","L","XL"] },
  { id:4, title:"Gez Blue T-Shirt", price:799, category:"boys", img:"/files/gezbluetshirt.png", sizes:["S","M","L","XL"] },
  { id:5, title:"NYC Hoodie", price:1399, category:"boys", img:"/files/nyc hoodies.png", sizes:["S","M","L","XL"] },
  { id:6, title:"Spider Hoodie", price:1499, category:"boys", img:"/files/spide-hoodie.png", sizes:["S","M","L","XL"] },
  { id:7, title:"White Shirt", price:1099, category:"men", img:"/files/white-shirt.png", sizes:["S","M","L","XL"] },
];


let cart = [];
let filteredProducts = [...PRODUCTS];

const q = (sel) => document.querySelector(sel);
const qa = (sel) => [...document.querySelectorAll(sel)];
const formatPrice = (n) => "₹" + Number(n).toLocaleString("en-IN");

function renderProducts(list = PRODUCTS){
  filteredProducts = list;
  const grid = q("#productsGrid");
  grid.innerHTML = "";
  
  if(list.length === 0){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:48px;margin-bottom:12px">🔍</div>
      <div style="font-size:18px;font-weight:600">No products found</div>
      <div style="font-size:14px;margin-top:8px">Try adjusting your filters</div>
    </div>`;
    return;
  }
  
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      <div class="card-media">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-header">
          <div>
            <div class="card-title">${p.title}</div>
            <div class="card-category">${p.category}</div>
          </div>
          <div class="card-price">${formatPrice(p.price)}</div>
        </div>

        <div class="card-options">
          <div class="option-group">
            <div class="option-label">Size</div>
            <select class="size" data-id="${p.id}">
              ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn add-btn" data-id="${p.id}">
            Add to Cart
          </button>
          <button class="whatsapp-btn ask-btn" data-id="${p.id}">
            💬 Ask
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  qa(".add-btn").forEach(btn => btn.addEventListener("click", addToCart));
  qa(".ask-btn").forEach(btn => btn.addEventListener("click", askOnWhatsApp));
}

/* ========== CART OPERATIONS ========== */
function addToCart(e){
  const id = Number(e.currentTarget.dataset.id);
  const size = q(`select.size[data-id="${id}"]`).value;
  const prod = PRODUCTS.find(x => x.id === id);
  
  const existing = cart.find(i => i.id === id && i.size === size);

  if(existing){
    existing.qty++;
  } else {
    cart.push({ 
      id: prod.id, 
      title: prod.title, 
      price: prod.price, 
      img: prod.img, 
      size, 
      qty: 1 
    });
  }

  updateCart();
  showFlash("✓ Added to cart");
}


function updateCart(){
  updateCartCount();
  renderCartItems();
}

function updateCartCount(){
  const total = cart.reduce((s, i) => s + i.qty, 0);
  q("#cartCount").textContent = total;
  q("#itemCount").textContent = total;
}

function renderCartItems(){
  const container = q("#cartItems");
  container.innerHTML = "";
  
  if(cart.length === 0){
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--muted)">
        <div style="font-size:48px;margin-bottom:12px">🛒</div>
        <div style="font-size:16px;font-weight:600">Your cart is empty</div>
        <div style="font-size:14px;margin-top:8px">Add some cozy winter items!</div>
      </div>
    `;
    q("#cartTotal").textContent = formatPrice(0);
    return;
  }

  cart.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div class="meta">
        <div class="cart-item-header">
          <div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-details">${item.size} · ${item.color}</div>
          </div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-dec" data-i="${i}">−</button>
          <div class="qty-value">${item.qty}</div>
          <button class="qty-inc" data-i="${i}">+</button>
          <button class="btn ghost remove-btn" data-i="${i}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  qa(".qty-inc").forEach(b => b.addEventListener("click", e => changeQty(e.currentTarget.dataset.i, 1)));
  qa(".qty-dec").forEach(b => b.addEventListener("click", e => changeQty(e.currentTarget.dataset.i, -1)));
  qa(".remove-btn").forEach(b => b.addEventListener("click", e => removeItem(e.currentTarget.dataset.i)));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  q("#cartTotal").textContent = formatPrice(total);
}

function changeQty(index, delta){
  index = Number(index);
  cart[index].qty += delta;
  if(cart[index].qty <= 0) cart.splice(index, 1);
  updateCart();
}

function removeItem(index){
  cart.splice(Number(index), 1);
  updateCart();
  showFlash("Item removed");
}

function clearCart(){
  if(cart.length === 0) return;
  cart = [];
  updateCart();
  showFlash("Cart cleared");
}

/* ========== UI INTERACTIONS ========== */
function openCart(){ 
  q("#cartDrawer").classList.add("open");
  q("#cartOverlay").classList.add("show");
  renderCartItems();
}

function closeCart(){ 
  q("#cartDrawer").classList.remove("open");
  q("#cartOverlay").classList.remove("show");
}

function showFlash(msg){
  const existing = q(".flash");
  if(existing) existing.remove();
  
  const el = document.createElement("div");
  el.className = "flash";
  el.textContent = msg;
  document.body.appendChild(el);
  
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

/* ========== WHATSAPP FUNCTIONS ========== */
function askOnWhatsApp(e){
  const id = Number(e.currentTarget.dataset.id);
  const size = q(`select.size[data-id="${id}"]`).value;
  const color = q(`select.color[data-id="${id}"]`).value;
  const prod = PRODUCTS.find(x => x.id === id);

  const message = `Hello! I'm interested in:\n\n*${prod.title}*\nSize: ${size}\nColor: ${color}\nPrice: ${formatPrice(prod.price)}\n\nCould you please share more details?`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function placeOrder(){
  if(cart.length === 0){ 
    showFlash("Cart is empty");
    return;
  }

  q("#confirmModal").classList.add("show");
}

function confirmOrder(){
  let lines = [`*Order Details*\n${"=".repeat(30)}\n`];
  
  cart.forEach((item, idx) => {
    lines.push(`${idx + 1}. *${item.title}*`);
    lines.push(`   Size: ${item.size} | Color: ${item.color}`);
    lines.push(`   Qty: ${item.qty} × ${formatPrice(item.price)} = ${formatPrice(item.qty * item.price)}\n`);
  });

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  
  lines.push(`${"=".repeat(30)}`);
  lines.push(`*Total Items:* ${itemCount}`);
  lines.push(`*Grand Total:* ${formatPrice(total)}`);
  lines.push(`\nPlease confirm availability and delivery details. Thank you!`);

  const message = lines.join("\n");
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  
  q("#confirmModal").classList.remove("show");
  window.open(url, "_blank");
  
  showFlash("Opening WhatsApp...");
}

/* ========== FILTERS ========== */
function applyFilters(){
  const cat = q("#categoryFilter").value;
  const sort = q("#sortSelect").value;
  const term = q("#searchInput").value.trim().toLowerCase();

  let filtered = PRODUCTS.filter(p => {
    if(cat !== "all" && p.category !== cat) return false;
    if(term && !`${p.title} ${p.colors.join(" ")} ${p.category}`.toLowerCase().includes(term)) return false;
    return true;
  });

  if(sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if(sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if(sort === "name") filtered.sort((a, b) => a.title.localeCompare(b.title));

  renderProducts(filtered);
}

function debounce(fn, ms){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ========== INITIALIZATION ========== */
function init(){
  renderProducts();
  updateCartCount();

  q("#cartBtn").addEventListener("click", openCart);
  q("#closeCart").addEventListener("click", closeCart);
  q("#cartOverlay").addEventListener("click", closeCart);
  q("#clearCart").addEventListener("click", clearCart);
  q("#placeOrder").addEventListener("click", placeOrder);

  q("#categoryFilter").addEventListener("change", applyFilters);
  q("#sortSelect").addEventListener("change", applyFilters);
  q("#searchInput").addEventListener("input", debounce(applyFilters, 300));

  q("#confirmYes").addEventListener("click", confirmOrder);
  q("#cancelConfirm").addEventListener("click", () => {
    q("#confirmModal").classList.remove("show");
  });
  
  q("#confirmModal").addEventListener("click", (e) => {
    if(e.target === q("#confirmModal")) q("#confirmModal").classList.remove("show");
  });

  q("#year").textContent = new Date().getFullYear();

  // Image error handling
  document.addEventListener("error", (e) => {
    if(e.target.tagName === "IMG" && !e.target.dataset.error){
      e.target.dataset.error = "true";
      e.target.src = `https://via.placeholder.com/400x400/f7d7e2/6f4bb9?text=${encodeURIComponent(e.target.alt || "Product")}`;
    }
  }, true);
}

init();