const FREE_SHIPPING_ABOVE = 5000;
const SHIPPING_CHARGE = 199;

const coupons = {
  SAVE10:  { type: "percent", value: 10,  min: 0,    text: "10% off" },
  SHOES20: { type: "percent", value: 20,  min: 5000, text: "20% off" },
  FLAT500: { type: "flat",    value: 500, min: 3000, text: "₹500 off" }
};

// cart is saved in localStorage so it stays after refresh
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedCoupon = localStorage.getItem("coupon") || null;
let activeCategory = "All";

const productGrid   = document.getElementById("productGrid");
const emptyMsg      = document.getElementById("emptyMsg");
const resultCount   = document.getElementById("resultCount");
const searchInput   = document.getElementById("searchInput");
const priceFilter   = document.getElementById("priceFilter");
const sortSelect    = document.getElementById("sortSelect");
const categoriesBox = document.getElementById("categories");

const cartBtn      = document.getElementById("cartBtn");
const cartCount    = document.getElementById("cartCount");
const cartDrawer   = document.getElementById("cartDrawer");
const overlay      = document.getElementById("overlay");
const cartItemsBox = document.getElementById("cartItems");
const cartFooter   = document.getElementById("cartFooter");

const couponInput = document.getElementById("couponInput");
const couponMsg   = document.getElementById("couponMsg");

const checkoutModal = document.getElementById("checkoutModal");
const toast = document.getElementById("toast");

function rupees(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function productImage(p) {
  if (p.image) {
    // if the photo does not load, show the drawn shoe
    return `<img src="${p.image}" alt="${p.name}" onerror="this.outerHTML = shoeSVG('${p.color}')" />`;
  }
  return shoeSVG(p.color);
}

function findProduct(id) {
  return products.find(function (p) {
    return p.id === id;
  });
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 1800);
}


// ---------- products ----------
function getFilteredProducts() {
  let list = products.slice();

  if (activeCategory !== "All") {
    list = list.filter(function (p) {
      return p.category === activeCategory;
    });
  }

  const text = searchInput.value.trim().toLowerCase();
  if (text !== "") {
    list = list.filter(function (p) {
      return p.name.toLowerCase().includes(text) || p.category.toLowerCase().includes(text);
    });
  }

  if (priceFilter.value !== "all") {
    const range = priceFilter.value.split("-");
    const min = Number(range[0]);
    const max = Number(range[1]);
    list = list.filter(function (p) {
      return p.price >= min && p.price <= max;
    });
  }

  const sortType = sortSelect.value;
  if (sortType === "low-high") {
    list.sort(function (a, b) { return a.price - b.price; });
  } else if (sortType === "high-low") {
    list.sort(function (a, b) { return b.price - a.price; });
  } else if (sortType === "rating") {
    list.sort(function (a, b) { return b.rating - a.rating; });
  } else if (sortType === "name") {
    list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  productGrid.innerHTML = "";

  resultCount.textContent = "(" + list.length + ")";
  emptyMsg.hidden = list.length !== 0;

  list.forEach(function (p) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-img">
        ${p.tag ? `<span class="badge">${p.tag}</span>` : ""}
        ${productImage(p)}
      </div>
      <div class="card-info">
        <div class="card-name">${p.name}</div>
        <div class="card-cat">${p.category} Shoes</div>
        <div class="card-rating">★ ${p.rating}</div>
        <div class="card-bottom">
          <span class="card-price">${rupees(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.classList.toggle("active", chip.dataset.cat === cat);
  });
  renderProducts();
}

categoriesBox.addEventListener("click", function (e) {
  if (e.target.classList.contains("chip")) {
    setCategory(e.target.dataset.cat);
  }
});

document.querySelectorAll("[data-nav]").forEach(function (link) {
  link.addEventListener("click", function () {
    setCategory(link.dataset.nav);
  });
});

searchInput.addEventListener("input", renderProducts);
priceFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

productGrid.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-btn")) {
    addToCart(Number(e.target.dataset.id));
  }
});


// ---------- cart ----------
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  if (appliedCoupon) {
    localStorage.setItem("coupon", appliedCoupon);
  } else {
    localStorage.removeItem("coupon");
  }
}

function addToCart(id) {
  const item = cart.find(function (c) { return c.id === id; });
  if (item) {
    item.qty++;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(findProduct(id).name + " added to cart");
}

function changeQty(id, change) {
  const item = cart.find(function (c) { return c.id === id; });
  if (!item) return;

  item.qty += change;
  if (item.qty < 1) {
    removeFromCart(id);
    return;
  }
  if (item.qty > 10) item.qty = 10;
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(function (c) { return c.id !== id; });
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  appliedCoupon = null;
  couponInput.value = "";
  couponMsg.textContent = "";
  saveCart();
  renderCart();
}

function calculateTotals() {
  let subtotal = 0;
  cart.forEach(function (c) {
    subtotal += findProduct(c.id).price * c.qty;
  });

  let discount = 0;
  if (appliedCoupon) {
    const coupon = coupons[appliedCoupon];
    if (subtotal >= coupon.min) {
      if (coupon.type === "percent") {
        discount = Math.round(subtotal * coupon.value / 100);
      } else {
        discount = coupon.value;
      }
    } else {
      // cart went below the minimum amount so coupon is removed
      appliedCoupon = null;
      saveCart();
      showCouponMessage("Coupon removed (minimum amount not met)", "error");
    }
  }

  const afterDiscount = subtotal - discount;
  let shipping = 0;
  if (subtotal > 0 && afterDiscount < FREE_SHIPPING_ABOVE) {
    shipping = SHIPPING_CHARGE;
  }

  return {
    subtotal: subtotal,
    discount: discount,
    shipping: shipping,
    total: afterDiscount + shipping
  };
}

function renderCart() {
  let totalQty = 0;
  cart.forEach(function (c) { totalQty += c.qty; });
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsBox.innerHTML = `<p class="cart-empty">Your cart is empty.<br />Add some shoes!</p>`;
    cartFooter.hidden = true;
    return;
  }
  cartFooter.hidden = false;

  cartItemsBox.innerHTML = "";
  cart.forEach(function (c) {
    const p = findProduct(c.id);
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-img">${productImage(p)}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-cat">${p.category} · ${rupees(p.price)}</div>
        <div class="qty-box">
          <button data-action="minus" data-id="${p.id}">−</button>
          <span>${c.qty}</span>
          <button data-action="plus" data-id="${p.id}">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="item-total">${rupees(p.price * c.qty)}</span>
        <button class="remove-btn" data-action="remove" data-id="${p.id}">Remove</button>
      </div>
    `;
    cartItemsBox.appendChild(row);
  });

  const t = calculateTotals();
  document.getElementById("subtotal").textContent = rupees(t.subtotal);
  document.getElementById("discount").textContent = "- " + rupees(t.discount);
  document.getElementById("shipping").textContent = t.shipping === 0 ? "FREE" : rupees(t.shipping);
  document.getElementById("total").textContent = rupees(t.total);
}

cartItemsBox.addEventListener("click", function (e) {
  const action = e.target.dataset.action;
  const id = Number(e.target.dataset.id);
  if (action === "plus") changeQty(id, 1);
  if (action === "minus") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
}
cartBtn.addEventListener("click", openCart);
overlay.addEventListener("click", closeCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("clearCart").addEventListener("click", clearCart);


// ---------- coupon ----------
function showCouponMessage(text, type) {
  couponMsg.textContent = text;
  couponMsg.className = "coupon-msg " + type;
}

function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  const subtotal = calculateTotals().subtotal;

  if (code === "") {
    showCouponMessage("Please enter a coupon code", "error");
    return;
  }
  if (!coupons[code]) {
    showCouponMessage("Invalid coupon code", "error");
    return;
  }
  if (subtotal < coupons[code].min) {
    showCouponMessage("Add items worth " + rupees(coupons[code].min) + " or more to use " + code, "error");
    return;
  }

  appliedCoupon = code;
  saveCart();
  renderCart();
  showCouponMessage(code + " applied: " + coupons[code].text, "ok");
}

document.getElementById("applyCoupon").addEventListener("click", applyCoupon);
couponInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") applyCoupon();
});


// ---------- checkout ----------
const checkoutStep = document.getElementById("checkoutStep");
const successStep = document.getElementById("successStep");

document.getElementById("checkoutBtn").addEventListener("click", function () {
  if (cart.length === 0) return;
  closeCart();
  fillOrderSummary();
  checkoutStep.hidden = false;
  successStep.hidden = true;
  checkoutModal.classList.add("show");
});

function fillOrderSummary() {
  const box = document.getElementById("orderItems");
  box.innerHTML = "";
  cart.forEach(function (c) {
    const p = findProduct(c.id);
    const line = document.createElement("div");
    line.className = "order-line";
    line.innerHTML = `<span>${p.name} × ${c.qty}</span><span>${rupees(p.price * c.qty)}</span>`;
    box.appendChild(line);
  });

  const t = calculateTotals();
  document.getElementById("sumSubtotal").textContent = rupees(t.subtotal);
  document.getElementById("sumDiscount").textContent = "- " + rupees(t.discount);
  document.getElementById("sumShipping").textContent = t.shipping === 0 ? "FREE" : rupees(t.shipping);
  document.getElementById("sumTotal").textContent = rupees(t.total);
}

function closeModal() {
  checkoutModal.classList.remove("show");
}
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("continueBtn").addEventListener("click", closeModal);
checkoutModal.addEventListener("click", function (e) {
  if (e.target === checkoutModal) closeModal();
});

document.getElementById("checkoutForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const method = document.getElementById("payMethod").value;
  const total = calculateTotals().total;
  const orderId = "ARP" + Math.floor(100000 + Math.random() * 900000);

  document.getElementById("successText").innerHTML =
    "Thank you, <b>" + name + "</b>!<br />" +
    "Order ID: <b>" + orderId + "</b><br />" +
    "Amount: <b>" + rupees(total) + "</b> (" + method + ")";

  checkoutStep.hidden = true;
  successStep.hidden = false;

  clearCart();
  this.reset();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeCart();
    closeModal();
  }
});


renderProducts();
renderCart();
if (appliedCoupon && coupons[appliedCoupon]) {
  couponInput.value = appliedCoupon;
  showCouponMessage(appliedCoupon + " applied: " + coupons[appliedCoupon].text, "ok");
}
