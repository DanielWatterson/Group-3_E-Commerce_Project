DROP SCHEMA IF EXISTS `e_commerce` ;

CREATE SCHEMA IF NOT EXISTS `e_commerce` ;
USE `e_commerce` ;

CREATE TABLE `customer` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
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
  PRIMARY KEY (`product_id`));
  
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) VALUES ('Marie', 'cutemarie@gmail.com', 'Im@tHeb3acH');
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) VALUES ('Ronald', 'shadowdweller123456789@gmail.com', '@bys$SeAleD1');
INSERT INTO `e_commerce`.`customer` (`customer_name`, `email`, `password`) VALUES ('Ian', 'ianskywalker22@gmail.com', '@walker0fTh3$ky');

INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`) VALUES ( 'software', 49.99 , 100);
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`) VALUES ( 'ai chatbot', 99.99, 50);
INSERT INTO `e_commerce`.`products` (`product_name`, `product_price`, `quantity`) VALUES ( 'code', 149.99, 12);

CREATE TABLE `orders` (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') 
  DEFAULT 'pending',
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE `order_items` (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO `e_commerce`.`orders` (`customer_id`) VALUES (2);
INSERT INTO `e_commerce`.`orders` (`customer_id`) VALUES (3);
INSERT INTO `e_commerce`.`orders` (`customer_id`) VALUES (1);

INSERT INTO `e_commerce`.`order_items` (`order_id`, `product_id`, `quantity`) VALUES (1, 2, 20);
INSERT INTO `e_commerce`.`order_items` (`order_id`, `product_id`, `quantity`) VALUES (2, 3, 10);
INSERT INTO `e_commerce`.`order_items` (`order_id`, `product_id`, `quantity`) VALUES (3, 1, 5);

CREATE TABLE `payments` (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

INSERT INTO payments (order_id, amount, payment_status, payment_method) 
VALUES (1, 49.99, 'completed', 'credit_card');

INSERT INTO payments (order_id, amount, payment_status, payment_method) 
VALUES (2, 99.99, 'failed', 'paypal');

INSERT INTO payments (order_id, amount, payment_status, payment_method) 
VALUES (3, 149.99, 'pending', 'bank_transfer');

