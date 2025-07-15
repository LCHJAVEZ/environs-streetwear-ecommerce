// Products page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Product filtering functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    // Filter products by category
    function filterProducts(category) {
        productCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                // Add animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update product count
        updateProductCount(category);
    }
    
    // Update product count display
    function updateProductCount(category) {
        const visibleProducts = document.querySelectorAll(
            category === 'all' 
                ? '.product-card' 
                : `.product-card[data-category="${category}"]`
        );
        
        const countElement = document.querySelector('.product-count');
        if (countElement) {
            countElement.textContent = `${visibleProducts.length} productos`;
        }
    }
    
    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter products
            const category = this.dataset.category;
            filterProducts(category);
        });
    });
    
    // Initialize with all products visible
    filterProducts('all');
    
    // Enhanced add to cart functionality
    window.addToCart = function(productName) {
        // Get current cart count
        let cartCount = parseInt(localStorage.getItem('cartCount') || '0');
        cartCount++;
        
        // Update localStorage
        localStorage.setItem('cartCount', cartCount.toString());
        
        // Update cart display
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
            
            // Add animation to cart icon
            cartCountElement.parentElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCountElement.parentElement.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Show notification
        if (window.ENVIRONS && window.ENVIRONS.showNotification) {
            window.ENVIRONS.showNotification(`"${productName}" agregado al carrito`);
        }
        
        // Add to cart items in localStorage (for future cart page)
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        
        // Check if item already exists
        const existingItem = cartItems.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            // Get product price from the DOM
            const productCard = Array.from(document.querySelectorAll('.product-card')).find(
                card => card.querySelector('.product-name').textContent === productName
            );
            
            let price = '$0,00';
            if (productCard) {
                const priceElement = productCard.querySelector('.product-price');
                price = priceElement.textContent.split('\n').pop().trim();
            }
            
            cartItems.push({
                name: productName,
                price: price,
                quantity: 1
            });
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    };
    
    // Load cart count from localStorage on page load
    function loadCartCount() {
        const cartCount = localStorage.getItem('cartCount') || '0';
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }
    
    // Initialize cart count
    loadCartCount();
    
    // Search functionality (if search input exists)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            productCards.forEach(card => {
                const productName = card.querySelector('.product-name').textContent.toLowerCase();
                const isVisible = productName.includes(searchTerm);
                
                card.style.display = isVisible ? 'block' : 'none';
            });
        });
    }
    
    // Sort functionality
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            const productsGrid = document.getElementById('products-grid');
            const products = Array.from(productCards);
            
            products.sort((a, b) => {
                switch (sortBy) {
                    case 'price-low':
                        return getProductPrice(a) - getProductPrice(b);
                    case 'price-high':
                        return getProductPrice(b) - getProductPrice(a);
                    case 'name':
                        return a.querySelector('.product-name').textContent.localeCompare(
                            b.querySelector('.product-name').textContent
                        );
                    default:
                        return 0;
                }
            });
            
            // Re-append sorted products
            products.forEach(product => {
                productsGrid.appendChild(product);
            });
        });
    }
    
    // Helper function to get product price as number
    function getProductPrice(productCard) {
        const priceText = productCard.querySelector('.product-price').textContent;
        const priceMatch = priceText.match(/\$([0-9,.]+)/);
        if (priceMatch) {
            return parseFloat(priceMatch[1].replace(/[,.]/g, ''));
        }
        return 0;
    }
    
    // Wishlist functionality (basic)
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            
            // Toggle wishlist state
            this.classList.toggle('active');
            
            // Save to localStorage
            let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            
            if (this.classList.contains('active')) {
                if (!wishlist.includes(productName)) {
                    wishlist.push(productName);
                }
                window.ENVIRONS.showNotification(`"${productName}" agregado a favoritos`);
            } else {
                wishlist = wishlist.filter(item => item !== productName);
                window.ENVIRONS.showNotification(`"${productName}" removido de favoritos`);
            }
            
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        });
    });
    
    // Load wishlist state
    function loadWishlistState() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent;
            const wishlistBtn = card.querySelector('.wishlist-btn');
            
            if (wishlistBtn && wishlist.includes(productName)) {
                wishlistBtn.classList.add('active');
            }
        });
    }
    
    // Initialize wishlist state
    loadWishlistState();
    
    // Quick view functionality (if implemented)
    const quickViewButtons = document.querySelectorAll('.quick-view-btn');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            
            // Show quick view modal (would need to implement modal)
            window.ENVIRONS.showNotification(`Vista rápida de "${productName}" - Funcionalidad próximamente`);
        });
    });
    
    // Lazy loading for product images (if real images are added)
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, observerOptions);
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    console.log('Products page functionality initialized');
});
