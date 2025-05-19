//Roieee
// Shopping cart data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Product data
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        description: "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.",
        price: 1699.00,
        image: "images/iphone15.jpg"
    },
    {
        id: 2,
        name: "MacBook Pro M3",
        description: "Powerful M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
        price: 2999.00,
        image: "images/macbook.jpg"
    },
    {
        id: 3,
        name: "AirPods Pro",
        description: "Active Noise Cancellation, spatial audio, and sweat and water resistant.",
        price: 399.00,
        image: "images/airpods.jpg"
    },
    {
        id: 4,
        name: "iPad Pro",
        description: "M2 chip, 12.9-inch Liquid Retina XDR display, and Apple Pencil support.",
        price: 1299.00,
        image: "images/ipad.jpg"
    },
    {
        id: 5,
        name: "Apple Watch Series 9",
        description: "Advanced health features, always-on Retina display, and cellular connectivity.",
        price: 599.00,
        image: "images/applewatch.jpg"
    },
    {
        id: 6,
        name: "Samsung QLED TV",
        description: "Quantum HDR, 4K resolution, and smart TV capabilities with Bixby voice control.",
        price: 2499.00,
        image: "images/samsungtv.jpg"
    },
    {
        id: 7,
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise cancellation, 30-hour battery life, and premium sound quality.",
        price: 549.00,
        image: "images/sonyheadphones.jpg"
    },
    {
        id: 8,
        name: "DJI Mavic 3",
        description: "4/3 CMOS Hasselblad camera, 46 minutes flight time, and omnidirectional obstacle sensing.",
        price: 2299.00,
        image: "images/dji.jpg"
    },
    {
        id: 9,
        name: "PlayStation 5",
        description: "Ultra-high speed SSD, haptic feedback, and 3D audio technology.",
        price: 799.00,
        image: "images/ps5.jpg"
    },
    {
        id: 10,
        name: "Xbox Series X",
        description: "12 teraflops of processing power, 4K gaming, and backward compatibility.",
        price: 749.00,
        image: "images/xbox.jpg"
    }
];

// User data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartDisplay();
    setupEventListeners();
    displayUserName();

    // Save products to localStorage if not already present
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Check if user is already logged in
    if (currentUser) {
        updateNavigation(true);
    } else {
        updateNavigation(false);
    }

    // DOM elements
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const registerForm = document.getElementById('registerFormElement');
    const loginForm = document.getElementById('loginFormElement');
    const cartLink = document.getElementById('cartLink');
    const checkoutLink = document.getElementById('checkoutLink');
    const logoutLink = document.getElementById('logoutLink');
    const navLinks = document.querySelectorAll('nav a');

    // Disable navigation links until login
    cartLink.style.pointerEvents = 'none';
    checkoutLink.style.pointerEvents = 'none';
    logoutLink.style.pointerEvents = 'none';

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update tabs
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update forms
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validate form
        if (validateRegistration(username, email, password, confirmPassword)) {
            // Check if username already exists
            if (users.some(user => user.username === username)) {
                showError('regUsernameError', 'Username already exists');
                return;
            }
            
            // Add new user
            const newUser = {
                username,
                email,
                password,
                orders: []
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Registration successful! Please login.');
            
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Enable navigation links
            cartLink.style.pointerEvents = 'auto';
            checkoutLink.style.pointerEvents = 'auto';
            logoutLink.style.pointerEvents = 'auto';
            
            alert('Login successful!');
            window.location.href = 'cart.html';
        } else {
            showError('loginUsernameError', 'Invalid username or password');
        }
        
        // Clear form
        loginForm.reset();
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please login first');
                window.location.href = 'index.html';
                return;
            }

            const productId = parseInt(e.target.dataset.productId);
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Product added to cart!');
        });
    });

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please login first');
                window.location.href = 'index.html';
                return;
            }

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }

            // Create order
            const order = {
                id: Date.now(),
                userId: currentUser.username,
                items: [...cart],
                date: new Date().toISOString(),
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 10, // Add shipping
                status: 'pending'
            };

            // Save order
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear cart
            localStorage.removeItem('cart');

            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }

    // Navigation links click event
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('disabled')) {
                e.preventDefault();
                alert('Please login first!');
            }
        });
    });
});

// Display products
function displayProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="price-label">Price:</span>
                    <span class="price-value">$${product.price.toFixed(2)}</span>
                </div>
                <button class="add-to-cart" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.productId);
            addToCart(productId);
        });
    });

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }

    saveCart();
    updateCartDisplay();
    showNotification('Product added to cart!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Product removed from cart');
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-quantity">
                    <span>Quantity: ${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-price">
                    <span>Price: $${item.price.toFixed(2)}</span>
                    <span>Total: $${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartDisplay();
    }
}

// Save cart to local storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    // Add checkout logic here
    showNotification('Checkout successful!');
    cart = [];
    saveCart();
    updateCartDisplay();
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    }

    .empty-cart {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    .cart-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #eee;
        gap: 15px;
    }

    .cart-item-image {
        width: 80px;
        height: 80px;
        overflow: hidden;
        border-radius: 5px;
    }

    .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .cart-item-details {
        flex: 1;
    }

    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
    }

    .quantity-btn {
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        cursor: pointer;
    }

    .quantity-btn:hover {
        background: #f5f5f5;
    }

    .remove-item {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        padding: 5px;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Validate registration form
function validateRegistration(username, email, password, confirmPassword) {
    let isValid = true;

    // Validate username
    if (username.length < 3 || username.length > 20) {
        showError('regUsernameError', 'Username must be between 3 and 20 characters');
        isValid = false;
    } else {
        clearError('regUsernameError');
    }

    // Validate email
    if (!isValidEmail(email)) {
        showError('regEmailError', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('regEmailError');
    }

    // Validate password
    if (password.length < 6) {
        showError('regPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError('regPasswordError');
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        showError('regConfirmPasswordError', 'Passwords do not match');
        isValid = false;
    } else {
        clearError('regConfirmPasswordError');
    }

    return isValid;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Clear error message
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// Switch to login form
function switchToLogin() {
    authTabs.forEach(t => t.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));
    document.querySelector('[data-tab="login"]').classList.add('active');
    document.getElementById('loginForm').classList.add('active');
}

// Update navigation status
function updateNavigation(isLoggedIn) {
    if (isLoggedIn) {
        cartLink.classList.remove('disabled');
        checkoutLink.classList.remove('disabled');
        logoutLink.classList.remove('disabled');
    } else {
        cartLink.classList.add('disabled');
        checkoutLink.classList.add('disabled');
        logoutLink.classList.add('disabled');
    }
}

// Display user name
function displayUserName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartLink = document.getElementById('cartLink');
    const checkoutLink = document.getElementById('checkoutLink');
    const logoutLink = document.getElementById('logoutLink');

    if (currentUser) {
        userNameDisplay.textContent = `Welcome, ${currentUser.username}`;
        logoutBtn.style.display = 'block';
        cartLink.classList.remove('disabled');
        checkoutLink.classList.remove('disabled');
        logoutLink.classList.remove('disabled');
    } else {
        userNameDisplay.textContent = 'Welcome, Guest';
        logoutBtn.style.display = 'none';
        cartLink.classList.add('disabled');
        checkoutLink.classList.add('disabled');
        logoutLink.classList.add('disabled');
    }
}

// Logout function
function logout() {
    // 清除所有相关的localStorage数据
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('products');
    displayUserName();
    window.location.href = 'index.html';
}