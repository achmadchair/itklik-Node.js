CREATE DATABASE IF NOT EXISTS `itklik_db`;
USE `itklik_db`;

-- Tabel Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','guest') DEFAULT 'guest',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password untuk akun default adalah 'password123' yang sudah di-hash bcrypt
INSERT IGNORE INTO `users` (`username`, `password`, `role`) VALUES
('superadmin', '$2b$10$Wvw/Yh1LhN6kO3NfH0x2.eo9Bq/S/YI4K4hB2bJ3uD0K/bL4Z/vN6', 'superadmin'),
('admin', '$2b$10$Wvw/Yh1LhN6kO3NfH0x2.eo9Bq/S/YI4K4hB2bJ3uD0K/bL4Z/vN6', 'admin'),
('guest_user', '$2b$10$Wvw/Yh1LhN6kO3NfH0x2.eo9Bq/S/YI4K4hB2bJ3uD0K/bL4Z/vN6', 'guest');

-- Tabel Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `products` (`id`, `name`, `category`, `price`, `imageUrl`) VALUES
(1, 'Epson L3210 EcoTank', 'Printer', 2150000.00, '/img/products/M3170.jpeg'),
(2, 'Epson L121', 'Printer', 1550000.00, '/img/products/shopping.webp'),
(3, 'Tinta Epson 003 Black', 'Ink', 85000.00, '/img/products/ink.avif'),
(4, 'Tinta Epson 664 Color', 'Ink', 90000.00, '/img/products/shopping (1).webp'),
(5, 'Epson EB-X51', 'Projector', 6200000.00, '/img/products/shopping (2).webp'),
(6, 'Epson Perfection V39', 'Scanner', 1450000.00, '/img/products/shopping (2).webp');

-- Tabel Testimonials
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `testimonials` (`username`, `text`) VALUES
('Aprillia', 'Good website and original product!'),
('Vani', 'Best products.'),
('Ulfa', 'Original product and official warranty.');
