//Roieee
// User data
let userData = JSON.parse(localStorage.getItem('userData')) || {
    email: 'user@example.com',
    lastLogin: new Date().toISOString(),
    orders: []
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first!');
        window.location.href = 'index.html';
        return;
    }

    // Display current cart
    displayCurrentCart();
    
    // Display order history
    displayOrderHistory(currentUser);

    // Event listeners
    document.getElementById('clearCart').addEventListener('click', clearCart);
    document.getElementById('downloadOrders').addEventListener('click', downloadOrders);
    document.getElementById('logout').addEventListener('click', logout);
});

// Display current cart
function displayCurrentCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentCartContainer = document.getElementById('currentCart');

    if (cart.length === 0) {
        currentCartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    currentCartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${item.price.toFixed(2)}</p>
            </div>
            <div class="item-total">
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Display order history
function displayOrderHistory(user) {
    const orderHistoryContainer = document.getElementById('orderHistory');
    const orders = user.orders || [];

    if (orders.length === 0) {
        orderHistoryContainer.innerHTML = '<p>No previous orders found.</p>';
        return;
    }

    orderHistoryContainer.innerHTML = orders.map(order => `
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

// Clear shopping cart
function clearCart() {
    if (confirm('Are you sure you want to clear your shopping cart?')) {
        localStorage.removeItem('cart');
        displayCurrentCart();
        alert('Shopping cart cleared successfully!');
    }
}

// Download order history
function downloadOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const orders = currentUser.orders || [];

    if (orders.length === 0) {
        alert('No orders to download!');
        return;
    }

    // Format orders for download
    const orderData = {
        user: currentUser.username,
        email: currentUser.email,
        orders: orders.map(order => ({
            id: order.id,
            date: order.date,
            items: order.items,
            shippingInfo: order.shippingInfo,
            total: order.total,
            status: order.status
        }))
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_history_${currentUser.username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout? This will clear all session data.')) {
        // Clear all related localStorage data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        localStorage.removeItem('orderHistory');
        
        // Show logout success message
        showNotification('Logged out successfully', 'success');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Load user data
function loadUserData() {
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
    userData.orders = orderHistory;

    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('last-login').textContent = new Date(userData.lastLogin).toLocaleString();
    document.getElementById('total-orders').textContent = orderHistory.length;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('export-orders').addEventListener('click', exportAllOrders);
    document.getElementById('logout-account').addEventListener('click', logoutAccount);
}

// Export all orders
function exportAllOrders() {
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
    if (orderHistory.length === 0) {
        showNotification('No orders to export', 'error');
        return;
    }

    const ordersData = {
        user: userData.email,
        exportDate: new Date().toISOString(),
        totalOrders: orderHistory.length,
        orders: orderHistory
    };

    const blob = new Blob([JSON.stringify(ordersData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${userData.email}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Orders exported successfully', 'success');
}

// Logout account
function logoutAccount() {
    if (confirm('Are you sure you want to logout? This will clear all session data.')) {
        // Clear all related localStorage data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        localStorage.removeItem('orderHistory');
        
        showNotification('Logged out successfully', 'success');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
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
    .logout-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .account-actions {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .action-button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .action-button.primary {
        background: #2ecc71;
        color: white;
    }

    .order-summary, .order-history {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .cart-item, .order-history-item {
        border-bottom: 1px solid #eee;
        padding: 15px 0;
    }

    .item-info, .order-details {
        flex: 1;
    }

    .item-total, .order-total {
        text-align: right;
        font-weight: bold;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
`;
document.head.appendChild(style); 