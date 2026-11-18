const menus = [
  { id:1, name:"Bowl balanceado", type:"Balanceado", description:"Pollo, quinua, aguacate y vegetales.", calories:420, protein:"32 g", price:15, colors:["#d9b56c","#89a95f","#9c6047"] },
  { id:2, name:"Wrap fresco", type:"Vegano", description:"Hummus, garbanzos, verduras y espinaca.", calories:390, protein:"18 g", price:14, colors:["#c8a56b","#78a968","#9f8b5d"] },
  { id:3, name:"Bowl proteico", type:"Proteico", description:"Pollo, brócoli, arroz integral y huevo.", calories:480, protein:"38 g", price:16, colors:["#b9aa72","#73a16a","#d07a61"] }
];

const menuGrid = document.getElementById("menuGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartOverlay = document.getElementById("cartOverlay");
let cart = loadCart();
let orders = loadOrders();

function readStoredValue(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    showToast("No se pudieron leer algunos datos guardados; puedes continuar en modo demo.");
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showToast("No se pudieron guardar los cambios en este navegador.");
    return false;
  }
}

function loadCart() {
  const stored = readStoredValue("nutricampus-cart", []);
  if (!Array.isArray(stored)) {
    showToast("El carrito guardado no tenía un formato válido y se inició vacío.");
    return [];
  }
  const valid = stored.filter((item) =>
    item &&
    menus.some((menu) => menu.id === item.id) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
  if (valid.length !== stored.length) {
    showToast("Se omitieron artículos inválidos del carrito guardado.");
  }
  return valid.map((item) => ({ id: item.id, quantity: item.quantity }));
}

function isValidOrder(order) {
  return Boolean(
    order &&
    typeof order.code === "string" &&
    typeof order.date === "string" &&
    typeof order.time === "string" &&
    typeof order.spot === "string" &&
    Number.isFinite(order.total) &&
    order.total >= 0 &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every((item) => typeof item === "string")
  );
}

function loadOrders() {
  const stored = readStoredValue("nutricampus-orders", null);
  if (stored === null) {
    const previousOrder = readStoredValue("nutricampus-order", null);
    return isValidOrder(previousOrder) ? [previousOrder] : [];
  }
  if (!Array.isArray(stored)) {
    showToast("El historial guardado no tenía un formato válido.");
    return [];
  }
  const valid = stored.filter(isValidOrder);
  if (valid.length !== stored.length) {
    showToast("Se omitieron reservas inválidas del historial.");
  }
  return valid;
}

function localDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  writeStoredValue("nutricampus-cart", cart);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
  const subtotal = cart.reduce((sum, item) => {
    const menu = menus.find((option) => option.id === item.id);
    return sum + (menu ? menu.price : 0) * item.quantity;
  }, 0);
  document.getElementById("subtotal").textContent = `S/ ${subtotal.toFixed(2)}`;
  document.getElementById("total").textContent = `S/ ${subtotal.toFixed(2)}`;
  cartItems.innerHTML = cart.length ? cart.map((item) => {
    const menu = menus.find((option) => option.id === item.id);
    if (!menu) return "";
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
  if (!date) return showToast("Selecciona la fecha de recojo.");
  if (date < localDateValue(new Date())) return showToast("La fecha no puede ser anterior a hoy.");

  const code = `NC-${Date.now().toString(36).toUpperCase()}`;
  const total = cart.reduce((sum, item) => {
    const menu = menus.find((option) => option.id === item.id);
    return sum + (menu ? menu.price : 0) * item.quantity;
  }, 0);
  const order = {
    code,
    date,
    time,
    spot,
    total,
    items: cart.map((item) => {
      const menu = menus.find((option) => option.id === item.id);
      return menu ? `${item.quantity}× ${menu.name}` : "";
    }).filter(Boolean)
  };
  if (!isValidOrder(order)) return showToast("No se pudo preparar la simulación del pedido.");

  orders.unshift(order);
  if (!writeStoredValue("nutricampus-orders", orders)) {
    orders.shift();
    return;
  }

  document.getElementById("checkoutDetails").textContent =
    `${date} · ${time} · ${spot}. No se envió a una cocina ni se procesó un pago.`;
  document.getElementById("reservationCode").textContent = code;
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

document.getElementById("activatePass").addEventListener("click", () => {
  showToast("Vista informativa: NutriPass no se activa ni se cobra en esta demo.");
});
document.getElementById("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const preferences = {
    goal: document.getElementById("profileGoal").value,
    diet: document.getElementById("profileDiet").value,
    allergens: document.getElementById("profileAllergens").value.trim()
  };
  if (writeStoredValue("nutricampus-profile", preferences)) {
    showToast("Preferencias guardadas en este navegador.");
  }
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
  const empty = document.getElementById("orderEmpty");
  const content = document.getElementById("ordersContent");
  empty.hidden = orders.length > 0;
  content.innerHTML = orders.map((order) => `
    <article class="current-order">
      <div class="demo-code">DEMO</div>
      <div>
        <strong>Solicitud de demostración</strong>
        <b>${escapeHtml(order.code)}</b>
        <small>${escapeHtml(order.date)} · ${escapeHtml(order.time)}</small>
        <small>${escapeHtml(order.spot)}</small>
        <small>${order.items.map(escapeHtml).join(" · ")}</small>
        <small>No enviada a una cocina.</small>
      </div>
      <strong>S/ ${order.total.toFixed(2)}</strong>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function loadProfile() {
  const profile = readStoredValue("nutricampus-profile", null);
  if (!profile || typeof profile !== "object") return;

  const goals = ["Comer de forma equilibrada", "Más proteína", "Reducir calorías"];
  const diets = ["Sin preferencia", "Vegetariano", "Vegano"];
  if (goals.includes(profile.goal)) document.getElementById("profileGoal").value = profile.goal;
  if (diets.includes(profile.diet)) document.getElementById("profileDiet").value = profile.diet;
  if (typeof profile.allergens === "string") {
    document.getElementById("profileAllergens").value = profile.allergens.slice(0, 120);
  }
}

const dateInput = document.getElementById("dateSelect");
dateInput.min = localDateValue(new Date());
dateInput.value = dateInput.min;
loadProfile();
