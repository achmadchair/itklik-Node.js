// Simulasi Slider (Dari dotnet script)
const layarImages = [
    '/img/home.jpg',
    '/img/home2.jpeg',
    '/img/home3.webp',
    '/img/home3.jpg'
];

let currentIndex = 0;
let sliderInterval = null;

function initSlider() {
    const layarSection = document.querySelector('.layar-section');
    if (!layarSection) {
        console.warn("Elemen .layar-section tidak ditemukan!");
        return;
    }

    // Set background awal
    layarSection.style.backgroundImage = `url('${layarImages[currentIndex]}')`;

    // Ganti background setiap 5 detik
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % layarImages.length;
        layarSection.style.backgroundImage = `url('${layarImages[currentIndex]}')`;
    }, 5000);
}

// ==========================================
// AUTHENTICATION & AUTHORIZATION
// ==========================================

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authOnlyElements = document.querySelectorAll('.auth-only');
const guestOnlyElements = document.querySelectorAll('.guest-only');
const adminOnlyElements = document.querySelectorAll('.admin-only');

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function updateAuthState() {
    const user = getUser();
    const isLoggedIn = !!user;

    // Re-query to include offcanvas elements
    const authOnly = document.querySelectorAll('.auth-only');
    const guestOnly = document.querySelectorAll('.guest-only');
    const adminOnly = document.querySelectorAll('.admin-only');

    authOnly.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
        if (isLoggedIn && el.tagName === 'A') el.style.display = 'flex'; // Fix for list-group items
    });

    guestOnly.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
        if (!isLoggedIn && el.tagName === 'A') el.style.display = 'flex';
    });

    adminOnly.forEach(el => {
        if (isLoggedIn && (user.role === 'admin' || user.role === 'superadmin')) {
            el.style.display = 'block';
            if (el.tagName === 'A') el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
}

// Inisialisasi awal Auth State
updateAuthState();

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');
if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', handleLogout);
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Anda berhasil logout!');
    updateAuthState();
    window.location.hash = '#home';
}

// Handle Login Form
document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Tutup modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();

        alert(`Selamat datang, ${data.user.username}!`);
        updateAuthState();

        // Clear form
        document.getElementById('form-login').reset();
        errorDiv.classList.add('d-none');
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
});

// Handle Register Form
document.getElementById('form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role')?.value || 'guest';
    const errorDiv = document.getElementById('register-error');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        alert('Registrasi berhasil! Silakan login.');

        document.getElementById('form-register').reset();
        errorDiv.classList.add('d-none');

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
});

// ==========================================
// PRODUCTS & ROUTING
// ==========================================

let productsData = [];

const homeView = document.getElementById('home-view');
const productsView = document.getElementById('products-view');
const cmsView = document.getElementById('cms-view');
const productsGrid = document.getElementById('products-grid');
const productsTitle = document.getElementById('products-title');
const cmsProductsTable = document.getElementById('cms-products-table');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const expiredView = document.getElementById('expired-view');
const expiryDateText = document.getElementById('expiry-date-text');
const aboutView = document.getElementById('about-view');

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        
        // Handle license expiry
        if (response.status === 403) {
            const data = await response.json();
            if (data.expired) {
                showExpiredView(data.expiryDate);
                return;
            }
        }

        if (!response.ok) throw new Error('Gagal memuat produk');
        productsData = await response.json();
    } catch (error) {
        console.error(error);
        productsData = []; // Fallback jika gagal
    }
}

function showExpiredView(date) {
    // Sembunyikan semua elemen navigasi dan konten utama
    const header = document.querySelector('header');
    const footers = document.querySelectorAll('footer');
    
    if (header) header.style.display = 'none';
    footers.forEach(f => f.style.display = 'none');
    
    if (homeView) homeView.style.display = 'none';
    if (productsView) productsView.style.display = 'none';
    if (cmsView) cmsView.style.display = 'none';
    if (detailView) detailView.style.display = 'none';
    if (aboutView) aboutView.style.display = 'none';
    
    if (expiredView) {
        expiredView.style.display = 'block';
        if (expiryDateText) expiryDateText.textContent = date;
    }
}

async function checkLicenseStatus() {
    try {
        const response = await fetch('/api/check-license');
        if (response.status === 403) {
            const data = await response.json();
            if (data.expired) {
                showExpiredView(data.expiryDate);
                return true; // Berhenti jika expired
            }
        }
    } catch (e) {
        console.error("Gagal cek lisensi", e);
    }
    return false;
}

async function fetchTestimonials() {
    try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Gagal memuat testimoni');
        const testimonials = await response.json();
        renderTestimonials(testimonials);
    } catch (error) {
        console.error(error);
    }
}

function renderTestimonials(testimonials) {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    if (testimonials.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="text-muted">Belum ada testimoni.</p></div>';
        return;
    }

    grid.innerHTML = testimonials.map(t => `
        <div class="col-md-4 testimonial-item">
            <p class="testimonial-text">"${t.text}"</p>
            <p class="testimonial-author">- ${t.username} -</p>
        </div>
    `).join('');
}

function renderProducts(category) {
    // Hide CMS view
    if (cmsView) cmsView.style.display = 'none';

    // Show/Hide views
    if (homeView) homeView.style.display = 'none';
    if (productsView) productsView.style.display = 'block';
    if (aboutView) aboutView.style.display = 'none';
    if (detailView) detailView.style.display = 'none';

    // Filter products
    let filtered = productsData;
    if (category && category !== 'all') {
        filtered = productsData.filter(p => p.category.toLowerCase() === category.toLowerCase());
        productsTitle.textContent = "Produk: " + category.charAt(0).toUpperCase() + category.slice(1);
    } else {
        productsTitle.textContent = "Semua Produk";
    }

    // Generate HTML
    if (filtered.length === 0) {
        productsGrid.innerHTML = '<div class="col-12"><p class="text-center text-muted">Belum ada produk di kategori ini.</p></div>';
        return;
    }

    productsGrid.innerHTML = filtered.map(p => `
        <div class="col-md-3 mb-4">
            <div class="card shadow-sm">
                <img src="${p.imageUrl}" class="card-img-top" style="height:180px; object-fit:cover;" />
                <div class="card-body">
                    <h5>${p.name}</h5>
                    <p class="text-muted">Rp ${formatRupiah(p.price)}</p>
                    <a href="#detail-${p.id}" class="btn btn-primary btn-sm">Detail</a>
                </div>
            </div>
        </div>
    `).join('');
}

function renderHomeCarousel() {
    const carouselInner = document.getElementById('dynamic-product-carousel');
    if (!carouselInner) return;

    if (productsData.length === 0) {
        // Fallback jika tidak ada produk
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <img src="/img/printer.webp" class="d-block w-100 img-fluid" alt="Printer Default">
                <div class="carousel-caption dynamic-caption-top bg-dark bg-opacity-50 rounded-pill px-4 py-2 shadow-sm border border-white border-opacity-10" style="backdrop-filter: blur(8px);">
                    <h5 class="fw-bold text-white mb-0">Epson Printer Solution</h5>
                </div>
            </div>
        `;
        return;
    }

    carouselInner.innerHTML = productsData.map((p, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${p.imageUrl}" class="d-block w-100 img-fluid" alt="${p.name}">
            <div class="carousel-caption dynamic-caption-top bg-dark bg-opacity-50 rounded-pill px-4 py-2 shadow-sm border border-white border-opacity-10" style="backdrop-filter: blur(8px);">
                <h5 class="fw-bold text-white mb-0">${p.name}</h5>
            </div>
        </div>
    `).join('');
}



function renderCMSProducts() {
    if (homeView) homeView.style.display = 'none';
    if (productsView) productsView.style.display = 'none';
    if (aboutView) aboutView.style.display = 'none';
    if (detailView) detailView.style.display = 'none';
    if (cmsView) cmsView.style.display = 'block';

    if (productsData.length === 0) {
        cmsProductsTable.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada produk.</td></tr>';
        return;
    }

    cmsProductsTable.innerHTML = productsData.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.imageUrl}" alt="${p.name}" style="height:50px; width:50px; object-fit:cover; border-radius:4px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>Rp ${formatRupiah(p.price)}</td>
            <td>
                <a href="#detail-${p.id}" class="btn btn-info btn-sm">View</a>
                <button class="btn btn-warning btn-sm" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

async function renderDetail(id) {
    if (homeView) homeView.style.display = 'none';
    if (productsView) productsView.style.display = 'none';
    if (cmsView) cmsView.style.display = 'none';
    if (aboutView) aboutView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';

    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Produk tidak ditemukan');
        const product = await response.json();

        detailContent.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    <img src="${product.imageUrl}" class="img-fluid rounded shadow" alt="${product.name}">
                </div>
                <div class="col-md-7">
                    <h2 class="fw-bold">${product.name}</h2>
                    <p class="badge bg-primary fs-6">${product.category}</p>
                    <h3 class="text-danger fw-bold mt-3">Rp ${formatRupiah(product.price)}</h3>
                    <hr>
                    <h5>Deskripsi Produk:</h5>
                    <p class="text-muted" style="white-space: pre-line;">${product.description || 'Tidak ada deskripsi.'}</p>
                    <div class="mt-5">
                        <a href="https://wa.me/6281354842048?text=Halo,%20saya%20ingin%20tanya%20produk%20${product.name}" 
                           target="_blank" class="btn btn-success btn-lg px-5">
                           Tanya via WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        detailContent.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

async function handleRouting() {
    const hash = window.location.hash;

    // Close offcanvas if open
    const offcanvasEl = document.getElementById('offcanvasMenu');
    if (offcanvasEl) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) bsOffcanvas.hide();
    }

    // Always fetch latest products on route change
    try {
        await fetchProducts();
    } catch (e) {
        console.error("Fetch products failed", e);
    }

    if (!hash || hash === '' || hash === '#home' || hash === '#services' || hash === '#contact' || hash === '#harco' || hash === '#keiai' || hash === '#cikarang') {
        if (homeView) homeView.style.display = 'block';
        if (productsView) productsView.style.display = 'none';
        if (cmsView) cmsView.style.display = 'none';
        if (detailView) detailView.style.display = 'none';
        if (aboutView) aboutView.style.display = 'none';
        await fetchTestimonials(); // Ambil testimoni saat di home
        renderHomeCarousel(); // Render carousel produk dinamis
        initSlider(); // Pastikan slider jalan saat di home
        
        if (hash === '#services' || hash === '#contact' || hash === '#harco' || hash === '#keiai' || hash === '#cikarang') {
            const target = document.querySelector(hash);
            if (target) {
                // Beri sedikit jeda agar display:block selesai diproses browser
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }
    else if (hash.startsWith('#detail-')) {
        const id = hash.split('-')[1];
        renderDetail(id);
        window.scrollTo(0, 0);
    }
    else if (hash === '#cms') {
        const user = getUser();
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
            renderCMSProducts();
            window.scrollTo(0, 0);
        } else {
            alert('Akses Ditolak! Anda bukan admin.');
            window.location.hash = '#home';
        }
    }
    else if (hash === '#products') {
        renderProducts('all');
        window.scrollTo(0, 0);
    }
    else if (hash === '#printer') {
        renderProducts('Printer');
        window.scrollTo(0, 0);
    }
    else if (hash === '#ink') {
        renderProducts('Ink');
        window.scrollTo(0, 0);
    }
    else if (hash === '#projector') {
        renderProducts('Projector');
        window.scrollTo(0, 0);
    }
    else if (hash === '#scanner') {
        renderProducts('Scanner');
        window.scrollTo(0, 0);
    }
    else if (hash === '#about') {
        if (homeView) homeView.style.display = 'none';
        if (productsView) productsView.style.display = 'none';
        if (cmsView) cmsView.style.display = 'none';
        if (detailView) detailView.style.display = 'none';
        if (aboutView) aboutView.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

// Global function to navigate and force refresh if needed
window.navigateTo = (hash) => {
    if (window.location.hash === hash) {
        handleRouting(); // Force refresh if already on the same hash
    } else {
        window.location.hash = hash;
    }
};

// Listen to hash changes
window.addEventListener('hashchange', handleRouting);

// Check initial route on load
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan routing & slider dulu agar UI tidak stuck
    handleRouting();
    initSlider();

    // Cek lisensi di background (tidak memblokir UI)
    checkLicenseStatus().then(isExpired => {
        if (isExpired) {
            console.warn("Lisensi berakhir. Menampilkan view expired.");
        }
    });
});

// ==========================================
// CMS PRODUCT CRUD LOGIC
// ==========================================

const productModal = document.getElementById('productModal');
let bootstrapProductModal;
if (productModal) {
    bootstrapProductModal = new bootstrap.Modal(productModal);
}

// Kosongkan form saat modal tambah produk dibuka
document.querySelector('[data-bs-target="#addProductModal"]')?.addEventListener('click', () => {
    document.getElementById('form-product').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('productModalLabel').textContent = 'Tambah Produk';
    bootstrapProductModal.show();
});

// Handle Submit Form Produk (Add / Edit)
document.getElementById('form-product')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const imageUrl = document.getElementById('product-image').value;
    const description = document.getElementById('product-description').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name, category, price, imageUrl, description })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert(`Produk berhasil ${id ? 'diupdate' : 'ditambahkan'}!`);
        bootstrapProductModal.hide();

        // Refresh tabel
        await fetchProducts();
        renderCMSProducts();
    } catch (error) {
        alert('Gagal menyimpan produk: ' + error.message);
    }
});

// Expose fungsi ke global (karena digunakan di atribut onclick pada string HTML)
window.editProduct = (id) => {
    const product = productsData.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.imageUrl;
    document.getElementById('product-description').value = product.description || '';

    document.getElementById('productModalLabel').textContent = 'Edit Produk';
    bootstrapProductModal.show();
};

window.deleteProduct = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert('Produk berhasil dihapus!');

        // Refresh tabel
        await fetchProducts();
        renderCMSProducts();
    } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
    }
};

// Handle Submit Testimonial
document.getElementById('form-testimonial')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('testimonial-text').value;

    try {
        const response = await fetch('/api/testimonials', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ text })
        });

        // Cek apakah responnya JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Gagal mengirim testimoni');
            
            alert('Testimoni Anda berhasil dikirim!');
            document.getElementById('form-testimonial').reset();
            await fetchTestimonials();
        } else {
            // Jika bukan JSON (kemungkinan server belum di-restart atau error 404)
            const textError = await response.text();
            console.error("Server Error:", textError);
            throw new Error("Server tidak memberikan respon yang valid. Silakan restart backend server Anda.");
        }
    } catch (error) {
        alert(error.message);
    }
});

// =========================
// SERVICE ADDRESS MODAL
// =========================
const serviceAddresses = {
    'HARCO': {
        name: 'ITKLIK HARCO MANGGA DUA',
        address: 'Ruko Harco Mangga Dua Blok G3A, Jl. Mangga Dua Raya, RW. 11, Mangga Dua Selatan, Kecamatan Sawah Besar, Kota Jakarta Pusat, DKI Jakarta 10730',
        mapUrl: 'https://maps.google.com/maps?q=Ruko+Harco+Mangga+Dua+Blok+G3A&t=&z=16&ie=UTF8&iwloc=&output=embed',
        googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Ruko+Harco+Mangga+Dua+Blok+G3A'
    },
    'KEIAI': {
        name: 'ITKLIK WISMA KEIAI',
        address: 'Wisma Keiai Lt. 1 Jl. Jenderal Sudirman Kav. 3 Jakarta Pusat - Dki Jakarta 10220',
        mapUrl: 'https://maps.google.com/maps?q=Wisma+Keiai+Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed',
        googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Wisma+Keiai+Jakarta'
    },
    'CIKARANG': {
        name: 'ITKLIK CIKARANG (ASP)',
        address: 'Dedicated ASP Cikarang, Ruko Metro Boulevard B1 Jababeka Cikarang 17530',
        mapUrl: 'https://maps.google.com/maps?q=Ruko+Metro+Boulevard+B1+Jababeka+Cikarang&t=&z=16&ie=UTF8&iwloc=&output=embed',
        googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Ruko+Metro+Boulevard+B1+Jababeka+Cikarang'
    }
};

window.showServiceAddress = function(branch) {
    const data = serviceAddresses[branch];
    if (!data) return;

    document.getElementById('service-branch-name').innerText = data.name;
    document.getElementById('service-address-text').innerText = data.address;
    document.getElementById('service-map-iframe').src = data.mapUrl;
    document.getElementById('service-google-maps-link').href = data.googleMapsLink;

    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();
};

window.showContact = function() {
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
};
