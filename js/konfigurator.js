// Konfigurator State
let cart = [];
let totalPrice = 0;
let serviceOptions = {
    aufbau: false,
    mixing: false
};

// Korrigierte Produktdatenbank mit den richtigen IDs
const products = {
    'rcf-evox-8': {
        name: 'RCF Evox 8',
        price: 50,
        category: 'tontechnik',
        maxQuantity: 2,
        description: 'Kompakte Säulenlautsprecher mit integriertem Subwoofer'
    },
    'rcf-712-mk2-inkl-stativ':
    content += `
Preisberechnung:
- Preis pro Tag: ${data.totalPrice}€
- Dauer: ${data['rental-duration']} Tag(e)
- Gesamtpreis: ${data.finalPrice}€

Zusätzliche Informationen:
${data['additional-info'] || 'Keine'}

Diese Anfrage wurde automatisch über die Website generiert.
Bitte prüfen Sie die Verfügbarkeit der Produkte für den gewünschten Zeitraum.`;

    return content;
}

// Load Selected Products from localStorage (vom Katalog)
function loadSelectedProducts() {
    const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts') || '[]');
    
    selectedProducts.forEach(product => {
        const productData = products[product.id];
        if (!productData) return;
        
        // Check if quantity exceeds maximum
        const quantity = Math.min(product.quantity, productData.maxQuantity);
        
        // Update quantity display
        const productElement = document.querySelector(`[data-product="${product.id}"]`);
        if (productElement) {
            const quantitySpan = productElement.querySelector('.quantity');
            if (quantitySpan) {
                quantitySpan.textContent = quantity;
            }
            
            // Update button state if at maximum
            if (quantity >= productData.maxQuantity) {
                const plusBtn = productElement.querySelector('.plus');
                if (plusBtn) {
                    plusBtn.disabled = true;
                    plusBtn.style.opacity = '0.5';
                    plusBtn.style.cursor = 'not-allowed';
                }
            }
        }
        
        // Add to cart
        cart.push({
            id: product.id,
            name: productData.name,
            price: product.price,
            quantity: quantity,
            maxQuantity: productData.maxQuantity
        });
        
        // Show warning if quantity was reduced
        if (product.quantity > productData.maxQuantity) {
            showNotification(
                `Menge von "${productData.name}" auf ${productData.maxQuantity} reduziert (nur ${productData.maxQuantity} verfügbar)`,
                'warning'
            );
        }
    });
    
    updateCartDisplay();
    
    // Clear localStorage after loading
    localStorage.removeItem('selectedProducts');
}

// Save Cart to localStorage
function saveCartToLocalStorage() {
    const cartData = {
        cart: cart,
        serviceOptions: serviceOptions,
        totalPrice: totalPrice,
        timestamp: Date.now()
    };
    localStorage.setItem('configuratorCart', JSON.stringify(cartData));
}

// Load Cart from localStorage
function loadCartFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem('configuratorCart') || '{}');
    
    // Check if data is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (savedData.timestamp && (Date.now() - savedData.timestamp) > maxAge) {
        localStorage.removeItem('configuratorCart');
        return;
    }
    
    if (savedData.cart) {
        cart = savedData.cart;
        serviceOptions = savedData.serviceOptions || { aufbau: false, mixing: false };
        totalPrice = savedData.totalPrice || 0;
        
        // Validate cart items against current product database
        cart = cart.filter(item => {
            const product = products[item.id];
            if (!product) return false;
            
            // Update max quantity if it changed
            item.maxQuantity = product.maxQuantity;
            
            // Reduce quantity if it exceeds current maximum
            if (item.quantity > product.maxQuantity) {
                item.quantity = product.maxQuantity;
                showNotification(
                    `Menge von "${product.name}" auf ${product.maxQuantity} reduziert`,
                    'warning'
                );
            }
            
            return true;
        });
        
        // Update UI
        updateQuantityDisplays();
        updateServiceCheckboxes();
        updateCartDisplay();
    }
}

// Update Quantity Displays
function updateQuantityDisplays() {
    cart.forEach(item => {
        const productElement = document.querySelector(`[data-product="${item.id}"]`);
        if (productElement) {
            const quantitySpan = productElement.querySelector('.quantity');
            const plusBtn = productElement.querySelector('.plus');
            
            if (quantitySpan) {
                quantitySpan.textContent = item.quantity;
            }
            
            // Update button state
            if (plusBtn) {
                if (item.quantity >= item.maxQuantity) {
                    plusBtn.disabled = true;
                    plusBtn.style.opacity = '0.5';
                    plusBtn.style.cursor = 'not-allowed';
                } else {
                    plusBtn.disabled = false;
                    plusBtn.style.opacity = '1';
                    plusBtn.style.cursor = 'pointer';
                }
            }
        }
    });
}

// Update Service Checkboxes
function updateServiceCheckboxes() {
    const aufbauCheckbox = document.getElementById('setup-service');
    const mixingCheckbox = document.getElementById('mixing-service');
    
    if (aufbauCheckbox) aufbauCheckbox.checked = serviceOptions.aufbau;
    if (mixingCheckbox) mixingCheckbox.checked = serviceOptions.mixing;
}

// Clear Cart
function clearCart() {
    cart = [];
    serviceOptions = { aufbau: false, mixing: false };
    totalPrice = 0;
    
    // Reset quantity displays
    document.querySelectorAll('.quantity').forEach(span => {
        span.textContent = '0';
    });
    
    // Reset and re-enable all plus buttons
    document.querySelectorAll('.plus').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
    
    // Reset checkboxes
    document.querySelectorAll('.service-option input').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    updateCartDisplay();
    localStorage.removeItem('configuratorCart');
}

// Get Available Quantity for Product
function getAvailableQuantity(productId) {
    const product = products[productId];
    if (!product) return 0;
    
    const cartItem = cart.find(item => item.id === productId);
    const usedQuantity = cartItem ? cartItem.quantity : 0;
    
    return product.maxQuantity - usedQuantity;
}

// Check if Product is Available
function isProductAvailable(productId, requestedQuantity = 1) {
    return getAvailableQuantity(productId) >= requestedQuantity;
}

// Get Cart Summary for Display
function getCartSummary() {
    const summary = {
        items: cart.length,
        totalProducts: cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        services: 0,
        total: 0
    };
    
    if (serviceOptions.aufbau) summary.services += 100;
    if (serviceOptions.mixing) summary.services += 150;
    
    summary.total = summary.subtotal + summary.services;
    
    return summary;
}

// Utility function for date formatting
function formatDate(dateString) {
    if (!dateString) return 'Nicht angegeben';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Notification function (falls nicht in main.js vorhanden)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--border-radius)',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)'
    });
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#2563eb'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Auto-save cart on page unload
window.addEventListener('beforeunload', () => {
    if (cart.length > 0 || serviceOptions.aufbau || serviceOptions.mixing) {
        saveCartToLocalStorage();
    }
});

// Load cart on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('konfigurator.html')) {
        setTimeout(loadCartFromLocalStorage, 100);
    }
});

// Export functions for debugging (optional)
if (typeof window !== 'undefined') {
    window.configuratorDebug = {
        getCart: () => cart,
        getProducts: () => products,
        clearCart,
        getCartSummary,
        isProductAvailable,
        getAvailableQuantity
    };
}
