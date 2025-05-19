//Roieee
// Order data
let currentOrder = null;
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first!');
        window.location.href = 'index.html';
        return;
    }

    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
        return;
    }

    // Display order items
    displayOrderItems(cart);
    
    // Load order history
    displayOrderHistory(currentUser);

    // Event listeners
    document.getElementById('editOrder').addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    document.getElementById('confirmOrder').addEventListener('click', confirmOrder);
});

// Display order items
function displayOrderItems(cart) {
    const orderItemsContainer = document.getElementById('orderItems');
    let total = 0;

    orderItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="order-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="item-total">
                    <p>$${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('orderTotal').textContent = total.toFixed(2);
}

// Display order history
function displayOrderHistory(user) {
    const previousOrdersContainer = document.getElementById('previousOrders');
    const orders = user.orders || [];

    if (orders.length === 0) {
        previousOrdersContainer.innerHTML = '<p>No previous orders found.</p>';
        return;
    }

    previousOrdersContainer.innerHTML = orders.map(order => `
        <div class="order-history-item">
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div class="order-details">
                ${order.items.map(item => `
                    <div class="order-item">
                        <p>${item.name} x ${item.quantity}</p>
                        <p>$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <p>Total: $${order.total.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Confirm order
function confirmOrder() {
    const shippingForm = document.getElementById('shippingForm');
    const paymentForm = document.getElementById('paymentForm');

    // Validate forms
    if (!shippingForm.checkValidity() || !paymentForm.checkValidity()) {
        alert('Please fill in all required fields!');
        return;
    }

    // Get form data
    const shippingInfo = {
        fullName: document.getElementById('fullName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        phone: document.getElementById('phone').value
    };

    const paymentInfo = {
        cardName: document.getElementById('cardName').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };

    // Create order
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        shippingInfo,
        paymentInfo,
        total,
        status: 'completed'
    };

    // Update user's orders
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.orders = currentUser.orders || [];
    currentUser.orders.push(order);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clear cart
    localStorage.removeItem('cart');

    // Show success message
    alert('Order confirmed successfully!');
    window.location.href = 'index.html';
}

// Load cart data
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    currentOrder = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        status: 'pending'
    };

    displayOrderSummary();
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');

    if (!currentOrder) return;

    orderItems.innerHTML = currentOrder.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: AUD ${item.price.toFixed(2)}</p>
                <p>Total: AUD ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');

    orderTotal.textContent = `AUD ${currentOrder.total.toFixed(2)}`;
}

// Setup event listeners
function setupEventListeners() {
    const checkoutForm = document.getElementById('checkoutForm');
    const editOrderBtn = document.getElementById('edit-order');

    checkoutForm.addEventListener('submit', handleCheckout);
    editOrderBtn.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}

// Handle checkout
async function handleCheckout(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const shippingAddress = document.getElementById('shipping-address').value;
    const paymentMethod = document.getElementById('payment-method').value;

    // Simple authentication check
    if (!email || !password) {
        showNotification('Please enter your credentials', 'error');
        return;
    }

    try {
        // Add authentication logic here
        const isAuthenticated = await authenticateUser(email, password);
        
        if (!isAuthenticated) {
            showNotification('Authentication failed', 'error');
            return;
        }

        // Save order details
        currentOrder = {
            ...currentOrder,
            email,
            shippingAddress,
            paymentMethod,
            status: 'confirmed',
            orderNumber: generateOrderNumber()
        };

        // Save to order history
        orderHistory.push(currentOrder);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

        // Clear cart
        localStorage.removeItem('cart');

        showNotification('Order confirmed successfully!', 'success');
        displayOrderHistory();
        
        // Reset form
        e.target.reset();
        
        // Redirect to order confirmation page
        setTimeout(() => {
            window.location.href = 'order-confirmation.html?order=' + currentOrder.orderNumber;
        }, 2000);

    } catch (error) {
        showNotification('An error occurred during checkout', 'error');
        console.error('Checkout error:', error);
    }
}

// View order details
function viewOrderDetails(orderNumber) {
    const order = orderHistory.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    const details = `
        Order Number: ${order.orderNumber}
        Date: ${new Date(order.date).toLocaleString()}
        Status: ${order.status}
        Shipping Address: ${order.shippingAddress}
        Payment Method: ${order.paymentMethod}
        Total: $${order.total.toFixed(2)}
        
        Items:
        ${order.items.map(item => `
            ${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
        `).join('\n')}
    `;

    alert(details);
}

// Export order
function exportOrder(orderNumber) {
    const order = orderHistory.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    const orderData = {
        orderNumber: order.orderNumber,
        date: order.date,
        status: order.status,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        total: order.total,
        items: order.items
    };

    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate order number
function generateOrderNumber() {
    return 'ORD-' + Date.now().toString().slice(-8);
}

// Simple authentication function
async function authenticateUser(email, password) {
    // This is a placeholder for actual authentication
    // In a real application, this would call an authentication API
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes, accept any non-empty credentials
            resolve(email && password);
        }, 1000);
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .checkout-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 30px;
    }

    .order-summary, .checkout-form {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .order-item {
        display: flex;
        gap: 15px;
        padding: 15px;
        border-bottom: 1px solid #eee;
    }

    .order-item-image {
        width: 80px;
        height: 80px;
        overflow: hidden;
        border-radius: 5px;
    }

    .order-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1em;
    }

    .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .primary-btn, .secondary-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
    }

    .primary-btn {
        background: #2ecc71;
        color: white;
    }

    .secondary-btn {
        background: #f1f1f1;
        color: #333;
    }

    .order-history {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-top: 30px;
    }

    .order-card {
        border: 1px solid #eee;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 15px;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .status-confirmed {
        color: #2ecc71;
    }

    .status-pending {
        color: #f39c12;
    }

    .order-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .view-details-btn, .export-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .view-details-btn {
        background: #3498db;
        color: white;
    }

    .export-btn {
        background: #f1f1f1;
        color: #333;
    }

    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    }

    .notification.success {
        background: #2ecc71;
        color: white;
    }

    .notification.error {
        background: #e74c3c;
        color: white;
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

    @media (max-width: 768px) {
        .checkout-container {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style); 