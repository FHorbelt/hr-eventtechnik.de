// Konfigurator State
let cart = [];
let totalPrice = 0;
let serviceOptions = {
    aufbau: false,
    mixing: false
};

// Korrigierte Produktdatenbank mit den richtigen Daten aus paste.txt
const products = {
    'rcf-evox-8': {
        name: 'RCF Evox 8',
        price: 50,
        category: 'tontechnik',
        maxQuantity: 2,
        description: 'Premium Säulensystem mit 1400W Peak-Leistung, 8x 2" Fullrange-Treiber und 12" Hochleistungs-Subwoofer'
    },
    'rcf-712-mk2-inkl-stativ': {
        name: 'RCF ART 712-A MK2',
        price: 45,
        category: 'tontechnik',
        maxQuantity: 2,
        description: 'Vielseitiger Vollbereichslautsprecher mit 1400W Peak, FiRPHASE-Technologie und 12" High-Power Woofer'
    },
    'rcf-nx-932a': {
        name: 'RCF NX 932-A',
        price: 65,
        category: 'tontechnik',
        maxQuantity: 2,
        description: 'Professionelle Hochleistungsbox mit 2100W Peak, Bass Motion Control und 3" Titan/Neodym-Treiber'
    },
    'rcf-sub-905as': {
        name: 'RCF SUB 905-AS MK3',
        price: 65,
        category: 'tontechnik',
        maxQuantity: 2,
        description: 'Kraftvoller Aktiv-Subwoofer mit 2200W Peak, 15" Hochleistungs-Woofer und Bass Motion Control'
    },
    'behringer-x32': {
        name: 'Behringer X32 Rack',
        price: 50,
        category: 'tontechnik',
        maxQuantity: 1,
        description: 'Professionelles Digital-Mischpult mit 40 Input-Kanälen, 16 MIDAS-Preamps und iPad/iPhone-Steuerung'
    },
    'behringer-q1204': {
        name: 'Behringer XENYX Q1204USB',
        price: 10,
        category: 'tontechnik',
        maxQuantity: 1,
        description: 'Kompaktes Analog-Mischpult mit 4 Mono + 2 Stereo Kanälen, XENYX Mic-Preamps und USB Audio Interface'
    },
    'led-spot-18x1w': {
        name: 'LED Spot 18x1W',
        price: 3,
        category: 'lichttechnik',
        maxQuantity: 9,
        description: 'Vielseitige Uplights mit 18x 1W RGBW LEDs, Batteriebetrieb möglich und Musiksteuerung'
    },
    'led-par-56': {
        name: 'LED Spot Par 56',
        price: 3,
        category: 'lichttechnik',
        maxQuantity: 4,
        description: 'Klassische LED-Scheinwerfer mit RGB LED-Bestückung im bewährten Par 56 Standard-Format'
    },
    'stairville-all-fx': {
        name: 'Stairville All FX Bar',
        price: 15,
        category: 'lichttechnik',
        maxQuantity: 2,
        description: 'Multifunktions-Lichteffekt mit 4-in-1 Kombination: Strobe + Derby + Laser + Par'
    },
    'stairville-clb24': {
        name: 'Stairville CLB2.4 Compact LED Par System',
        price: 15,
        category: 'lichttechnik',
        maxQuantity: 1,
        description: 'Komplettes Beleuchtungsset mit 4x kompakte LED Par-Spots, RGBW Farbmischung inkl. T-Bar und Stativ'
    },
    'stairville-dj-bundle': {
        name: 'Stairville Wind Up DJ Bundle III',
        price: 50,
        category: 'lichttechnik',
        maxQuantity: 1,
        description: 'Komplette Lichtshow mit 4x Moving Head Spots, 2x Derby-Effekte, 4x Par LED-Spots und DMX-Controller'
    }
};

// Initialize Configurator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('konfigurator.html')) {
        initConfigurator();
        loadSelectedProducts();
    }
});

// Initialize Configurator
function initConfigurator() {
    initQuantityControls();
    initServiceOptions();
    initQuoteRequest();
    updateCartDisplay();
}

// Calculate dynamic setup costs
function calculateSetupCosts(productSubtotal) {
    const minSetupCost = 50;
    const setupPercentage = 0.25; // 25%
    
    const calculatedCost = Math.round(productSubtotal * setupPercentage);
    return Math.max(minSetupCost, calculatedCost);
}

// Get formatted setup cost text (simplified - just show the price)
function getSetupCostText(productSubtotal) {
    // Return empty string since we don't want to show calculation details
    return '';
}

// Initialize Quantity Controls mit Maximum-Logik
function initQuantityControls() {
    const quantityControls = document.querySelectorAll('.quantity-controls');
    
    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');
        const quantitySpan = control.querySelector('.quantity');
        const productElement = control.closest('.config-product');
        const productId = productElement.getAttribute('data-product');
        const productPrice = parseInt(productElement.getAttribute('data-price'));
        const product = products[productId];
        
        if (!product) return;
        
        const maxQuantity = product.maxQuantity;
        
        // Plus button mit Maximum-Check
        plusBtn.addEventListener('click', () => {
            const currentQty = parseInt(quantitySpan.textContent);
            if (currentQty < maxQuantity) {
                const newQty = currentQty + 1;
                quantitySpan.textContent = newQty;
                updateCartItem(productId, newQty, productPrice);
                
                // Disable button if maximum reached
                if (newQty >= maxQuantity) {
                    plusBtn.disabled = true;
                    plusBtn.style.opacity = '0.5';
                    plusBtn.style.cursor = 'not-allowed';
                    showNotification(`Maximum erreicht: Nur ${maxQuantity} Stück von "${product.name}" verfügbar`, 'warning');
                }
            } else {
                showNotification(`Maximum erreicht: Nur ${maxQuantity} Stück von "${product.name}" verfügbar`, 'warning');
            }
        });
        
        // Minus button
        minusBtn.addEventListener('click', () => {
            const currentQty = parseInt(quantitySpan.textContent);
            if (currentQty > 0) {
                const newQty = currentQty - 1;
                quantitySpan.textContent = newQty;
                updateCartItem(productId, newQty, productPrice);
                
                // Re-enable plus button
                plusBtn.disabled = false;
                plusBtn.style.opacity = '1';
                plusBtn.style.cursor = 'pointer';
            }
        });
        
        // Initialize button state
        const currentQty = parseInt(quantitySpan.textContent);
        if (currentQty >= maxQuantity) {
            plusBtn.disabled = true;
            plusBtn.style.opacity = '0.5';
            plusBtn.style.cursor = 'not-allowed';
        }
    });
}

// Update Cart Item mit Verfügbarkeits-Check
function updateCartItem(productId, quantity, price) {
    const product = products[productId];
    if (!product) return;
    
    // Check maximum quantity
    if (quantity > product.maxQuantity) {
        showNotification(`Nur ${product.maxQuantity} Stück von "${product.name}" verfügbar!`, 'error');
        return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (quantity === 0) {
        if (existingItemIndex !== -1) {
            cart.splice(existingItemIndex, 1);
        }
    } else {
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity = quantity;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: price,
                quantity: quantity,
                maxQuantity: product.maxQuantity
            });
        }
    }
    
    updateCartDisplay();
    saveCartToLocalStorage();
}

// Initialize Service Options
function initServiceOptions() {
    const aufbauCheckbox = document.getElementById('setup-service');
    const mixingCheckbox = document.getElementById('mixing-service');
    
    if (aufbauCheckbox) {
        aufbauCheckbox.addEventListener('change', (e) => {
            serviceOptions.aufbau = e.target.checked;
            updateCartDisplay();
            saveCartToLocalStorage();
        });
    }
    
    if (mixingCheckbox) {
        mixingCheckbox.addEventListener('change', (e) => {
            serviceOptions.mixing = e.target.checked;
            updateCartDisplay();
            saveCartToLocalStorage();
        });
    }
}

// Update Cart Display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const requestButton = document.getElementById('request-quote');
    
    if (!cartItemsContainer) return;
    
    // Clear cart display
    cartItemsContainer.innerHTML = '';
    
    // Calculate product subtotal first
    let productSubtotal = 0;
    cart.forEach(item => {
        productSubtotal += item.price * item.quantity;
    });
    
    let subtotal = productSubtotal;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Noch keine Produkte ausgewählt</p>';
        if (requestButton) requestButton.disabled = true;
    } else {
        // Display cart items
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <p>${item.quantity}x ${item.price}€ <span class="availability-info">(max. ${item.maxQuantity})</span></p>
                </div>
                <div class="cart-item-price">${itemTotal}€</div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        if (requestButton) requestButton.disabled = false;
    }
    
    // Add service options to display
    if (serviceOptions.aufbau) {
        const setupCost = calculateSetupCosts(productSubtotal);
        subtotal += setupCost;
        const serviceItem = document.createElement('div');
        serviceItem.className = 'cart-item';
        serviceItem.innerHTML = `
            <div class="cart-item-info">
                <h5>Auf- und Abbau</h5>
                <p>Service ${getSetupCostText(productSubtotal)}</p>
            </div>
            <div class="cart-item-price">${setupCost}€</div>
        `;
        cartItemsContainer.appendChild(serviceItem);
    }
    
    if (serviceOptions.mixing) {
        subtotal += 150;
        const serviceItem = document.createElement('div');
        serviceItem.className = 'cart-item';
        serviceItem.innerHTML = `
            <div class="cart-item-info">
                <h5>Live Mixing</h5>
                <p>Service</p>
            </div>
            <div class="cart-item-price">150€</div>
        `;
        cartItemsContainer.appendChild(serviceItem);
    }
    
    // Update total price
    totalPrice = subtotal;
    if (totalPriceElement) {
        totalPriceElement.innerHTML = `<strong>Gesamt: ${totalPrice}€/Tag</strong>`;
    }
    
    // Update setup service label with current cost
    updateSetupServiceLabel(productSubtotal);
}

// Update Setup Service Label
function updateSetupServiceLabel(productSubtotal) {
    const setupLabel = document.querySelector('label[for="setup-service"] span');
    if (setupLabel) {
        const setupCost = calculateSetupCosts(productSubtotal);
        setupLabel.textContent = `Auf- und Abbau (+${setupCost}€)`;
    }
}

// Initialize Quote Request
function initQuoteRequest() {
    const requestButton = document.getElementById('request-quote');
    const modal = document.getElementById('quote-modal');
    const quoteForm = document.getElementById('quote-form');
    
    if (requestButton && modal) {
        requestButton.addEventListener('click', () => {
            updateQuoteSummary();
            modal.style.display = 'block';
        });
    }
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmission);
    }
}

// Update Quote Summary in Modal
function updateQuoteSummary() {
    const summaryContainer = document.getElementById('quote-summary');
    if (!summaryContainer) return;
    
    let summaryHTML = '<h4>Zusammenfassung Ihres Pakets:</h4>';
    
    // Calculate product subtotal
    let productSubtotal = 0;
    cart.forEach(item => {
        productSubtotal += item.price * item.quantity;
    });
    
    // Products
    if (cart.length > 0) {
        summaryHTML += '<div class="summary-section"><h5>Produkte:</h5>';
        cart.forEach(item => {
            summaryHTML += `
                <div class="summary-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${item.price * item.quantity}€/Tag</span>
                </div>
            `;
        });
        summaryHTML += '</div>';
    }
    
    // Services
    if (serviceOptions.aufbau || serviceOptions.mixing) {
        summaryHTML += '<div class="summary-section"><h5>Services:</h5>';
        if (serviceOptions.aufbau) {
            const setupCost = calculateSetupCosts(productSubtotal);
            summaryHTML += `
                <div class="summary-item">
                    <span>Auf- und Abbau</span>
                    <span>${setupCost}€</span>
                </div>
            `;
        }
        if (serviceOptions.mixing) {
            summaryHTML += `
                <div class="summary-item">
                    <span>Live Mixing</span>
                    <span>150€</span>
                </div>
            `;
        }
        summaryHTML += '</div>';
    }
    
    // Total
    summaryHTML += `
        <div class="summary-total">
            <div class="summary-item">
                <span><strong>Gesamtpreis pro Tag:</strong></span>
                <span><strong>${totalPrice}€</strong></span>
            </div>
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

// Handle Quote Form Submission
function handleQuoteSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Calculate product subtotal for setup cost calculation
    let productSubtotal = 0;
    cart.forEach(item => {
        productSubtotal += item.price * item.quantity;
    });
    
    // Add cart data to form data
    data.products = cart;
    data.serviceOptions = serviceOptions;
    data.setupCost = serviceOptions.aufbau ? calculateSetupCosts(productSubtotal) : 0;
    data.totalPrice = totalPrice;
    
    // Calculate total price based on duration
    const duration = parseInt(data['event-duration']);
    const finalPrice = totalPrice * duration;
    data.finalPrice = finalPrice;
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
    submitButton.disabled = true;
    
    // Simulate sending email (replace with actual implementation)
    setTimeout(() => {
        // Create email content
        const emailContent = createEmailContent(data);
        
        // Log for development (replace with actual email sending)
        console.log('Quote request:', data);
        console.log('Email content:', emailContent);
        
        // Show success message
        showNotification('Ihre Anfrage wurde erfolgreich gesendet! Wir melden uns schnellstmöglich bei Ihnen.', 'success');
        
        // Close modal
        document.getElementById('quote-modal').style.display = 'none';
        
        // Reset form and cart
        e.target.reset();
        clearCart();
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
    }, 2000);
}

// Create Email Content
function createEmailContent(data) {
    let content = `
Neue Anfrage von H&R Eventtechnik Website
=========================================

Kundendaten:
- Name: ${data['customer-name']}
- E-Mail: ${data['customer-email']}
- Telefon: ${data['customer-phone'] || 'Nicht angegeben'}

Veranstaltung:
- Datum: ${formatDate(data['event-date'])}
- Dauer: ${data['event-duration']} Tag(e)
- Art: ${data['event-type']}
- Gäste: ${data['guest-count'] || 'Nicht angegeben'}
- Ort: ${data['event-location']}

Gewünschte Produkte:
`;

    data.products.forEach(item => {
        content += `- ${item.quantity}x ${item.name} (${item.price}€/Tag) [max. ${item.maxQuantity} verfügbar]\n`;
    });
    
    if (data.serviceOptions.aufbau) {
        content += `- Auf- und Abbau (${data.setupCost}€)\n`;
    }
    
    if (data.serviceOptions.mixing) {
        content += `- Live Mixing (150€)\n`;
    }
    
    content += `
Preisberechnung:
- Preis pro Tag: ${data.totalPrice}€
- Dauer: ${data['event-duration']} Tag(e)
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
    let productSubtotal = 0;
    cart.forEach(item => {
        productSubtotal += item.price * item.quantity;
    });
    
    const summary = {
        items: cart.length,
        totalProducts: cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: productSubtotal,
        services: 0,
        total: 0
    };
    
    if (serviceOptions.aufbau) summary.services += calculateSetupCosts(productSubtotal);
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
        getAvailableQuantity,
        calculateSetupCosts
    };
}