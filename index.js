// Replace the key with your own from https://crudcrud.com if this one has expired
const API_URL = "https://crudcrud.com/api/11c5626d4fc2419ea0f405ffc72b30f0/candies";

const form = document.getElementById("candy-form");
const list = document.getElementById("candy-list");
const message = document.getElementById("message");
const countLabel = document.getElementById("count");
const emptyText = document.getElementById("empty");

// Load saved candies when the page opens
window.addEventListener("DOMContentLoaded", () => {
  axios
    .get(API_URL)
    .then((response) => {
      response.data.forEach((candy) => displayCandy(candy));
      updateCount();
    })
    .catch((error) => {
      console.log(error);
      showMessage("Could not load candies. Check your crudcrud key.", "error");
    });
});

// Add a new candy
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const candy = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    price: Number(document.getElementById("price").value),
    quantity: Number(document.getElementById("quantity").value),
  };

  axios
    .post(API_URL, candy)
    .then((response) => {
      displayCandy(response.data);
      updateCount();
      showMessage(`${candy.name} added to stock.`, "success");
      form.reset();
    })
    .catch((error) => {
      console.log(error);
      showMessage("Could not add the candy. Try again.", "error");
    });
});

// Show one candy row with its Buy buttons
function displayCandy(candy) {
  const item = document.createElement("li");
  item.className = "candy-item";

  const name = document.createElement("span");
  name.className = "candy-name";
  name.textContent = candy.name;

  const description = document.createElement("span");
  description.className = "candy-desc";
  description.textContent = candy.description;

  const price = document.createElement("span");
  price.textContent = `₹${candy.price}`;

  const stock = document.createElement("span");
  stock.className = "stock";

  const buyGroup = document.createElement("div");
  buyGroup.className = "buy-group";

  const buttons = [1, 2, 3].map((amount) => {
    const button = document.createElement("button");
    button.className = "btn-buy";
    button.textContent = amount === 1 ? "Buy 1" : `Buy ${amount}`;
    button.addEventListener("click", () => buyCandy(amount));
    buyGroup.appendChild(button);
    return button;
  });

  item.append(name, description, price, stock, buyGroup);
  list.appendChild(item);

  // Update the stock text and disable buttons that would exceed the stock
  function refreshStock() {
    stock.textContent = candy.quantity > 0 ? candy.quantity : "Out of stock";
    stock.classList.toggle("out", candy.quantity === 0);
    stock.classList.toggle("low", candy.quantity > 0 && candy.quantity <= 5);
    buttons.forEach((button, index) => {
      button.disabled = candy.quantity < index + 1;
    });
  }

  // Reduce the quantity on crudcrud, then on screen
  function buyCandy(amount) {
    if (candy.quantity < amount) return;

    const newQuantity = candy.quantity - amount;
    buttons.forEach((button) => (button.disabled = true));

    // crudcrud PUT replaces the whole record and must not include _id
    axios
      .put(`${API_URL}/${candy._id}`, {
        name: candy.name,
        description: candy.description,
        price: candy.price,
        quantity: newQuantity,
      })
      .then(() => {
        candy.quantity = newQuantity;
        showMessage(`Sold ${amount} × ${candy.name}.`, "success");
      })
      .catch((error) => {
        console.log(error);
        showMessage("Purchase failed. Try again.", "error");
      })
      .finally(refreshStock);
  }

  refreshStock();
}

function updateCount() {
  const total = list.children.length;
  countLabel.textContent = `${total} ${total === 1 ? "item" : "items"}`;
  emptyText.classList.toggle("hidden", total > 0);
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}
