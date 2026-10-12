-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: sathya_dbd
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `actual_budget`
--

DROP TABLE IF EXISTS `actual_budget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actual_budget` (
  `id` int NOT NULL AUTO_INCREMENT,
  `overhead_id` int NOT NULL,
  `po_budget_id` int NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `difference_value` decimal(15,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `splitted_budget` decimal(15,2) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `overhead_id` (`overhead_id`),
  KEY `po_budget_id` (`po_budget_id`),
  CONSTRAINT `actual_budget_ibfk_1` FOREIGN KEY (`overhead_id`) REFERENCES `overhead` (`id`),
  CONSTRAINT `actual_budget_ibfk_2` FOREIGN KEY (`po_budget_id`) REFERENCES `po_budget` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actual_budget`
--

LOCK TABLES `actual_budget` WRITE;
/*!40000 ALTER TABLE `actual_budget` DISABLE KEYS */;
INSERT INTO `actual_budget` VALUES (1,1,2,NULL,NULL,NULL,'2025-10-25 11:04:51',21150.00,'system','2025-10-25 11:06:39'),(2,2,2,NULL,NULL,NULL,'2025-10-25 11:04:51',70000.00,'system','2025-10-25 11:06:39'),(3,3,2,NULL,NULL,NULL,'2025-10-25 11:04:51',110000.00,'system','2025-10-25 11:06:39');
/*!40000 ALTER TABLE `actual_budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actual_budget_edit_history`
--

DROP TABLE IF EXISTS `actual_budget_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actual_budget_edit_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actual_budget_history_id` bigint NOT NULL,
  `actual_budget_id` int NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `actual_budget_history_id` (`actual_budget_history_id`),
  CONSTRAINT `actual_budget_edit_history_ibfk_1` FOREIGN KEY (`actual_budget_history_id`) REFERENCES `actual_budget_history` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actual_budget_edit_history`
--

LOCK TABLES `actual_budget_edit_history` WRITE;
/*!40000 ALTER TABLE `actual_budget_edit_history` DISABLE KEYS */;
INSERT INTO `actual_budget_edit_history` VALUES (1,1,3,50.00,'50 used','2',NULL,'2025-10-03 09:49:28','2025-10-03 09:49:28'),(2,1,3,55.00,'55 used','2','2','2025-10-03 09:49:28','2025-10-03 09:50:14'),(3,1,3,54.00,'54 used','2','2','2025-10-03 09:49:28','2025-10-03 09:50:58'),(4,1,3,100.00,'100 used','2','2','2025-10-03 09:49:28','2025-10-03 09:51:24'),(5,1,3,23.00,'23 litre used','2','2','2025-10-03 09:49:28','2025-10-03 09:58:00'),(6,2,3,10.00,'10 remarks','2',NULL,'2025-10-06 08:33:04','2025-10-06 08:33:04'),(7,3,3,50.00,NULL,'7',NULL,'2025-10-07 06:26:23','2025-10-07 06:26:23'),(8,5,4,100.00,'spended','7',NULL,'2025-10-24 10:09:04','2025-10-24 10:09:04'),(9,5,4,120.00,'spended','7','7','2025-10-24 10:09:04','2025-10-24 10:09:21'),(10,4,3,6000.00,'6000 spend','7',NULL,'2025-10-24 10:08:50','2025-10-24 10:08:50');
/*!40000 ALTER TABLE `actual_budget_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actual_budget_history`
--

DROP TABLE IF EXISTS `actual_budget_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actual_budget_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actual_budget_id` int NOT NULL,
  `entry_date` date NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `actual_budget_id` (`actual_budget_id`),
  CONSTRAINT `actual_budget_history_ibfk_1` FOREIGN KEY (`actual_budget_id`) REFERENCES `actual_budget` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actual_budget_history`
--

LOCK TABLES `actual_budget_history` WRITE;
/*!40000 ALTER TABLE `actual_budget_history` DISABLE KEYS */;
INSERT INTO `actual_budget_history` VALUES (1,3,'2025-10-03',23.00,'23 litre used','2','2025-10-03 15:19:28','2','2025-10-03 10:00:57'),(2,3,'2025-10-06',15.00,'15 remarks','2','2025-10-06 14:03:04','2','2025-10-06 08:33:41'),(3,3,'2025-10-07',50.00,'50 rupees spend for paint brush','7','2025-10-07 11:56:23','7','2025-10-07 06:26:42'),(4,3,'2025-10-24',3600.00,'used','7','2025-10-24 15:38:50','7','2025-10-24 10:35:20'),(5,4,'2025-10-24',130.00,'spend','7','2025-10-24 15:39:04','7','2025-10-24 10:09:50');
/*!40000 ALTER TABLE `actual_budget_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'Coimbatore'),(2,'Perundurai');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `company_id` varchar(30) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `spoc_name` varchar(100) DEFAULT NULL,
  `spoc_contact_no` varchar(20) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`company_id`),
  KEY `fk_city` (`city_id`),
  KEY `fk_state` (`state_id`),
  CONSTRAINT `fk_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`),
  CONSTRAINT `fk_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES ('CO001','Jay Jay Mills (India) Private Ltd.,','Sipcot Industrial Growth centre, K-32, Perundurai, Tamil Nadu 638052','Gunasekar','914294234015','33AAACJ7915N1ZB','998717',2,1,'638052','2025-08-25 05:02:52','2025-08-25 05:02:52',NULL,NULL),('CO002','KGISL','Saravanampatti','Suresh','9484904147','ABC2109345STC23','3456',NULL,1,'641035','2025-09-03 04:41:57','2025-09-03 04:41:57',NULL,NULL),('CO003','Test','Test','Anand','8456679112','4984894983TEST1','409872',1,1,'641 035','2025-09-10 05:45:53','2025-09-30 06:20:38',NULL,'2'),('CO004','Test II','Test Address II','sanjay','9484847473','4984894983TEST','4098659393',1,1,'4343421','2025-09-27 05:02:15','2025-10-10 00:24:32','2','2');
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_updation_history`
--

DROP TABLE IF EXISTS `company_updation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_updation_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` varchar(30) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `company_name` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `spoc_name` varchar(100) DEFAULT NULL,
  `spoc_contact_no` varchar(20) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `company_updation_history_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_updation_history`
--

LOCK TABLES `company_updation_history` WRITE;
/*!40000 ALTER TABLE `company_updation_history` DISABLE KEYS */;
INSERT INTO `company_updation_history` VALUES (1,'CO004','2','2025-09-30 05:11:34','dummy','dummy address','sanjay','9484847473','4984894983TEST','409865',1,1,'43434','2025-09-27 05:02:15'),(2,'CO004','2','2025-09-30 05:12:02','dummy address','dummy address','sanjay','9484847473','4984894983TEST','409865',1,1,'43434','2025-09-27 05:02:15'),(3,'CO003','2','2025-09-30 06:20:38','Test','Test','Anand','8456679112','4984894983TEST','409872',1,1,'641 035','2025-09-10 05:45:53');
/*!40000 ALTER TABLE `company_updation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `completion_edit_entries_history`
--

DROP TABLE IF EXISTS `completion_edit_entries_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `completion_edit_entries_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `completion_status_id` int NOT NULL,
  `area_completed` float DEFAULT NULL,
  `rate` float DEFAULT NULL,
  `value` float DEFAULT NULL,
  `billed_area` float DEFAULT NULL,
  `billed_value` float DEFAULT NULL,
  `balance_area` float DEFAULT NULL,
  `balance_value` float DEFAULT NULL,
  `work_status` varchar(50) DEFAULT NULL,
  `billing_status` varchar(50) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `completion_status_id` (`completion_status_id`),
  CONSTRAINT `completion_edit_entries_history_ibfk_1` FOREIGN KEY (`completion_status_id`) REFERENCES `completion_status` (`completion_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `completion_edit_entries_history`
--

LOCK TABLES `completion_edit_entries_history` WRITE;
/*!40000 ALTER TABLE `completion_edit_entries_history` DISABLE KEYS */;
INSERT INTO `completion_edit_entries_history` VALUES (1,1,30,135,4050,NULL,NULL,NULL,NULL,'In Progress','Not Billed','remarks',2,'2025-10-03 10:53:34',NULL,'2025-10-03 10:53:34'),(2,1,35,135,4725,NULL,NULL,NULL,NULL,'In Progress','Not Billed','remarks',2,'2025-10-03 10:53:34',2,'2025-10-03 10:53:42'),(3,1,55,135,7425,NULL,NULL,NULL,NULL,'In Progress','Not Billed','remarks',2,'2025-10-03 10:53:34',2,'2025-10-03 10:54:15'),(4,1,65,135,8775,NULL,NULL,NULL,NULL,'In Progress','Not Billed','first remarks',2,'2025-10-03 10:53:34',2,'2025-10-06 08:54:05'),(5,2,20,10,200,NULL,NULL,NULL,NULL,'In Progress','Not Billed','dummy1 remarks',2,'2025-10-06 08:56:13',NULL,'2025-10-06 08:56:13'),(6,1,105,135,14175,NULL,NULL,NULL,NULL,'In Progress','Not Billed','first remarks',2,'2025-10-03 10:53:34',2,'2025-10-06 08:54:15'),(7,1,115,135,15525,NULL,NULL,NULL,NULL,'In Progress','Not Billed','10 completed',7,'2025-10-03 10:53:34',2,'2025-10-07 06:45:40'),(8,1,135,135,18225,NULL,NULL,NULL,NULL,'In Progress','Not Billed','completed 20',7,'2025-10-03 10:53:34',2,'2025-10-07 06:46:51');
/*!40000 ALTER TABLE `completion_edit_entries_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `completion_entries_history`
--

DROP TABLE IF EXISTS `completion_entries_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `completion_entries_history` (
  `entry_id` bigint NOT NULL AUTO_INCREMENT,
  `rec_id` int NOT NULL,
  `entry_date` date NOT NULL,
  `area_added` decimal(10,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `value_added` decimal(10,2) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_rec_id_entry_date` (`rec_id`,`entry_date`),
  CONSTRAINT `completion_entries_history_ibfk_1` FOREIGN KEY (`rec_id`) REFERENCES `po_reckoner` (`rec_id`),
  CONSTRAINT `completion_entries_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `completion_entries_history`
--

LOCK TABLES `completion_entries_history` WRITE;
/*!40000 ALTER TABLE `completion_entries_history` DISABLE KEYS */;
INSERT INTO `completion_entries_history` VALUES (1,4,'2025-10-03',55.00,135.00,4050.00,2,'2025-10-03 16:23:34','remarks2'),(2,4,'2025-10-06',50.00,135.00,1350.00,2,'2025-10-06 14:24:05','correct secondremarks'),(3,13,'2025-10-06',30.00,10.00,200.00,2,'2025-10-06 14:26:13','dummy2 remarks'),(4,10,'2025-10-07',10.00,100.00,1000.00,7,'2025-10-07 09:50:23','remarks for 10'),(5,4,'2025-10-07',10.00,135.00,1350.00,7,'2025-10-07 12:15:40','10 completed'),(6,4,'2025-10-07',20.00,135.00,2700.00,7,'2025-10-07 12:16:51','completed 20'),(7,4,'2025-10-07',10.00,135.00,1350.00,7,'2025-10-07 12:17:58','10 completed');
/*!40000 ALTER TABLE `completion_entries_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `completion_status`
--

DROP TABLE IF EXISTS `completion_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `completion_status` (
  `completion_id` int NOT NULL AUTO_INCREMENT,
  `rec_id` int DEFAULT NULL,
  `area_completed` float DEFAULT NULL,
  `rate` float DEFAULT NULL,
  `value` float DEFAULT NULL,
  `billed_area` float DEFAULT NULL,
  `billed_value` float DEFAULT NULL,
  `balance_area` float DEFAULT NULL,
  `balance_value` float DEFAULT NULL,
  `work_status` varchar(50) DEFAULT NULL,
  `billing_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`completion_id`),
  KEY `rec_id` (`rec_id`),
  KEY `fk_created_by` (`created_by`),
  CONSTRAINT `completion_status_ibfk_1` FOREIGN KEY (`rec_id`) REFERENCES `po_reckoner` (`rec_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `completion_status`
--

LOCK TABLES `completion_status` WRITE;
/*!40000 ALTER TABLE `completion_status` DISABLE KEYS */;
INSERT INTO `completion_status` VALUES (1,4,145,135,19575,NULL,NULL,NULL,NULL,'In Progress','Not Billed','2025-10-03 10:53:34',7,2,'2025-10-07 06:47:58','10 completed'),(2,13,30,10,300,NULL,NULL,NULL,NULL,'In Progress','Not Billed','2025-10-06 08:56:13',2,2,'2025-10-06 08:56:24','dummy1 remarks'),(3,10,10,100,1000,NULL,NULL,NULL,NULL,'In Progress','Not Billed','2025-10-07 04:20:23',7,NULL,'2025-10-07 04:20:23','remarks for 10');
/*!40000 ALTER TABLE `completion_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consumables_master`
--

DROP TABLE IF EXISTS `consumables_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumables_master` (
  `consumable_id` int NOT NULL AUTO_INCREMENT,
  `consumable_name` varchar(50) NOT NULL,
  PRIMARY KEY (`consumable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumables_master`
--

LOCK TABLES `consumables_master` WRITE;
/*!40000 ALTER TABLE `consumables_master` DISABLE KEYS */;
INSERT INTO `consumables_master` VALUES (1,'Grinding Machine'),(2,'Paint mixing machine'),(3,'Paint Brush'),(4,'Spike Roller Paint'),(5,'Trowel');
/*!40000 ALTER TABLE `consumables_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor`
--

DROP TABLE IF EXISTS `contractor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contractor_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor`
--

LOCK TABLES `contractor` WRITE;
/*!40000 ALTER TABLE `contractor` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `description_of_work`
--

DROP TABLE IF EXISTS `description_of_work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `description_of_work` (
  `item_id` varchar(30) NOT NULL,
  `item_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `description_of_work`
--

LOCK TABLES `description_of_work` WRITE;
/*!40000 ALTER TABLE `description_of_work` DISABLE KEYS */;
INSERT INTO `description_of_work` VALUES ('Item-1','Sticker for cooling water supply'),('Item-10','Sticker for Non Peso Tank'),('Item-11','Sticker for Holding Tank'),('Item-12','Structural Painting Work'),('Item-13','Nitrogen 2 coat redoxide + Canary Yellow'),('Item-14','Raw water 2 coat redoxide + sea green'),('Item-15','PSV quench 2 coat redoxide + black'),('Item-16','Vacuum White'),('Item-17','Plant Air 2 coat redoxide + sky blue'),('Item-18','Structural paint incl cleaner 2 coat paint'),('Item-19','Air line 1 coat blue'),('Item-2','Sticker for cooling water return'),('Item-20','Cooling water line 1 coat dark green'),('Item-21','Raw water line 1 coat sea green'),('Item-22','Structural line painting'),('Item-23','Primer coating with supply'),('Item-24','Cooling water line painting'),('Item-25','Chilled water line painting'),('Item-26','Chilled brine line painting'),('Item-27','Nitrogen line painting'),('Item-28','Process water line painting work'),('Item-29','PSV line painting'),('Item-3','Sticker for process water'),('Item-30','Eye wash shower line'),('Item-31','Raw water line'),('Item-32','Instrument air line'),('Item-33','Plant air line painting'),('Item-34','LP Steam line painting work'),('Item-35','MP Stam line painting'),('Item-36','HSD line painting work'),('Item-37','Cooling water band supply and pasting'),('Item-38','Chilled water band supply and pasting'),('Item-39','Chilled brine band supply and pasting'),('Item-4','Sticker for Eye wash'),('Item-40','Nitrogen bank supply and pasting'),('Item-41','Process water band supply and pasting'),('Item-42','PSV band supply and pasting'),('Item-43','Eye wash shower band supply and pasting'),('Item-44','Raw water band supply and pasting'),('Item-45','Instrument air band supply and pasting'),('Item-46','Plant air band supply and pasting'),('Item-47','LP Steam bank supply and pasting'),('Item-48','MP Steam band supply and pasting'),('Item-49','HSD Bank supply and pasting'),('Item-5','Sticker for High speed diesel'),('Item-50','1\" Line arrow supply and pasting'),('Item-51','1.5\" line arrow supply and pasting'),('Item-52','2\" line arrow supply and pasting'),('Item-53','3\" line arrow supply and pasting'),('Item-54','4\" line arrow supply and pasting'),('Item-55','6\" line arrow supply and pasting'),('Item-56','8\" line arrow supply and pasting'),('Item-57','10\" line arrow supply and pasting'),('Item-58','12\" line arrow supply and pasting'),('Item-59','1\" line font stickering work'),('Item-6','Sticker for Vaccum'),('Item-60','1.5\" line font stickering work'),('Item-61','2\" line font stickering work'),('Item-62','3\" line font stickering work'),('Item-63','4\" line font stickering work'),('Item-64','6\" line font stickering work'),('Item-65','8\" line font stickering work'),('Item-66','10\" line font stickering work'),('Item-67','12\" line font stickering work'),('Item-7','Sticker for scrubber'),('Item-8','Sticker for LEV Scrubber'),('Item-9','Sticker for Peso Tank');
/*!40000 ALTER TABLE `description_of_work` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_master`
--

DROP TABLE IF EXISTS `driver_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_name` varchar(255) DEFAULT NULL,
  `driver_mobile` varchar(20) DEFAULT NULL,
  `driver_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_master`
--

LOCK TABLES `driver_master` WRITE;
/*!40000 ALTER TABLE `driver_master` DISABLE KEYS */;
INSERT INTO `driver_master` VALUES (1,'raj','9483948373','chennai'),(3,'tharun','958398394','gandhipuram'),(4,'prasanth','9483948384','example address'),(5,'hari','88849483423','example'),(6,'ram','9484939483','pn palayam');
/*!40000 ALTER TABLE `driver_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_department`
--

DROP TABLE IF EXISTS `emp_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_department`
--

LOCK TABLES `emp_department` WRITE;
/*!40000 ALTER TABLE `emp_department` DISABLE KEYS */;
INSERT INTO `emp_department` VALUES (1,'Engineering'),(2,'Management'),(3,'Accounts'),(4,'HR Management'),(5,'Marketing');
/*!40000 ALTER TABLE `emp_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_designation`
--

DROP TABLE IF EXISTS `emp_designation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_designation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `designation` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_designation`
--

LOCK TABLES `emp_designation` WRITE;
/*!40000 ALTER TABLE `emp_designation` DISABLE KEYS */;
INSERT INTO `emp_designation` VALUES (1,'Site Supervisor'),(2,'Accountant'),(3,'HR Manager'),(5,'Marketing Executive'),(6,'Site Engineer'),(7,'Labour');
/*!40000 ALTER TABLE `emp_designation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_gender`
--

DROP TABLE IF EXISTS `emp_gender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_gender` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gender` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_gender`
--

LOCK TABLES `emp_gender` WRITE;
/*!40000 ALTER TABLE `emp_gender` DISABLE KEYS */;
INSERT INTO `emp_gender` VALUES (1,'Male'),(2,'Female'),(3,'Other');
/*!40000 ALTER TABLE `emp_gender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_status`
--

DROP TABLE IF EXISTS `emp_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_status`
--

LOCK TABLES `emp_status` WRITE;
/*!40000 ALTER TABLE `emp_status` DISABLE KEYS */;
INSERT INTO `emp_status` VALUES (1,'Active'),(2,'Inactive');
/*!40000 ALTER TABLE `emp_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_master`
--

DROP TABLE IF EXISTS `employee_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_master` (
  `emp_id` varchar(30) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `date_of_joining` date NOT NULL,
  `company` varchar(100) NOT NULL,
  `branch` varchar(50) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `company_email` varchar(100) NOT NULL,
  `current_address` varchar(255) NOT NULL,
  `permanent_address` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `gender_id` int NOT NULL,
  `dept_id` int NOT NULL,
  `emp_type_id` int NOT NULL,
  `designation_id` int NOT NULL,
  `status_id` int NOT NULL,
  `esic_number` varchar(50) DEFAULT NULL,
  `pf_number` varchar(50) DEFAULT NULL,
  `approved_salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`emp_id`),
  KEY `fk_gender` (`gender_id`),
  KEY `fk_department` (`dept_id`),
  KEY `fk_employment_type` (`emp_type_id`),
  KEY `fk_designation` (`designation_id`),
  KEY `fk_employee_status` (`status_id`),
  CONSTRAINT `fk_department` FOREIGN KEY (`dept_id`) REFERENCES `emp_department` (`id`),
  CONSTRAINT `fk_designation` FOREIGN KEY (`designation_id`) REFERENCES `emp_designation` (`id`),
  CONSTRAINT `fk_employee_status` FOREIGN KEY (`status_id`) REFERENCES `emp_status` (`id`),
  CONSTRAINT `fk_employment_type` FOREIGN KEY (`emp_type_id`) REFERENCES `employment_type` (`id`),
  CONSTRAINT `fk_gender` FOREIGN KEY (`gender_id`) REFERENCES `emp_gender` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_master`
--

LOCK TABLES `employee_master` WRITE;
/*!40000 ALTER TABLE `employee_master` DISABLE KEYS */;
INSERT INTO `employee_master` VALUES ('EMP001','Ezhavahgan','1988-07-13','2024-06-19','SathyaCoating PVT LTD','Edayarpalayam','9856741246','ezhavahgan001@sathyacoating.com','221 Chinnammal Nagar, Edayarpalayam, Vadavalli Road, Coimbatore-641041','221 Chinnammal Nagar, Edayarpalayam, Vadavalli Road, Coimbatore-641041','2025-07-29 15:57:40',1,2,1,6,1,'2-1234567890-12-0997','N/AMB/0123456/0008483',13000.00,NULL),('EMP002','ragul prakash','1992-07-09','2025-08-06','Student','peelamedu','+919942883595','sanjayravichandran006@gmail.com','25c, uniontank road, 1st street,periyanaicken palayam','25c, uniontank road, 1st street,periyanaicken palayam','2025-08-19 17:41:20',1,2,1,1,1,'12-1234567890-12-0001','TN/AMB/0123456/0001234',15000.00,NULL),('EMP003','Suresh','1997-06-19','2025-03-20','Sathya Coatings','perundurai','9484938839','suresh@gmail.com','25c, uniontank road, 1st street,periyanaicken palayam','25c, uniontank road, 1st street,perundurai','2025-08-25 10:39:57',1,1,1,6,1,'4894883988943','489438389343',12500.00,NULL),('EMP004','ram','1992-07-07','2025-08-06','sathyacoatings','peelamedu','9876789874','ram@gmail.com','25c, uniontank road, 1st street,periyanaicken palayam','25c, uniontank road, 1st street,periyanaicken palayam','2025-08-19 17:41:20',1,1,1,7,1,'12-1234567890-12-0001','TN/AMB/0123456/0001234',14000.00,NULL),('emp0043','sanjay','2025-09-02','2025-09-18','mills','pm','8978767987','name@gmail.com','cbe','cbe','2025-09-08 15:13:53',1,1,1,1,1,'84484949494949494','4984983898989344',11000.00,NULL),('EMP005','eric','1997-06-18','2025-08-06','sathyacoatings','edayarpalayam','8484949484','eric@gmail.com','123 RS Puram , Combatore','123 RS Puram , Combatore','2025-09-01 15:05:00',1,2,1,7,1,'8484847478484','848484849834983498',12000.00,NULL),('EMP006','velraj','1987-10-13','2025-08-14','sathyacoatings','peelamedu','9847837263','peelamedu@gmail.com','123 , gandhipuram','123 , gandhipuram','2025-09-01 15:08:27',1,2,1,7,1,'398983298329832','8938989327832',10000.00,NULL),('EMP007','surya','1984-10-24','2025-09-09','sathyacoatings','peelamedu','9584948394','surya@gmail.com','RS puram , coimbatore','RS puram , coimbatore','2025-09-18 14:24:48',1,1,1,1,1,'5898954985498','5989845985498',14000.00,NULL),('emp49834938','bala','1982-07-01','2025-09-11','lakshmi mills','peelamedu','8949389383','bala@sathyahitec.com','gandhipuram','gandhipuram','2025-09-29 14:51:58',1,1,1,1,1,'12345678901203','48384384989c94934',25000.00,'2');
/*!40000 ALTER TABLE `employee_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employment_type`
--

DROP TABLE IF EXISTS `employment_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employment_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employment_type`
--

LOCK TABLES `employment_type` WRITE;
/*!40000 ALTER TABLE `employment_type` DISABLE KEYS */;
INSERT INTO `employment_type` VALUES (1,'Full-Time'),(2,'Contract'),(3,'Part-Time');
/*!40000 ALTER TABLE `employment_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_category`
--

DROP TABLE IF EXISTS `expense_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exp_category` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_category`
--

LOCK TABLES `expense_category` WRITE;
/*!40000 ALTER TABLE `expense_category` DISABLE KEYS */;
INSERT INTO `expense_category` VALUES (1,'Room rent'),(2,'Labour food'),(3,'Freight'),(4,'Travelling/Auto'),(5,'Consumables'),(6,'Site er food'),(7,'others');
/*!40000 ALTER TABLE `expense_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_details`
--

DROP TABLE IF EXISTS `expense_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `details` varchar(300) NOT NULL,
  `exp_category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exp_category_id` (`exp_category_id`),
  CONSTRAINT `expense_details_ibfk_1` FOREIGN KEY (`exp_category_id`) REFERENCES `expense_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_details`
--

LOCK TABLES `expense_details` WRITE;
/*!40000 ALTER TABLE `expense_details` DISABLE KEYS */;
INSERT INTO `expense_details` VALUES (1,'Incharge room rent',1),(2,'Incharge team food',2),(3,'Site food',6),(4,'Oragadam to Hosur bus fare',4),(5,'Auto from Hosur bus stand to Motely Appliances up and down',4),(6,'Hosur to Sriperumbudur bus fare',4),(7,'Sriperumbudur to Oragadam Ola cab',4),(8,'Oragadam to AOAI site Ola cab up and down',4),(9,'AOAI to Sunguvarchattram bus for 5 persons',4),(10,'Sunguvarchattram to Sriperumbudur auto',4),(11,'Sriperumbudur to Oragadam bus fare',4),(12,'Oragadam to Chunsung site material unloading up and down',3),(13,'Auto with CPS material for Incharge team',4),(14,'Room to Chunsung site auto with material',4),(15,'Return auto and bus charge for 3 persons',4),(16,'Room to Chunsung site auto charge',4),(17,'Return auto charge',4),(18,'Sriperumbudur to Ranipet bus and auto for Incharge team',4),(19,'Oragadam to Perundurai bus fare for Incharge team',4),(20,'Oragadam to Tenkasi bus ticket',4),(21,'VPG site to Oragadam auto',4),(22,'4 inch roller set',5),(23,'1 inch masking tape',5),(24,'Sample material porter charge',3),(25,'HJ Engineering sample work auto fare',4),(26,'Enamel yellow paint',5),(27,'Paint brush',5),(28,'Material transport from SSMPL to AOAI',3),(29,'4 inch roller 3 sets',5),(30,'Masking tape 5 bundles',5),(31,'Tea',2),(32,'Bike petrol',4),(33,'Plywood',5),(34,'Incharge dress purchase',5),(35,'Mixing mug 2 units',5),(36,'9 inch roller',5),(37,'Bosch grinding machine',5),(38,'Grinding wheel',5),(39,'Exterior 9 inch roller',5),(40,'Trowel 1mm 2 units',5),(41,'Spike roller 2 units',5),(42,'Spike shoe 2 sets',5),(43,'Trowel 1.5mm 2 units',5),(44,'Trowel 2mm 2 units',5),(45,'VPG site mixing buckets 2 units',5),(46,'3-pin plug for mixing machine',5),(47,'others',7);
/*!40000 ALTER TABLE `expense_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incharge_details`
--

DROP TABLE IF EXISTS `incharge_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incharge_details` (
  `incharge_id` varchar(30) NOT NULL,
  `incharge_name` varchar(100) NOT NULL,
  `incharge_role_id` varchar(30) NOT NULL,
  PRIMARY KEY (`incharge_id`),
  KEY `incharge_role_id` (`incharge_role_id`),
  CONSTRAINT `incharge_details_ibfk_1` FOREIGN KEY (`incharge_role_id`) REFERENCES `site_incharge` (`incharge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incharge_details`
--

LOCK TABLES `incharge_details` WRITE;
/*!40000 ALTER TABLE `incharge_details` DISABLE KEYS */;
INSERT INTO `incharge_details` VALUES ('ID001','Aravind Kumar','SI001'),('ID002','Suresh Balaji','SI001'),('ID003','Priya Venkatesh','SI001'),('ID004','Karthik Rajan','SI001'),('ID005','Lakshmi Narayanan','SI001'),('ID006','Vigneshwaran Pillai','SI001'),('ID007','Anitha Subramanian','SI001'),('ID008','Manikandan Nair','SI001'),('ID009','Saravanan Gopi','SI001'),('ID010','Deepa Krishnan','SI001'),('ID011','Ramesh Srinivasan','SI002'),('ID012','Nandhini Murugan','SI002'),('ID013','Gokul Prasath','SI002'),('ID014','Vinoth Kannan','SI002'),('ID015','Meena Sathish','SI002'),('ID016','Balamurugan Ram','SI002'),('ID017','Kavitha Selvaraj','SI002'),('ID018','Praveen Chandran','SI002'),('ID019','Senthil Kumar','SI002'),('ID020','Divya Bharathi','SI002'),('ID021','subash','SI001');
/*!40000 ALTER TABLE `incharge_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_category`
--

DROP TABLE IF EXISTS `item_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_category` (
  `category_id` varchar(30) NOT NULL,
  `category_name` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_category`
--

LOCK TABLES `item_category` WRITE;
/*!40000 ALTER TABLE `item_category` DISABLE KEYS */;
INSERT INTO `item_category` VALUES ('CA101','Structural Painting'),('CA102','PipeLine'),('CA103','stickering'),('CA104','Cool Coating'),('CA105','Coolroof Coating');
/*!40000 ALTER TABLE `item_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_subcategory`
--

DROP TABLE IF EXISTS `item_subcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_subcategory` (
  `subcategory_id` varchar(30) NOT NULL,
  `subcategory_name` varchar(70) DEFAULT NULL,
  `billing` tinyint DEFAULT '0',
  PRIMARY KEY (`subcategory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_subcategory`
--

LOCK TABLES `item_subcategory` WRITE;
/*!40000 ALTER TABLE `item_subcategory` DISABLE KEYS */;
INSERT INTO `item_subcategory` VALUES ('SC101','Cleaning',0),('SC102','Primer',0),('SC103','1st Coat',0),('SC104','2nd Coat',0),('SC105','Top Coat',1),('SC106','Arrow',1),('SC107','Font Sticker',1),('SC108','Pasting',1);
/*!40000 ALTER TABLE `item_subcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour`
--

DROP TABLE IF EXISTS `labour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `date_of_joining` date NOT NULL,
  `company` varchar(255) NOT NULL,
  `branch` varchar(255) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `company_email` varchar(255) NOT NULL,
  `current_address` text NOT NULL,
  `permanent_address` text NOT NULL,
  `gender_id` int NOT NULL,
  `dept_id` int NOT NULL,
  `emp_type_id` int NOT NULL,
  `designation_id` int NOT NULL,
  `status_id` int NOT NULL,
  `esic_number` varchar(50) DEFAULT NULL,
  `pf_number` varchar(50) DEFAULT NULL,
  `contractor_id` int DEFAULT NULL,
  `approved_salary` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contractor_id` (`contractor_id`),
  KEY `emp_type_id` (`emp_type_id`),
  KEY `labour_ibfk_2` (`gender_id`),
  KEY `labour_ibfk_3` (`dept_id`),
  KEY `labour_ibfk_5` (`designation_id`),
  KEY `labour_ibfk_6` (`status_id`),
  CONSTRAINT `labour_ibfk_1` FOREIGN KEY (`contractor_id`) REFERENCES `contractor` (`id`) ON DELETE SET NULL,
  CONSTRAINT `labour_ibfk_2` FOREIGN KEY (`gender_id`) REFERENCES `emp_gender` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_ibfk_3` FOREIGN KEY (`dept_id`) REFERENCES `emp_department` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_ibfk_4` FOREIGN KEY (`emp_type_id`) REFERENCES `employment_type` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_ibfk_5` FOREIGN KEY (`designation_id`) REFERENCES `emp_designation` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_ibfk_6` FOREIGN KEY (`status_id`) REFERENCES `emp_status` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour`
--

LOCK TABLES `labour` WRITE;
/*!40000 ALTER TABLE `labour` DISABLE KEYS */;
INSERT INTO `labour` VALUES (6,'moorthi','2025-05-09','2025-09-12','mills','pm','8494937493','name@gmail.com','cbe','cbe',1,1,1,1,1,'12345678901234567','9885489898945',NULL,1000.00,'2025-09-08 09:54:13','2025-09-09 09:28:45',NULL),(7,'gopal','2000-01-14','2025-08-20','lakshmi mills','peelamedu','9484948493','gopal@gmail.com','rs puram','rs puram',1,1,1,7,1,'12345678901234567','49889894389344389',NULL,1200.00,'2025-09-10 04:49:15','2025-09-10 04:49:15',NULL),(8,'ragu','2025-10-10','2025-10-10','lakshmi mills','peelamedu','9483928382','ragu@sathyacoating.com','coimbatore','coimbatore',1,1,2,1,1,NULL,'4783498484839',NULL,25000.00,'2025-09-29 09:35:21','2025-09-29 09:35:21','2');
/*!40000 ALTER TABLE `labour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_assignment`
--

DROP TABLE IF EXISTS `labour_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_assignment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `labour_id` int DEFAULT NULL,
  `salary` decimal(15,2) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `site_id` (`site_id`),
  KEY `desc_id` (`desc_id`),
  KEY `created_by` (`created_by`),
  KEY `fk_labour_assignment_labour` (`labour_id`),
  KEY `fk_labour_assignment_updated_by` (`updated_by`),
  CONSTRAINT `fk_labour_assignment_labour` FOREIGN KEY (`labour_id`) REFERENCES `labour` (`id`),
  CONSTRAINT `fk_labour_assignment_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `labour_assignment_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project_details` (`pd_id`),
  CONSTRAINT `labour_assignment_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`),
  CONSTRAINT `labour_assignment_ibfk_3` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`),
  CONSTRAINT `labour_assignment_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_assignment`
--

LOCK TABLES `labour_assignment` WRITE;
/*!40000 ALTER TABLE `labour_assignment` DISABLE KEYS */;
INSERT INTO `labour_assignment` VALUES (1,'PD001','ST001',69,'2025-09-29','2025-10-04',2,'2025-09-29 10:07:14',7,NULL,NULL,NULL),(2,'PD001','ST001',69,'2025-09-29','2025-10-11',2,'2025-09-29 16:04:24',6,NULL,NULL,NULL),(3,'PD001','ST001',69,'2025-10-03','2025-10-03',2,'2025-10-03 09:12:30',7,NULL,NULL,NULL),(4,'PD001','ST001',69,'2025-10-06','2025-10-29',2,'2025-10-03 16:25:03',6,3000.00,2,'2025-10-04 09:59:40'),(5,'PD001','ST001',69,'2025-10-21','2025-10-31',7,'2025-10-07 12:31:14',6,NULL,NULL,NULL);
/*!40000 ALTER TABLE `labour_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_assignment_edit_history`
--

DROP TABLE IF EXISTS `labour_assignment_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_assignment_edit_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `labour_assignment_id` int NOT NULL,
  `project_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int NOT NULL,
  `labour_id` int NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `salary` decimal(15,2) DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labour_assignment_id` (`labour_assignment_id`),
  KEY `project_id` (`project_id`),
  KEY `site_id` (`site_id`),
  KEY `desc_id` (`desc_id`),
  KEY `labour_id` (`labour_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `labour_assignment_edit_history_ibfk_1` FOREIGN KEY (`labour_assignment_id`) REFERENCES `labour_assignment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `labour_assignment_edit_history_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project_details` (`pd_id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_assignment_edit_history_ibfk_3` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_assignment_edit_history_ibfk_4` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_assignment_edit_history_ibfk_5` FOREIGN KEY (`labour_id`) REFERENCES `labour` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_assignment_edit_history_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_assignment_edit_history_ibfk_7` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_assignment_edit_history`
--

LOCK TABLES `labour_assignment_edit_history` WRITE;
/*!40000 ALTER TABLE `labour_assignment_edit_history` DISABLE KEYS */;
INSERT INTO `labour_assignment_edit_history` VALUES (1,4,'PD001','ST001',69,6,'2025-10-03','2025-10-03',NULL,2,NULL,'2025-10-03 16:25:03','2025-10-03 16:25:03'),(2,4,'PD001','ST001',69,6,'2025-10-14','2025-10-24',NULL,2,2,'2025-10-03 16:25:03','2025-10-04 09:17:48'),(3,4,'PD001','ST001',69,6,'2025-10-22','2025-10-30',NULL,2,2,'2025-10-03 16:25:03','2025-10-04 09:18:22'),(4,4,'PD001','ST001',69,6,'2025-10-08','2025-10-17',NULL,2,2,'2025-10-03 16:25:03','2025-10-04 09:47:59'),(5,4,'PD001','ST001',69,6,'2025-10-09','2025-10-30',NULL,2,2,'2025-10-03 16:25:03','2025-10-04 09:56:35'),(6,4,'PD001','ST001',69,6,'2025-10-08','2025-10-31',NULL,2,2,'2025-10-03 16:25:03','2025-10-04 09:57:00'),(7,4,'PD001','ST001',69,6,'2025-10-07','2025-10-30',2000.00,2,2,'2025-10-03 16:25:03','2025-10-04 09:59:16');
/*!40000 ALTER TABLE `labour_assignment_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_attendance`
--

DROP TABLE IF EXISTS `labour_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `labour_assignment_id` int NOT NULL,
  `shift` decimal(3,1) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `entry_date` date NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labour_assignment_id` (`labour_assignment_id`),
  KEY `created_by` (`created_by`),
  KEY `fk_labour_attendance_updated_by` (`updated_by`),
  CONSTRAINT `fk_labour_attendance_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `labour_attendance_ibfk_1` FOREIGN KEY (`labour_assignment_id`) REFERENCES `labour_assignment` (`id`),
  CONSTRAINT `labour_attendance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_attendance`
--

LOCK TABLES `labour_attendance` WRITE;
/*!40000 ALTER TABLE `labour_attendance` DISABLE KEYS */;
INSERT INTO `labour_attendance` VALUES (1,1,1.0,2,'2025-09-29 16:04:46','2025-09-29',NULL,NULL,NULL),(2,2,1.5,2,'2025-09-29 16:04:46','2025-09-29',NULL,NULL,NULL),(3,1,1.0,2,'2025-09-29 16:05:30','2025-09-30',NULL,NULL,NULL),(4,2,0.5,2,'2025-09-29 16:05:30','2025-09-30',NULL,NULL,NULL),(5,2,1.0,2,'2025-10-04 10:03:40','2025-10-04','no ot hours',2,'2025-10-04 10:21:35'),(6,4,1.0,2,'2025-10-04 10:03:40','2025-10-04',NULL,2,'2025-10-04 10:16:29'),(7,1,1.0,2,'2025-10-04 10:03:40','2025-10-04',NULL,2,'2025-10-04 10:16:29'),(8,3,1.0,2,'2025-10-04 10:03:40','2025-10-04',NULL,2,'2025-10-04 10:16:29'),(9,2,1.5,2,'2025-10-06 10:07:41','2025-10-06','full day + OT',2,'2025-10-06 14:37:50'),(10,4,1.5,2,'2025-10-06 10:07:41','2025-10-06','ot',NULL,NULL),(11,1,0.5,2,'2025-10-06 10:07:41','2025-10-06','half day',NULL,NULL),(12,2,1.0,7,'2025-10-07 12:34:02','2025-10-07','full day',NULL,NULL),(13,2,1.5,7,'2025-10-07 12:49:41','2025-10-08','ot',NULL,NULL);
/*!40000 ALTER TABLE `labour_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_attendance_edit_history`
--

DROP TABLE IF EXISTS `labour_attendance_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_attendance_edit_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `labour_attendance_id` int NOT NULL,
  `labour_assignment_id` int NOT NULL,
  `shift` decimal(3,1) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labour_attendance_id` (`labour_attendance_id`),
  KEY `labour_assignment_id` (`labour_assignment_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `labour_attendance_edit_history_ibfk_1` FOREIGN KEY (`labour_attendance_id`) REFERENCES `labour_attendance` (`id`) ON DELETE CASCADE,
  CONSTRAINT `labour_attendance_edit_history_ibfk_2` FOREIGN KEY (`labour_assignment_id`) REFERENCES `labour_assignment` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_attendance_edit_history_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `labour_attendance_edit_history_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_attendance_edit_history`
--

LOCK TABLES `labour_attendance_edit_history` WRITE;
/*!40000 ALTER TABLE `labour_attendance_edit_history` DISABLE KEYS */;
INSERT INTO `labour_attendance_edit_history` VALUES (1,5,2,1.0,NULL,2,NULL,'2025-10-04 10:03:40','2025-10-04 10:03:40'),(2,6,4,1.0,NULL,2,NULL,'2025-10-04 10:03:40','2025-10-04 10:03:40'),(3,7,1,1.0,NULL,2,NULL,'2025-10-04 10:03:40','2025-10-04 10:03:40'),(4,8,3,1.0,NULL,2,NULL,'2025-10-04 10:03:40','2025-10-04 10:03:40'),(5,5,2,1.5,'ot hours',2,NULL,'2025-10-04 10:03:40','2025-10-04 10:16:29'),(6,9,2,1.0,'full day',2,NULL,'2025-10-06 10:07:41','2025-10-06 10:07:41');
/*!40000 ALTER TABLE `labour_attendance_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_overhead`
--

DROP TABLE IF EXISTS `labour_overhead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_overhead` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int NOT NULL,
  `calculation_type` enum('no_of_labours','total_shifts') NOT NULL,
  `no_of_labours` int DEFAULT NULL,
  `total_shifts` int DEFAULT NULL,
  `rate_per_shift` decimal(10,2) NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  `overhead_type` varchar(50) DEFAULT 'labour',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `projection_id` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_overhead`
--

LOCK TABLES `labour_overhead` WRITE;
/*!40000 ALTER TABLE `labour_overhead` DISABLE KEYS */;
INSERT INTO `labour_overhead` VALUES (1,'ST001',69,'no_of_labours',20,NULL,3500.00,70000.00,'2','2025-10-25 11:04:18',1,'2025-10-25 11:04:18');
/*!40000 ALTER TABLE `labour_overhead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `location_id` varchar(30) NOT NULL,
  `location_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES ('LO001','Kanchipuram'),('LO002','Erode'),('LO003','Chennai'),('LO004','Chengalpattu'),('LO005','Dindigul'),('LO006','Coimbatore'),('LO007','Pollachi'),('LO008','Perundurai');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `master_dc_no`
--

DROP TABLE IF EXISTS `master_dc_no`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_dc_no` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dc_no` varchar(100) NOT NULL,
  `company_id` varchar(10) DEFAULT NULL,
  `created_by` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `master_dc_no_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_dc_no`
--

LOCK TABLES `master_dc_no` WRITE;
/*!40000 ALTER TABLE `master_dc_no` DISABLE KEYS */;
INSERT INTO `master_dc_no` VALUES (1,'KGiSL002','CO002',''),(2,'J001','CO001',''),(10,'TESTMASTER001','CO003','2');
/*!40000 ALTER TABLE `master_dc_no` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_acknowledgement`
--

DROP TABLE IF EXISTS `material_acknowledgement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_acknowledgement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_dispatch_id` int NOT NULL,
  `comp_a_qty` int DEFAULT NULL,
  `comp_b_qty` int DEFAULT NULL,
  `comp_c_qty` int DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `overall_quantity` int DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_dispatch_id` (`material_dispatch_id`),
  CONSTRAINT `material_acknowledgement_ibfk_1` FOREIGN KEY (`material_dispatch_id`) REFERENCES `material_dispatch` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_acknowledgement`
--

LOCK TABLES `material_acknowledgement` WRITE;
/*!40000 ALTER TABLE `material_acknowledgement` DISABLE KEYS */;
INSERT INTO `material_acknowledgement` VALUES (1,1,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:05:51','2025-10-24 10:05:51',6000,'received','7',NULL),(2,2,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:06:06','2025-10-24 10:06:06',4000,'received','7',NULL),(3,3,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:06:14','2025-10-24 10:06:14',4500,'received','7',NULL),(4,4,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:06:23','2025-10-24 10:06:23',400,'received','7',NULL);
/*!40000 ALTER TABLE `material_acknowledgement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_acknowledgement_history`
--

DROP TABLE IF EXISTS `material_acknowledgement_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_acknowledgement_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_acknowledgement_id` int NOT NULL,
  `material_dispatch_id` int NOT NULL,
  `comp_a_qty` int DEFAULT NULL,
  `comp_b_qty` int DEFAULT NULL,
  `comp_c_qty` int DEFAULT NULL,
  `comp_a_remarks` text,
  `comp_b_remarks` text,
  `comp_c_remarks` text,
  `overall_quantity` int DEFAULT NULL,
  `remarks` text,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `material_acknowledgement_id` (`material_acknowledgement_id`),
  CONSTRAINT `material_acknowledgement_history_ibfk_1` FOREIGN KEY (`material_acknowledgement_id`) REFERENCES `material_acknowledgement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_acknowledgement_history`
--

LOCK TABLES `material_acknowledgement_history` WRITE;
/*!40000 ALTER TABLE `material_acknowledgement_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_acknowledgement_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_assign`
--

DROP TABLE IF EXISTS `material_assign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_assign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `item_id` varchar(50) NOT NULL,
  `uom_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `comp_ratio_a` int DEFAULT NULL,
  `comp_ratio_b` int DEFAULT NULL,
  `comp_ratio_c` int DEFAULT NULL,
  `desc_id` int DEFAULT NULL,
  `rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_by` varchar(30) NOT NULL,
  `projection_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `site_id` (`site_id`),
  KEY `item_id` (`item_id`),
  KEY `uom_id` (`uom_id`),
  KEY `fk_material_assign_desc_id` (`desc_id`),
  CONSTRAINT `fk_material_assign_desc_id` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`),
  CONSTRAINT `material_assign_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE RESTRICT,
  CONSTRAINT `material_assign_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE RESTRICT,
  CONSTRAINT `material_assign_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `material_master` (`item_id`) ON DELETE RESTRICT,
  CONSTRAINT `material_assign_ibfk_4` FOREIGN KEY (`uom_id`) REFERENCES `uom_master` (`uom_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_assign`
--

LOCK TABLES `material_assign` WRITE;
/*!40000 ALTER TABLE `material_assign` DISABLE KEYS */;
INSERT INTO `material_assign` VALUES (1,'PD001','ST001','item_29',2,160,'2025-10-25 16:33:44',2,1,NULL,69,30.00,'4',1),(2,'PD001','ST001','item_101',2,350,'2025-10-25 16:33:44',NULL,NULL,NULL,69,35.00,'4',1),(3,'PD001','ST001','item_10',2,140,'2025-10-25 16:33:44',3,2,1,69,25.00,'4',1),(4,'PD001','ST001','item_10',2,350,'2025-10-25 16:36:16',3,2,NULL,69,1.00,'4',2),(5,'PD001','ST001','item_112',2,250,'2025-10-25 16:36:16',3,2,NULL,69,1.00,'4',2);
/*!40000 ALTER TABLE `material_assign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_dispatch`
--

DROP TABLE IF EXISTS `material_dispatch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_dispatch` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_assign_id` int NOT NULL,
  `desc_id` int DEFAULT NULL,
  `dc_no` int NOT NULL,
  `dispatch_date` date NOT NULL,
  `dispatch_qty` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `comp_a_qty` int DEFAULT NULL,
  `comp_b_qty` int DEFAULT NULL,
  `comp_c_qty` int DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `created_by` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_material_assign_id` (`material_assign_id`),
  KEY `fk_material_dispatch_desc_id` (`desc_id`),
  CONSTRAINT `fk_material_assign_id` FOREIGN KEY (`material_assign_id`) REFERENCES `material_assign` (`id`),
  CONSTRAINT `fk_material_dispatch_desc_id` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_dispatch`
--

LOCK TABLES `material_dispatch` WRITE;
/*!40000 ALTER TABLE `material_dispatch` DISABLE KEYS */;
INSERT INTO `material_dispatch` VALUES (1,1,69,1,'2025-09-24',6000.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',3000,2000,1000,'first remarks','first remarks','first remarks','6789098483','998717',''),(2,2,69,1,'2025-09-24',4000.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',2001,1333,666,'first remarks','first remarks','first remarks','6789098483','998717',''),(3,3,69,1,'2025-09-24',4500.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',2700,1800,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(4,4,69,1,'2025-09-24',400.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',240,160,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(5,5,69,1,'2025-09-24',6000.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',4286,1714,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(6,6,69,1,'2025-09-24',6000.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',3750,2250,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(7,7,69,1,'2025-09-24',4000.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',2400,1600,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(8,8,69,1,'2025-09-24',200.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',120,80,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(9,9,69,1,'2025-09-24',1198.00,'2025-09-22 11:23:32','2025-09-22 11:23:32',719,479,NULL,'first remarks','first remarks',NULL,'6789098483','998717',''),(10,11,46,1,'2025-10-09',30.00,'2025-09-29 09:09:06','2025-09-29 09:09:06',20,10,NULL,'remarks','remarks',NULL,'9876540321','409872','2'),(11,12,46,1,'2025-10-09',500.00,'2025-09-29 09:09:06','2025-09-29 09:09:06',300,200,NULL,'remarks','remarks',NULL,'9876540321','409872','2');
/*!40000 ALTER TABLE `material_dispatch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_master`
--

DROP TABLE IF EXISTS `material_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_master` (
  `item_id` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_master`
--

LOCK TABLES `material_master` WRITE;
/*!40000 ALTER TABLE `material_master` DISABLE KEYS */;
INSERT INTO `material_master` VALUES ('item_00129','material50'),('item_1','CPS '),('item_10','Sathya Omegakoat 6000 FR Grey'),('item_100','Sathya Fluorocoat 9000'),('item_101','DW CS BC'),('item_102','No.1 sand'),('item_103','DW CS TC Pastel Green '),('item_104','SLF - SG Pastel Green'),('item_105','Sathya SLF - G RAL 7040 Grey'),('item_106','Sathya ZPP Primer Grey'),('item_107','SCPU TCPU DA Grey'),('item_108','NONO KOAT 2000'),('item_109','OMEGAKOAT 6000'),('item_11','Sathya Omegakoat FR PU Grey'),('item_110','Sathya HB PA Pearl Grey'),('item_111','Reflectkoat white'),('item_11130','material56'),('item_112','Powder For Light Green'),('item_113','SCPL TCPU Light Green'),('item_114','new materisl'),('item_115','new material 2'),('item_116','newmaterial3'),('item_117','newmaterial4'),('item_118','material5'),('item_119','material6'),('item_12','Sathya Omegakoat EPM 6000'),('item_120','material7'),('item_121','material8'),('item_122','material9'),('item_123','material10'),('item_124','material11'),('item_125','material12'),('item_126','material12'),('item_127','material13'),('item_128','material22'),('item_13','SCPL TCPU RAL 5017'),('item_14','SCPL TCPU RAL 1026 yellow'),('item_15','SCPL TCPU RAL 6037'),('item_16','Sathya Nanokoat 2000'),('item_17','TCPU Clear'),('item_18','TCPU Clear'),('item_19','SCPL TCPU Smoke Grey'),('item_2','CPS PU'),('item_20','DTM UHB 6000 Smoke Grey'),('item_21','DTM 6000 UHB - 3K'),('item_22','SCPL TCPU Golden yellow'),('item_23','DTM 1K PU Maroon'),('item_24','Sathya ROZP Brown'),('item_25','Sathya TCPU UVR 750 Dark Green'),('item_26','Sathya TCPU UVR 750 Smoke Grey'),('item_27','Sathya DTM 600 Grey'),('item_28','Sathya TCPU UVR 750 Golden yellow'),('item_29','Sathya TCPU UVR 750 Sea Green'),('item_3','Sathya Duramort EP'),('item_30','Sathya TCPU UVR 750 Sky Blue'),('item_31','Sathya TCPU PO Red'),('item_32','Sathya TCPU UVR 750 Black'),('item_33','Sathya TCPU UVR 750 Signal Red'),('item_34','Sathya TCPU UVR 750 Canary yellow'),('item_35','Sathya TCPU UVR 750 PO Red'),('item_36','Stickers'),('item_37','Sathya ZPP Primer'),('item_38','Acrylic Primer'),('item_39','Sathya HBE Epoxy Light Green'),('item_4','Solvent'),('item_40','Aliphatic TCPU UVR 500 Dark Green'),('item_41','Fluorokoat 9000 - Comp.B'),('item_42','Sathya Reflectkoat white'),('item_43','All Surface Roller'),('item_44','SCC'),('item_45','DW CS Primer'),('item_46','Sand'),('item_47','DW CS TC Smoke Grey'),('item_48','TCPU RAL 7043 Grey'),('item_49','HBPU Int. Silver Grey'),('item_5','Duracrete PU Pearl Grey'),('item_50','HBPU Ext. Silver Grey'),('item_51','AFC Topcot Crimson'),('item_52','Rainguard PRO - Morning Glory'),('item_53','Sathya Line Marking Golden yellow'),('item_54','SCPL TCPU UVR 500 Golden yellow'),('item_55','Sathya SF ZPP Grey'),('item_56','SCPL TCPU RAL 2003 Orange'),('item_57','SCPL TCPU UVR 500 Black'),('item_58','Sathya DTM 1K PU Dark Grey'),('item_59','Sathya DTM Red'),('item_6','Duracrete PU Pearl Grey'),('item_60','Sathya TCPU DA Grey'),('item_61','H.B.C.1000 White'),('item_62','Sathya DTM 2K PU Light Green'),('item_63','Sathya TCPU UVR 500 Grey'),('item_64','CLEANING SOLVENT'),('item_65','Sathya HBE Epoxy Line Marking Golden yellow'),('item_66','Sathya SF HBE Epoxy Pearl Grey'),('item_67','Sathya SF PU Prime'),('item_68','Sathya HYC PU LIGHT BLUE'),('item_69','Roller'),('item_7','SCPL TCPU Pink'),('item_70','Tray'),('item_71','Putty Blade 4'),('item_72','Sheet'),('item_73','Interior Royale Roller'),('item_74','Sathya HYC PU Beige'),('item_75','9\" Roller'),('item_76','2\" Brush'),('item_77','Empty Plastic pail'),('item_78','Sathya HB PU RAL 7002 Olive Grey'),('item_79','Sathya SLS Screed'),('item_8','SCPL TCPU Blue RAL 5015'),('item_80','Sathya HB PU RAL 7031 Grey'),('item_81','Sathya HB PU RAL 7035 Grey'),('item_82','SCPL TCPU Red'),('item_83','SCPL TCPU Sky Blue'),('item_84','Sathya SLF - SG Pearl Grey'),('item_85','Sathya SLF - SG Pearl Grey'),('item_86','Sathya SLF - G Pearl Grey'),('item_87','Sathya SLF PU 2K P.Green'),('item_88','Sathya SLF PU 2K French Blue'),('item_89','ESDEE Coat PU Paint'),('item_9','Sathya Omegakoat 6000 Grey'),('item_90','Vertical Fall Arrest Equipment'),('item_91','SCPL ZPP Grey'),('item_92','Durakoat TCPU Oxford Blue'),('item_93','SCPL TCPU Ivory'),('item_94','Durakoat TCPU Opaline Green'),('item_95','GREENSOL 9000'),('item_96','CRE FR - Nile Blue'),('item_97','Sathya Technobond FR EP Grey'),('item_98','Sathya Technobond FR PU'),('item_99','SCPL TCPU Silver Grey');
/*!40000 ALTER TABLE `material_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_usage`
--

DROP TABLE IF EXISTS `material_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_ack_id` int DEFAULT NULL,
  `comp_a_qty` int DEFAULT NULL,
  `comp_b_qty` int DEFAULT NULL,
  `comp_c_qty` int DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `overall_qty` int DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `material_ack_id` (`material_ack_id`),
  CONSTRAINT `material_usage_ibfk_1` FOREIGN KEY (`material_ack_id`) REFERENCES `material_acknowledgement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_usage`
--

LOCK TABLES `material_usage` WRITE;
/*!40000 ALTER TABLE `material_usage` DISABLE KEYS */;
INSERT INTO `material_usage` VALUES (1,1,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:06:37','2025-10-24 10:36:18',1200,'used','7',NULL),(2,2,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:06:44','2025-10-24 10:36:31',1200,'used','7',NULL),(3,3,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 10:37:03','2025-10-24 10:37:03',800,'used','7',NULL);
/*!40000 ALTER TABLE `material_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_usage_edit_history`
--

DROP TABLE IF EXISTS `material_usage_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_usage_edit_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_usage_history_id` bigint NOT NULL,
  `material_ack_id` int NOT NULL,
  `comp_a_qty` int DEFAULT NULL,
  `comp_b_qty` int DEFAULT NULL,
  `comp_c_qty` int DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `overall_qty` int DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) NOT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `material_usage_history_id` (`material_usage_history_id`),
  CONSTRAINT `material_usage_edit_history_ibfk_1` FOREIGN KEY (`material_usage_history_id`) REFERENCES `material_usage_history` (`entry_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_usage_edit_history`
--

LOCK TABLES `material_usage_edit_history` WRITE;
/*!40000 ALTER TABLE `material_usage_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_usage_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_usage_history`
--

DROP TABLE IF EXISTS `material_usage_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_usage_history` (
  `entry_id` bigint NOT NULL AUTO_INCREMENT,
  `material_ack_id` int NOT NULL,
  `entry_date` date NOT NULL,
  `comp_a_qty` int DEFAULT NULL,
  `comp_b_qty` int DEFAULT NULL,
  `comp_c_qty` int DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `overall_qty` int DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`entry_id`),
  KEY `material_ack_id` (`material_ack_id`),
  CONSTRAINT `material_usage_history_ibfk_1` FOREIGN KEY (`material_ack_id`) REFERENCES `material_acknowledgement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_usage_history`
--

LOCK TABLES `material_usage_history` WRITE;
/*!40000 ALTER TABLE `material_usage_history` DISABLE KEYS */;
INSERT INTO `material_usage_history` VALUES (1,1,'2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,7,'2025-10-24 15:36:37',600,'600 used',NULL,'2025-10-24 10:06:37'),(2,2,'2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,7,'2025-10-24 15:36:44',400,'used',NULL,'2025-10-24 10:06:44'),(3,1,'2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,7,'2025-10-24 16:06:18',600,'used',NULL,'2025-10-24 10:36:18'),(4,2,'2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,7,'2025-10-24 16:06:31',800,'used',NULL,'2025-10-24 10:36:31'),(5,3,'2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,7,'2025-10-24 16:07:03',800,'used',NULL,'2025-10-24 10:37:03');
/*!40000 ALTER TABLE `material_usage_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `overhead`
--

DROP TABLE IF EXISTS `overhead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `overhead` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_name` varchar(100) NOT NULL,
  `is_default` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `overhead`
--

LOCK TABLES `overhead` WRITE;
/*!40000 ALTER TABLE `overhead` DISABLE KEYS */;
INSERT INTO `overhead` VALUES (1,'materials',1),(2,'labours',1),(3,'consumables',0),(4,'rent',0),(5,'Accomadation',0),(6,'Petty Cash',0),(7,'new overhead',0),(8,'labours',0),(9,'materials',0),(10,'consumables',0),(11,'rent',0),(12,'Accomadations',0);
/*!40000 ALTER TABLE `overhead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petty_cash`
--

DROP TABLE IF EXISTS `petty_cash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `petty_cash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `assign_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `previous_remaining_amount` decimal(10,2) DEFAULT NULL,
  `desc_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `site_id` (`site_id`),
  KEY `fk_petty_cash_work_descriptions` (`desc_id`),
  CONSTRAINT `fk_petty_cash_work_descriptions` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `petty_cash_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`),
  CONSTRAINT `petty_cash_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petty_cash`
--

LOCK TABLES `petty_cash` WRITE;
/*!40000 ALTER TABLE `petty_cash` DISABLE KEYS */;
INSERT INTO `petty_cash` VALUES (1,'PD001','ST001','2025-05-28',1500.00,'2025-08-25 07:05:16',NULL,NULL,69),(2,'PD001','ST001','2025-06-04',3140.00,'2025-08-25 07:06:11',NULL,NULL,69),(3,'PD001','ST001','2025-06-16',1500.00,'2025-08-25 07:06:46',NULL,NULL,69),(4,'PD001','ST001','2025-09-11',250.00,'2025-09-12 03:54:38',NULL,NULL,69);
/*!40000 ALTER TABLE `petty_cash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pipeline`
--

DROP TABLE IF EXISTS `pipeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pipeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `report_type_id` int NOT NULL,
  `primer` decimal(10,2) DEFAULT NULL,
  `primer_rate` decimal(10,2) DEFAULT NULL,
  `primer_value` decimal(10,2) DEFAULT NULL,
  `total_rate` decimal(10,2) DEFAULT NULL,
  `total_value` decimal(10,2) DEFAULT NULL,
  `top_coat` decimal(10,2) DEFAULT NULL,
  `top_coat_rate` decimal(10,2) DEFAULT NULL,
  `top_coat_value` decimal(10,2) DEFAULT NULL,
  `arrow` decimal(10,2) DEFAULT NULL,
  `arrow_rate` decimal(10,2) DEFAULT NULL,
  `arrow_value` decimal(10,2) DEFAULT NULL,
  `cleaning` decimal(10,2) DEFAULT NULL,
  `cleaning_rate` decimal(10,2) DEFAULT NULL,
  `cleaning_value` decimal(10,2) DEFAULT NULL,
  `pasting` decimal(10,2) DEFAULT NULL,
  `pasting_rate` decimal(10,2) DEFAULT NULL,
  `pasting_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_type` (`report_id`,`report_type_id`),
  KEY `report_type_id` (`report_type_id`),
  CONSTRAINT `pipeline_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report_master` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `pipeline_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pipeline`
--

LOCK TABLES `pipeline` WRITE;
/*!40000 ALTER TABLE `pipeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `pipeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `po_budget`
--

DROP TABLE IF EXISTS `po_budget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `po_budget` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` varchar(50) NOT NULL,
  `desc_id` int NOT NULL,
  `total_po_value` decimal(15,2) NOT NULL,
  `total_budget_value` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `projection_id` int DEFAULT NULL,
  `projection_status` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_site_desc_projection` (`site_id`,`desc_id`,`projection_id`),
  KEY `desc_id` (`desc_id`),
  CONSTRAINT `po_budget_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`),
  CONSTRAINT `po_budget_ibfk_2` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po_budget`
--

LOCK TABLES `po_budget` WRITE;
/*!40000 ALTER TABLE `po_budget` DISABLE KEYS */;
INSERT INTO `po_budget` VALUES (1,'ST001',69,919215.00,597489.75,'2025-10-25 11:02:53','2025-10-25 11:02:53',1,1),(2,'ST001',69,919215.00,689411.25,'2025-10-25 11:05:10','2025-10-25 11:05:10',2,0);
/*!40000 ALTER TABLE `po_budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `po_reckoner`
--

DROP TABLE IF EXISTS `po_reckoner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `po_reckoner` (
  `rec_id` int NOT NULL AUTO_INCREMENT,
  `category_id` varchar(30) DEFAULT NULL,
  `subcategory_id` varchar(30) DEFAULT NULL,
  `po_quantity` int DEFAULT NULL,
  `uom` varchar(10) DEFAULT NULL,
  `rate` float DEFAULT NULL,
  `value` float DEFAULT NULL,
  `site_id` varchar(30) DEFAULT NULL,
  `desc_id` varchar(10) DEFAULT NULL,
  `item_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(30) NOT NULL,
  PRIMARY KEY (`rec_id`),
  KEY `fk_category` (`category_id`),
  KEY `fk_subcategory` (`subcategory_id`),
  KEY `fk_po_reckoner_site` (`site_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `item_category` (`category_id`),
  CONSTRAINT `fk_po_reckoner_site` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `item_subcategory` (`subcategory_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po_reckoner`
--

LOCK TABLES `po_reckoner` WRITE;
/*!40000 ALTER TABLE `po_reckoner` DISABLE KEYS */;
INSERT INTO `po_reckoner` VALUES (1,'CA105','SC101',1857,'sqm',120,222840,'ST001','69','10','2025-08-25 10:59:50',''),(2,'CA105','SC102',1857,'sqm',140,259980,'ST001','69','10','2025-08-25 10:59:50',''),(3,'CA105','SC103',1857,'sqm',100,185700,'ST001','69','10','2025-08-25 10:59:50',''),(4,'CA105','SC105',1857,'sqm',135,250695,'ST001','69','10','2025-08-25 10:59:50',''),(7,'CA102','SC101',130,'sqm',215,27950,'ST002','53','10','2025-09-10 10:04:19',''),(8,'CA102','SC101',220,'sqm',100,22000,'ST002','17','15','2025-09-10 10:04:19',''),(9,'CA102','SC102',130,'sqm',215,27950,'ST002','53','10','2025-09-10 10:04:19',''),(10,'CA102','SC102',220,'sqm',100,22000,'ST002','17','15','2025-09-10 10:04:19',''),(11,'CA102','SC101',50,'sqm',10,500,'ST003','46','30','2025-09-29 10:24:07','2'),(12,'CA102','SC102',50,'sqm',10,500,'ST003','46','30','2025-09-29 10:24:07','2'),(13,'CA102','SC103',50,'sqm',10,500,'ST003','46','30','2025-09-29 10:24:07','2');
/*!40000 ALTER TABLE `po_reckoner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_details`
--

DROP TABLE IF EXISTS `project_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_details` (
  `pd_id` varchar(30) NOT NULL,
  `company_id` varchar(30) DEFAULT NULL,
  `project_type_id` varchar(30) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pd_id`),
  KEY `fk_company_details` (`company_id`),
  KEY `fk_project_type` (`project_type_id`),
  CONSTRAINT `fk_company_details` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  CONSTRAINT `fk_project_type` FOREIGN KEY (`project_type_id`) REFERENCES `project_type` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_details`
--

LOCK TABLES `project_details` WRITE;
/*!40000 ALTER TABLE `project_details` DISABLE KEYS */;
INSERT INTO `project_details` VALUES ('PD001','CO001','PT001','Jay Jay Mills (Perundurai)',NULL,'2025-10-03 03:23:39','2025-10-03 03:23:39'),('PD002','CO002','PT001','kgcas',NULL,'2025-10-03 03:23:39','2025-10-03 03:23:39'),('PD003','CO003','PT001','Test Cost Center',NULL,'2025-10-03 03:23:39','2025-10-03 03:23:39'),('PD004','CO002','PT001','newcostcenter','2','2025-10-03 03:35:14','2025-10-03 03:35:14'),('PD005','CO002','PT001','newcostcenter2','2','2025-10-03 03:39:48','2025-10-03 03:39:48');
/*!40000 ALTER TABLE `project_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_type`
--

DROP TABLE IF EXISTS `project_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_type` (
  `type_id` varchar(30) NOT NULL,
  `type_description` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_type`
--

LOCK TABLES `project_type` WRITE;
/*!40000 ALTER TABLE `project_type` DISABLE KEYS */;
INSERT INTO `project_type` VALUES ('PT001','service'),('PT002','supply');
/*!40000 ALTER TABLE `project_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_updation_history`
--

DROP TABLE IF EXISTS `project_updation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_updation_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) DEFAULT NULL,
  `company_id` varchar(30) DEFAULT NULL,
  `project_type_id` varchar(30) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  CONSTRAINT `project_updation_history_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_updation_history`
--

LOCK TABLES `project_updation_history` WRITE;
/*!40000 ALTER TABLE `project_updation_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_updation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projection_allocated`
--

DROP TABLE IF EXISTS `projection_allocated`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projection_allocated` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int NOT NULL,
  `overhead_type_id` int NOT NULL,
  `projection_id` int NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  `budget_percentage` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projection_allocated`
--

LOCK TABLES `projection_allocated` WRITE;
/*!40000 ALTER TABLE `projection_allocated` DISABLE KEYS */;
INSERT INTO `projection_allocated` VALUES (1,'ST001',69,1,1,20550.00,3.44,'2025-10-25 11:03:44','2025-10-25 11:03:44'),(2,'ST001',69,2,1,70000.00,11.72,'2025-10-25 11:04:18','2025-10-25 11:04:18'),(3,'ST001',69,3,1,60000.00,10.04,'2025-10-25 11:04:35','2025-10-25 11:04:35'),(4,'ST001',69,1,2,600.00,0.09,'2025-10-25 11:06:16','2025-10-25 11:06:16'),(5,'ST001',69,3,2,50000.00,7.25,'2025-10-25 11:06:34','2025-10-25 11:06:34');
/*!40000 ALTER TABLE `projection_allocated` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projection_remaining`
--

DROP TABLE IF EXISTS `projection_remaining`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projection_remaining` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` varchar(50) NOT NULL,
  `desc_id` int NOT NULL,
  `remaining_budget` decimal(15,2) DEFAULT '0.00',
  `remaining_percentage` decimal(5,2) DEFAULT '0.00',
  `projection_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `desc_id` (`desc_id`),
  KEY `idx_site_desc_proj` (`site_id`,`desc_id`,`projection_id`),
  CONSTRAINT `projection_remaining_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE CASCADE,
  CONSTRAINT `projection_remaining_ibfk_2` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projection_remaining`
--

LOCK TABLES `projection_remaining` WRITE;
/*!40000 ALTER TABLE `projection_remaining` DISABLE KEYS */;
INSERT INTO `projection_remaining` VALUES (1,'ST001',69,446939.75,74.80,1,'2025-10-25 11:04:51','2025-10-25 11:04:51',NULL),(2,'ST001',69,638811.25,92.66,2,'2025-10-25 11:06:39','2025-10-25 11:06:39',NULL);
/*!40000 ALTER TABLE `projection_remaining` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_master`
--

DROP TABLE IF EXISTS `provider_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `transport_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transport_type_id` (`transport_type_id`),
  CONSTRAINT `provider_master_ibfk_1` FOREIGN KEY (`transport_type_id`) REFERENCES `transport_type` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_master`
--

LOCK TABLES `provider_master` WRITE;
/*!40000 ALTER TABLE `provider_master` DISABLE KEYS */;
INSERT INTO `provider_master` VALUES (1,'ABC parcel service','chennai','94839483',2),(2,'karthi','chennai','94838283',1),(3,'sankar',NULL,NULL,1),(5,'guna','gandhhipuram','9958475945',4),(6,'guru','example address','9483847384',1),(7,'xyz parcel service limited','example address','9484838483',2),(8,'lmw parcel service','PN palayam','9859493943',2),(9,'No.1 Transport','gandhi nagar','8474839929',1);
/*!40000 ALTER TABLE `provider_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reckoner_types`
--

DROP TABLE IF EXISTS `reckoner_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reckoner_types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reckoner_types`
--

LOCK TABLES `reckoner_types` WRITE;
/*!40000 ALTER TABLE `reckoner_types` DISABLE KEYS */;
INSERT INTO `reckoner_types` VALUES (1,'Sample'),(2,'Approved'),(3,'Not Approved');
/*!40000 ALTER TABLE `reckoner_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_master`
--

DROP TABLE IF EXISTS `report_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_master` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `site_id` varchar(30) NOT NULL,
  PRIMARY KEY (`report_id`),
  KEY `site_id` (`site_id`),
  CONSTRAINT `report_master_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_master`
--

LOCK TABLES `report_master` WRITE;
/*!40000 ALTER TABLE `report_master` DISABLE KEYS */;
INSERT INTO `report_master` VALUES (1,'2025-09-05','ST002'),(2,'2025-09-06','ST002'),(3,'2025-09-07','ST002'),(4,'2025-09-08','ST002'),(5,'2025-09-09','ST002'),(6,'2025-09-10','ST002'),(7,'2025-09-11','ST002');
/*!40000 ALTER TABLE `report_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_type`
--

DROP TABLE IF EXISTS `report_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_type` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_type`
--

LOCK TABLES `report_type` WRITE;
/*!40000 ALTER TABLE `report_type` DISABLE KEYS */;
INSERT INTO `report_type` VALUES (1,'SPR'),(2,'MDR'),(3,'MUR');
/*!40000 ALTER TABLE `report_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'superadmin'),(2,'admin'),(3,'accounts_team'),(4,'siteincharge');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_details`
--

DROP TABLE IF EXISTS `site_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_details` (
  `site_id` varchar(30) NOT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(70) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `incharge_id` varchar(30) DEFAULT NULL,
  `workforce_id` varchar(30) DEFAULT NULL,
  `pd_id` varchar(30) NOT NULL,
  `location_id` varchar(10) DEFAULT NULL,
  `reckoner_type_id` int DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`site_id`),
  KEY `fk_incharge_type` (`incharge_id`),
  KEY `fk_workforce_type` (`workforce_id`),
  KEY `fk_pd_id` (`pd_id`),
  KEY `fk_site_details_location` (`location_id`),
  KEY `fk_reckoner_type_id` (`reckoner_type_id`),
  CONSTRAINT `fk_incharge_type` FOREIGN KEY (`incharge_id`) REFERENCES `site_incharge` (`incharge_id`),
  CONSTRAINT `fk_pd_id` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reckoner_type_id` FOREIGN KEY (`reckoner_type_id`) REFERENCES `reckoner_types` (`type_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_site_details_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `fk_workforce_type` FOREIGN KEY (`workforce_id`) REFERENCES `workforce_type` (`workforce_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_details`
--

LOCK TABLES `site_details` WRITE;
/*!40000 ALTER TABLE `site_details` DISABLE KEYS */;
INSERT INTO `site_details` VALUES ('ST001','Perundurai ','6789098483','2025-05-28',NULL,'SI002',NULL,'PD001','LO008',2,NULL,'2025-10-03 03:23:44','2025-10-03 03:23:44',NULL),('ST002','ground0786','NA0000000001','2025-09-03','2025-09-09','SI002',NULL,'PD002','LO003',3,NULL,'2025-10-03 03:23:44','2025-10-03 04:05:27',NULL),('ST003','new site','9876540321','2025-08-31',NULL,'SI001',NULL,'PD003','LO006',2,NULL,'2025-10-03 03:23:44','2025-10-03 03:23:44',NULL),('ST004','newsitedemo','8484748483','2025-10-09',NULL,'SI002',NULL,'PD002','LO006',2,'2','2025-10-03 03:31:30','2025-10-03 03:31:30',NULL),('ST005','newsitedemo1785668','8484748483','2025-10-13','2025-10-22','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2025-10-03 05:05:14','2'),('ST006','newsite232','43349898434883','2025-10-05','2025-10-19','SI002',NULL,'PD005','LO006',2,'2','2025-10-03 03:39:48','2025-10-03 04:22:16',NULL);
/*!40000 ALTER TABLE `site_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_incharge`
--

DROP TABLE IF EXISTS `site_incharge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_incharge` (
  `incharge_id` varchar(30) NOT NULL,
  `incharge_type` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`incharge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_incharge`
--

LOCK TABLES `site_incharge` WRITE;
/*!40000 ALTER TABLE `site_incharge` DISABLE KEYS */;
INSERT INTO `site_incharge` VALUES ('SI001','supervisor'),('SI002','site engineer'),('SI003','supervisor + site engineer');
/*!40000 ALTER TABLE `site_incharge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_updation_history`
--

DROP TABLE IF EXISTS `site_updation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_updation_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` varchar(30) DEFAULT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(70) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `incharge_id` varchar(30) DEFAULT NULL,
  `workforce_id` varchar(30) DEFAULT NULL,
  `pd_id` varchar(30) DEFAULT NULL,
  `location_id` varchar(10) DEFAULT NULL,
  `reckoner_type_id` int DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `previous_updated_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `site_id` (`site_id`),
  KEY `pd_id` (`pd_id`),
  CONSTRAINT `site_updation_history_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE CASCADE,
  CONSTRAINT `site_updation_history_ibfk_2` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_updation_history`
--

LOCK TABLES `site_updation_history` WRITE;
/*!40000 ALTER TABLE `site_updation_history` DISABLE KEYS */;
INSERT INTO `site_updation_history` VALUES (1,'ST006','newsite232','43349898434883','2025-10-05','2025-10-19','SI002',NULL,'PD005','LO006',2,'2','2025-10-03 03:39:48','2','2025-10-03 04:27:07',NULL),(2,'ST006','newsite232','43349898434883','2025-10-05','2025-10-19','SI002',NULL,'PD005','LO006',2,'2','2025-10-03 03:39:48','2','2025-10-03 04:28:13',NULL),(3,'ST006','newsite232','43349898434883','2025-10-05','2025-10-19','SI002',NULL,'PD005','LO006',2,'2','2025-10-03 03:39:48','2','2025-10-03 04:41:45',NULL),(4,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:43:35',NULL),(5,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:44:19',NULL),(6,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:44:20',NULL),(7,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:44:25',NULL),(8,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:44:32',NULL),(9,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:44:32',NULL),(10,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 04:46:20',NULL),(11,'ST005','newsitedemo1','8484748483','2025-10-15','2025-10-24','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 05:04:54',NULL),(12,'ST005','newsitedemo178','8484748483','2025-10-14','2025-10-23','SI002',NULL,'PD004','LO005',2,'2','2025-10-03 03:35:14','2','2025-10-03 05:05:14',NULL);
/*!40000 ALTER TABLE `site_updation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siteincharge_assign`
--

DROP TABLE IF EXISTS `siteincharge_assign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siteincharge_assign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int DEFAULT NULL,
  `emp_id` varchar(30) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `site_id` (`site_id`),
  KEY `emp_id` (`emp_id`),
  KEY `fk_siteincharge_desc_id` (`desc_id`),
  CONSTRAINT `fk_siteincharge_desc_id` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`),
  CONSTRAINT `siteincharge_assign_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `siteincharge_assign_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `siteincharge_assign_ibfk_3` FOREIGN KEY (`emp_id`) REFERENCES `employee_master` (`emp_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siteincharge_assign`
--

LOCK TABLES `siteincharge_assign` WRITE;
/*!40000 ALTER TABLE `siteincharge_assign` DISABLE KEYS */;
INSERT INTO `siteincharge_assign` VALUES (1,'PD001','ST001',NULL,'EMP003','2025-05-28','2025-08-31','','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(2,'PD002','ST002',NULL,'EMP006','2025-09-05','2025-09-11','','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(3,'PD001','ST001',69,'EMP004','2025-09-08','2025-09-08','','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(4,'PD001','ST001',69,'EMP006','2025-09-08','2025-09-08','','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(5,'PD003','ST003',NULL,'EMP005','2025-09-01','2025-09-30','','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(6,'PD001','ST001',69,'EMP005','2025-09-15','2025-09-17','','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(7,'PD001','ST001',69,'EMP004','2025-09-29','2025-10-01','2','2025-10-03 03:36:23',NULL,'2025-10-03 03:36:23'),(8,'PD005','ST006',NULL,'EMP005','2025-10-09','2025-10-16','2','2025-10-03 03:39:48',NULL,'2025-10-03 03:39:48'),(9,'PD001','ST001',69,'EMP004','2025-10-23','2025-10-31','2','2025-10-03 03:42:11',NULL,'2025-10-03 03:42:11');
/*!40000 ALTER TABLE `siteincharge_assign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siteincharge_exp_entry`
--

DROP TABLE IF EXISTS `siteincharge_exp_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siteincharge_exp_entry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `petty_cash_id` int NOT NULL,
  `expense_category_id` int DEFAULT NULL,
  `expense_detail_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `amount_created_at` timestamp NULL DEFAULT NULL,
  `expense_details` varchar(300) DEFAULT NULL,
  `overhead_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `petty_cash_id` (`petty_cash_id`),
  KEY `expense_category_id` (`expense_category_id`),
  KEY `expense_detail_id` (`expense_detail_id`),
  KEY `overhead_id` (`overhead_id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_1` FOREIGN KEY (`petty_cash_id`) REFERENCES `petty_cash` (`id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_2` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_category` (`id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_3` FOREIGN KEY (`expense_detail_id`) REFERENCES `expense_details` (`id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_4` FOREIGN KEY (`overhead_id`) REFERENCES `overhead` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siteincharge_exp_entry`
--

LOCK TABLES `siteincharge_exp_entry` WRITE;
/*!40000 ALTER TABLE `siteincharge_exp_entry` DISABLE KEYS */;
INSERT INTO `siteincharge_exp_entry` VALUES (1,1,7,47,580.00,'2025-05-28 07:18:50',NULL,NULL),(2,1,4,32,200.00,'2025-05-31 07:24:58',NULL,NULL),(3,2,4,13,500.00,'2025-06-04 07:31:46',NULL,NULL),(4,2,3,24,2640.00,'2025-06-04 07:32:19',NULL,NULL),(5,1,4,32,200.00,'2025-06-25 07:33:11',NULL,NULL),(6,1,4,32,200.00,'2025-06-13 07:33:37',NULL,NULL),(7,3,NULL,NULL,100.00,'2025-09-08 12:18:17','remarks example',1),(8,4,NULL,NULL,100.00,'2025-09-12 06:15:46','travel charge',5);
/*!40000 ALTER TABLE `siteincharge_exp_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `state`
--

DROP TABLE IF EXISTS `state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `state` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `state`
--

LOCK TABLES `state` WRITE;
/*!40000 ALTER TABLE `state` DISABLE KEYS */;
INSERT INTO `state` VALUES (1,'Tamil Nadu');
/*!40000 ALTER TABLE `state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stickering`
--

DROP TABLE IF EXISTS `stickering`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stickering` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `report_type_id` int NOT NULL,
  `pasting` decimal(10,2) DEFAULT NULL,
  `pasting_rate` decimal(10,2) DEFAULT NULL,
  `pasting_value` decimal(10,2) DEFAULT NULL,
  `total_rate` decimal(10,2) DEFAULT NULL,
  `total_value` decimal(10,2) DEFAULT NULL,
  `font_sticker` decimal(10,2) DEFAULT NULL,
  `font_sticker_rate` decimal(10,2) DEFAULT NULL,
  `font_sticker_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_type` (`report_id`,`report_type_id`),
  KEY `report_type_id` (`report_type_id`),
  CONSTRAINT `stickering_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report_master` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `stickering_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stickering`
--

LOCK TABLES `stickering` WRITE;
/*!40000 ALTER TABLE `stickering` DISABLE KEYS */;
/*!40000 ALTER TABLE `stickering` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `structural_painting`
--

DROP TABLE IF EXISTS `structural_painting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `structural_painting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `report_type_id` int NOT NULL,
  `primer` decimal(10,2) DEFAULT NULL,
  `primer_rate` decimal(10,2) DEFAULT NULL,
  `primer_value` decimal(10,2) DEFAULT NULL,
  `total_rate` decimal(10,2) DEFAULT NULL,
  `total_value` decimal(10,2) DEFAULT NULL,
  `top_coat` decimal(10,2) DEFAULT NULL,
  `top_coat_rate` decimal(10,2) DEFAULT NULL,
  `top_coat_value` decimal(10,2) DEFAULT NULL,
  `cleaning` decimal(10,2) DEFAULT NULL,
  `cleaning_rate` decimal(10,2) DEFAULT NULL,
  `cleaning_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_type` (`report_id`,`report_type_id`),
  KEY `report_type_id` (`report_type_id`),
  CONSTRAINT `structural_painting_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report_master` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `structural_painting_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`type_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `structural_painting`
--

LOCK TABLES `structural_painting` WRITE;
/*!40000 ALTER TABLE `structural_painting` DISABLE KEYS */;
INSERT INTO `structural_painting` VALUES (1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,2,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,3,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,4,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,4,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,5,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,5,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,5,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,6,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,6,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,6,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,7,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,7,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,7,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `structural_painting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_company`
--

DROP TABLE IF EXISTS `supply_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_company` (
  `company_id` varchar(30) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `spoc_name` varchar(100) DEFAULT NULL,
  `spoc_contact_no` varchar(20) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_company`
--

LOCK TABLES `supply_company` WRITE;
/*!40000 ALTER TABLE `supply_company` DISABLE KEYS */;
INSERT INTO `supply_company` VALUES ('SUPP001','supply company 1','PN palayam','sanjay','9484847473','498489498394','48348',1,1,'641 020','2025-09-25 04:33:39','2025-09-25 04:33:39',NULL),('SUPP002','supply company 2','Test','Anand','8456678383','4984894983TEST2','4999373',1,1,'641 035','2025-09-29 09:44:17','2025-09-29 09:44:17','2');
/*!40000 ALTER TABLE `supply_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_master_dc_no`
--

DROP TABLE IF EXISTS `supply_master_dc_no`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_master_dc_no` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dc_no` varchar(100) NOT NULL,
  `company_id` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `supply_master_dc_no_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `supply_company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_master_dc_no`
--

LOCK TABLES `supply_master_dc_no` WRITE;
/*!40000 ALTER TABLE `supply_master_dc_no` DISABLE KEYS */;
INSERT INTO `supply_master_dc_no` VALUES (1,'sup1ground001','SUPP001','2025-09-26 05:55:42','2025-09-26 05:55:42',NULL);
/*!40000 ALTER TABLE `supply_master_dc_no` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_material_assign`
--

DROP TABLE IF EXISTS `supply_material_assign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_material_assign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `item_id` varchar(50) NOT NULL,
  `uom_id` int NOT NULL,
  `quantity` int NOT NULL,
  `production_cost_per_uom` decimal(10,2) NOT NULL,
  `production_cost` decimal(10,2) NOT NULL,
  `supply_cost_per_uom` decimal(10,2) NOT NULL,
  `supply_cost` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_material_assign`
--

LOCK TABLES `supply_material_assign` WRITE;
/*!40000 ALTER TABLE `supply_material_assign` DISABLE KEYS */;
INSERT INTO `supply_material_assign` VALUES (1,'SPD002','SSITE006','item_101',2,3000,25.00,75000.00,20.00,60000.00,'2025-09-26 11:24:44','2025-09-26 11:24:44',2,'2025-10-03'),(2,'SPD002','SSITE006','item_109',2,150,20.00,3000.00,25.00,3750.00,'2025-09-26 11:24:44','2025-09-26 11:24:44',2,'2025-10-02'),(3,'SPD002','SSITE006','item_12',2,3000,36.00,108000.00,40.00,120000.00,'2025-09-26 11:24:44','2025-09-26 11:24:44',2,'2025-10-04'),(4,'SPD002','SSITE003','item_10',2,100,20.00,2000.00,25.00,2500.00,'2025-09-26 12:48:34','2025-09-26 12:48:34',2,'2025-09-30'),(5,'SPD001','SSITE002','item_100',5,300,25.00,7500.00,35.00,10500.00,'2025-09-29 15:39:15','2025-09-29 15:39:15',2,'2025-09-30');
/*!40000 ALTER TABLE `supply_material_assign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_material_dispatch`
--

DROP TABLE IF EXISTS `supply_material_dispatch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_material_dispatch` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supply_material_assign_id` int NOT NULL,
  `dc_no` int NOT NULL,
  `dispatch_date` date NOT NULL,
  `order_no` varchar(50) NOT NULL,
  `vendor_code` varchar(50) NOT NULL,
  `dispatch_qty` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dispatch_cost` decimal(10,2) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supply_material_assign_id` (`supply_material_assign_id`),
  CONSTRAINT `supply_material_dispatch_ibfk_1` FOREIGN KEY (`supply_material_assign_id`) REFERENCES `supply_material_assign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_material_dispatch`
--

LOCK TABLES `supply_material_dispatch` WRITE;
/*!40000 ALTER TABLE `supply_material_dispatch` DISABLE KEYS */;
INSERT INTO `supply_material_dispatch` VALUES (1,1,1,'2025-10-10','sup834','48348',2000.00,'2025-09-26 05:55:42','2025-09-26 05:55:42',40000.00,NULL),(2,2,1,'2025-10-10','sup834','48348',100.00,'2025-09-26 05:55:42','2025-09-26 05:55:42',2500.00,NULL),(3,3,1,'2025-10-10','sup834','48348',2500.00,'2025-09-26 05:55:42','2025-09-26 05:55:42',100000.00,NULL),(4,1,1,'2025-10-09','sup834','48348',500.00,'2025-09-26 05:57:28','2025-09-26 05:57:28',10000.00,NULL),(5,2,1,'2025-10-09','sup834','48348',40.00,'2025-09-26 05:57:28','2025-09-26 05:57:28',1000.00,NULL),(6,3,1,'2025-10-09','sup834','48348',400.00,'2025-09-26 05:57:28','2025-09-26 05:57:28',16000.00,NULL),(7,1,1,'2025-10-03','sup834','48348',500.00,'2025-09-26 05:58:28','2025-09-26 05:58:28',10000.00,NULL),(8,2,1,'2025-10-03','sup834','48348',10.00,'2025-09-26 05:58:28','2025-09-26 05:58:28',250.00,NULL),(9,3,1,'2025-10-03','sup834','48348',100.00,'2025-09-26 05:58:28','2025-09-26 05:58:28',4000.00,NULL),(10,4,1,'2025-10-02','8484748483','48348',100.00,'2025-09-29 10:10:02','2025-09-29 10:10:02',2500.00,'2');
/*!40000 ALTER TABLE `supply_material_dispatch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_project_details`
--

DROP TABLE IF EXISTS `supply_project_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_project_details` (
  `pd_id` varchar(30) NOT NULL,
  `company_id` varchar(30) DEFAULT NULL,
  `project_type_id` varchar(30) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_project_details`
--

LOCK TABLES `supply_project_details` WRITE;
/*!40000 ALTER TABLE `supply_project_details` DISABLE KEYS */;
INSERT INTO `supply_project_details` VALUES ('SPD001','SUPP001',NULL,'new cost center for supply company 1'),('SPD002','SUPP001','PT002','new cost center'),('SPD003','SUPP001','PT002','new testing');
/*!40000 ALTER TABLE `supply_project_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_site_details`
--

DROP TABLE IF EXISTS `supply_site_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_site_details` (
  `site_id` varchar(30) NOT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(70) DEFAULT NULL,
  `pd_id` varchar(30) DEFAULT NULL,
  `location_id` varchar(10) DEFAULT NULL,
  `reckoner_type_id` int DEFAULT NULL,
  `supply_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_site_details`
--

LOCK TABLES `supply_site_details` WRITE;
/*!40000 ALTER TABLE `supply_site_details` DISABLE KEYS */;
INSERT INTO `supply_site_details` VALUES ('SSITE001','Perundurais','','SPD001','LO006',1,'sup4093'),('SSITE002','New','6789098425','SPD001','LO006',2,NULL),('SSITE003','new site','8484748483','SPD002','LO006',2,NULL),('SSITE004','new test site',NULL,'SPD003','LO005',3,'supss948'),('SSITE005','new site2','5848958','SPD002','LO005',3,NULL),('SSITE006','ground3','','SPD002','LO005',2,'sup834'),('SSITE007','New','','SPD003','LO005',3,'sup584');
/*!40000 ALTER TABLE `supply_site_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_transport_master`
--

DROP TABLE IF EXISTS `supply_transport_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_transport_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supply_dispatch_id` int NOT NULL,
  `provider_id` int NOT NULL,
  `destination` varchar(255) NOT NULL,
  `vehicle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `booking_expense` decimal(10,2) DEFAULT NULL,
  `travel_expense` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supply_dispatch_id` (`supply_dispatch_id`),
  KEY `provider_id` (`provider_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `supply_transport_master_ibfk_1` FOREIGN KEY (`supply_dispatch_id`) REFERENCES `supply_material_dispatch` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supply_transport_master_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `provider_master` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `supply_transport_master_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle_master` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `supply_transport_master_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `driver_master` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_transport_master`
--

LOCK TABLES `supply_transport_master` WRITE;
/*!40000 ALTER TABLE `supply_transport_master` DISABLE KEYS */;
INSERT INTO `supply_transport_master` VALUES (1,1,2,'gandhipuram',3,1,NULL,5000.00,'2025-09-26 11:25:42'),(2,2,2,'gandhipuram',3,1,NULL,5000.00,'2025-09-26 11:25:42'),(3,3,2,'gandhipuram',3,1,NULL,5000.00,'2025-09-26 11:25:42'),(4,4,3,'ganapathy',3,3,NULL,2500.00,'2025-09-26 11:27:28'),(5,5,3,'ganapathy',3,3,NULL,2500.00,'2025-09-26 11:27:28'),(6,6,3,'ganapathy',3,3,NULL,2500.00,'2025-09-26 11:27:28'),(7,7,3,'thudiyalur',1,3,NULL,3000.00,'2025-09-26 11:28:28'),(8,8,3,'thudiyalur',1,3,NULL,3000.00,'2025-09-26 11:28:28'),(9,9,3,'thudiyalur',1,3,NULL,3000.00,'2025-09-26 11:28:28'),(10,10,3,'saravanampatti',1,3,NULL,5000.00,'2025-09-29 15:40:02');
/*!40000 ALTER TABLE `supply_transport_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_master`
--

DROP TABLE IF EXISTS `transport_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_id` int DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `booking_expense` decimal(10,2) DEFAULT NULL,
  `travel_expense` decimal(10,2) DEFAULT NULL,
  `dispatch_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `dispatch_id` (`dispatch_id`),
  CONSTRAINT `transport_master_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `provider_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transport_master_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transport_master_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `driver_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transport_master_ibfk_4` FOREIGN KEY (`dispatch_id`) REFERENCES `material_dispatch` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_master`
--

LOCK TABLES `transport_master` WRITE;
/*!40000 ALTER TABLE `transport_master` DISABLE KEYS */;
INSERT INTO `transport_master` VALUES (1,3,'saravanampatti',3,3,NULL,3500.00,1,'2025-09-22 09:36:25'),(2,3,'saravanampatti',3,3,NULL,3500.00,2,'2025-09-22 09:36:25'),(3,3,'saravanampatti',3,3,NULL,3500.00,3,'2025-09-22 09:36:25'),(4,3,'saravanampatti',3,3,NULL,3500.00,4,'2025-09-22 09:36:25'),(5,2,'saravanampatti',3,3,NULL,3500.00,1,'2025-09-22 12:10:05'),(6,2,'saravanampatti',3,3,NULL,3500.00,2,'2025-09-22 12:10:05'),(7,2,'saravanampatti',3,3,NULL,3500.00,3,'2025-09-22 12:10:05'),(8,3,'saravanampatti',3,3,NULL,5000.00,1,'2025-09-22 16:53:32'),(9,3,'saravanampatti',3,3,NULL,5000.00,2,'2025-09-22 16:53:32'),(10,3,'saravanampatti',3,3,NULL,5000.00,3,'2025-09-22 16:53:32'),(11,3,'saravanampatti',3,3,NULL,5000.00,4,'2025-09-22 16:53:32'),(12,3,'saravanampatti',3,3,NULL,5000.00,5,'2025-09-22 16:53:32'),(13,3,'saravanampatti',3,3,NULL,5000.00,6,'2025-09-22 16:53:32'),(14,3,'saravanampatti',3,3,NULL,5000.00,7,'2025-09-22 16:53:32'),(15,3,'saravanampatti',3,3,NULL,5000.00,8,'2025-09-22 16:53:32'),(16,3,'saravanampatti',3,3,NULL,5000.00,9,'2025-09-22 16:53:32'),(17,3,'saravanampatti',3,1,NULL,50000.00,10,'2025-09-29 14:39:06'),(18,3,'saravanampatti',3,1,NULL,50000.00,11,'2025-09-29 14:39:06');
/*!40000 ALTER TABLE `transport_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_type`
--

DROP TABLE IF EXISTS `transport_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_type`
--

LOCK TABLES `transport_type` WRITE;
/*!40000 ALTER TABLE `transport_type` DISABLE KEYS */;
INSERT INTO `transport_type` VALUES (1,'Freight Paid'),(2,'Freight to Pay');
/*!40000 ALTER TABLE `transport_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uom_master`
--

DROP TABLE IF EXISTS `uom_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uom_master` (
  `uom_id` int NOT NULL AUTO_INCREMENT,
  `uom_name` varchar(10) NOT NULL,
  PRIMARY KEY (`uom_id`),
  UNIQUE KEY `uom_name` (`uom_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uom_master`
--

LOCK TABLES `uom_master` WRITE;
/*!40000 ALTER TABLE `uom_master` DISABLE KEYS */;
INSERT INTO `uom_master` VALUES (4,'GMS'),(2,'KGS'),(1,'LIT'),(3,'ML'),(5,'NOS'),(6,'SET');
/*!40000 ALTER TABLE `uom_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'superadmin1','superadmin1@gmail.com','12345678',1,'2025-10-06 09:41:56'),(2,'superadmin2','superadmin2@gmail.com','12345678',1,'2025-10-06 09:41:56'),(3,'admin1','admin1@gmail.com','12345678',2,'2025-10-06 09:41:56'),(4,'admin2','admin2@gmail.com','12345678',2,'2025-10-06 09:41:56'),(5,'accounts1','accounts1@gmail.com','12345678',3,'2025-10-06 09:41:56'),(6,'accounts2','accounts2@gmail.com','12345678',3,'2025-10-06 09:41:56'),(7,'siteincharge1','siteincharge1@gmail.com','12345678',4,'2025-10-06 09:41:56'),(8,'siteincharge2','siteincharge2@gmail.com','12345678',4,'2025-10-06 09:41:56'),(9,'siteincharge3','siteincharge3@gmail.com','12345678',4,'2025-10-06 09:41:56'),(10,'siteincharge4','siteincharge4@gmail.com','12345678',4,'2025-10-06 09:41:56'),(11,'siteincharge5','siteincharge5@gmail.com','12345678',4,'2025-10-06 09:41:56'),(12,'siteincharge6','siteincharge6@gmail.com','12345678',4,'2025-10-06 09:41:56'),(13,'siteincharge7','siteincharge7@gmail.com','12345678',4,'2025-10-06 09:41:56'),(14,'siteincharge8','siteincharge8@gmail.com','12345678',4,'2025-10-06 09:41:56'),(15,'siteincharge9','siteincharge9@gmail.com','12345678',4,'2025-10-06 09:41:56'),(16,'siteincharge10','siteincharge10@gmail.com','12345678',4,'2025-10-06 09:41:56'),(17,'siteincharge11','siteincharge11@gmail.com','12345678',4,'2025-10-06 09:41:56'),(18,'siteincharge12','siteincharge12@gmail.com','12345678',4,'2025-10-06 09:41:56'),(19,'siteincharge13','siteincharge13@gmail.com','12345678',4,'2025-10-06 09:41:56'),(20,'siteincharge14','siteincharge14@gmail.com','12345678',4,'2025-10-06 09:41:56'),(21,'siteincharge15','siteincharge15@gmail.com','12345678',4,'2025-10-06 09:41:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_master`
--

DROP TABLE IF EXISTS `vehicle_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_name` varchar(255) DEFAULT NULL,
  `vehicle_model` varchar(255) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_master`
--

LOCK TABLES `vehicle_master` WRITE;
/*!40000 ALTER TABLE `vehicle_master` DISABLE KEYS */;
INSERT INTO `vehicle_master` VALUES (1,'tempo','2s1','Tn-39-2394'),(3,'mini truck','se145','TN -483 -39394'),(4,'auto','new model','tn04923'),(5,'honda','s21','tn-388283'),(6,'car','car','tn-04 -4343');
/*!40000 ALTER TABLE `vehicle_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_descriptions`
--

DROP TABLE IF EXISTS `work_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_descriptions` (
  `desc_id` int NOT NULL AUTO_INCREMENT,
  `desc_name` varchar(100) NOT NULL,
  PRIMARY KEY (`desc_id`),
  UNIQUE KEY `desc_name` (`desc_name`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_descriptions`
--

LOCK TABLES `work_descriptions` WRITE;
/*!40000 ALTER TABLE `work_descriptions` DISABLE KEYS */;
INSERT INTO `work_descriptions` VALUES (47,'1.5\" line arrow supply and pasting'),(57,'1.5\" line font stickering work'),(46,'1\" line arrow supply and pasting'),(55,'1\" line font stickering work'),(53,'10\" line arrow supply and pasting'),(63,'10\" line font stickering work'),(54,'12\" line arrow supply and pasting'),(64,'12\" line font stickering work'),(48,'2\" line arrow supply and pasting'),(58,'2\" line font stickering work'),(49,'3\" line arrow supply and pasting'),(59,'3\" line font stickering work'),(50,'4\" line arrow supply and pasting'),(60,'4\" line font stickering work'),(51,'6\" line arrow supply and pasting'),(61,'6\" line font stickering work'),(52,'8\" line arrow supply and pasting'),(62,'8\" line font stickering work'),(11,'Air line 1 coat blue'),(33,'Chilled brine band supply and pasting'),(19,'Chilled brine line painting'),(32,'Chilled water band supply and pasting'),(18,'Chilled water line painting'),(31,'Cooling water band supply and pasting'),(13,'Cooling water line 1 coat dark green'),(17,'Cooling water line painting'),(68,'dummy description'),(38,'Eye wash shower band supply and pasting'),(24,'Eye wash shower line'),(44,'HSD band supply and pasting'),(30,'HSD line painting work'),(40,'Instrument air band supply and pasting'),(26,'Instrument air line'),(42,'LP Steam band supply and pasting'),(28,'LP Steam line painting work'),(43,'MP Steam band supply and pasting'),(29,'MP Steam line painting'),(5,'Nitrogen 2 coat redoxide + Canary Yellow'),(35,'Nitrogen band supply and pasting'),(20,'Nitrogen line painting'),(9,'Plant Air 2 coat redoxide + sky blue'),(41,'Plant air band supply and pasting'),(27,'Plant air line painting'),(16,'Primer coating with supply'),(36,'Process water band supply and pasting'),(21,'Process water line painting work'),(37,'PSV band supply and pasting'),(22,'PSV line painting'),(7,'PSV quench 2 coat redoxide + black'),(6,'Raw water 2 coat redoxide + sea green'),(39,'Raw water band supply and pasting'),(25,'Raw water line'),(14,'Raw water line 1 coat sea green'),(12,'Sticker for cooling water return'),(1,'Sticker for cooling water supply'),(34,'Sticker for Eye wash'),(45,'Sticker for High speed diesel'),(3,'Sticker for Holding Tank'),(66,'Sticker for LEV Scrubber'),(2,'Sticker for Non Peso Tank'),(67,'Sticker for Peso Tank'),(23,'Sticker for process water'),(65,'Sticker for scrubber'),(56,'Sticker for Vacuum'),(15,'Structural line painting'),(10,'Structural paint incl cleaner 2 coat paint'),(4,'Structural Painting Work'),(69,'Surface Cleaning + RC + SFZPP + UVR 750DFT'),(8,'Vacuum White');
/*!40000 ALTER TABLE `work_descriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workforce_type`
--

DROP TABLE IF EXISTS `workforce_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workforce_type` (
  `workforce_id` varchar(30) NOT NULL,
  `workforce_type` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`workforce_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workforce_type`
--

LOCK TABLES `workforce_type` WRITE;
/*!40000 ALTER TABLE `workforce_type` DISABLE KEYS */;
INSERT INTO `workforce_type` VALUES ('WF001','contract'),('WF002','labour'),('WF003','contract + labour');
/*!40000 ALTER TABLE `workforce_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27  9:02:30
