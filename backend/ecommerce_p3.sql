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
  PRIMARY KEY (`product_id`),
  CONSTRAINT chk_price_positive CHECK (product_price > 0),
  CONSTRAINT chk_quantity_nonnegative CHECK (quantity >= 0),
  CONSTRAINT chk_stock_alert CHECK (quantity >= 0)
  );
  
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) 
VALUES ('Marie', 'cutemarie@gmail.com', 'Im@tHeb3acH');
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) 
VALUES ('Ronald', 'shadowdweller123456789@gmail.com', '@bys$SeAleD1');
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) 
VALUES ('Ian', 'ianskywalker22@gmail.com', '@walker0fTh3$ky');

INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`)
VALUES ( 'Basic Wooden Desk', 2999.99 , 75,'https://i.postimg.cc/5t16MvWb/shopping-q-tbn-ANd9Gc-TRs5F-MWYt-JXAX6Rdjg6-dwiyjh-Iy-XT2w0Erp-Cd-QKv-Dc-QJ0XUKq7ka-Nb-Hx-IQJVc-Wtdt.webp');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ( 'Standard Wooden Desk', 3999.99, 50,'https://i.postimg.cc/mDgkPsrX/images-q-tbn-ANd9Gc-Tg-PNm-IErf-Jk2vf-Dd-NN7hko-Z-4so-FM5evu-Mk-A-s.jpg');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ( 'Premium Wooden Desk', 4999.99, 25,'https://i.postimg.cc/1t3X8Qz6/images-q-tbn-ANd9Gc-SDE6s-Ov-Gxh-E-Byn8q2Xcxk-Vo0PZ7w-W49Ef-Q-s.jpg');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ( 'Deluxe Wooden Desk', 5999.99, 40,'https://i.postimg.cc/6Q0T63B5/images-q-tbn-ANd9Gc-Qk-Oen9l-Xj7Kqh-BNqo-H3Zy-G72FUc-Y6t-GJQw-Tw-s.jpg');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ('Custom Desk - Entry', 2999.99, 35,'https://i.postimg.cc/KYr1PM03/custom-basic-desk.png' );
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ('Custom Desk - Basic', 3999.99, 30,'https://i.postimg.cc/KYr1PM03/custom-basic-desk.png');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ('Custom Desk - Plus', 4999.99, 25,'https://i.postimg.cc/KYr1PM03/custom-basic-desk.png');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ('Custom Desk - Pro', 5999.99, 20 ,'https://i.postimg.cc/cHycHwrx/custom-pro-desk.png');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ('Custom Desk - Elite', 6999.99, 15,'https://i.postimg.cc/cHycHwrx/custom-pro-desk.png');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`)
VALUES ('Custom Desk - Premium', 7999.99, 10,'https://i.postimg.cc/cHycHwrx/custom-pro-desk.png');
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`, `image_url`) 
VALUES ('Custom Desk - Luxury', 8999.99, 20,'https://i.postimg.cc/cHycHwrx/custom-pro-desk.png');

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
(1, 7999.98, 5199.99, 35.00, 2800.00, 'paid'),      -- Over R5,000 = 35%
(2, 4999.99, 3999.99, 20.00, 1000.00, 'pending'),   -- R4,000-R5,000 = 20%
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