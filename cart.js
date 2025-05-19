//Roieee
// Check if user is logged in
if (!localStorage.getItem('currentUser')) {
    window.location.href = 'index.html';
}

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Display user name
function displayUserName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        userNameDisplay.textContent = `Welcome, ${currentUser.username}`;
        logoutBtn.style.display = 'block';
    } else {
        userNameDisplay.textContent = 'Welcome, Guest';
        logoutBtn.style.display = 'none';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Fetch products from JSON file
async function fetchProducts() {
    try {
        const response = await fetch('cart.json');
        const data = await response.json();
        products = data.products;
        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="price-label">Price:</span>
                    <span class="price-value">AUD ${product.price.toFixed(2)}</span>
                </div>
                <div class="quantity-input">
                    <input type="number" id="quantity-${product.id}" min="1" value="1" class="quantity-field" placeholder="Qty">
                    <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (quantity < 1) {
        alert('Please enter a valid quantity');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>Quantity: ${item.quantity}</span>
            <span>AUD ${(item.price * item.quantity).toFixed(2)}</span>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `AUD ${total.toFixed(2)}`;
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Verify user is still logged in
    if (!localStorage.getItem('currentUser')) {
        alert('Please log in to continue checkout');
        window.location.href = 'index.html';
        return;
    }
    
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert('Order placed successfully!');
    updateCartDisplay();
    displayOrders();
});

// Display orders
function displayOrders() {
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = orders.map(order => `
        <div class="order-item">
            <h3>Order #${order.id}</h3>
            <p>Date: ${new Date(order.date).toLocaleString()}</p>
            <p>Total: AUD ${order.total.toFixed(2)}</p>
            <button onclick="downloadOrder(${order.id})">Download Order</button>
        </div>
    `).join('');
}

// Download order
function downloadOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Format order data as JSON
    const orderData = {
        orderId: order.id,
        date: order.date,
        items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: (item.price * item.quantity).toFixed(2)
        })),
        total: order.total.toFixed(2),
        currency: 'AUD'
    };
    
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_${order.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize page
fetchProducts();
updateCartDisplay();
displayOrders();
displayUserName();