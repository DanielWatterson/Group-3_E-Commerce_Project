CREATE DATABASE  IF NOT EXISTS `e_commerce` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `e_commerce`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: e_commerce
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(45) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `chk_email_format` CHECK ((`email` like _utf8mb4'%@%.%'))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Marie','cutemarie@gmail.com','Im@tHeb3acH'),(2,'Ronald','shadowdweller123456789@gmail.com','@bys$SeAleD1'),(3,'Ian','ianskywalker22@gmail.com','@walker0fTh3$ky');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `order_audit`
--

DROP TABLE IF EXISTS `order_audit`;
/*!50001 DROP VIEW IF EXISTS `order_audit`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `order_audit` AS SELECT 
 1 AS `order_id`,
 1 AS `customer_name`,
 1 AS `email`,
 1 AS `original_total`,
 1 AS `discount_percent`,
 1 AS `discount_amount`,
 1 AS `final_total`,
 1 AS `order_status`,
 1 AS `order_date`,
 1 AS `items_count`,
 1 AS `products`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,2,'2026-02-27 12:25:05'),(2,2,3,1,'2026-02-27 12:25:05'),(3,3,5,1,'2026-02-27 12:25:05');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `order_status` enum('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',
  `original_total` decimal(10,2) NOT NULL,
  `final_total` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `idx_order_customer` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'paid',7999.98,5199.99,35.00,2800.00,'2026-02-27 12:25:04'),(2,2,'pending',4999.99,3999.99,20.00,1000.00,'2026-02-27 12:25:04'),(3,3,'paid',2999.99,2549.99,15.00,450.00,'2026-02-27 12:25:04');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `refund_id` varchar(100) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_status` enum('pending','completed','failed') DEFAULT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `idx_payments_order` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,5199.99,'payfast','completed',NULL,NULL,NULL,'2026-02-27 12:25:05'),(2,2,4999.99,'paypal','pending',NULL,NULL,NULL,'2026-02-27 12:25:05'),(3,3,2999.99,'credit_card','failed','1',2999.99,'pending','2026-02-27 12:25:05');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(45) NOT NULL,
  `description` text,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `has_warranty` tinyint(1) DEFAULT '0',
  `warranty_period_months` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `chk_price_positive` CHECK ((`product_price` > 0)),
  CONSTRAINT `chk_quantity_nonnegative` CHECK ((`quantity` >= 0)),
  CONSTRAINT `chk_stock_alert` CHECK ((`quantity` >= 0)),
  CONSTRAINT `chk_warranty_period` CHECK ((`warranty_period_months` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Standard Wooden Desk - Everyday Ready','A sturdy, classic wooden desk perfect for home offices. Features a smooth writing surface and a small drawer for storage. Available in oak, walnut, and cherry finishes.',1999.99,50,'https://i.postimg.cc/WpZcmGy7/cleaned-Generated-Image-September-25-2025-2-45PM-1.webp',1,12,1,NULL),(2,'Premium Wooden Desk - Office Ready','Executive-style desk with premium hardwood construction. Includes cable management, three drawers, and a scratch-resistant finish. Perfect for professional environments.',2499.99,0,'https://i.postimg.cc/65NJM7s0/Maluti-Lshape-desk-02.jpg',1,24,1,NULL),(3,'Deluxe Wooden Desk - Gaming Ready','Designed for gamers! Features RGB lighting, headphone hook, cup holder, and reinforced frame supporting up to 100kg. Includes a free mouse pad.',4649.99,40,'https://i.postimg.cc/gchbyV7H/sa301e109aeb9462384c4e91da0ab1c383-500x500.webp',1,24,1,NULL),(4,'Wooden Coasters 4set','Set of 4 handcrafted wooden coasters. Protects surfaces from water rings and heat. Each coaster is unique with natural wood grain patterns.',299.99,100,'https://i.postimg.cc/N0ndTHY2/Kanso-Nat-Ash-Wd-Cstrs-S4AVSSF24-web-pdp-main-carousel-med.jpg',0,NULL,1,NULL),(5,'Small Wooden Statuette','Hand-carved animal figurine. Perfect for desk decoration or as a thoughtful gift. Each piece is unique due to handcrafting process.',199.99,20,'https://i.postimg.cc/25Z2X079/animals-wooden-figurines-handmade-animal-260nw-2259268799.jpg',0,NULL,1,NULL),(6,'Medium Wooden Statuette','Intricately carved medium-sized figurine. Features detailed craftsmanship and smooth finish. Makes a beautiful display piece.',499.99,10,'https://i.postimg.cc/TwvC8ntj/handmade-wooden-figurine-on-black-260nw-2291672301.jpg',1,6,1,NULL),(7,'Large Wooden Statuette','Statement piece hand-carved from solid wood. Stands approximately 12 inches tall. A true artisan creation.',954.99,7,'https://i.postimg.cc/zvZRYJwK/il-fullxfull-6542577593-bmuv.jpg',1,12,1,NULL),(8,'Wooden Tableware Collection','Eco-friendly disposable wooden plates, bowls, and cutlery. Perfect for parties, picnics, and sustainable living. Biodegradable and compostable.',84.99,60,'https://i.postimg.cc/63xYsCMd/collection-wooden-tableware-including-plate-260nw-2698937855-(1).jpg',0,NULL,1,NULL),(9,'Wooden Cutting Board','Durable acacia wood cutting board. Reversible design with juice groove on one side. Naturally antibacterial and easy to maintain.',109.99,80,'https://i.postimg.cc/zfr06ntk/360-F-348145814-uhi0Hau-E2L6df-O4KRq-Ajgne4TCfj7Acr.jpg',0,NULL,1,NULL),(10,'Standard Wooden Table','Versatile dining table made from solid pine. Seats 4-6 people. Assembly required. Available in natural or stained finishes.',1499.99,50,'https://i.postimg.cc/5ydpKW6T/wooden-table-20792188.jpg',1,24,1,NULL),(11,'Standard Wooden Chair','Comfortable dining chair with contoured seat and back. Solid wood construction with reinforced joints. Sold in sets of 2.',499.99,120,'https://i.postimg.cc/k4PfrWTv/wooden-cross-back-chair-260nw-2683424195.jpg',1,24,1,NULL),(12,'Standard Wooden Bench','Beautiful garden or entryway bench made from weather-resistant teak. Seats 2-3 people. Perfect for outdoor or indoor use.',8999.99,50,'https://i.postimg.cc/4dRBCpWb/beautiful-wooden-decorative-bench-city-260nw-2301571797.jpg',1,36,1,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `order_audit`
--

/*!50001 DROP VIEW IF EXISTS `order_audit`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `order_audit` AS select `o`.`order_id` AS `order_id`,`c`.`customer_name` AS `customer_name`,`c`.`email` AS `email`,`o`.`original_total` AS `original_total`,`o`.`discount_percent` AS `discount_percent`,`o`.`discount_amount` AS `discount_amount`,`o`.`final_total` AS `final_total`,`o`.`order_status` AS `order_status`,`o`.`order_date` AS `order_date`,count(`oi`.`order_item_id`) AS `items_count`,group_concat(`p`.`product_name` separator ', ') AS `products` from (((`orders` `o` join `customer` `c` on((`o`.`customer_id` = `c`.`customer_id`))) left join `order_items` `oi` on((`o`.`order_id` = `oi`.`order_id`))) left join `products` `p` on((`oi`.`product_id` = `p`.`product_id`))) group by `o`.`order_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-27 12:25:18
