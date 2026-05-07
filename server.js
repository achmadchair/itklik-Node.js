import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/img', express.static('img'));

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'itklik_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to check License Expiry
const checkLicense = (req, res, next) => {
    const expiryDateStr = process.env.LICENSE_EXPIRY_DATE;
    if (expiryDateStr) {
        const expiryDate = new Date(expiryDateStr);
        const today = new Date();
        if (today > expiryDate) {
            return res.status(403).json({ 
                message: 'Lisensi aplikasi telah berakhir.', 
                expired: true,
                expiryDate: expiryDateStr 
            });
        }
    }
    next();
};

app.use(checkLicense);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid.' });
        req.user = user;
        next();
    });
};

// Middleware to check admin/superadmin roles
const authorizeAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki otoritas.' });
    }
};

// --- AUTH ROUTES --- //

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'guest'; // Default role
        
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, userRole]
        );
        res.status(201).json({ message: 'Registrasi berhasil', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(400).json({ message: 'Username atau password salah' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Username atau password salah' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'supersecret',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login berhasil', token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// --- PRODUCT ROUTES --- //

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk', error: error.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail produk', error: error.message });
    }
});

// Add new product (Admin Only)
app.post('/api/products', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, category, price, imageUrl, description } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, category, price, imageUrl, description) VALUES (?, ?, ?, ?, ?)',
            [name, category, price, imageUrl, description]
        );
        res.status(201).json({ message: 'Produk berhasil ditambahkan', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah produk', error: error.message });
    }
});

// Update product (Admin Only)
app.put('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, category, price, imageUrl, description } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE products SET name=?, category=?, price=?, imageUrl=?, description=? WHERE id=?',
            [name, category, price, imageUrl, description, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate produk', error: error.message });
    }
});

// Delete product (Admin Only)
app.delete('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id=?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk', error: error.message });
    }
});

// --- LICENSE CHECK --- //
app.get('/api/check-license', checkLicense, (req, res) => {
    res.json({ status: 'ok', message: 'Lisensi aktif' });
});

// --- TESTIMONIAL ROUTES --- //

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const [testimonials] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data testimoni', error: error.message });
    }
});

// Add new testimonial (Any Logged In User)
app.post('/api/testimonials', authenticateToken, async (req, res) => {
    const { text } = req.body;
    const username = req.user.username; // Ambil dari token JWT
    try {
        const [result] = await pool.query(
            'INSERT INTO testimonials (username, text) VALUES (?, ?)',
            [username, text]
        );
        res.status(201).json({ message: 'Testimoni berhasil ditambahkan', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah testimoni', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
