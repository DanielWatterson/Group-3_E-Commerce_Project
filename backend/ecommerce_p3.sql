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
  CONSTRAINT chk_quantity_nonnegative CHECK (quantity >= 0)
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

CREATE TABLE `orders` (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') 
  DEFAULT 'pending',
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
  ON DELETE CASCADE  -- If customer deleted, delete their orders
);

CREATE TABLE `order_items` (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
  CONSTRAINT chk_order_quantity_positive CHECK (quantity > 0)
);

INSERT INTO `e_commerce`.`orders` (`customer_id`) VALUES (2);
INSERT INTO `e_commerce`.`orders` (`customer_id`) VALUES (3);
INSERT INTO `e_commerce`.`orders` (`customer_id`) VALUES (1);

INSERT INTO `e_commerce`.`order_items` (`order_id`, `product_id`, `quantity`) VALUES (1, 2, 2);
INSERT INTO `e_commerce`.`order_items` (`order_id`, `product_id`, `quantity`) VALUES (2, 3, 1);
INSERT INTO `e_commerce`.`order_items` (`order_id`, `product_id`, `quantity`) VALUES (3, 1, 3);

CREATE TABLE `payments` (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT chk_payment_amount_positive CHECK (amount > 0)
  );
  
INSERT INTO payments (order_id, amount, payment_status, payment_method) 
VALUES 
(1, 7999.98, 'completed', 'credit_card'),
(2, 4999.99, 'failed', 'paypal'),
(3, 8999.97, 'pending', 'bank_transfer');

CREATE INDEX idx_order_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_payments_order ON payments(order_id);