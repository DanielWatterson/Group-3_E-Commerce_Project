DROP SCHEMA IF EXISTS `e_commerce` ;

CREATE SCHEMA IF NOT EXISTS `e_commerce` ;
USE `e_commerce` ;

CREATE TABLE `customer` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`customer_id`),
  CONSTRAINT chk_email_format CHECK (email LIKE '%@%.%')
);
  
  CREATE TABLE `products` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(45) NOT NULL,
  `product_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `image_url` VARCHAR(500),
  `has_warranty` BOOLEAN DEFAULT FALSE, 
  `warranty_period_months` INT DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT chk_price_positive CHECK (product_price > 0),
  CONSTRAINT chk_quantity_nonnegative CHECK (quantity >= 0),
  CONSTRAINT chk_stock_alert CHECK (quantity >= 0),
  CONSTRAINT chk_warranty_period CHECK (warranty_period_months >= 0)
  );
  
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) 
VALUES ('Marie', 'cutemarie@gmail.com', 'Im@tHeb3acH');
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) 
VALUES ('Ronald', 'shadowdweller123456789@gmail.com', '@bys$SeAleD1');
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) 
VALUES ('Ian', 'ianskywalker22@gmail.com', '@walker0fTh3$ky');

INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`, `has_warranty`, `warranty_period_months`) 
VALUES
('Standard Wooden Desk - Everyday Ready', 1999.99, 50, 'https://i.postimg.cc/WpZcmGy7/cleaned-Generated-Image-September-25-2025-2-45PM-1.webp', TRUE, 12),
('Premium Wooden Desk - Office Ready', 2499.99, 0, 'https://i.postimg.cc/65NJM7s0/Maluti-Lshape-desk-02.jpg', TRUE, 24),
('Deluxe Wooden Desk - Gaming Ready', 4649.99, 40, 'https://i.postimg.cc/gchbyV7H/sa301e109aeb9462384c4e91da0ab1c383-500x500.webp', TRUE, 24),
('Wooden Coasters 4set', 299.99, 100, 'https://i.postimg.cc/N0ndTHY2/Kanso-Nat-Ash-Wd-Cstrs-S4AVSSF24-web-pdp-main-carousel-med.jpg', FALSE, NULL),
('Small Wooden Statuette', 199.99, 20, 'https://i.postimg.cc/25Z2X079/animals-wooden-figurines-handmade-animal-260nw-2259268799.jpg', FALSE, NULL),
('Medium Wooden Statuette', 499.99, 10, 'https://i.postimg.cc/TwvC8ntj/handmade-wooden-figurine-on-black-260nw-2291672301.jpg', TRUE, 6),
('Large Wooden Statuette', 954.99, 7, 'https://i.postimg.cc/zvZRYJwK/il-fullxfull-6542577593-bmuv.jpg', TRUE, 12),
('Wooden tableware collection', 84.99, 60, 'https://i.postimg.cc/63xYsCMd/collection-wooden-tableware-including-plate-260nw-2698937855-(1).jpg', FALSE, NULL),
('Wooden Cutting Board', 109.99, 80, 'https://i.postimg.cc/zfr06ntk/360-F-348145814-uhi0Hau-E2L6df-O4KRq-Ajgne4TCfj7Acr.jpg', FALSE, NULL),
('Standard Wooden Table', 1499.99, 50, 'https://i.postimg.cc/5ydpKW6T/wooden-table-20792188.jpg', TRUE, 24),
('Standard Wooden Chair', 499.99, 120, 'https://i.postimg.cc/k4PfrWTv/wooden-cross-back-chair-260nw-2683424195.jpg', TRUE, 24),
('Standard Wooden Bench', 8999.99, 50, 'https://i.postimg.cc/4dRBCpWb/beautiful-wooden-decorative-bench-city-260nw-2301571797.jpg', TRUE, 36);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',
  original_total DECIMAL(10,2) NOT NULL,
  final_total DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

INSERT INTO orders (customer_id, original_total, final_total, discount_percent, discount_amount, order_status) VALUES
(1, 7999.98, 5199.99, 35.00, 2800.00, 'paid'),      
(2, 4999.99, 3999.99, 20.00, 1000.00, 'pending'),   
(3, 2999.99, 2549.99, 15.00, 450.00, 'paid'); 

CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 2),
(2, 3, 1),
(3, 5, 1);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status ENUM('pending','completed','failed') DEFAULT 'pending',
  refund_id VARCHAR(100) NULL,
  refund_amount DECIMAL(10,2) NULL,
  refund_status ENUM('pending','completed','failed') NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

INSERT INTO payments (order_id, amount, payment_method, payment_status, refund_id, refund_amount, refund_status) VALUES
(1, 5199.99, 'payfast', 'completed', NULL, NULL, NULL),
(2, 4999.99, 'paypal', 'pending', NULL, NULL, NULL),
(3, 2999.99, 'credit_card', 'failed', 1, 2999.99, 'pending');

CREATE OR REPLACE VIEW order_audit AS
SELECT 
  o.order_id,
  c.customer_name,
  c.email,
  o.original_total,
  o.discount_percent,
  o.discount_amount,
  o.final_total,
  o.order_status,
  o.order_date,
  COUNT(oi.order_item_id) as items_count,
  GROUP_CONCAT(p.product_name SEPARATOR ', ') as products
FROM orders o
JOIN customer c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.product_id
GROUP BY o.order_id;

SELECT * FROM order_audit WHERE discount_amount > 0;

CREATE INDEX idx_order_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_payments_order ON payments(order_id);