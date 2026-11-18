const menus = [
  { id:1, name:"Bowl balanceado", type:"Balanceado", description:"Pollo, quinua, aguacate y vegetales.", calories:420, protein:"32 g", price:15, colors:["#d9b56c","#89a95f","#9c6047"] },
  { id:2, name:"Wrap fresco", type:"Vegano", description:"Hummus, garbanzos, verduras y espinaca.", calories:390, protein:"18 g", price:14, colors:["#c8a56b","#78a968","#9f8b5d"] },
  { id:3, name:"Bowl proteico", type:"Proteico", description:"Pollo, brócoli, arroz integral y huevo.", calories:480, protein:"38 g", price:16, colors:["#b9aa72","#73a16a","#d07a61"] }
];

let cart = JSON.parse(localStorage.getItem("nutricampus-cart") || "[]");
const menuGrid = document.getElementById("menuGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartOverlay = document.getElementById("cartOverlay");

function renderMenus(filter = "Todos") {
  const visible = filter === "Todos" ? menus : menus.filter((menu) => menu.type === filter);
  menuGrid.innerHTML = visible.map((menu) => `
    <article class="menu-card">
      <div class="menu-art" style="--food-a:${menu.colors[0]};--food-b:${menu.colors[1]};--food-c:${menu.colors[2]}">
        <div class="meal-visual"></div>
      </div>
      <div class="menu-content">
        <div class="menu-tags"><span>${menu.type}</span><span>${menu.calories} kcal</span></div>
        <h3>${menu.name}</h3>
        <p>${menu.description}</p>
        <div class="nutrition-row"><span><strong>${menu.protein}</strong> proteína</span><span><strong>${menu.calories}</strong> kcal</span></div>
        <div class="menu-footer"><strong>S/ ${menu.price.toFixed(2)}</strong><button class="add-button" data-add="${menu.id}" aria-label="Agregar ${menu.name}">+</button></div>
      </div>
    </article>
  `).join("");
}

function saveCart() {
  localStorage.setItem("nutricampus-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
  const subtotal = cart.reduce((sum, item) => {
    const menu = menus.find((option) => option.id === item.id);
    return sum + menu.price * item.quantity;
  }, 0);
  document.getElementById("subtotal").textContent = `S/ ${subtotal.toFixed(2)}`;
  document.getElementById("total").textContent = `S/ ${subtotal.toFixed(2)}`;
  cartItems.innerHTML = cart.length ? cart.map((item) => {
    const menu = menus.find((option) => option.id === item.id);
    return `<article class="cart-row">
      <div class="cart-thumb">🥗</div>
      <div><strong>${menu.name}</strong><small>S/ ${menu.price.toFixed(2)} c/u</small></div>
      <div class="qty"><button data-minus="${item.id}" aria-label="Reducir">−</button><strong>${item.quantity}</strong><button data-plus="${item.id}" aria-label="Agregar">+</button></div>
    </article>`;
  }).join("") : `<p class="cart-empty">Tu pedido está vacío.</p>`;
}

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderMenus(button.dataset.filter);
  });
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  const item = cart.find((entry) => entry.id === id);
  item ? item.quantity++ : cart.push({ id, quantity:1 });
  saveCart();
  showToast("Añadido a tu pedido");
});

cartItems.addEventListener("click", (event) => {
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  if (plus) {
    cart.find((item) => item.id === Number(plus.dataset.plus)).quantity++;
  }
  if (minus) {
    const id = Number(minus.dataset.minus);
    const item = cart.find((entry) => entry.id === id);
    item.quantity--;
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
  }
  saveCart();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    document.getElementById(`${button.dataset.view}View`).classList.add("active");
  });
});

document.querySelectorAll("[data-go-menu]").forEach((button) => button.addEventListener("click", () => {
  document.querySelector('[data-view="menu"]').click();
}));

document.getElementById("openCart").addEventListener("click", () => { cartOverlay.hidden = false; });
document.getElementById("closeCart").addEventListener("click", () => { cartOverlay.hidden = true; });
cartOverlay.addEventListener("click", (event) => { if (event.target === cartOverlay) cartOverlay.hidden = true; });

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) return showToast("Agrega un menú antes de reservar");
  const time = document.getElementById("timeSelect").value;
  const spot = document.getElementById("spotSelect").value;
  const date = document.getElementById("dateSelect").value;
  const code = `NC-${Math.floor(1000 + Math.random() * 9000)}`;
  const total = cart.reduce((sum, item) => {
    const menu = menus.find((option) => option.id === item.id);
    return sum + menu.price * item.quantity;
  }, 0);
  document.getElementById("checkoutDetails").textContent = `${date} · ${time} · ${spot}`;
  document.getElementById("qrCode").textContent = code;
  localStorage.setItem("nutricampus-order", JSON.stringify({
    code,
    date,
    time,
    spot,
    total,
    items: cart.map((item) => {
      const menu = menus.find((option) => option.id === item.id);
      return `${item.quantity}× ${menu.name}`;
    })
  }));
  renderOrders();
  cartOverlay.hidden = true;
  document.getElementById("checkoutDialog").showModal();
  cart = [];
  saveCart();
});

document.getElementById("closeCheckout").addEventListener("click", () => document.getElementById("checkoutDialog").close());
document.getElementById("viewOrders").addEventListener("click", () => {
  document.getElementById("checkoutDialog").close();
  document.querySelector('[data-view="orders"]').click();
});

document.getElementById("activatePass").addEventListener("click", () => showToast("Prueba NutriPass activada por 7 días"));
document.getElementById("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Preferencias guardadas");
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

renderMenus();
renderCart();
renderOrders();

function renderOrders() {
  const order = JSON.parse(localStorage.getItem("nutricampus-order") || "null");
  const empty = document.getElementById("orderEmpty");
  const content = document.getElementById("ordersContent");
  if (!order) {
    if (empty) empty.hidden = false;
    content.innerHTML = "";
    return;
  }
  if (empty) empty.hidden = true;
  content.innerHTML = `<article class="current-order">
    <div class="mini-qr">QR</div>
    <div><strong>Reserva confirmada</strong><b>${order.code}</b><small>${order.date} · ${order.time}</small><small>${order.spot}</small><small>${order.items.join(" · ")}</small></div>
    <strong>S/ ${Number(order.total || 0).toFixed(2)}</strong>
  </article>`;
}
