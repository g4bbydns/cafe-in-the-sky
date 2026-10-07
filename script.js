// ===================== DATA (simple arrays) =====================
var today = new Date().toLocaleDateString();

var menu = [
  { id: 1, name: "Cafe Latte", category: "Coffee", price: 125, desc: "Smooth espresso with steamed milk.", image: "images/cafe-latte.jpg", available: true },
  { id: 2, name: "Spanish Latte", category: "Coffee", price: 145, desc: "Sweet and creamy espresso latte.", image: "images/spanish-latte.jpg", available: true },
  { id: 3, name: "Americano", category: "Coffee", price: 110, desc: "Bold espresso with hot water.", image: "images/americano.jpg", available: true },
  { id: 4, name: "Cappuccino", category: "Coffee", price: 130, desc: "Espresso with thick milk foam.", image: "images/cappuccino.jpg", available: true },
  { id: 5, name: "Caramel Macchiato", category: "Coffee", price: 155, desc: "Espresso, milk, and caramel drizzle.", image: "images/caramel-macchiato.jpg", available: true },
  { id: 6, name: "Matcha Latte", category: "Non-Coffee", price: 150, desc: "Earthy green tea with milk.", image: "images/matcha-latte.jpg", available: true },
  { id: 7, name: "Chocolate", category: "Non-Coffee", price: 125, desc: "Rich and creamy hot chocolate.", image: "images/chocolate.jpg", available: true },
  { id: 8, name: "Strawberry Cream", category: "Non-Coffee", price: 135, desc: "Sweet strawberry with cream.", image: "images/strawberry-cream.jpg", available: true },
  { id: 9, name: "Croissant", category: "Pastries", price: 95, desc: "Buttery and flaky, baked fresh.", image: "images/croissant.jpg", available: true },
  { id: 10, name: "Chocolate Muffin", category: "Pastries", price: 85, desc: "Soft muffin with chocolate chips.", image: "images/chocolate-muffin.jpg", available: true },
  { id: 11, name: "Cinnamon Roll", category: "Pastries", price: 100, desc: "Warm roll with cinnamon glaze.", image: "images/cinnamon-roll.jpg", available: true },
  { id: 12, name: "Banana Bread", category: "Pastries", price: 75, desc: "Moist homemade banana bread.", image: "images/banana-bread.jpg", available: true }
];
var nextMenuId = 13;

var inventory = [
  { name: "Coffee Beans", category: "Ingredients", quantity: 25, unit: "kg" },
  { name: "Milk", category: "Ingredients", quantity: 8, unit: "liters" },
  { name: "Sugar", category: "Ingredients", quantity: 15, unit: "kg" },
  { name: "Matcha Powder", category: "Ingredients", quantity: 4, unit: "kg" },
  { name: "Chocolate", category: "Ingredients", quantity: 12, unit: "kg" },
  { name: "Paper Cups", category: "Packaging", quantity: 200, unit: "pcs" },
  { name: "Cup Lids", category: "Packaging", quantity: 0, unit: "pcs" },
  { name: "Paper Bags", category: "Packaging", quantity: 150, unit: "pcs" },
  { name: "Pastry Ingredients", category: "Ingredients", quantity: 9, unit: "kg" }
];

var orders = [
  { number: "CH-001", date: today, customer: "Ana Reyes", username: "customer", items: [{ name: "Cafe Latte", qty: 2 }, { name: "Croissant", qty: 1 }], total: 345, status: "Completed", payment: "Paid", orderType: "Pickup", paymentMethod: "GCash", paymentRef: "0000-1111-2222" },
  { number: "CH-002", date: today, customer: "Ben", items: [{ name: "Matcha Latte", qty: 1 }], total: 150, status: "Preparing", payment: "Pending" },
  { number: "CH-003", date: today, customer: "Walk-in", items: [{ name: "Spanish Latte", qty: 2 }, { name: "Banana Bread", qty: 1 }], total: 365, status: "Pending", payment: "Pending" }
];

// "Out for Delivery" only makes sense for delivered orders, but the list is
// shared so the admin Orders drop-down can set every status.
var statuses = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Completed", "Cancelled"];
var cart = [];
var nextLineId = 1;   // each basket line gets its own id, so two differently
                      // customised copies of one drink stay separate lines

// ===================== CHECKOUT: ORDER TYPE + PAYMENT =====================
// COD is a delivery-only option, so each order type carries its own list.
var PAYMENT_METHODS = {
  Pickup: ["GCash", "Bank Transfer", "Cash"],
  Delivery: ["GCash", "Bank Transfer", "Cash on Delivery"]
};

// The cafe's own GCash number, shown whenever GCash is chosen.
var CAFE_GCASH_NUMBER = "09568561069";

// Bank details are still left for the cafe to fill in.
var PAYMENT_DETAILS = {
  "GCash": "GCash Number: " + CAFE_GCASH_NUMBER,
  "Bank Transfer": "Bank Account: Add caf\u00E9 bank details"
};

function isPaidByTransfer(method) {
  return method == "GCash" || method == "Bank Transfer";
}

// ===================== ACCOUNTS (ONE list for all roles) =====================
// Each account has a role: "admin", "staff", or "customer".
// This is a front-end simulation only. Real websites never store passwords like this.
var users = [
  { name: "Admin", username: "admin", password: "admin123", role: "admin", active: true, registered: today },
  { name: "Maria Santos", username: "staff", password: "staff123", role: "staff", active: true, registered: today },
  { name: "Juan Dela Cruz", username: "juan", password: "juan123", role: "staff", active: true, registered: today },
  { name: "Ana Reyes", username: "customer", password: "customer123", role: "customer", active: true, registered: today }
];

var currentUser = null; // nobody is logged in at the start

// ===================== ROLE-BASED ACCESS =====================
// Which dashboard panels each role may open.
// Customers have an empty list, so they can never open the dashboard.
var panelAccess = {
  admin: ["panel-dashboard", "panel-users", "panel-orders", "panel-sales", "panel-menu", "panel-inventory", "panel-queue", "panel-staff", "panel-reports"],
  staff: ["panel-dashboard", "panel-orders", "panel-menu", "panel-inventory", "panel-queue"],
  customer: []
};

// ===================== VALIDATION =====================
var PHONE_LENGTH = 11;
var MIN_PASSWORD = 8;

function isFilled(value) {
  return value.trim() !== "";
}

// Names: starts with a letter, then letters and the punctuation real names use.
// No digits, no symbols.
function isName(value) {
  return /^[A-Za-z][A-Za-z .,']*$/.test(value.trim());
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim());
}

// Philippine mobile number: exactly 11 digits and nothing else.
function isPhone(value) {
  return new RegExp("^\\d{" + PHONE_LENGTH + "}$").test(value.trim());
}

// Digits only, so a minus sign or a letter can never sneak in.
function isWholeNumber(value) {
  return /^\d+$/.test(value.trim());
}

// Used when adding stock or a price: must be greater than zero.
function isPositiveNumber(value) {
  return isWholeNumber(value) && Number(value) > 0;
}

function isUsername(value) {
  return /^[A-Za-z0-9._-]{3,}$/.test(value.trim());
}

function isLongEnoughPassword(value) {
  return value.length >= MIN_PASSWORD;
}

// Rejects impossible dates such as 2026-02-30 or month 13.
function isRealDate(value) {
  var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (parts == null) return false;

  var year = Number(parts[1]);
  var month = Number(parts[2]);
  var day = Number(parts[3]);
  if (month < 1 || month > 12 || day < 1) return false;

  // Day 0 of the next month is the last day of this month, leap years included.
  return day <= new Date(year, month, 0).getDate();
}

// Shows the message under a field and marks it for assistive tech.
function showFieldError(input, message) {
  clearFieldError(input);

  var note = document.createElement("p");
  note.className = "field-error";
  note.id = input.id + "-error";
  note.textContent = message;

  input.parentNode.insertBefore(note, input.nextSibling);
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-describedby", note.id);
  input.classList.add("invalid");
}

function clearFieldError(input) {
  var note = document.getElementById(input.id + "-error");
  if (note != null) note.remove();

  input.removeAttribute("aria-invalid");
  input.removeAttribute("aria-describedby");
  input.classList.remove("invalid");
}

function clearFormErrors(form) {
  var notes = form.querySelectorAll(".field-error");
  for (var i = 0; i < notes.length; i++) notes[i].remove();

  var flagged = form.querySelectorAll(".invalid");
  for (var j = 0; j < flagged.length; j++) {
    flagged[j].removeAttribute("aria-invalid");
    flagged[j].removeAttribute("aria-describedby");
    flagged[j].classList.remove("invalid");
  }
}

// Runs a list of { input, test, message } checks. Returns true only when all pass.
function runChecks(form, checks) {
  var failed = [];

  for (var i = 0; i < checks.length; i++) {
    if (checks[i].test(checks[i].input.value)) clearFieldError(checks[i].input);
    else {
      showFieldError(checks[i].input, checks[i].message);
      failed.push(checks[i].input);
    }
  }

  if (failed.length > 0) failed[0].focus();
  return failed.length === 0;
}

// Applies to any date picker added later, so bad dates are caught before saving.
function dateChecks(form) {
  var checks = [];
  var pickers = form.querySelectorAll("input[type='date']");
  for (var i = 0; i < pickers.length; i++) {
    checks.push({
      input: pickers[i],
      test: function (value) { return value.trim() === "" || isRealDate(value); },
      message: "Enter a real date, for example 2026-04-18."
    });
  }
  return checks;
}

// Clearing the warning as soon as the user starts fixing the field.
function watchField(input) {
  input.addEventListener("input", function () {
    if (input.classList.contains("invalid")) clearFieldError(input);
  });
}

// ===================== SMALL HELPERS =====================
function peso(amount) {
  return "\u20B1" + amount.toLocaleString();
}

// Customer notes travel back into the page as text, never as markup.
function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStockStatus(qty) {
  if (qty == 0) return "Out of Stock";
  if (qty <= 10) return "Low Stock";
  return "In Stock";
}

// Returns the badge color class for a status word
function badge(text) {
  var css = "warn";
  if (text == "In Stock" || text == "Completed" || text == "Paid" || text == "Ready" || text == "Active") css = "ok";
  if (text == "Out of Stock" || text == "Cancelled" || text == "Inactive") css = "bad";
  return '<span class="badge ' + css + '">' + text + "</span>";
}

function itemsText(order) {
  var text = "";
  for (var i = 0; i < order.items.length; i++) {
    text += order.items[i].name + " \u00D7 " + order.items[i].qty;
    // Orders placed before customisation have no options field.
    if (order.items[i].options != null && order.items[i].options !== "") {
      text += " (" + escapeText(order.items[i].options) + ")";
    }
    if (i < order.items.length - 1) text += ", ";
  }
  return text;
}

// ===================== CUSTOMER: MENU =====================
function showMenu() {
  var boxes = {
    "Coffee": document.getElementById("menu-coffee"),
    "Non-Coffee": document.getElementById("menu-noncoffee"),
    "Pastries": document.getElementById("menu-pastries")
  };
  boxes["Coffee"].innerHTML = "";
  boxes["Non-Coffee"].innerHTML = "";
  boxes["Pastries"].innerHTML = "";

  for (var i = 0; i < menu.length; i++) {
    var item = menu[i];
    var button = item.available
      ? '<button class="btn" onclick="openCustomize(' + item.id + ')">Add to Order</button>'
      : '<button class="btn" disabled>Unavailable</button>';

    boxes[item.category].innerHTML +=
      '<article class="product-card">' +
      '<div class="card-media">' +
      '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
      "</div>" +
      '<div class="card-body">' +
      "<h4>" + item.name + "</h4>" +
      '<p class="card-desc">' + item.desc + "</p>" +
      '<div class="card-foot">' +
      '<span class="price">' + peso(item.price) + "</span>" +
      button +
      "</div>" +
      "</div>" +
      "</article>";
  }
}

// ===================== CUSTOMIZE BEFORE ADDING TO BASKET =====================
// "Add to Order" only opens this modal. Nothing reaches the basket until the
// customer presses "Add to Basket".
// Drinks get temperature / ice / sugar / size. Pastries get none of those,
// because hot-cold and ice do not apply to a croissant.
var DRINK_CATEGORIES = ["Coffee", "Non-Coffee"];
var customizing = null;   // { id, qty } for as long as the modal is open

function menuItemById(id) {
  for (var i = 0; i < menu.length; i++) {
    if (menu[i].id == id) return menu[i];
  }
  return null;
}

function isDrink(item) {
  return DRINK_CATEGORIES.indexOf(item.category) != -1;
}

// One row of round choice buttons, with `checkedIndex` preselected.
function optionChips(name, label, options, checkedIndex) {
  var html = '<div class="opt-group"><span class="opt-label">' + label + '</span><div class="opt-chips">';
  for (var i = 0; i < options.length; i++) {
    html += '<label class="chip"><input type="radio" name="' + name + '" value="' + options[i] + '"' +
      (i == checkedIndex ? " checked" : "") + "><span>" + options[i] + "</span></label>";
  }
  return html + "</div></div>";
}

function openCustomize(id) {
  // Guests may browse the menu and the photos, but only a signed-in customer
  // can build a basket. Staff and admin are signed in, yet they are not
  // customers, so they are turned away here too.
  if (!isCustomer()) {
    if (currentUser == null) {
      showToast(
        "Please log in to place an order.",
        "Browse the menu any time, then log in to start your order.",
        "Go to Login",
        function () {
          showLoginForm();
          showOnly("login-page");
        }
      );
    } else {
      showToast("Only customer accounts can place orders.", "Staff and admin accounts use the dashboard instead.");
    }
    return;
  }

  var item = menuItemById(id);
  if (item == null || !item.available) return;

  customizing = { id: id, qty: 1 };

  document.getElementById("custom-title").textContent = item.name;
  document.getElementById("custom-desc").textContent = item.desc;
  document.getElementById("custom-price").textContent = peso(item.price);

  var pic = document.getElementById("custom-image");
  pic.src = item.image;
  pic.alt = item.name;

  var options = "";
  if (isDrink(item)) {
    options += optionChips("opt-temp", "Temperature", ["Hot", "Iced"], 0);
    options += optionChips("opt-ice", "Ice", ["No Ice", "Less Ice", "Regular Ice", "Extra Ice"], 2);
    options += optionChips("opt-sugar", "Sugar", ["No Sugar", "Less Sugar", "Regular", "Extra Sugar"], 2);
    options += optionChips("opt-size", "Size", ["Regular", "Large"], 0);
  }
  options +=
    '<div class="opt-group"><label class="opt-label" for="custom-notes">Special Instructions</label>' +
    '<textarea id="custom-notes" rows="2" placeholder="For example: extra hot, less sweet"></textarea></div>';
  document.getElementById("custom-options").innerHTML = options;

  // Reopening always starts from a clean slate.
  document.getElementById("custom-qty-value").textContent = "1";
  document.getElementById("custom-add").disabled = false;
  document.getElementById("custom-modal").classList.remove("hidden");
}

function closeCustomize() {
  document.getElementById("custom-modal").classList.add("hidden");
  customizing = null;
}

function chosenOption(name) {
  var picked = document.getElementById("custom-modal").querySelector('input[name="' + name + '"]:checked');
  return picked == null ? "" : picked.value;
}

// The picks are stored as one short line so the basket can tell a Hot from an
// Iced, and so the staff can read the order.
function customizationText(item) {
  var parts = [];
  if (isDrink(item)) {
    parts.push(chosenOption("opt-temp"));
    parts.push(chosenOption("opt-ice"));
    parts.push(chosenOption("opt-sugar"));
    parts.push(chosenOption("opt-size"));
  }
  var notes = document.getElementById("custom-notes").value.trim();
  if (notes !== "") parts.push("Note: " + notes);
  return parts.join(" \u00B7 ");
}

function addToBasket(id, qty, options) {
  // Second guard, so the basket can never be filled without an account.
  if (!isCustomer()) return;
  var item = menuItemById(id);
  if (item == null) return;

  // Identical choices merge into one line; different choices stay separate.
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id == id && cart[i].options == options) {
      cart[i].qty += qty;
      return;
    }
  }
  cart.push({ lineId: nextLineId++, id: id, name: item.name, price: item.price, qty: qty, options: options });
}

document.getElementById("custom-qty-minus").addEventListener("click", function () {
  if (customizing == null || customizing.qty <= 1) return;
  customizing.qty--;
  document.getElementById("custom-qty-value").textContent = customizing.qty;
});

document.getElementById("custom-qty-plus").addEventListener("click", function () {
  if (customizing == null) return;
  customizing.qty++;
  document.getElementById("custom-qty-value").textContent = customizing.qty;
});

document.getElementById("custom-cancel").addEventListener("click", closeCustomize);
document.getElementById("custom-close-x").addEventListener("click", closeCustomize);

// Clicking the dimmed background closes it, exactly like Cancel.
document.getElementById("custom-modal").addEventListener("click", function (event) {
  if (event.target === this) closeCustomize();
});

document.addEventListener("keydown", function (event) {
  if (event.key != "Escape") return;
  if (document.getElementById("custom-modal").classList.contains("hidden")) return;
  closeCustomize();
});

// Small confirmation pop-up that appears by itself and fades away again.
// The bell panel cannot do this job: it is a click-to-open list of saved
// notes, it only shows to a signed-in account, and it never disappears.
function showToast(title, detail, actionLabel, action) {
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = "<strong>" + escapeText(title) + "</strong><span>" + escapeText(detail) + "</span>";

  // An optional way forward. Only this button reacts to clicks; the toast
  // itself stays inert, so it can never cover the page.
  if (actionLabel != null) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "toast-action";
    button.textContent = actionLabel;
    button.addEventListener("click", function () {
      toast.remove();
      action();
    });
    toast.appendChild(button);
  }

  document.getElementById("toast-area").appendChild(toast);

  setTimeout(function () {
    toast.classList.add("leaving");
    setTimeout(function () { toast.remove(); }, 320);
  }, 3200);
}

document.getElementById("custom-add").addEventListener("click", function () {
  if (customizing == null) return;

  var item = menuItemById(customizing.id);
  addToBasket(customizing.id, customizing.qty, customizationText(item));
  showCart();

  showToast("Added to basket!", item.name + " has been added to your basket.");
  this.disabled = true;
  setTimeout(closeCustomize, 900);
});

// ===================== CUSTOMER: ORDER =====================
function changeQty(lineId, change) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].lineId == lineId) {
      cart[i].qty += change;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      break;
    }
  }
  showCart();
}

function removeItem(lineId) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].lineId == lineId) {
      cart.splice(i, 1);
      break;
    }
  }
  showCart();
}

function showCart() {
  var list = document.getElementById("order-list");
  var total = 0;
  var count = 0;
  list.innerHTML = "";

  if (cart.length == 0) list.innerHTML = "<li>No items yet. Add something from the menu!</li>";

  for (var i = 0; i < cart.length; i++) {
    var subtotal = cart[i].price * cart[i].qty;
    total += subtotal;
    count += cart[i].qty;
    list.innerHTML +=
      "<li><span>" + cart[i].name + " \u00D7 " + cart[i].qty + " \u2014 " + peso(subtotal) +
      (cart[i].options ? '<em class="cart-options">' + escapeText(cart[i].options) + "</em>" : "") +
      "</span><span>" +
      '<button class="btn btn-small" onclick="changeQty(' + cart[i].lineId + ', -1)">\u2212</button>' +
      '<button class="btn btn-small" onclick="changeQty(' + cart[i].lineId + ', 1)">+</button>' +
      '<button class="btn btn-small" onclick="removeItem(' + cart[i].lineId + ')">Remove</button>' +
      "</span></li>";
  }
  document.getElementById("order-total").textContent = "Total: " + peso(total);
  updateCartBadge(count);
}

// Keeps the header cart in sync with the order box
function updateCartBadge(count) {
  var badge = document.getElementById("cart-count");
  if (badge == null) return;

  badge.textContent = count;
  if (count == 0) {
    document.getElementById("cart-btn").setAttribute("aria-label", "Cart is empty");
  } else {
    document.getElementById("cart-btn").setAttribute("aria-label", count + " item" + (count == 1 ? "" : "s") + " in cart");
  }
}

// Rebuilds the payment list for the chosen order type, then refreshes the
// details box. COD is only ever listed for Delivery.
function refreshCheckout() {
  var type = document.getElementById("order-type").value;
  var method = document.getElementById("payment-method");
  var chosen = method.value;

  document.getElementById("delivery-box").classList.toggle("hidden", type != "Delivery");

  var allowed = PAYMENT_METHODS[type] || [];
  var options = "";
  for (var i = 0; i < allowed.length; i++) {
    options += '<option value="' + allowed[i] + '">' + allowed[i] + "</option>";
  }
  method.innerHTML = options;

  // Keep the earlier choice when the new order type still offers it.
  for (var j = 0; j < allowed.length; j++) {
    if (allowed[j] == chosen) method.value = chosen;
  }

  refreshPaymentDetails();
}

// Cash and COD need no reference number, so the details box stays closed.
function refreshPaymentDetails() {
  var method = document.getElementById("payment-method").value;
  var box = document.getElementById("payment-details");
  var ref = document.getElementById("payment-ref");
  var note = document.getElementById("payment-note");

  if (!isPaidByTransfer(method)) {
    box.classList.add("hidden");
    ref.value = "";
    clearFieldError(ref);
    note.textContent = method == "Cash on Delivery"
      ? "Cash on Delivery. Please pay the rider when your order arrives."
      : "Cash. Please pay at the counter when you pick up your order.";
    return;
  }

  box.classList.remove("hidden");
  note.textContent = "";
  document.getElementById("payment-instructions").textContent = PAYMENT_DETAILS[method];
}

document.getElementById("order-type").addEventListener("change", refreshCheckout);
document.getElementById("payment-method").addEventListener("change", refreshPaymentDetails);

function placeOrder() {
  var message = document.getElementById("order-message");
  // A basket left behind by someone who logged out can still be on screen.
  if (!isCustomer()) {
    message.textContent = "Please log in to place an order.";
    return;
  }
  if (cart.length == 0) {
    message.textContent = "Your order is empty.";
    return;
  }

  var type = document.getElementById("order-type").value;
  var method = document.getElementById("payment-method").value;
  var addressBox = document.getElementById("delivery-address");
  var ref = document.getElementById("payment-ref");

  // Delivery needs somewhere to go; a transfer needs a reference to match on.
  if (type == "Delivery" && !isFilled(addressBox.value)) {
    showFieldError(addressBox, "Enter the address we should deliver your order to.");
    addressBox.focus();
    message.textContent = "Please check the highlighted fields.";
    return;
  }
  if (isPaidByTransfer(method) && !isFilled(ref.value)) {
    showFieldError(ref, "Enter your " + (method == "GCash" ? "GCash" : "bank transfer") + " reference number.");
    ref.focus();
    message.textContent = "Please check the highlighted fields.";
    return;
  }
  if (!isFilled(addressBox.value)) clearFieldError(addressBox);
  if (!isFilled(ref.value)) clearFieldError(ref);

  var total = 0;
  var orderItems = [];
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].qty;
    orderItems.push({ name: cart[i].name, qty: cart[i].qty, options: cart[i].options });
  }

  // Order number: CH-001, CH-002, ...
  var number = "CH-" + String(orders.length + 1).padStart(3, "0");

  // Use the typed name; if empty, use the logged-in customer's name; otherwise Walk-in
  var name = document.getElementById("customer-name").value;
  if (name == "" && currentUser != null) name = currentUser.name;
  if (name == "") name = "Walk-in";

  orders.push({
    number: number,
    date: today,
    customer: name,
    // Links the order to the account so My Orders can find it again.
    username: currentUser == null ? "" : currentUser.username,
    items: orderItems,
    total: total,
    status: "Pending",
    payment: "Pending",
    orderType: type,
    paymentMethod: method,
    paymentRef: isPaidByTransfer(method) ? ref.value.trim() : "",
    address: type == "Delivery" ? addressBox.value.trim() : ""
  });

  message.textContent = "Order received! Thank you for choosing Cafe in the Sky. Your order number is " + number + " (" + type + ", " + method + ").";
  cart = [];
  showCart();
}

// ===================== CONTACT FORM =====================
document.getElementById("contact-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var fullName = document.getElementById("contact-name");
  var mail = document.getElementById("contact-email");
  var message = document.getElementById("contact-message");

  var checks = [
    { input: fullName, test: function (v) { return isFilled(v) && isName(v); }, message: "Enter your name using letters only." },
    { input: mail, test: isEmail, message: "Enter a valid email, for example name@example.com." },
    { input: message, test: function (v) { return v.trim().length >= 10; }, message: "Please write at least 10 characters." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  document.getElementById("contact-success").textContent = "Thank you! Your message has been sent.";
  this.reset();
});

// ===================== NOTIFICATIONS =====================
var notifications = [];

function addNotification(text, forUser) {
  notifications.unshift({ text: text, forUser: forUser, read: false, time: new Date().toLocaleTimeString() });

  // Refresh the bell straight away so the count never goes stale.
  updateNotifBadge();
  if (!document.getElementById("notif-panel").classList.contains("hidden")) renderNotifications();
}

// A note with no owner is a staff alert; a note with an owner belongs to that customer.
function visibleNotifications() {
  var mine = [];
  for (var i = 0; i < notifications.length; i++) {
    var note = notifications[i];
    if (note.forUser == null) {
      if (currentUser != null && currentUser.role != "customer") mine.push(note);
    } else if (currentUser != null && currentUser.name == note.forUser) {
      mine.push(note);
    }
  }
  return mine;
}

function updateNotifBadge() {
  var mine = visibleNotifications();
  var unread = 0;
  for (var i = 0; i < mine.length; i++) {
    if (!mine[i].read) unread++;
  }

  var badge = document.getElementById("notif-count");
  badge.textContent = unread;
  if (unread == 0) badge.classList.add("hidden");
  else badge.classList.remove("hidden");
}

function renderNotifications() {
  var list = document.getElementById("notif-list");
  var mine = visibleNotifications();
  list.innerHTML = "";

  if (mine.length == 0) {
    list.innerHTML = '<li class="empty-row">No notifications yet.</li>';
    return;
  }

  for (var i = 0; i < mine.length; i++) {
    list.innerHTML += '<li class="' + (mine[i].read ? "" : "unread") + '">' + mine[i].text + "<span>" + mine[i].time + "</span></li>";
  }
}

function closeNotifications() {
  document.getElementById("notif-panel").classList.add("hidden");
}

// Opening the panel is what marks the notes as read.
function toggleNotifications() {
  var panel = document.getElementById("notif-panel");
  if (!panel.classList.contains("hidden")) {
    closeNotifications();
    return;
  }

  var mine = visibleNotifications();
  for (var i = 0; i < mine.length; i++) mine[i].read = true;
  renderNotifications();
  updateNotifBadge();
  panel.classList.remove("hidden");
}

document.getElementById("notif-btn").addEventListener("click", function (event) {
  event.stopPropagation();
  toggleNotifications();
});

document.getElementById("notif-read-btn").addEventListener("click", function () {
  var mine = visibleNotifications();
  for (var i = 0; i < mine.length; i++) mine[i].read = true;
  renderNotifications();
  updateNotifBadge();
});

// Clicking anywhere else closes the panel
document.addEventListener("click", function (event) {
  var panel = document.getElementById("notif-panel");
  if (panel.classList.contains("hidden")) return;
  if (panel.contains(event.target)) return;
  if (document.getElementById("notif-btn").contains(event.target)) return;
  closeNotifications();
});

// ===================== LOGIN / LOGOUT / ROLES =====================
function showOnly(id) {
  closeNotifications();
  document.getElementById("customer-site").classList.add("hidden");
  document.getElementById("login-page").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  // The profile page must close too, or the last customer's details would
  // stay on screen after they log out.
  document.getElementById("account-page").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

// The top-right button says "Login", or "Logout" when a customer is logged in
function updateLoginButton() {
  var button = document.getElementById("login-btn");
  var welcome = document.getElementById("welcome-text");
  var nameBox = document.getElementById("customer-name");

  if (currentUser != null && currentUser.role == "customer") {
    button.textContent = "Logout (" + currentUser.name + ")";
    welcome.textContent = "Welcome, " + currentUser.name + "!";
    nameBox.value = currentUser.name;
  } else {
    button.textContent = "Login";
    welcome.textContent = "";
    nameBox.value = "";
  }

  // The profile icon is customer-only: staff and admin use the dashboard instead.
  var userButton = document.getElementById("user-btn");
  if (currentUser != null && currentUser.role == "customer") userButton.classList.remove("hidden");
  else userButton.classList.add("hidden");

  // Who is signed in decides which notifications are visible.
  renderNotifications();
  updateNotifBadge();
}

// The login page holds two forms; only one is visible at a time.
// The credential boxes always open empty: nobody is signed in for them.
function showLoginForm() {
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("login-error").textContent = "";
  document.getElementById("register-error").textContent = "";
}

function showRegisterForm() {
  var form = document.getElementById("register-form");
  form.reset();
  clearFormErrors(form);
  document.getElementById("login-form").classList.add("hidden");
  form.classList.remove("hidden");
  document.getElementById("login-error").textContent = "";
  document.getElementById("register-error").textContent = "";
  hideRegisterSuccess();
}

// Confirmation shown on the login panel after a sign-up.
function showRegisterSuccess(text) {
  var note = document.getElementById("register-success");
  note.textContent = text;
  note.classList.remove("hidden");
}

function hideRegisterSuccess() {
  var note = document.getElementById("register-success");
  note.textContent = "";
  note.classList.add("hidden");
}

document.getElementById("show-register-btn").addEventListener("click", showRegisterForm);
document.getElementById("show-login-btn").addEventListener("click", showLoginForm);

document.getElementById("login-btn").addEventListener("click", function () {
  if (currentUser != null) {
    logout();                 // a logged-in customer clicked "Logout"
  } else {
    showLoginForm();          // always open on the login form, never the register form
    showOnly("login-page");
  }
});

document.getElementById("back-btn").addEventListener("click", function () {
  showLoginForm();
  showOnly("customer-site");
});

// Public sign-up. New accounts are always customers; staff and admin accounts
// are created from the dashboard, so nobody can register as staff from here.
// A new account is saved but NOT signed in: the person logs in themselves.
document.getElementById("register-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var name = document.getElementById("reg-name");
  var username = document.getElementById("reg-username");
  var password = document.getElementById("reg-password");
  var confirm = document.getElementById("reg-confirm");
  var address = document.getElementById("reg-address");
  var phone = document.getElementById("reg-phone");
  var email = document.getElementById("reg-email");

  var checks = [
    { input: name, test: function (v) { return isFilled(v) && isName(v); }, message: "Enter your full name using letters only." },
    { input: username, test: function (v) { return isFilled(v) && isUsername(v); }, message: "Username needs 3 or more letters, numbers, dot, dash or underscore." },
    { input: password, test: isLongEnoughPassword, message: "Password must be at least " + MIN_PASSWORD + " characters." },
    { input: confirm, test: function (v) { return v === password.value; }, message: "The two passwords do not match." },
    { input: address, test: isFilled, message: "Enter your address." },
    { input: phone, test: isPhone, message: "Enter an 11-digit Philippine number, for example 09123456789." },
    { input: email, test: isEmail, message: "Enter a valid email, for example name@example.com." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  var taken = username.value.trim();
  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() == taken.toLowerCase()) {
      showFieldError(username, "That username is already taken. Please pick another.");
      username.focus();
      return;
    }
  }

  users.push({
    name: name.value.trim(),
    username: taken,
    password: password.value,
    role: "customer",
    active: true,
    registered: today,
    address: address.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim()
  });

  // Saved, but nobody is signed in. Back to a blank login form.
  this.reset();
  clearFormErrors(this);
  showLoginForm();
  showRegisterSuccess("Registration successful. Please log in.");
  document.getElementById("username").focus();
});

// ONE login form for all roles. Nothing is ever typed in for the user and
// nobody is signed in until both boxes are filled and Login is clicked.
document.getElementById("login-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var box = document.getElementById("username");
  var secret = document.getElementById("password");
  var error = document.getElementById("login-error");
  error.textContent = "";

  var checks = [
    { input: box, test: isFilled, message: "Enter your username." },
    { input: secret, test: isFilled, message: "Enter your password." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  var username = box.value.trim().toLowerCase();
  var password = secret.value;

  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (user.username.toLowerCase() != username || user.password != password) continue;

    if (!user.active) {
      error.textContent = "This account is inactive. Ask an admin to reactivate it.";
      return;
    }

    currentUser = user;
    this.reset();
    hideRegisterSuccess();
    enterApp();
    return;
  }

  error.textContent = "Wrong username or password.";
});

// Customers stay on the public site. Staff and admin go to the dashboard.
function enterApp() {
  if (currentUser.role == "customer") {
    showOnly("customer-site");
    showMenu();
    updateLoginButton();
    return;
  }

  showOnly("dashboard");
  document.getElementById("dashboard").classList.toggle("staff-mode", currentUser.role == "staff");
  document.getElementById("dash-title").textContent = currentUser.role == "admin" ? "Admin Dashboard" : "Staff Dashboard";
  updateLoginButton();
  openPanel(panelAccess[currentUser.role][0]);
}

function logout() {
  currentUser = null;
  document.getElementById("dash-title").textContent = "Dashboard";
  document.getElementById("dashboard").classList.remove("staff-mode");
  document.getElementById("register-form").reset();
  clearFormErrors(document.getElementById("register-form"));
  clearFormErrors(document.getElementById("login-form"));
  clearAccountPage();   // nobody's details stay on the page
  showLoginForm();
  hideRegisterSuccess();
  closeAllPanels();       // leave nothing open for whoever signs in next
  updateLoginButton();
  showOnly("customer-site");
}

// Collapses every dashboard panel. openPanel() opens exactly one again.
function closeAllPanels() {
  var panels = document.querySelectorAll("#dashboard .panel");
  for (var i = 0; i < panels.length; i++) panels[i].classList.add("hidden");
}

var sideButtons = document.querySelectorAll(".side-btn[data-panel]");
for (var s = 0; s < sideButtons.length; s++) {
  sideButtons[s].addEventListener("click", function () {
    openPanel(this.getAttribute("data-panel"));
  });
}

document.getElementById("logout-btn").addEventListener("click", logout);

// Only opens a panel the signed-in role is allowed to see.
function openPanel(id) {
  if (currentUser == null) return;

  var allowed = panelAccess[currentUser.role] || [];
  if (allowed.indexOf(id) == -1) return;

  var panels = document.querySelectorAll("#dashboard .panel");
  for (var i = 0; i < panels.length; i++) panels[i].classList.add("hidden");

  document.getElementById(id).classList.remove("hidden");
  refreshPanel(id);
}

function refreshPanel(id) {
  if (id == "panel-dashboard") renderDashboard();
  else if (id == "panel-orders") renderOrders();
  else if (id == "panel-sales") renderSales();
  else if (id == "panel-menu") renderMenuPanel();
  else if (id == "panel-inventory") renderInventory();
  else if (id == "panel-staff") renderStaff();
  else if (id == "panel-queue") renderQueue();
  else if (id == "panel-users") renderUsers();
  else if (id == "panel-reports") renderReports();
}

// ===================== CUSTOMER PROFILE + MY ORDERS =====================
// Customer-only. Staff and admin keep using the dashboard, so every entry
// point here refuses anyone whose role is not "customer".
function isCustomer() {
  return currentUser != null && currentUser.role == "customer";
}

function openAccountPage() {
  if (!isCustomer()) return;
  renderProfile();
  renderMyOrders();
  showOnly("account-page");
}

document.getElementById("user-btn").addEventListener("click", openAccountPage);

document.getElementById("account-back-btn").addEventListener("click", function () {
  showOnly("customer-site");
});

document.getElementById("profile-logout-btn").addEventListener("click", logout);

// Wipes the profile page so the last signed-in customer's details and orders
// are not left sitting in the page after they log out.
function clearAccountPage() {
  document.getElementById("account-subtitle").textContent = "";
  document.getElementById("profile-username").textContent = "";
  document.getElementById("profile-role").textContent = "";
  document.getElementById("profile-name").value = "";
  document.getElementById("profile-email").value = "";
  document.getElementById("profile-phone").value = "";
  document.getElementById("profile-address").value = "";
  document.getElementById("profile-password").value = "";
  document.getElementById("profile-saved").textContent = "";
  document.getElementById("my-orders-body").innerHTML = "";
  document.getElementById("my-orders-empty").classList.add("hidden");
  clearFormErrors(document.getElementById("profile-form"));
}

// Fills the form from the signed-in account. Username and Account Type are
// printed as plain text, so there is nothing to change them with.
function renderProfile() {
  document.getElementById("account-subtitle").textContent = "Signed in as " + currentUser.username;
  document.getElementById("profile-username").textContent = currentUser.username;
  document.getElementById("profile-role").textContent = currentUser.role;
  document.getElementById("profile-name").value = currentUser.name;
  document.getElementById("profile-email").value = currentUser.email || "";
  document.getElementById("profile-phone").value = currentUser.phone || "";
  document.getElementById("profile-address").value = currentUser.address || "";
  document.getElementById("profile-password").value = "";
  document.getElementById("profile-error").textContent = "";
  document.getElementById("profile-saved").textContent = "";
  clearFormErrors(document.getElementById("profile-form"));
}

// Cancel throws away the edits by reloading the saved values.
document.getElementById("profile-cancel-btn").addEventListener("click", renderProfile);

document.getElementById("profile-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);
  document.getElementById("profile-saved").textContent = "";

  if (!isCustomer()) return;

  var name = document.getElementById("profile-name");
  var email = document.getElementById("profile-email");
  var phone = document.getElementById("profile-phone");
  var address = document.getElementById("profile-address");
  var password = document.getElementById("profile-password");

  // Every field is optional except the name; blank means "leave as it was".
  var checks = [
    { input: name, test: function (v) { return isFilled(v) && isName(v); }, message: "Enter your full name using letters only." },
    { input: email, test: function (v) { return v.trim() === "" || isEmail(v); }, message: "Enter a valid email, for example name@example.com." },
    { input: phone, test: function (v) { return v.trim() === "" || isPhone(v); }, message: "Enter an 11-digit Philippine number, for example 09123456789." },
    { input: address, test: function (v) { return v.trim() === "" || isFilled(v); }, message: "Enter your address." },
    { input: password, test: function (v) { return v === "" || isLongEnoughPassword(v); }, message: "Password must be at least " + MIN_PASSWORD + " characters." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  // Username and role are deliberately never written here.
  currentUser.name = name.value.trim();
  if (email.value.trim() !== "") currentUser.email = email.value.trim();
  if (phone.value.trim() !== "") currentUser.phone = phone.value.trim();
  if (address.value.trim() !== "") currentUser.address = address.value.trim();
  if (password.value !== "") currentUser.password = password.value;

  document.getElementById("profile-password").value = "";
  document.getElementById("profile-saved").textContent = "Your changes have been saved.";
  updateLoginButton();   // the header greets the customer by their new name
});

// Newest first, and only the orders placed from this account.
function renderMyOrders() {
  var body = document.getElementById("my-orders-body");
  var empty = document.getElementById("my-orders-empty");
  body.innerHTML = "";

  var mine = [];
  for (var i = 0; i < orders.length; i++) {
    var order = orders[i];
    if (order.username != null && order.username != "" && order.username == currentUser.username) mine.push(order);
  }

  if (mine.length == 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  for (var j = mine.length - 1; j >= 0; j--) {
    var o = mine[j];
    body.innerHTML += tableRow([
      ["Order ID", o.number],
      ["Date", o.date],
      ["Items", itemsText(o)],
      ["Total", peso(o.total)],
      ["Type", o.orderType == null ? "Pickup" : o.orderType],
      ["Payment Method", o.paymentMethod == null ? "Cash" : o.paymentMethod],
      ["Payment Status", badge(o.payment)],
      ["Order Status", badge(o.status)]
    ]);
  }
}

// ===================== DASHBOARD: TABLES =====================
// Every cell carries data-label so the small-screen CSS can name the column.
function tableRow(cells) {
  var html = "<tr>";
  for (var i = 0; i < cells.length; i++) {
    html += '<td data-label="' + cells[i][0] + '">' + cells[i][1] + "</td>";
  }
  return html + "</tr>";
}

function emptyRow(columns, text) {
  return '<tr><td class="empty-row" colspan="' + columns + '">' + text + "</td></tr>";
}

// Cancelled orders never count toward money or item totals.
function isCounted(order) {
  return order.status != "Cancelled";
}

function menuItemByName(name) {
  for (var i = 0; i < menu.length; i++) {
    if (menu[i].name == name) return menu[i];
  }
  return null;
}

// name -> { qty, revenue } across every order that is not cancelled
function salesByItem() {
  var tally = Object.create(null);
  for (var i = 0; i < orders.length; i++) {
    if (!isCounted(orders[i])) continue;

    for (var j = 0; j < orders[i].items.length; j++) {
      var line = orders[i].items[j];
      var item = menuItemByName(line.name);
      if (tally[line.name] == null) tally[line.name] = { qty: 0, revenue: 0 };
      tally[line.name].qty += line.qty;
      tally[line.name].revenue += line.qty * (item == null ? 0 : item.price);
    }
  }
  return tally;
}

// ===================== DASHBOARD: OVERVIEW =====================
function renderDashboard() {
  var todayOrders = 0;
  var todaySales = 0;
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].date != today) continue;
    todayOrders++;
    if (orders[i].payment == "Paid") todaySales += orders[i].total;
  }

  var lowStock = 0;
  for (var j = 0; j < inventory.length; j++) {
    if (inventory[j].quantity <= 10) lowStock++;
  }

  document.getElementById("stat-sales").textContent = peso(todaySales);
  document.getElementById("stat-orders").textContent = todayOrders;
  document.getElementById("stat-products").textContent = menu.length;
  document.getElementById("stat-low").textContent = lowStock;

  var body = document.getElementById("recent-orders");
  body.innerHTML = "";
  if (orders.length == 0) {
    body.innerHTML = emptyRow(6, "No orders yet.");
    return;
  }

  // Newest first, capped at five rows.
  var first = Math.max(0, orders.length - 5);
  for (var k = orders.length - 1; k >= first; k--) {
    var order = orders[k];
    body.innerHTML += tableRow([
      ["Order #", order.number],
      ["Customer", order.customer],
      ["Items", itemsText(order)],
      ["Total", peso(order.total)],
      ["Status", badge(order.status)],
      ["Payment", badge(order.payment)]
    ]);
  }
}

// ===================== DASHBOARD: ORDERS =====================
function renderOrders() {
  var body = document.getElementById("orders-body");
  body.innerHTML = "";
  if (orders.length == 0) {
    body.innerHTML = emptyRow(8, "No orders yet.");
    return;
  }

  for (var i = orders.length - 1; i >= 0; i--) {
    var order = orders[i];
    var canCancel = order.status != "Cancelled" && order.status != "Completed";
    body.innerHTML += tableRow([
      ["Order #", order.number],
      ["Date", order.date],
      ["Customer", order.customer],
      ["Items", itemsText(order)],
      ["Total", peso(order.total)],
      ["Status", statusSelect(order, i)],
      ["Payment", paymentSelect(order, i)],
      ["Actions", canCancel ? '<button class="btn btn-small" onclick="cancelOrder(' + i + ')">Cancel</button>' : "-"]
    ]);
  }
}

function statusSelect(order, index) {
  var options = "";
  for (var i = 0; i < statuses.length; i++) {
    options += '<option value="' + statuses[i] + '"' + (statuses[i] == order.status ? " selected" : "") + ">" + statuses[i] + "</option>";
  }
  return '<select onchange="setOrderStatus(' + index + ', this.value)">' + options + "</select>";
}

function paymentSelect(order, index) {
  var options = "";
  for (var i = 0; i < 2; i++) {
    var word = i == 0 ? "Pending" : "Paid";
    options += '<option value="' + word + '"' + (order.payment == word ? " selected" : "") + ">" + word + "</option>";
  }
  return '<select onchange="setOrderPayment(' + index + ', this.value)">' + options + "</select>";
}

function setOrderStatus(index, value) {
  if (orders[index] == null) return;
  orders[index].status = value;
  addNotification("Order " + orders[index].number + " is now " + value + ".", orders[index].customer);
  renderOrders();
  renderDashboard();
}

function setOrderPayment(index, value) {
  if (orders[index] == null) return;
  orders[index].payment = value;
  addNotification("Order " + orders[index].number + " payment is now " + value + ".", orders[index].customer);
  renderOrders();
  renderDashboard();
}

function cancelOrder(index) {
  if (orders[index] == null) return;
  if (!confirm("Cancel order " + orders[index].number + "?")) return;
  orders[index].status = "Cancelled";
  addNotification("Order " + orders[index].number + " was cancelled.", orders[index].customer);
  renderOrders();
  renderDashboard();
}

// ===================== DASHBOARD: SALES =====================
function renderSales() {
  var gross = 0;
  var paid = 0;
  var unpaid = 0;
  var counted = 0;

  for (var i = 0; i < orders.length; i++) {
    if (!isCounted(orders[i])) continue;
    gross += orders[i].total;
    counted++;
    if (orders[i].payment == "Paid") paid += orders[i].total;
    else unpaid += orders[i].total;
  }

  document.getElementById("sales-gross").textContent = peso(gross);
  document.getElementById("sales-paid").textContent = peso(paid);
  document.getElementById("sales-unpaid").textContent = peso(unpaid);
  document.getElementById("sales-average").textContent = peso(counted == 0 ? 0 : Math.round(gross / counted));

  var body = document.getElementById("sales-items");
  body.innerHTML = "";

  var tally = salesByItem();
  var names = Object.keys(tally);
  if (names.length == 0) {
    body.innerHTML = emptyRow(4, "Nothing sold yet.");
    return;
  }

  for (var j = 0; j < names.length; j++) {
    var item = menuItemByName(names[j]);
    body.innerHTML += tableRow([
      ["Item", names[j]],
      ["Category", item == null ? "-" : item.category],
      ["Units Sold", tally[names[j]].qty],
      ["Revenue", peso(tally[names[j]].revenue)]
    ]);
  }
}

// ===================== DASHBOARD: MENU =====================
function renderMenuPanel() {
  var body = document.getElementById("menu-body");
  body.innerHTML = "";
  if (menu.length == 0) {
    body.innerHTML = emptyRow(5, "No menu items yet.");
    return;
  }

  for (var i = 0; i < menu.length; i++) {
    var item = menu[i];
    body.innerHTML += tableRow([
      ["Name", item.name],
      ["Category", item.category],
      ["Price", peso(item.price)],
      ["Availability", item.available ? badge("Active") : badge("Inactive")],
      ["Actions",
        '<button class="btn btn-small" onclick="toggleItem(' + item.id + ')">' + (item.available ? "Mark Unavailable" : "Mark Available") + "</button>" +
        '<button class="btn btn-small" onclick="deleteItem(' + item.id + ')">Delete</button>']
    ]);
  }
}

document.getElementById("menu-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var name = document.getElementById("menu-name");
  var price = document.getElementById("menu-price");
  var desc = document.getElementById("menu-desc");

  var checks = [
    { input: name, test: function (v) { return v.trim().length >= 2; }, message: "Enter an item name of at least 2 characters." },
    { input: price, test: isPositiveNumber, message: "Price must be a whole number of pesos, greater than 0." },
    { input: desc, test: isFilled, message: "Enter a short description." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  menu.push({
    id: nextMenuId++,
    name: name.value.trim(),
    category: document.getElementById("menu-category").value,
    price: Number(price.value),
    desc: desc.value.trim(),
    image: "images/placeholder.jpg",
    available: true
  });

  this.reset();
  clearFormErrors(this);
  renderMenuPanel();
  showMenu();
});

function toggleItem(id) {
  for (var i = 0; i < menu.length; i++) {
    if (menu[i].id != id) continue;
    menu[i].available = !menu[i].available;
    break;
  }
  renderMenuPanel();
  showMenu();
}

function deleteItem(id) {
  for (var i = 0; i < menu.length; i++) {
    if (menu[i].id != id) continue;
    if (!confirm("Delete " + menu[i].name + " from the menu?")) return;
    menu.splice(i, 1);
    break;
  }
  renderMenuPanel();
  showMenu();
}

// ===================== DASHBOARD: INVENTORY =====================
function renderInventory() {
  var body = document.getElementById("inventory-body");
  body.innerHTML = "";
  if (inventory.length == 0) {
    body.innerHTML = emptyRow(5, "No stock items yet.");
    return;
  }

  for (var i = 0; i < inventory.length; i++) {
    var item = inventory[i];
    body.innerHTML += tableRow([
      ["Item", item.name],
      ["Category", item.category],
      ["Quantity", '<input type="number" min="0" step="1" inputmode="numeric" data-stock="' + i + '" value="' + item.quantity + '" onchange="setStock(' + i + ', this.value)"> ' + item.unit],
      ["Status", badge(getStockStatus(item.quantity))],
      ["Actions",
        '<button class="btn btn-small" onclick="restock(' + i + ')">Restock +10</button>' +
        '<button class="btn btn-small" onclick="deleteStock(' + i + ')">Delete</button>']
    ]);
  }
}

document.getElementById("inventory-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var name = document.getElementById("inv-name");
  var qty = document.getElementById("inv-qty");
  var unit = document.getElementById("inv-unit");

  var checks = [
    { input: name, test: function (v) { return v.trim().length >= 2; }, message: "Enter an item name of at least 2 characters." },
    { input: qty, test: isPositiveNumber, message: "Quantity must be a whole number greater than 0." },
    { input: unit, test: isFilled, message: "Enter a unit, for example kg or pcs." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  inventory.push({
    name: name.value.trim(),
    category: document.getElementById("inv-category").value,
    quantity: Number(qty.value),
    unit: unit.value.trim()
  });

  this.reset();
  clearFormErrors(this);
  renderInventory();
  renderDashboard();
});

// Anything at 10 or below is worth flagging to staff.
function flagLowStock(item) {
  if (item.quantity > 10) return;
  addNotification(getStockStatus(item.quantity) + ": " + item.name + " (" + item.quantity + " " + item.unit + ").", null);
}

function setStock(index, value) {
  if (inventory[index] == null) return;

  if (!isWholeNumber(value)) {
    // Re-render to snap the box back, then explain the problem on the new one.
    renderInventory();
    var box = document.querySelector("#inventory-body input[data-stock='" + index + "']");
    if (box != null) {
      box.focus();
      showFieldError(box, "Quantity must be a whole number of 0 or more.");
    }
    return;
  }

  inventory[index].quantity = Number(value);
  flagLowStock(inventory[index]);
  renderInventory();
  renderDashboard();
}

function restock(index) {
  if (inventory[index] == null) return;
  inventory[index].quantity += 10;
  flagLowStock(inventory[index]);
  renderInventory();
  renderDashboard();
}

function deleteStock(index) {
  if (inventory[index] == null) return;
  if (!confirm("Remove " + inventory[index].name + " from inventory?")) return;
  inventory.splice(index, 1);
  renderInventory();
  renderDashboard();
}

// ===================== DASHBOARD: STAFF =====================
// Signed-up customers carry contact details; staff accounts made in the dashboard do not.
function contactText(user) {
  var text = [];
  if (user.email != null) text.push(user.email);
  if (user.phone != null) text.push(user.phone);
  if (user.address != null) text.push(user.address);
  if (text.length == 0) return "-";
  return text.join("<br>");
}

function renderStaff() {
  var body = document.getElementById("staff-body");
  body.innerHTML = "";

  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var isMe = currentUser != null && user.username == currentUser.username;

    body.innerHTML += tableRow([
      ["Name", user.name],
      ["Username", user.username],
      ["Role", isMe ? user.role : roleSelect(user, i)],
      ["Status", user.active ? badge("Active") : badge("Inactive")],
      ["Contact", contactText(user)],
      ["Actions", isMe ? "<em>Signed in</em>" :
        '<button class="btn btn-small" onclick="toggleAccount(' + i + ')">' + (user.active ? "Deactivate" : "Activate") + "</button>" +
        '<button class="btn btn-small" onclick="deleteAccount(' + i + ')">Delete</button>']
    ]);
  }
}

function roleSelect(user, index) {
  var roles = ["admin", "staff", "customer"];
  var options = "";
  for (var i = 0; i < roles.length; i++) {
    options += '<option value="' + roles[i] + '"' + (roles[i] == user.role ? " selected" : "") + ">" + roles[i] + "</option>";
  }
  return '<select onchange="setRole(' + index + ', this.value)">' + options + "</select>";
}

function setRole(index, role) {
  if (users[index] == null) return;
  if (currentUser != null && users[index].username == currentUser.username) return;
  users[index].role = role;
  renderStaff();
}

function toggleAccount(index) {
  if (users[index] == null) return;
  if (currentUser != null && users[index].username == currentUser.username) return;
  users[index].active = !users[index].active;
  renderStaff();
}

function deleteAccount(index) {
  if (users[index] == null) return;
  if (currentUser != null && users[index].username == currentUser.username) return;
  if (!confirm("Delete account " + users[index].username + "?")) return;
  users.splice(index, 1);
  renderStaff();
}

document.getElementById("staff-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var error = document.getElementById("staff-error");
  var fullName = document.getElementById("staff-name");
  var username = document.getElementById("staff-username");
  var password = document.getElementById("staff-password");
  error.textContent = "";

  var checks = [
    { input: fullName, test: function (v) { return isFilled(v) && isName(v); }, message: "Enter a name using letters only." },
    { input: username, test: function (v) { return isFilled(v) && isUsername(v); }, message: "Username needs 3 or more letters, numbers, dot, dash or underscore." },
    { input: password, test: isLongEnoughPassword, message: "Password must be at least " + MIN_PASSWORD + " characters." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  var taken = username.value.trim();
  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() == taken.toLowerCase()) {
      showFieldError(username, "That username is already taken.");
      username.focus();
      return;
    }
  }

  users.push({
    name: fullName.value.trim(),
    username: taken,
    password: password.value,
    role: document.getElementById("staff-role").value,
    active: true,
    registered: today
  });

  this.reset();
  clearFormErrors(this);
  renderStaff();
});

// ===================== REGISTERED USERS (admin only) =====================
// Reads straight from the same users list the login and registration system
// writes to, so a new sign-up appears here the moment it is saved.
function renderUsers() {
  var body = document.getElementById("users-body");
  body.innerHTML = "";

  var total = 0, customers = 0, staff = 0, admin = 0, inactive = 0;
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    total++;
    if (u.role == "customer") customers++;
    else if (u.role == "staff") staff++;
    else if (u.role == "admin") admin++;
    if (!u.active) inactive++;
  }

  document.getElementById("users-total").textContent = total;
  document.getElementById("users-customers").textContent = customers;
  document.getElementById("users-staff").textContent = staff;
  document.getElementById("users-admin").textContent = admin;
  document.getElementById("users-inactive").textContent = inactive;

  if (users.length == 0) {
    body.innerHTML = emptyRow(7, "No accounts registered yet.");
    return;
  }

  // Newest first, so the most recent sign-up is always on top.
  var sorted = users.slice().sort(function (a, b) {
    if (a.registered < b.registered) return 1;
    if (a.registered > b.registered) return -1;
    return 0;
  });

  for (var j = 0; j < sorted.length; j++) {
    var user = sorted[j];
    var isMe = currentUser != null && user.username == currentUser.username;

    body.innerHTML += tableRow([
      ["Full Name", user.name],
      ["Username", user.username],
      ["Email", user.email == null ? "-" : user.email],
      ["Role", isMe ? user.role : roleSelect(user, users.indexOf(user))],
      ["Status", user.active ? badge("Active") : badge("Inactive")],
      ["Date Registered", user.registered == null ? "-" : user.registered],
      ["Actions", isMe ? "<em>Signed in</em>" :
        '<button class="btn btn-small" onclick="toggleAccount(' + users.indexOf(user) + ')">' + (user.active ? "Deactivate" : "Activate") + "</button>" +
        '<button class="btn btn-small" onclick="deleteAccount(' + users.indexOf(user) + ')">Delete</button>']
    ]);
  }
}

// ===================== WALK-IN QUEUE (staff + admin) =====================
// Only for people who walk into the cafe. Online orders stay in Orders and are
// never added to this list.
var queue = [
  { number: "Q001", customer: "Liza Cruz", items: "Cafe Latte x1, Croissant x1", date: today, time: "10:15 AM", total: 220, paymentMethod: "Cash", status: "Completed" },
  { number: "Q002", customer: "Mark Bautista", items: "Iced Americano x2", date: today, time: "10:40 AM", total: 220, paymentMethod: "GCash", status: "Waiting" },
  { number: "Q003", customer: "Tina Reyes", items: "Matcha Latte x1", date: today, time: "10:52 AM", total: 150, paymentMethod: "Cash", status: "Waiting" }
];
var queueStatuses = ["Waiting", "In Progress", "Completed", "Cancelled"];
var nextQueueNo = 4;   // staff never type the queue number

function queueNumber() {
  return "Q" + String(nextQueueNo++).padStart(3, "0");
}

// The earliest entry still waiting is the one being served next.
function nextInLine() {
  for (var i = 0; i < queue.length; i++) {
    if (queue[i].status == "Waiting") return queue[i];
  }
  return null;
}

function queueCount(status) {
  var count = 0;
  for (var i = 0; i < queue.length; i++) {
    if (queue[i].status == status) count++;
  }
  return count;
}

function queueStatusSelect(entry, index) {
  var options = "";
  for (var i = 0; i < queueStatuses.length; i++) {
    options += '<option value="' + queueStatuses[i] + '"' + (queueStatuses[i] == entry.status ? " selected" : "") + ">" + queueStatuses[i] + "</option>";
  }
  return '<select onchange="setQueueStatus(' + index + ', this.value)">' + options + "</select>";
}

function renderQueue() {
  var body = document.getElementById("queue-body");
  body.innerHTML = "";

  var up = nextInLine();

  document.getElementById("queue-waiting").textContent = queueCount("Waiting");
  document.getElementById("queue-progress").textContent = queueCount("In Progress");
  document.getElementById("queue-done").textContent = queueCount("Completed");
  document.getElementById("queue-next").textContent = up == null ? "-" : up.number;

  if (queue.length == 0) {
    body.innerHTML = emptyRow(10, "Nobody in the walk-in queue.");
    return;
  }

  for (var i = 0; i < queue.length; i++) {
    var entry = queue[i];
    var isNext = up != null && entry.number == up.number;

    var row = tableRow([
      ["Queue #", entry.number + (isNext ? ' <em class="queue-next-flag">next</em>' : "")],
      ["Customer", entry.customer],
      ["Items", entry.items],
      ["Type", "Walk-in"],
      ["Date", entry.date],
      ["Time", entry.time],
      ["Total", peso(entry.total)],
      ["Payment", entry.paymentMethod],
      ["Status", queueStatusSelect(entry, i)],
      ["Actions", '<button class="btn btn-small" onclick="removeQueueEntry(' + i + ')">Remove</button>']
    ]);

    if (isNext) row = row.replace("<tr>", '<tr class="queue-next-row">');
    body.innerHTML += row;
  }
}

function setQueueStatus(index, value) {
  if (queue[index] == null) return;
  queue[index].status = value;
  renderQueue();
}

// Fills the queue menu dropdown from the same menu list the customer site uses,
// so the names and prices always match what is in the system.
function fillQueueMenu() {
  var select = document.getElementById("queue-menu");
  select.innerHTML = '<option value="">-- Select a menu item --</option>';

  for (var i = 0; i < menu.length; i++) {
    var item = menu[i];
    if (!item.available) continue;
    var opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item.name;
    opt.setAttribute("data-price", item.price);
    select.appendChild(opt);
  }
}

// When a menu is chosen, the price is locked from the menu data and the
// total box is filled in for them. The price can never be typed in.
document.getElementById("queue-menu").addEventListener("change", function () {
  var opt = this.options[this.selectedIndex];
  var price = opt.getAttribute("data-price");
  var total = document.getElementById("queue-total");
  var note = document.getElementById("queue-price-note");

  if (this.value === "" || price === null) {
    total.value = "";
    note.textContent = "";
    total.readOnly = false;
    return;
  }

  total.value = price;
  total.readOnly = true;
  note.textContent = "Fixed price from the menu. Select an item to change it.";
});

function removeQueueEntry(index) {
  if (queue[index] == null) return;
  if (!confirm("Remove " + queue[index].number + " (" + queue[index].customer + ") from the walk-in queue?")) return;
  queue.splice(index, 1);
  renderQueue();
}

document.getElementById("queue-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearFormErrors(this);

  var name = document.getElementById("queue-name");
  var menu = document.getElementById("queue-menu");
  var total = document.getElementById("queue-total");

  var checks = [
    { input: name, test: function (v) { return isFilled(v) && isName(v); }, message: "Enter the customer's name using letters only." },
    { input: menu, test: function (v) { return v !== ""; }, message: "Select a menu item." },
    { input: total, test: isPositiveNumber, message: "Total must be a whole number of pesos, greater than 0." }
  ].concat(dateChecks(this));

  if (!runChecks(this, checks)) return;

  // Queue number, date, time, type and status are all filled in for them.
  queue.push({
    number: queueNumber(),
    customer: name.value.trim(),
    items: menu.options[menu.selectedIndex].textContent,
    date: today,
    time: new Date().toLocaleTimeString(),
    total: Number(total.value),
    paymentMethod: document.getElementById("queue-payment").value,
    status: "Waiting"
  });

  this.reset();
  clearFormErrors(this);
  fillQueueMenu();   // restore the dropdown after the reset
  renderQueue();
});

// ===================== DASHBOARD: REPORTS =====================
function renderReports() {
  var counts = {};
  var values = {};
  for (var i = 0; i < statuses.length; i++) {
    counts[statuses[i]] = 0;
    values[statuses[i]] = 0;
  }
  for (var j = 0; j < orders.length; j++) {
    counts[orders[j].status] = (counts[orders[j].status] || 0) + 1;
    values[orders[j].status] = (values[orders[j].status] || 0) + orders[j].total;
  }

  var statusBody = document.getElementById("report-status");
  statusBody.innerHTML = "";
  for (var s = 0; s < statuses.length; s++) {
    statusBody.innerHTML += tableRow([
      ["Status", badge(statuses[s])],
      ["Orders", counts[statuses[s]]],
      ["Value", peso(values[statuses[s]])]
    ]);
  }

  var tally = salesByItem();
  var names = Object.keys(tally);
  names.sort(function (a, b) { return tally[b].qty - tally[a].qty; });

  var bestBody = document.getElementById("report-best");
  bestBody.innerHTML = "";
  if (names.length == 0) {
    bestBody.innerHTML = emptyRow(5, "No sales recorded yet.");
  } else {
    var limit = Math.min(5, names.length);
    for (var k = 0; k < limit; k++) {
      var item = menuItemByName(names[k]);
      bestBody.innerHTML += tableRow([
        ["Rank", "#" + (k + 1)],
        ["Item", names[k]],
        ["Category", item == null ? "-" : item.category],
        ["Units Sold", tally[names[k]].qty],
        ["Revenue", peso(tally[names[k]].revenue)]
      ]);
    }
  }

  var inventoryBody = document.getElementById("report-inventory");
  inventoryBody.innerHTML = "";
  if (inventory.length == 0) {
    inventoryBody.innerHTML = emptyRow(4, "No stock items yet.");
    return;
  }
  for (var m = 0; m < inventory.length; m++) {
    inventoryBody.innerHTML += tableRow([
      ["Item", inventory[m].name],
      ["Category", inventory[m].category],
      ["Quantity", inventory[m].quantity + " " + inventory[m].unit],
      ["Status", badge(getStockStatus(inventory[m].quantity))]
    ]);
  }
}

// ===================== START =====================
// Every field drops its error the moment the user starts correcting it.
var watchedForms = ["login-form", "register-form", "contact-form", "menu-form", "inventory-form", "staff-form", "profile-form", "queue-form"];
for (var w = 0; w < watchedForms.length; w++) {
  var fields = document.getElementById(watchedForms[w]).querySelectorAll("input, select, textarea");
  for (var f = 0; f < fields.length; f++) watchField(fields[f]);
}

document.getElementById("place-order-btn").addEventListener("click", placeOrder);
showMenu();
showCart();
refreshCheckout();     // fills the payment list for the default order type
fillQueueMenu();       // populate the walk-in queue menu dropdown
renderNotifications();
updateLoginButton();