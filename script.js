/**
 * ChudiStitch Core System Controller Logic Engine File
 */
// 1. DATA INVENTORY SCHEMA SEED (Simulates Database Product Records)
const HARDENED_PRODUCT_INVENTORY = [
    { 
        id: "prod_001", 
        name: "Floral Print Cotton Unstitched Material", 
        category: "Cotton Premium", 
        material_price: 599.00, 
        stitching_base_price: 450.00, 
        desc: "Premium pure organic cotton weaves with structured collection dupatta. Perfect for casual daily wear.", 
        tags: ["Summer Classic", "Breathable"],
        images:[
            "images/floral-1.jpeg",
            "floral-2.jpeg"
        ]
    },
    { 
        id: "prod_002", 
        name: "Banarasi Silk Brocade Traditional Suit Set", 
        category: "Luxury Silk", 
        material_price: 1499.00, 
        stitching_base_price: 650.00, 
        desc: "Ornate silk zari frameworks optimal for wedding celebrations and grand banquets.", 
        tags: ["Festive Wear", "Royal Texture"],
        images:[
            "images/banarasi.jpeg",
            "images/banarasi1.jpeg"
        ]
    },
    { 
        id: "prod_003", 
        name: "Georgette Mirror Work Designer Dress Material", 
        category: "Georgette Sheer", 
        material_price: 150.00, 
        stitching_base_price: 500.00, 
        desc: "Faux mirror micro-arrangements set on lightweight sheer georgette bases. Includes matching inner fabric.", 
        tags: ["Evening Glam", "Trending Art"],
        images:[
            "images/mirror.jpeg",
        ]
    },
    { 
        id: "prod_004", 
        name: "Chanderi Kora Loom Woven Material", 
        category: "Chanderi Cotton-Silk", 
        material_price: 1850.00, 
        stitching_base_price: 550.00, 
        desc: "Authentic handloom Chanderi fabric with delicate golden border thread details and a sheer texture.", 
        tags: ["Handloom", "Elegant Choice"],
        images:[
            "images/kora.jpeg",
            "images/kora1.jpeg",
            "images/kora2.jpeg"
        ]
    },
    { 
        id: "prod_005", 
        name: "Pashmina Wool Winter Kurta Material", 
        category: "Pashmina Premium", 
        material_price: 2100.00, 
        stitching_base_price: 450.00, 
        desc: "Ultra-soft premium Kashmiri Pashmina weave with intricate traditional digital tracking prints.", 
        tags: ["Winter Wear", "Premium Soft"],
        images:[
            "images/wool.jpeg",
            "images/wool1.jpeg"
        ]
    },
    { 
        id: "prod_006", 
        name: "Bandhani Tie & Dye Pure Crepe Set", 
        category: "Crepe Traditional", 
        material_price: 1699.00, 
        stitching_base_price: 500.00, 
        desc: "Traditional Rajasthani Bandhani crinkled tie-dye patterns on high-grade flowy crepe fabric base.", 
        tags: ["Ethnic Heritage", "Vibrant Tones"],
        images:[
            "images/badani.jpeg",
            "images/badani1.jpeg"
        ]
    }
];
let productSliderStates = {};
// 2. RUNTIME REACTIVE STATE HOLDERS
let userAuthenticationSession = { loggedIn: false, email: null };
let activeAuthenticationUIMode = "LOGIN"; 
let applicationShoppingBasketDataState = []; 
let targetedConfiguratorProductStub = null; 

// 3. APPLICATION INITIALIZATION LIFECYCLE HOOK
window.addEventListener('DOMContentLoaded', () => {
    renderStatefulAuthZone();
    compileProductCatalogGrid();
    lucide.createIcons();
});

// VIEWPORT SWITCH CONTROLLER
function switchView(targetViewportId) {
    ['view-auth', 'view-catalog', 'view-configurator', 'view-studio', 'view-log'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(`view-${targetViewportId}`).classList.remove('hidden');
}

// 4. AUTHENTICATION CONTROLLER LAYER
function renderStatefulAuthZone() {
    const container = document.getElementById('auth-zone');
    if (userAuthenticationSession.loggedIn) {
        container.innerHTML = `
            <div class="flex items-center gap-2 mr-2">
                <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200">
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> ${userAuthenticationSession.email}
                </span>
                <button onclick="terminateUserSession()" class="text-xs font-medium text-slate-400 hover:text-rose-600 transition">Logout</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button onclick="activateAuthenticationPrompt()" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 mr-2">
                Authenticate Account
            </button>
        `;
    }
    lucide.createIcons();
}

function activateAuthenticationPrompt() {
    activeAuthenticationUIMode = "LOGIN";
    document.getElementById('auth-title').innerText = "Account Verification Access";
    switchView('auth');
}

function toggleAuthMode() {
    activeAuthenticationUIMode = (activeAuthenticationUIMode === "LOGIN") ? "REGISTER" : "LOGIN";
    document.getElementById('auth-title').innerText = (activeAuthenticationUIMode === "LOGIN") ? "Account Verification Access" : "Create Marketplace Credentials";
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const targetEmailValue = document.getElementById('auth-email').value;
    userAuthenticationSession = { loggedIn: true, email: targetEmailValue };
    renderStatefulAuthZone();
    switchView('catalog');
}

function terminateUserSession() {
    userAuthenticationSession = { loggedIn: false, email: null };
    applicationShoppingBasketDataState = [];
    evaluateFinancialBasketMetrics();
    renderStatefulAuthZone();
    switchView('catalog');
}

// 5. PRODUCT CATALOG DISPLAY COMPILER MODULE
function compileProductCatalogGrid() {
    const gridContainer = document.getElementById('catalog-products-grid');
    
    // Safety check: if the HTML container doesn't exist yet, don't crash
    if (!gridContainer) return; 

    gridContainer.innerHTML = HARDENED_PRODUCT_INVENTORY.map(product => {
        const badgeElements = product.tags.map(tag => `<span class="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">${tag}</span>`).join('');
        
        // Initialize state for this product if it doesn't exist
        if (productSliderStates[product.id] === undefined) {
            productSliderStates[product.id] = 0;
        }
        
        const currentActiveIndex = productSliderStates[product.id];
        
        // Safety fallback if 'images' array is missing or empty
        const currentActiveImage = (product.images && product.images.length > 0) 
            ? product.images[currentActiveIndex] 
            : 'https://placehold.co/600x400/fff1f2/e11d48?text=Fabric+Preview';

        return `
            <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition group">
                <div class="space-y-3">
                    <div class="bg-slate-100 border border-slate-100 rounded-xl aspect-[4/3] relative overflow-hidden flex items-center justify-center">
                        <span class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs text-slate-800 font-bold px-2 py-1 rounded-md text-[10px] tracking-wide border border-slate-200/50">${product.category}</span>
                        
                        <img 
                            id="slide-${product.id}" 
                            src="${currentActiveImage}" 
                            alt="${product.name}" 
                            class="w-full h-full object-cover"
                            onerror="this.onerror=null; this.src='https://placehold.co/600x400/fff1f2/e11d48?text=Fabric+Preview';"
                        >
                        
                        ${product.images && product.images.length > 1 ? `
                            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-20">
                                <button onclick="changeSlide('${product.id}', -1, event)" class="bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md transition transform active:scale-95">
                                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                                </button>
                                <button onclick="changeSlide('${product.id}', 1, event)" class="bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md transition transform active:scale-95">
                                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                                </button>
                            </div>
                            <div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 z-20" id="dots-${product.id}">
                                ${product.images.map((_, i) => `
                                    <span class="w-1.5 h-1.5 rounded-full transition-all ${i === currentActiveIndex ? 'bg-rose-600 w-3' : 'bg-slate-300'}"></span>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="absolute bottom-3 left-3 flex gap-1.5 z-10">${badgeElements}</div>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors line-clamp-1">${product.name}</h3>
                        <p class="text-xs text-slate-500 mt-1 line-clamp-2">${product.desc}</p>
                    </div>
                </div>
                <div class="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <div class="flex justify-between items-baseline">
                        <span class="text-xs text-slate-400">Material Cost Base</span>
                        <span class="text-xl font-black text-slate-900">₹${product.material_price.toFixed(2)}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="addMaterialOnlyDirectlyToCart('${product.id}')" class="text-xs font-bold border border-slate-200 hover:border-slate-900 text-slate-800 py-2.5 rounded-xl transition">
                            Buy Fabric Only
                        </button>
                        <button onclick="initializeCustomStitchingConfigurator('${product.id}')" class="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 py-2.5 rounded-xl transition flex items-center justify-center gap-1">
                            <i data-lucide="scissors" class="w-3 h-3"></i> Tailor & Buy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Safety check to ensure Lucide icons library exists before calling it
    if (window.lucide) {
        lucide.createIcons();
    }
}
function changeSlide(productId, direction, event) {
    // Prevent button click event from trickling down to any parent element wrappers
    event.stopPropagation();
    
    const product = HARDENED_PRODUCT_INVENTORY.find(p => p.id === productId);
    if (!product) return;
    
    let currentIndex = productSliderStates[productId];
    currentIndex += direction;
    
    // Bounds Check: Wrap around logic loops smoothly
    if (currentIndex >= product.images.length) {
        currentIndex = 0; // Wrap back to first photo
    } else if (currentIndex < 0) {
        currentIndex = product.images.length - 1; // Wrap around to final photo
    }
    
    // Store updated pointer position back inside regional system memory state
    productSliderStates[productId] = currentIndex;
    
    // Target and mutate DOM Image node instantly without rebuilding the entire page layout
    const imageElement = document.getElementById(`slide-${productId}`);
    if (imageElement) {
        imageElement.src = product.images[currentIndex];
    }
    
    // Update the visual dot tracking indicators
    const dotsContainer = document.getElementById(`dots-${productId}`);
    if (dotsContainer) {
        dotsContainer.innerHTML = product.images.map((_, i) => `
            <span class="w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-rose-600 w-3' : 'bg-slate-300'}"></span>
        `).join('');
    }
}
// 6. STITCHING ENGINE PIPELINE OPERATIONS
function initializeCustomStitchingConfigurator(productId) {
    targetedConfiguratorProductStub = HARDENED_PRODUCT_INVENTORY.find(p => p.id === productId);
    if (!targetedConfiguratorProductStub) return;

    document.getElementById('cfg-display-title').innerText = targetedConfiguratorProductStub.name;
    document.getElementById('cfg-badge-category').innerText = targetedConfiguratorProductStub.category;

    switchView('configurator');
    recalculateWizardSummary();
}

function recalculateWizardSummary() {
    if (!targetedConfiguratorProductStub) return;
    let dynamicTotal = targetedConfiguratorProductStub.material_price + targetedConfiguratorProductStub.stitching_base_price;
    
    if (document.getElementById('sys-model').value === 'Anarkali Suit') {
        dynamicTotal += 150.00; // Extra layout calculation surcharge
    }
    document.getElementById('cfg-summary-total').innerText = `₹${dynamicTotal.toFixed(2)}`;
}

function commitCustomConfiguratorToCart() {
    if (!targetedConfiguratorProductStub) return;

    const extraCharges = document.getElementById('sys-model').value === 'Anarkali Suit' ? 150.00 : 0;
    const finalCalculatedStitchingCost = targetedConfiguratorProductStub.stitching_base_price + extraCharges;

    const customizationBundlePayload = {
        cartItemId: "cart_item_hash_" + Date.now(),
        productId: targetedConfiguratorProductStub.id,
        name: targetedConfiguratorProductStub.name,
        order_type: "Custom Stitching",
        pricing_breakdown: {
            material_cost: targetedConfiguratorProductStub.material_price,
            stitching_cost: finalCalculatedStitchingCost,
            total_amount: targetedConfiguratorProductStub.material_price + finalCalculatedStitchingCost
        },
        stitching_details: {
            model_type: document.getElementById('sys-model').value,
            neck_design: document.getElementById('sys-neck').value,
            sleeve_design: document.getElementById('sys-sleeve').value,
            measurements: {
                bust: parseFloat(document.getElementById('size-bust').value),
                waist: parseFloat(document.getElementById('size-waist').value),
                hip: parseFloat(document.getElementById('size-hip').value),
                churidar_length: parseFloat(document.getElementById('size-length').value)
            }
        }
    };

    applicationShoppingBasketDataState.push(customizationBundlePayload);
    evaluateFinancialBasketMetrics();
    switchView('catalog');
    toggleCartDrawer(true);
}

function addMaterialOnlyDirectlyToCart(productId) {
    const targetedProduct = HARDENED_PRODUCT_INVENTORY.find(p => p.id === productId);
    if (!targetedProduct) return;

    const materialOnlyPayload = {
        cartItemId: "cart_item_hash_" + Date.now(),
        productId: targetedProduct.id,
        name: targetedProduct.name,
        order_type: "Material Only",
        pricing_breakdown: {
            material_cost: targetedProduct.material_price,
            stitching_cost: 0,
            total_amount: targetedProduct.material_price
        },
        stitching_details: null
    };

    applicationShoppingBasketDataState.push(materialOnlyPayload);
    evaluateFinancialBasketMetrics();
    toggleCartDrawer(true);
}

// 7. PERSISTENT BUCKET OPERATORS (CART MODIFICATIONS)
function toggleCartDrawer(shouldOpenFlag) {
    const drawerElement = document.getElementById('cart-drawer-overlay');
    if (shouldOpenFlag) {
        drawerElement.classList.remove('hidden');
        renderCartStreamItems();
    } else {
        drawerElement.classList.add('hidden');
    }
}

function renderCartStreamItems() {
    const streamContainer = document.getElementById('cart-items-stream');
    if (applicationShoppingBasketDataState.length === 0) {
        streamContainer.innerHTML = `
            <div class="text-center py-12 text-slate-400 space-y-2">
                <i data-lucide="ghost" class="w-10 h-10 mx-auto"></i>
                <p class="text-sm">Your shopping bag is completely empty</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    streamContainer.innerHTML = applicationShoppingBasketDataState.map(item => {
        const tailoringSpecsSnippet = item.order_type === "Custom Stitching" 
            ? `<div class="mt-1.5 p-2 bg-rose-50 text-[11px] text-rose-700 font-medium rounded-lg border border-rose-100/50">
                Configured: ${item.stitching_details.model_type} (${item.stitching_details.neck_design})
               </div>`
            : `<div class="mt-1.5 text-[11px] text-slate-400">Unstitched Raw Fabric Component Only</div>`;

        return `
            <div class="p-4 bg-white border border-slate-200 rounded-xl relative group hover:border-slate-300 transition shadow-xs">
                <button onclick="removeBasketItem('${item.cartItemId}')" class="absolute top-3 right-3 text-slate-300 hover:text-rose-600 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                <span class="text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm inline-block ${item.order_type === 'Custom Stitching' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}">${item.order_type}</span>
                <h4 class="font-bold text-slate-900 text-sm mt-1 pr-6 truncate">${item.name}</h4>
                ${tailoringSpecsSnippet}
                <div class="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span class="text-xs text-slate-400">Yield Value Cost</span>
                    <span class="font-extrabold text-slate-900 text-sm">₹${item.pricing_breakdown.total_amount.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function removeBasketItem(cartItemId) {
    applicationShoppingBasketDataState = applicationShoppingBasketDataState.filter(item => item.cartItemId !== cartItemId);
    evaluateFinancialBasketMetrics();
    renderCartStreamItems();
}

function evaluateFinancialBasketMetrics() {
    const calculatedSubtotal = applicationShoppingBasketDataState.reduce((accumulatedSum, currentElement) => accumulatedSum + currentElement.pricing_breakdown.total_amount, 0);
    
    document.getElementById('cart-subtotal').innerText = `₹${calculatedSubtotal.toFixed(2)}`;
    
    const badge = document.getElementById('global-cart-badge');
    if (applicationShoppingBasketDataState.length > 0) {
        badge.innerText = applicationShoppingBasketDataState.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// 8. SANDBOXED PAYMENT SETTLERS ROUTER
function triggerPaymentWorkflow() {
    if (applicationShoppingBasketDataState.length === 0) {
        alert("Transaction processing halted. Your shopping cart must contain items before checking out.");
        return;
    }
    if (!userAuthenticationSession.loggedIn) {
        alert("Authentication required. Please authenticate your user profile first.");
        activateAuthenticationPrompt();
        toggleCartDrawer(false);
        return;
    }

    const calculatedSubtotal = applicationShoppingBasketDataState.reduce((sum, item) => sum + item.pricing_breakdown.total_amount, 0);
    document.getElementById('pay-modal-amount').innerText = `₹${calculatedSubtotal.toFixed(2)}`;
    
    toggleCartDrawer(false);
    document.getElementById('payment-gateway-modal').classList.remove('hidden');
}

function dismissPaymentModal() {
    document.getElementById('payment-gateway-modal').classList.add('hidden');
}

function executeSimulatedFinancialSettlement() {
    // Generate JSON Document Payload mirroring future backend delivery API standards
    const definitiveOrderPayloadObject = {
        timestamp_epoch: Date.now(),
        buyer_identity_node: userAuthenticationSession.email,
        line_item_manifest: applicationShoppingBasketDataState,
        payment_settlement_status: "SUCCESS_AUTHORIZED_DEBITED"
    };

    console.log("FINALIZED COMPLETE PIPELINE TRANSACTION PAYLOAD:", definitiveOrderPayloadObject);
    
    dismissPaymentModal();
    applicationShoppingBasketDataState = [];
    evaluateFinancialBasketMetrics();
    
    alert("Payment Authorization Successful!\n\nYour complete premium order structure has been logged out inside your developer tools console.");
}