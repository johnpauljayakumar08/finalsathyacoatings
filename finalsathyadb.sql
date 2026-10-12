/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.18-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: sathya_dbd
-- ------------------------------------------------------
-- Server version	10.11.18-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `actual_budget` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `overhead_id` int(11) NOT NULL,
  `po_budget_id` int(11) NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `difference_value` decimal(15,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `splitted_budget` decimal(15,2) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `overhead_id` (`overhead_id`),
  KEY `po_budget_id` (`po_budget_id`),
  CONSTRAINT `actual_budget_ibfk_1` FOREIGN KEY (`overhead_id`) REFERENCES `overhead` (`id`),
  CONSTRAINT `actual_budget_ibfk_2` FOREIGN KEY (`po_budget_id`) REFERENCES `po_budget` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actual_budget`
--

LOCK TABLES `actual_budget` WRITE;
/*!40000 ALTER TABLE `actual_budget` DISABLE KEYS */;
/*!40000 ALTER TABLE `actual_budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actual_budget_edit_history`
--

DROP TABLE IF EXISTS `actual_budget_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `actual_budget_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actual_budget_history_id` bigint(20) NOT NULL,
  `actual_budget_id` int(11) NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `actual_budget_history_id` (`actual_budget_history_id`),
  CONSTRAINT `actual_budget_edit_history_ibfk_1` FOREIGN KEY (`actual_budget_history_id`) REFERENCES `actual_budget_history` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actual_budget_edit_history`
--

LOCK TABLES `actual_budget_edit_history` WRITE;
/*!40000 ALTER TABLE `actual_budget_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `actual_budget_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actual_budget_history`
--

DROP TABLE IF EXISTS `actual_budget_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `actual_budget_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `actual_budget_id` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `actual_value` decimal(15,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `actual_budget_id` (`actual_budget_id`),
  CONSTRAINT `actual_budget_history_ibfk_1` FOREIGN KEY (`actual_budget_id`) REFERENCES `actual_budget` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actual_budget_history`
--

LOCK TABLES `actual_budget_history` WRITE;
/*!40000 ALTER TABLE `actual_budget_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `actual_budget_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES
(1,'Coimbatore'),
(2,'Perundurai'),
(3,'chennai'),
(4,'1 NAIDUPETTA'),
(5,'TIRUPATI');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `company_id` varchar(30) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `spoc_name` varchar(100) DEFAULT NULL,
  `spoc_contact_no` varchar(20) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`company_id`),
  KEY `fk_city` (`city_id`),
  KEY `fk_state` (`state_id`),
  CONSTRAINT `fk_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`),
  CONSTRAINT `fk_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_updation_history`
--

DROP TABLE IF EXISTS `company_updation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_updation_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` varchar(30) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_time` timestamp NULL DEFAULT current_timestamp(),
  `company_name` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `spoc_name` varchar(100) DEFAULT NULL,
  `spoc_contact_no` varchar(20) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `company_updation_history_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_updation_history`
--

LOCK TABLES `company_updation_history` WRITE;
/*!40000 ALTER TABLE `company_updation_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `company_updation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `completion_edit_entries_history`
--

DROP TABLE IF EXISTS `completion_edit_entries_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `completion_edit_entries_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `completion_status_id` int(11) NOT NULL,
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
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `completion_status_id` (`completion_status_id`),
  CONSTRAINT `completion_edit_entries_history_ibfk_1` FOREIGN KEY (`completion_status_id`) REFERENCES `completion_status` (`completion_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `completion_edit_entries_history`
--

LOCK TABLES `completion_edit_entries_history` WRITE;
/*!40000 ALTER TABLE `completion_edit_entries_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `completion_edit_entries_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `completion_entries_history`
--

DROP TABLE IF EXISTS `completion_entries_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `completion_entries_history` (
  `entry_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rec_id` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `area_added` decimal(10,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `value_added` decimal(10,2) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_rec_id_entry_date` (`rec_id`,`entry_date`),
  CONSTRAINT `completion_entries_history_ibfk_1` FOREIGN KEY (`rec_id`) REFERENCES `po_reckoner` (`rec_id`),
  CONSTRAINT `completion_entries_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `completion_entries_history`
--

LOCK TABLES `completion_entries_history` WRITE;
/*!40000 ALTER TABLE `completion_entries_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `completion_entries_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `completion_status`
--

DROP TABLE IF EXISTS `completion_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `completion_status` (
  `completion_id` int(11) NOT NULL AUTO_INCREMENT,
  `rec_id` int(11) DEFAULT NULL,
  `area_completed` float DEFAULT NULL,
  `rate` float DEFAULT NULL,
  `value` float DEFAULT NULL,
  `billed_area` float DEFAULT NULL,
  `billed_value` float DEFAULT NULL,
  `balance_area` float DEFAULT NULL,
  `balance_value` float DEFAULT NULL,
  `work_status` varchar(50) DEFAULT NULL,
  `billing_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`completion_id`),
  KEY `rec_id` (`rec_id`),
  KEY `fk_created_by` (`created_by`),
  CONSTRAINT `completion_status_ibfk_1` FOREIGN KEY (`rec_id`) REFERENCES `po_reckoner` (`rec_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `completion_status`
--

LOCK TABLES `completion_status` WRITE;
/*!40000 ALTER TABLE `completion_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `completion_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consumables_master`
--

DROP TABLE IF EXISTS `consumables_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumables_master` (
  `consumable_id` int(11) NOT NULL AUTO_INCREMENT,
  `consumable_name` varchar(50) NOT NULL,
  PRIMARY KEY (`consumable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumables_master`
--

LOCK TABLES `consumables_master` WRITE;
/*!40000 ALTER TABLE `consumables_master` DISABLE KEYS */;
INSERT INTO `consumables_master` VALUES
(1,'Grinding Machine'),
(2,'Paint mixing machine'),
(3,'Paint Brush'),
(4,'Spike Roller Paint'),
(5,'Trowel');
/*!40000 ALTER TABLE `consumables_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor`
--

DROP TABLE IF EXISTS `contractor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contractor_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `description_of_work` (
  `item_id` varchar(30) NOT NULL,
  `item_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `description_of_work`
--

LOCK TABLES `description_of_work` WRITE;
/*!40000 ALTER TABLE `description_of_work` DISABLE KEYS */;
INSERT INTO `description_of_work` VALUES
('Item-1','Sticker for cooling water supply'),
('Item-10','Sticker for Non Peso Tank'),
('Item-11','Sticker for Holding Tank'),
('Item-12','Structural Painting Work'),
('Item-13','Nitrogen 2 coat redoxide + Canary Yellow'),
('Item-14','Raw water 2 coat redoxide + sea green'),
('Item-15','PSV quench 2 coat redoxide + black'),
('Item-16','Vacuum White'),
('Item-17','Plant Air 2 coat redoxide + sky blue'),
('Item-18','Structural paint incl cleaner 2 coat paint'),
('Item-19','Air line 1 coat blue'),
('Item-2','Sticker for cooling water return'),
('Item-20','Cooling water line 1 coat dark green'),
('Item-21','Raw water line 1 coat sea green'),
('Item-22','Structural line painting'),
('Item-23','Primer coating with supply'),
('Item-24','Cooling water line painting'),
('Item-25','Chilled water line painting'),
('Item-26','Chilled brine line painting'),
('Item-27','Nitrogen line painting'),
('Item-28','Process water line painting work'),
('Item-29','PSV line painting'),
('Item-3','Sticker for process water'),
('Item-30','Eye wash shower line'),
('Item-31','Raw water line'),
('Item-32','Instrument air line'),
('Item-33','Plant air line painting'),
('Item-34','LP Steam line painting work'),
('Item-35','MP Stam line painting'),
('Item-36','HSD line painting work'),
('Item-37','Cooling water band supply and pasting'),
('Item-38','Chilled water band supply and pasting'),
('Item-39','Chilled brine band supply and pasting'),
('Item-4','Sticker for Eye wash'),
('Item-40','Nitrogen bank supply and pasting'),
('Item-41','Process water band supply and pasting'),
('Item-42','PSV band supply and pasting'),
('Item-43','Eye wash shower band supply and pasting'),
('Item-44','Raw water band supply and pasting'),
('Item-45','Instrument air band supply and pasting'),
('Item-46','Plant air band supply and pasting'),
('Item-47','LP Steam bank supply and pasting'),
('Item-48','MP Steam band supply and pasting'),
('Item-49','HSD Bank supply and pasting'),
('Item-5','Sticker for High speed diesel'),
('Item-50','1\" Line arrow supply and pasting'),
('Item-51','1.5\" line arrow supply and pasting'),
('Item-52','2\" line arrow supply and pasting'),
('Item-53','3\" line arrow supply and pasting'),
('Item-54','4\" line arrow supply and pasting'),
('Item-55','6\" line arrow supply and pasting'),
('Item-56','8\" line arrow supply and pasting'),
('Item-57','10\" line arrow supply and pasting'),
('Item-58','12\" line arrow supply and pasting'),
('Item-59','1\" line font stickering work'),
('Item-6','Sticker for Vaccum'),
('Item-60','1.5\" line font stickering work'),
('Item-61','2\" line font stickering work'),
('Item-62','3\" line font stickering work'),
('Item-63','4\" line font stickering work'),
('Item-64','6\" line font stickering work'),
('Item-65','8\" line font stickering work'),
('Item-66','10\" line font stickering work'),
('Item-67','12\" line font stickering work'),
('Item-7','Sticker for scrubber'),
('Item-8','Sticker for LEV Scrubber'),
('Item-9','Sticker for Peso Tank');
/*!40000 ALTER TABLE `description_of_work` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_master`
--

DROP TABLE IF EXISTS `driver_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `driver_name` varchar(255) DEFAULT NULL,
  `driver_mobile` varchar(20) DEFAULT NULL,
  `driver_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_master`
--

LOCK TABLES `driver_master` WRITE;
/*!40000 ALTER TABLE `driver_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_department`
--

DROP TABLE IF EXISTS `emp_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_department`
--

LOCK TABLES `emp_department` WRITE;
/*!40000 ALTER TABLE `emp_department` DISABLE KEYS */;
INSERT INTO `emp_department` VALUES
(1,'Engineering'),
(2,'Management'),
(3,'Accounts'),
(4,'HR Management'),
(5,'Marketing');
/*!40000 ALTER TABLE `emp_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_designation`
--

DROP TABLE IF EXISTS `emp_designation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_designation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `designation` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_designation`
--

LOCK TABLES `emp_designation` WRITE;
/*!40000 ALTER TABLE `emp_designation` DISABLE KEYS */;
INSERT INTO `emp_designation` VALUES
(1,'Site Supervisor'),
(2,'Accountant'),
(3,'HR Manager'),
(5,'Marketing Executive'),
(6,'Site Engineer'),
(7,'Labour');
/*!40000 ALTER TABLE `emp_designation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_gender`
--

DROP TABLE IF EXISTS `emp_gender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_gender` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gender` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_gender`
--

LOCK TABLES `emp_gender` WRITE;
/*!40000 ALTER TABLE `emp_gender` DISABLE KEYS */;
INSERT INTO `emp_gender` VALUES
(1,'Male'),
(2,'Female'),
(3,'Other');
/*!40000 ALTER TABLE `emp_gender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_status`
--

DROP TABLE IF EXISTS `emp_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_status`
--

LOCK TABLES `emp_status` WRITE;
/*!40000 ALTER TABLE `emp_status` DISABLE KEYS */;
INSERT INTO `emp_status` VALUES
(1,'Active'),
(2,'Inactive');
/*!40000 ALTER TABLE `emp_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_master`
--

DROP TABLE IF EXISTS `employee_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `created_at` datetime DEFAULT current_timestamp(),
  `gender_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `emp_type_id` int(11) NOT NULL,
  `designation_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `esic_number` varchar(50) DEFAULT NULL,
  `pf_number` varchar(50) DEFAULT NULL,
  `approved_salary` decimal(10,2) NOT NULL DEFAULT 0.00,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_master`
--

LOCK TABLES `employee_master` WRITE;
/*!40000 ALTER TABLE `employee_master` DISABLE KEYS */;
INSERT INTO `employee_master` VALUES
('BAS1998','BASKAR','1998-07-17','2026-05-12','VALEO','CHENNAI','8012113429','sathyabaskar@1998gmail.com','chennai','chennai','2026-06-25 10:20:17',1,1,1,6,1,NULL,NULL,40000.00,'3'),
('EMP001','Suresh','1972-06-15','2026-02-13','Sathya Hitec','perundurai','9484847484','suresh@gmail.com','Perundurai mills','Perundurai mills','2026-03-13 13:55:03',1,1,1,6,1,'985985498549854','TN43834789834',15000.00,'4'),
('EMP002','babu','2001-02-25','2026-03-05','sathya hitec','vadavalli','8473849485','babu@sathyahitec.com','RS Puram , Coimbatore , Tamilnadu','RS Puram , Coimbatore, Tamilnadu','2026-03-14 09:32:59',1,1,1,6,1,'539848948943','43988989834',24000.00,'4'),
('EMP003','Raj Kumar','1994-09-12','2026-03-09','Lakshmi Mills','peelamedu','9484948448','raj@sathyacoatings.com','RS Puram, Coimbatore , Tamilnadu','RS Puram , Coimbatore , Tamilnadu','2026-03-14 09:36:06',1,1,1,6,1,'4590359047983498734','48089034980035',26000.00,'4'),
('KamalakannanMAS','Kamalakannan ','1998-07-12','2026-07-14','Super auto forge','chennai','8012113429','balajii7227@gmail.com','coimbatore','coimbatore','2026-07-15 11:51:00',1,1,1,6,1,NULL,NULL,20000.00,'3'),
('Mani1995','Manivannan ','2026-07-12','2025-01-01','Vandiyambadi','Chennai','8012113429','sathyaec@gmail.com','Gumudipoondi','vaniyambadi','2026-08-05 10:58:43',1,1,1,1,1,'5883324465','10756886522',25000.00,'3');
/*!40000 ALTER TABLE `employee_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employment_type`
--

DROP TABLE IF EXISTS `employment_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employment_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employment_type`
--

LOCK TABLES `employment_type` WRITE;
/*!40000 ALTER TABLE `employment_type` DISABLE KEYS */;
INSERT INTO `employment_type` VALUES
(1,'Full-Time'),
(2,'Contract'),
(3,'Part-Time');
/*!40000 ALTER TABLE `employment_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_category`
--

DROP TABLE IF EXISTS `expense_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exp_category` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_category`
--

LOCK TABLES `expense_category` WRITE;
/*!40000 ALTER TABLE `expense_category` DISABLE KEYS */;
INSERT INTO `expense_category` VALUES
(1,'Room rent'),
(2,'Labour food'),
(3,'Freight'),
(4,'Travelling/Auto'),
(5,'Consumables'),
(6,'Site er food'),
(7,'others');
/*!40000 ALTER TABLE `expense_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_details`
--

DROP TABLE IF EXISTS `expense_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `details` varchar(300) NOT NULL,
  `exp_category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exp_category_id` (`exp_category_id`),
  CONSTRAINT `expense_details_ibfk_1` FOREIGN KEY (`exp_category_id`) REFERENCES `expense_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_details`
--

LOCK TABLES `expense_details` WRITE;
/*!40000 ALTER TABLE `expense_details` DISABLE KEYS */;
INSERT INTO `expense_details` VALUES
(1,'Incharge room rent',1),
(2,'Incharge team food',2),
(3,'Site food',6),
(4,'Oragadam to Hosur bus fare',4),
(5,'Auto from Hosur bus stand to Motely Appliances up and down',4),
(6,'Hosur to Sriperumbudur bus fare',4),
(7,'Sriperumbudur to Oragadam Ola cab',4),
(8,'Oragadam to AOAI site Ola cab up and down',4),
(9,'AOAI to Sunguvarchattram bus for 5 persons',4),
(10,'Sunguvarchattram to Sriperumbudur auto',4),
(11,'Sriperumbudur to Oragadam bus fare',4),
(12,'Oragadam to Chunsung site material unloading up and down',3),
(13,'Auto with CPS material for Incharge team',4),
(14,'Room to Chunsung site auto with material',4),
(15,'Return auto and bus charge for 3 persons',4),
(16,'Room to Chunsung site auto charge',4),
(17,'Return auto charge',4),
(18,'Sriperumbudur to Ranipet bus and auto for Incharge team',4),
(19,'Oragadam to Perundurai bus fare for Incharge team',4),
(20,'Oragadam to Tenkasi bus ticket',4),
(21,'VPG site to Oragadam auto',4),
(22,'4 inch roller set',5),
(23,'1 inch masking tape',5),
(24,'Sample material porter charge',3),
(25,'HJ Engineering sample work auto fare',4),
(26,'Enamel yellow paint',5),
(27,'Paint brush',5),
(28,'Material transport from SSMPL to AOAI',3),
(29,'4 inch roller 3 sets',5),
(30,'Masking tape 5 bundles',5),
(31,'Tea',2),
(32,'Bike petrol',4),
(33,'Plywood',5),
(34,'Incharge dress purchase',5),
(35,'Mixing mug 2 units',5),
(36,'9 inch roller',5),
(37,'Bosch grinding machine',5),
(38,'Grinding wheel',5),
(39,'Exterior 9 inch roller',5),
(40,'Trowel 1mm 2 units',5),
(41,'Spike roller 2 units',5),
(42,'Spike shoe 2 sets',5),
(43,'Trowel 1.5mm 2 units',5),
(44,'Trowel 2mm 2 units',5),
(45,'VPG site mixing buckets 2 units',5),
(46,'3-pin plug for mixing machine',5),
(47,'others',7);
/*!40000 ALTER TABLE `expense_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_bank_master`
--

DROP TABLE IF EXISTS `finance_bank_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_bank_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(200) NOT NULL,
  `opening_balance` decimal(15,2) DEFAULT NULL,
  `available_balance` decimal(15,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` varchar(30) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bank_name` (`bank_name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_bank_master`
--

LOCK TABLES `finance_bank_master` WRITE;
/*!40000 ALTER TABLE `finance_bank_master` DISABLE KEYS */;
INSERT INTO `finance_bank_master` VALUES
(1,'Canara Bank',NULL,45000.00,'credited 45000','2025-11-27 09:43:55','2025-11-29 05:26:52','1',1),
(2,'State Bank of India',NULL,0.00,NULL,'2025-11-27 09:43:55',NULL,'1',NULL),
(3,'HDFC Bank',NULL,0.00,NULL,'2025-11-27 09:43:55',NULL,'1',NULL),
(4,'ICICI Bank',NULL,0.00,NULL,'2025-11-27 09:43:55',NULL,'1',NULL),
(5,'Indian Bank',NULL,0.00,NULL,'2025-11-27 09:43:55',NULL,'1',NULL),
(6,'Axis',5000.00,40000.00,'added 5k','2025-11-27 09:43:55','2026-04-08 11:20:36','1',1),
(7,'Punjab National Bank',NULL,0.00,NULL,'2025-11-27 09:43:55',NULL,'1',NULL),
(8,'Bank of Baroda',20000.00,5000.00,'added 3k','2025-11-27 09:43:55','2026-06-11 07:46:11','1',1),
(9,'Kotak Mahindra Bank',NULL,0.00,NULL,'2025-11-27 09:43:55',NULL,'1',NULL),
(10,'Union Bank of India',NULL,40000.00,NULL,'2025-11-27 09:43:55','2025-11-27 04:46:48','1',1),
(11,'City Union Bank',NULL,0.00,NULL,'2025-11-27 10:16:33',NULL,'1',NULL);
/*!40000 ALTER TABLE `finance_bank_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_bank_master_edit_history`
--

DROP TABLE IF EXISTS `finance_bank_master_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_bank_master_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_bank_master_id` int(11) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `opening_balance` decimal(15,2) DEFAULT NULL,
  `available_balance` decimal(15,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_master_id` (`finance_bank_master_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `finance_bank_master_edit_history_ibfk_1` FOREIGN KEY (`finance_bank_master_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_bank_master_edit_history`
--

LOCK TABLES `finance_bank_master_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_bank_master_edit_history` DISABLE KEYS */;
INSERT INTO `finance_bank_master_edit_history` VALUES
(1,8,'Bank of Baroda',0.00,0.00,NULL,'2025-11-27 04:55:06',NULL,1,1),
(2,8,'Bank of baroda',0.00,0.00,NULL,'2025-11-27 04:55:35',NULL,1,1),
(3,8,'Bank of Baroda',0.00,100000.00,'credited 1 lakh rupees','2025-11-27 04:55:53',NULL,1,1),
(4,8,'Bank of Baroda',0.00,50000.00,'debited 50000','2025-11-28 08:06:20',NULL,1,1),
(5,1,'Canara Bank',0.00,0.00,NULL,'2025-11-29 05:26:52',NULL,1,1),
(6,6,'Axis Bank',0.00,10.00,NULL,'2025-11-29 05:27:12',NULL,1,1),
(7,8,'Bank of Baroda',0.00,60000.00,'debited 60000','2025-11-29 05:27:24',NULL,1,1),
(8,6,'Axis Bank',0.00,50000.00,'credited 50000','2025-11-29 10:13:18',NULL,1,1),
(9,6,'Axis Bank',0.00,40000.00,'cash withdraw','2025-12-05 04:23:57',NULL,1,1),
(10,6,'Axis',NULL,0.00,'name to be short','2026-04-08 10:38:45',NULL,1,1),
(11,6,'Axis',8000.00,0.00,'added 8k','2026-04-08 10:46:27',NULL,1,1),
(12,8,'Bank of Baroda',0.00,-4000.00,'Auto updated from transactions: +₹6000.00 received, -₹10000.00 paid','2026-04-08 11:05:46',NULL,1,1),
(13,8,'Bank of Baroda',NULL,0.00,'credited 60000','2026-04-08 11:06:33',NULL,1,1),
(14,8,'Bank of Baroda',20000.00,16000.00,'Auto updated from transactions: +₹6000.00 received, -₹10000.00 paid','2026-04-08 11:06:33',NULL,1,1),
(15,8,'Bank of Baroda',20000.00,16000.00,'Auto updated from transactions: +₹6000.00 received, -₹10000.00 paid','2026-04-08 11:12:54',NULL,1,1),
(16,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: +₹6000.00 received, -₹10000.00 paid','2026-04-08 11:16:40',NULL,1,1),
(17,8,'Bank of Baroda',20000.00,0.00,'credited 20k','2026-04-08 11:17:18',NULL,1,1),
(18,8,'Bank of Baroda',2000.00,-2000.00,'Auto updated: +₹6000.00 received, -₹10000.00 paid','2026-04-08 11:17:18',NULL,1,1),
(19,6,'Axis',15000.00,0.00,'added 15000','2026-04-08 11:20:36',NULL,1,1),
(20,8,'Bank of Baroda',2000.00,7000.00,'added 5k','2026-04-08 11:21:39',NULL,1,1),
(21,8,'Bank of Baroda',7000.00,10000.00,'added 3k','2026-04-08 11:22:07',NULL,1,1),
(22,8,'Bank of Baroda',10000.00,15000.00,'added 5k','2026-04-08 11:22:57',NULL,1,1),
(23,8,'Bank of Baroda',15000.00,11000.00,'Auto updated: Opening ₹15000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:27:09',NULL,1,1),
(24,8,'Bank of Baroda',15000.00,11000.00,'Auto updated: Opening ₹15000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:27:11',NULL,1,1),
(25,8,'Bank of Baroda',15000.00,17000.00,'added 2k','2026-04-08 11:28:15',NULL,1,1),
(26,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:28:15',NULL,1,1),
(27,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:28:19',NULL,1,1),
(28,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:28:54',NULL,1,1),
(29,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:28:58',NULL,1,1),
(30,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:29:10',NULL,1,1),
(31,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:31:25',NULL,1,1),
(32,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:31:28',NULL,1,1),
(33,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:32:31',NULL,1,1),
(34,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:33:51',NULL,1,1),
(35,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:33:53',NULL,1,1),
(36,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:33:55',NULL,1,1),
(37,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:34:44',NULL,1,1),
(38,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:37:11',NULL,1,1),
(39,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:37:56',NULL,1,1),
(40,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:38:19',NULL,1,1),
(41,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:38:35',NULL,1,1),
(42,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:38:41',NULL,1,1),
(43,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:38:52',NULL,1,1),
(44,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:39:03',NULL,1,1),
(45,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:39:40',NULL,1,1),
(46,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:41:32',NULL,1,1),
(47,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:41:36',NULL,1,1),
(48,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:41:53',NULL,1,1),
(49,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:42:20',NULL,1,1),
(50,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:42:27',NULL,1,1),
(51,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:43:26',NULL,1,1),
(52,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:44:14',NULL,1,1),
(53,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:44:18',NULL,1,1),
(54,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:45:22',NULL,1,1),
(55,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:45:35',NULL,1,1),
(56,8,'Bank of Baroda',17000.00,13000.00,'Auto updated: Opening ₹17000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:47:07',NULL,1,1),
(57,8,'Bank of Baroda',17000.00,20000.00,'added 3k','2026-04-08 11:47:33',NULL,1,1),
(58,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:47:33',NULL,1,1),
(59,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:47:52',NULL,1,1),
(60,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:50:25',NULL,1,1),
(61,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-08 11:57:26',NULL,1,1),
(62,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 07:29:11',NULL,1,1),
(63,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:02:38',NULL,1,1),
(64,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:19:41',NULL,1,1),
(65,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:19:52',NULL,1,1),
(66,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:23:41',NULL,1,1),
(67,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:25:09',NULL,1,1),
(68,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:29:50',NULL,1,1),
(69,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:30:21',NULL,1,1),
(70,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:35:49',NULL,1,1),
(71,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:37:02',NULL,1,1),
(72,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:37:56',NULL,1,1),
(73,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:39:37',NULL,1,1),
(74,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 08:45:02',NULL,1,1),
(75,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 09:36:21',NULL,1,1),
(76,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 09:36:39',NULL,1,1),
(77,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 09:37:44',NULL,1,1),
(78,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-09 09:37:48',NULL,1,1),
(79,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 09:45:23',NULL,1,1),
(80,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 09:45:36',NULL,1,1),
(81,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 09:56:21',NULL,1,1),
(82,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 09:56:56',NULL,1,1),
(83,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 10:09:42',NULL,1,1),
(84,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 10:12:28',NULL,1,1),
(85,8,'Bank of Baroda',20000.00,16000.00,'Auto updated: Opening ₹20000.00 + Received ₹6000.00 - Paid ₹10000.00','2026-04-10 10:15:13',NULL,1,1),
(86,8,'Bank of Baroda',20000.00,15000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹5000.00','2026-06-11 07:15:12',NULL,1,1),
(87,8,'Bank of Baroda',20000.00,15000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹5000.00','2026-06-11 07:20:36',NULL,1,1),
(88,8,'Bank of Baroda',20000.00,15000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹5000.00','2026-06-11 07:21:00',NULL,1,1),
(89,8,'Bank of Baroda',20000.00,15000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹5000.00','2026-06-11 07:22:31',NULL,1,1),
(90,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 07:46:11',NULL,1,1),
(91,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 09:34:00',NULL,1,1),
(92,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 09:36:31',NULL,1,1),
(93,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 09:37:36',NULL,1,1),
(94,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 09:50:06',NULL,1,1),
(95,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 10:07:39',NULL,1,1),
(96,8,'Bank of Baroda',20000.00,5000.00,'Auto updated: Opening ₹20000.00 + Received ₹0.00 - Paid ₹15000.00','2026-06-11 10:16:04',NULL,1,1);
/*!40000 ALTER TABLE `finance_bank_master_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_bank_statement_consolidation`
--

DROP TABLE IF EXISTS `finance_bank_statement_consolidation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_bank_statement_consolidation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_year_id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `expense_description` text DEFAULT NULL,
  `cost_center` varchar(255) DEFAULT NULL,
  `cost_center_id` int(11) DEFAULT NULL,
  `po_status` enum('available','not_available') DEFAULT 'not_available',
  `cost_element` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT 0.00,
  `transaction_type` enum('credit','debit') NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `payment_category` enum('purchase','sales','purchase_advance','sales_advance','na') DEFAULT 'na',
  `invoice_date` date DEFAULT NULL,
  `invoice_no` varchar(100) DEFAULT NULL,
  `supplier_customer_name` varchar(255) DEFAULT NULL,
  `utr_details` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_finance_year` (`finance_year_id`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_po_status` (`po_status`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_payment_category` (`payment_category`),
  KEY `fk_bank_statement_cost_center` (`cost_center_id`),
  CONSTRAINT `finance_bank_statement_consolidation_ibfk_1` FOREIGN KEY (`finance_year_id`) REFERENCES `finance_financial_year` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_bank_statement_cost_center` FOREIGN KEY (`cost_center_id`) REFERENCES `finance_cost_center` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_bank_statement_consolidation`
--

LOCK TABLES `finance_bank_statement_consolidation` WRITE;
/*!40000 ALTER TABLE `finance_bank_statement_consolidation` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_bank_statement_consolidation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_bill_to_be_raise`
--

DROP TABLE IF EXISTS `finance_bill_to_be_raise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_bill_to_be_raise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `po_details` varchar(255) DEFAULT NULL,
  `inv_no` varchar(100) DEFAULT NULL,
  `work_completion_date` date DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `party_name` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `sale_amount` decimal(15,2) DEFAULT NULL,
  `gst` decimal(15,2) DEFAULT NULL,
  `total_pyt_due` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_bill_to_be_raise`
--

LOCK TABLES `finance_bill_to_be_raise` WRITE;
/*!40000 ALTER TABLE `finance_bill_to_be_raise` DISABLE KEYS */;
INSERT INTO `finance_bill_to_be_raise` VALUES
(2,'po number348','408','2026-04-04','2026-04-02','2026-04-18','kathir','Flaker retrofitting work\n',213452.39,38421.43,251873.82,'2026-04-09 10:47:32','2026-04-09 10:47:32',3,NULL);
/*!40000 ALTER TABLE `finance_bill_to_be_raise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_bill_to_be_raise_edit_history`
--

DROP TABLE IF EXISTS `finance_bill_to_be_raise_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_bill_to_be_raise_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_bill_to_be_raise_id` int(11) NOT NULL,
  `po_details` varchar(255) DEFAULT NULL,
  `inv_no` varchar(100) DEFAULT NULL,
  `work_completion_date` date DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `party_name` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `sale_amount` decimal(15,2) DEFAULT NULL,
  `gst` decimal(15,2) DEFAULT NULL,
  `total_pyt_due` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_bill_to_be_raise_id` (`finance_bill_to_be_raise_id`),
  CONSTRAINT `finance_bill_to_be_raise_edit_history_ibfk_1` FOREIGN KEY (`finance_bill_to_be_raise_id`) REFERENCES `finance_bill_to_be_raise` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_bill_to_be_raise_edit_history`
--

LOCK TABLES `finance_bill_to_be_raise_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_bill_to_be_raise_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_bill_to_be_raise_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_billed_debtors_receivables`
--

DROP TABLE IF EXISTS `finance_billed_debtors_receivables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_billed_debtors_receivables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_party_id` int(11) NOT NULL,
  `po_details` text DEFAULT NULL,
  `inv_no` varchar(100) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `finance_item_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `uom` int(11) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT 0.00,
  `sale_amount` decimal(10,2) DEFAULT 0.00,
  `gst_amount` decimal(10,2) DEFAULT 0.00,
  `total_payment_due` decimal(10,2) DEFAULT 0.00,
  `date_of_receipt` date DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `balance_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_party_id` (`finance_party_id`),
  KEY `finance_item_id` (`finance_item_id`),
  KEY `uom` (`uom`),
  KEY `fk_finance_bank_id` (`finance_bank_id`),
  CONSTRAINT `finance_billed_debtors_receivables_ibfk_1` FOREIGN KEY (`finance_party_id`) REFERENCES `finance_party` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finance_billed_debtors_receivables_ibfk_2` FOREIGN KEY (`finance_item_id`) REFERENCES `finance_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `finance_billed_debtors_receivables_ibfk_3` FOREIGN KEY (`uom`) REFERENCES `uom_master` (`uom_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_finance_bank_id` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_billed_debtors_receivables`
--

LOCK TABLES `finance_billed_debtors_receivables` WRITE;
/*!40000 ALTER TABLE `finance_billed_debtors_receivables` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_billed_debtors_receivables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_billed_debtors_receivables_edit_history`
--

DROP TABLE IF EXISTS `finance_billed_debtors_receivables_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_billed_debtors_receivables_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_billed_debtors_receivables_id` int(11) NOT NULL,
  `finance_party_id` int(11) NOT NULL,
  `po_details` text DEFAULT NULL,
  `inv_no` varchar(100) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `finance_item_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `uom` int(11) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT 0.00,
  `sale_amount` decimal(10,2) DEFAULT 0.00,
  `gst_amount` decimal(10,2) DEFAULT 0.00,
  `total_payment_due` decimal(10,2) DEFAULT 0.00,
  `date_of_receipt` date DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `balance_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `changed_by` int(11) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_billed_debtors_receivables_id` (`finance_billed_debtors_receivables_id`),
  CONSTRAINT `finance_billed_debtors_receivables_edit_history_ibfk_1` FOREIGN KEY (`finance_billed_debtors_receivables_id`) REFERENCES `finance_billed_debtors_receivables` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_billed_debtors_receivables_edit_history`
--

LOCK TABLES `finance_billed_debtors_receivables_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_billed_debtors_receivables_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_billed_debtors_receivables_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_commission_payable`
--

DROP TABLE IF EXISTS `finance_commission_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_commission_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `cost_category_id` int(11) NOT NULL,
  `marketing_person_id` int(11) NOT NULL,
  `commission_amount_due` decimal(15,2) DEFAULT NULL,
  `date_of_payment` date DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `balance_amount` decimal(15,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_commission_pd_id` (`pd_id`),
  KEY `fk_commission_cost_category` (`cost_category_id`),
  KEY `fk_commission_marketing_person` (`marketing_person_id`),
  KEY `fk_commission_bank` (`finance_bank_id`),
  CONSTRAINT `fk_commission_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commission_cost_category` FOREIGN KEY (`cost_category_id`) REFERENCES `finance_cost_category` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_commission_marketing_person` FOREIGN KEY (`marketing_person_id`) REFERENCES `finance_marketing_persons` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_commission_pd_id` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_commission_payable`
--

LOCK TABLES `finance_commission_payable` WRITE;
/*!40000 ALTER TABLE `finance_commission_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_commission_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_commission_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_commission_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_commission_payable_edit_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_commission_payable_id` int(11) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `pd_id` varchar(30) NOT NULL,
  `cost_category_id` int(11) NOT NULL,
  `marketing_person_id` int(11) NOT NULL,
  `commission_amount_due` decimal(15,2) DEFAULT NULL,
  `date_of_payment` date DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `balance_amount` decimal(15,2) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `fk_commission_history_main` (`finance_commission_payable_id`),
  KEY `fk_history_bank` (`finance_bank_id`),
  CONSTRAINT `fk_commission_history_main` FOREIGN KEY (`finance_commission_payable_id`) REFERENCES `finance_commission_payable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_history_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_commission_payable_edit_history`
--

LOCK TABLES `finance_commission_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_commission_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_commission_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_cost_category`
--

DROP TABLE IF EXISTS `finance_cost_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_cost_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_cost_category`
--

LOCK TABLES `finance_cost_category` WRITE;
/*!40000 ALTER TABLE `finance_cost_category` DISABLE KEYS */;
INSERT INTO `finance_cost_category` VALUES
(1,'Freight charges'),
(2,'wages'),
(3,'office staff'),
(4,'SHS axis');
/*!40000 ALTER TABLE `finance_cost_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_cost_center`
--

DROP TABLE IF EXISTS `finance_cost_center`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_cost_center` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cost_center_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cost_center_name` (`cost_center_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_cost_center`
--

LOCK TABLES `finance_cost_center` WRITE;
/*!40000 ALTER TABLE `finance_cost_center` DISABLE KEYS */;
INSERT INTO `finance_cost_center` VALUES
(1,'Administration','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(2,'Production','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(3,'Sales','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(4,'Marketing','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(5,'Research & Development','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(6,'IT','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(7,'Human Resources','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(8,'Finance','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(9,'Operations','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1),
(10,'Logistics','2026-07-14 08:19:08','2026-07-14 08:19:08',NULL,NULL,1);
/*!40000 ALTER TABLE `finance_cost_center` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_creditcard_payable`
--

DROP TABLE IF EXISTS `finance_creditcard_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_creditcard_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) DEFAULT NULL,
  `cost_category_id` int(11) NOT NULL,
  `due_date` date DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `particulars` varchar(500) NOT NULL,
  `amount_due` decimal(15,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pd_id` (`pd_id`),
  KEY `idx_cost_category` (`cost_category_id`),
  KEY `idx_due_date` (`due_date`),
  KEY `fk_creditcard_bank` (`finance_bank_id`),
  CONSTRAINT `fk_creditcard_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_creditcard_category` FOREIGN KEY (`cost_category_id`) REFERENCES `finance_cost_category` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_creditcard_project` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_creditcard_payable`
--

LOCK TABLES `finance_creditcard_payable` WRITE;
/*!40000 ALTER TABLE `finance_creditcard_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_creditcard_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_creditcard_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_creditcard_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_creditcard_payable_edit_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_creditcard_payable_id` int(11) NOT NULL,
  `pd_id` varchar(30) DEFAULT NULL,
  `cost_category_id` int(11) NOT NULL,
  `due_date` date DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `particulars` varchar(500) NOT NULL,
  `amount_due` decimal(15,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `idx_payable_id` (`finance_creditcard_payable_id`),
  KEY `idx_changed_at` (`changed_at`),
  CONSTRAINT `fk_history_creditcard` FOREIGN KEY (`finance_creditcard_payable_id`) REFERENCES `finance_creditcard_payable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_creditcard_payable_edit_history`
--

LOCK TABLES `finance_creditcard_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_creditcard_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_creditcard_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_creditors`
--

DROP TABLE IF EXISTS `finance_creditors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_creditors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `po_sent_through` varchar(100) DEFAULT NULL,
  `inv_number` varchar(200) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `pdc_date` date DEFAULT NULL,
  `item_code` varchar(100) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `rate` int(11) DEFAULT NULL,
  `sale_amount` decimal(15,2) DEFAULT NULL,
  `gst_amount` decimal(15,2) DEFAULT NULL,
  `total_payment_due` decimal(15,2) DEFAULT NULL,
  `amount_paid` decimal(15,2) DEFAULT NULL,
  `balance_amount` decimal(15,2) DEFAULT NULL,
  `date_of_payment` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_gst` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_finance_creditors_client_id` (`client_id`),
  KEY `fk_creditors_bank` (`finance_bank_id`),
  CONSTRAINT `fk_creditors_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_finance_creditors_client_id` FOREIGN KEY (`client_id`) REFERENCES `finance_creditors_client` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_creditors`
--

LOCK TABLES `finance_creditors` WRITE;
/*!40000 ALTER TABLE `finance_creditors` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_creditors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_creditors_client`
--

DROP TABLE IF EXISTS `finance_creditors_client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_creditors_client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_creditors_client`
--

LOCK TABLES `finance_creditors_client` WRITE;
/*!40000 ALTER TABLE `finance_creditors_client` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_creditors_client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_creditors_edit_history`
--

DROP TABLE IF EXISTS `finance_creditors_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_creditors_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_creditors_id` int(11) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `po_sent_through` varchar(100) DEFAULT NULL,
  `inv_number` varchar(200) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `pdc_date` date DEFAULT NULL,
  `item_code` varchar(100) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `rate` int(11) DEFAULT NULL,
  `sale_amount` decimal(15,2) DEFAULT NULL,
  `gst_amount` decimal(15,2) DEFAULT NULL,
  `total_payment_due` decimal(15,2) DEFAULT NULL,
  `amount_paid` decimal(15,2) DEFAULT NULL,
  `balance_amount` decimal(15,2) DEFAULT NULL,
  `date_of_payment` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_gst` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_finance_creditors_edit_history_id` (`finance_creditors_id`),
  KEY `fk_creditors_history_bank` (`finance_bank_id`),
  CONSTRAINT `fk_creditors_history_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_finance_creditors_edit_history_id` FOREIGN KEY (`finance_creditors_id`) REFERENCES `finance_creditors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_creditors_edit_history`
--

LOCK TABLES `finance_creditors_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_creditors_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_creditors_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_custom_payment_categories`
--

DROP TABLE IF EXISTS `finance_custom_payment_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_custom_payment_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL,
  `payment_type_id` int(10) unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` varchar(50) DEFAULT NULL,
  `paid_receive_amount` varchar(50) DEFAULT NULL,
  `paid_receive_date` date DEFAULT NULL,
  `receipt` varchar(150) DEFAULT NULL,
  `cash` decimal(15,2) DEFAULT 0.00,
  `bank_id` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payment_type_id` (`payment_type_id`),
  KEY `idx_bank_id` (`bank_id`),
  KEY `idx_date` (`date`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `finance_custom_payment_categories_ibfk_1` FOREIGN KEY (`payment_type_id`) REFERENCES `finance_custom_payment_type` (`id`),
  CONSTRAINT `finance_custom_payment_categories_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `finance_custom_payment_categories_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `finance_custom_payment_category_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Custom payments for various categories';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_custom_payment_categories`
--

LOCK TABLES `finance_custom_payment_categories` WRITE;
/*!40000 ALTER TABLE `finance_custom_payment_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_custom_payment_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_custom_payment_categories_edit_history`
--

DROP TABLE IF EXISTS `finance_custom_payment_categories_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_custom_payment_categories_edit_history` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `finance_custom_payment_categories_id` int(10) unsigned NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `payment_type_id` int(10) unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `total_amount` varchar(50) DEFAULT NULL,
  `paid_receive_amount` varchar(50) DEFAULT NULL,
  `paid_receive_date` date DEFAULT NULL,
  `receipt` varchar(150) DEFAULT NULL,
  `cash` decimal(15,2) DEFAULT NULL,
  `bank_id` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `edited_by` int(10) unsigned NOT NULL,
  `edited_at` datetime DEFAULT current_timestamp(),
  `edit_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_custom_payment_categories_id` (`finance_custom_payment_categories_id`),
  KEY `payment_type_id` (`payment_type_id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `finance_custom_payment_categories_edit_history_ibfk_1` FOREIGN KEY (`finance_custom_payment_categories_id`) REFERENCES `finance_custom_payment_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finance_custom_payment_categories_edit_history_ibfk_2` FOREIGN KEY (`payment_type_id`) REFERENCES `finance_custom_payment_type` (`id`),
  CONSTRAINT `finance_custom_payment_categories_edit_history_ibfk_3` FOREIGN KEY (`bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_custom_payment_categories_edit_history`
--

LOCK TABLES `finance_custom_payment_categories_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_custom_payment_categories_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_custom_payment_categories_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_custom_payment_category_master`
--

DROP TABLE IF EXISTS `finance_custom_payment_category_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_custom_payment_category_master` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_name` varchar(120) NOT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_custom_payment_category_master`
--

LOCK TABLES `finance_custom_payment_category_master` WRITE;
/*!40000 ALTER TABLE `finance_custom_payment_category_master` DISABLE KEYS */;
INSERT INTO `finance_custom_payment_category_master` VALUES
(1,'frei',3,'2026-06-06 13:06:12','2026-06-06 13:06:12'),
(2,'Freight Charges',3,'2026-06-06 13:06:23','2026-06-06 13:06:23'),
(3,'fre',3,'2026-06-11 06:56:43','2026-06-11 06:56:43');
/*!40000 ALTER TABLE `finance_custom_payment_category_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_custom_payment_type`
--

DROP TABLE IF EXISTS `finance_custom_payment_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_custom_payment_type` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_custom_payment_type`
--

LOCK TABLES `finance_custom_payment_type` WRITE;
/*!40000 ALTER TABLE `finance_custom_payment_type` DISABLE KEYS */;
INSERT INTO `finance_custom_payment_type` VALUES
(1,'Payable','2026-03-30 11:38:25','2026-03-30 11:38:25'),
(2,'Receivable','2026-03-30 11:38:25','2026-03-30 11:38:25');
/*!40000 ALTER TABLE `finance_custom_payment_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_expected_date_of_receipt`
--

DROP TABLE IF EXISTS `finance_expected_date_of_receipt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_expected_date_of_receipt` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_billed_debtors_receivables_id` int(11) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `expected_from_date` date DEFAULT NULL,
  `expected_to_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_billed_debtors_receivables_id` (`finance_billed_debtors_receivables_id`),
  CONSTRAINT `finance_expected_date_of_receipt_ibfk_1` FOREIGN KEY (`finance_billed_debtors_receivables_id`) REFERENCES `finance_billed_debtors_receivables` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_expected_date_of_receipt`
--

LOCK TABLES `finance_expected_date_of_receipt` WRITE;
/*!40000 ALTER TABLE `finance_expected_date_of_receipt` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_expected_date_of_receipt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_expected_date_of_receipt_edit_history`
--

DROP TABLE IF EXISTS `finance_expected_date_of_receipt_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_expected_date_of_receipt_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_billed_debtors_receivables_id` int(11) NOT NULL,
  `expected_from_date` date DEFAULT NULL,
  `expected_to_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT current_timestamp(),
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_receivable_id` (`finance_billed_debtors_receivables_id`),
  CONSTRAINT `finance_expected_date_of_receipt_edit_history_ibfk_1` FOREIGN KEY (`finance_billed_debtors_receivables_id`) REFERENCES `finance_billed_debtors_receivables` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_expected_date_of_receipt_edit_history`
--

LOCK TABLES `finance_expected_date_of_receipt_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_expected_date_of_receipt_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_expected_date_of_receipt_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_financial_year`
--

DROP TABLE IF EXISTS `finance_financial_year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_financial_year` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `start_year` varchar(10) NOT NULL,
  `end_year` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_year_range` (`start_year`,`end_year`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_financial_year`
--

LOCK TABLES `finance_financial_year` WRITE;
/*!40000 ALTER TABLE `finance_financial_year` DISABLE KEYS */;
INSERT INTO `finance_financial_year` VALUES
(1,'2024','2025',1,'2026-07-14 08:18:11','2026-07-14 08:18:11',NULL,NULL),
(2,'2023','2024',1,'2026-07-14 08:18:11','2026-07-14 08:18:11',NULL,NULL),
(3,'2022','2023',1,'2026-07-14 08:18:11','2026-07-14 08:18:11',NULL,NULL);
/*!40000 ALTER TABLE `finance_financial_year` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_gst_company`
--

DROP TABLE IF EXISTS `finance_gst_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_gst_company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_company_name` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_gst_company`
--

LOCK TABLES `finance_gst_company` WRITE;
/*!40000 ALTER TABLE `finance_gst_company` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_gst_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_gst_entry_type`
--

DROP TABLE IF EXISTS `finance_gst_entry_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_gst_entry_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_gst_entry_type`
--

LOCK TABLES `finance_gst_entry_type` WRITE;
/*!40000 ALTER TABLE `finance_gst_entry_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_gst_entry_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_gst_payable`
--

DROP TABLE IF EXISTS `finance_gst_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_gst_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_gst_company_id` int(11) NOT NULL,
  `month` varchar(50) NOT NULL COMMENT 'e.g., "April-2025" or "2025-04"',
  `entry_type_id` int(11) NOT NULL,
  `input_amount` decimal(15,2) DEFAULT 0.00 COMMENT 'ITC / Input Tax Credit related',
  `output_amount` decimal(15,2) DEFAULT 0.00 COMMENT 'Liability / Output Tax',
  `finance_bank_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_company_month` (`finance_gst_company_id`,`month`),
  KEY `idx_entry_type` (`entry_type_id`),
  KEY `fk_gst_payable_bank` (`finance_bank_id`),
  CONSTRAINT `fk_gst_payable_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payable_company` FOREIGN KEY (`finance_gst_company_id`) REFERENCES `finance_gst_company` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_payable_entry_type` FOREIGN KEY (`entry_type_id`) REFERENCES `finance_gst_entry_type` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_gst_payable`
--

LOCK TABLES `finance_gst_payable` WRITE;
/*!40000 ALTER TABLE `finance_gst_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_gst_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_gst_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_gst_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_gst_payable_edit_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_gst_payable_id` int(11) NOT NULL,
  `finance_gst_company_id` int(11) NOT NULL,
  `month` varchar(50) NOT NULL,
  `entry_type_id` int(11) NOT NULL,
  `input_amount` decimal(15,2) DEFAULT 0.00,
  `output_amount` decimal(15,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  `change_reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `idx_payable_id` (`finance_gst_payable_id`),
  KEY `idx_changed_at` (`changed_at`),
  KEY `idx_company_month` (`finance_gst_company_id`,`month`),
  CONSTRAINT `fk_history_payable` FOREIGN KEY (`finance_gst_payable_id`) REFERENCES `finance_gst_payable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_gst_payable_edit_history`
--

LOCK TABLES `finance_gst_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_gst_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_gst_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_items`
--

DROP TABLE IF EXISTS `finance_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_items`
--

LOCK TABLES `finance_items` WRITE;
/*!40000 ALTER TABLE `finance_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_marketing_persons`
--

DROP TABLE IF EXISTS `finance_marketing_persons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_marketing_persons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `person_name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_marketing_persons`
--

LOCK TABLES `finance_marketing_persons` WRITE;
/*!40000 ALTER TABLE `finance_marketing_persons` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_marketing_persons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_other_payables`
--

DROP TABLE IF EXISTS `finance_other_payables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_other_payables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payable_name` varchar(255) NOT NULL COMMENT 'e.g., Electricity Bill, Rent, Internet, etc.',
  `payable_amount` decimal(15,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`payable_name`),
  KEY `idx_amount` (`payable_amount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_other_payables`
--

LOCK TABLES `finance_other_payables` WRITE;
/*!40000 ALTER TABLE `finance_other_payables` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_other_payables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_other_payables_edit_history`
--

DROP TABLE IF EXISTS `finance_other_payables_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_other_payables_edit_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_other_payables_id` int(11) NOT NULL,
  `payable_name` varchar(255) NOT NULL,
  `payable_amount` decimal(15,2) DEFAULT 0.00,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `idx_payable_id` (`finance_other_payables_id`),
  KEY `idx_changed_at` (`changed_at`),
  CONSTRAINT `fk_history_other_payable` FOREIGN KEY (`finance_other_payables_id`) REFERENCES `finance_other_payables` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_other_payables_edit_history`
--

LOCK TABLES `finance_other_payables_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_other_payables_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_other_payables_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_party`
--

DROP TABLE IF EXISTS `finance_party`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_party` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `party_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_party`
--

LOCK TABLES `finance_party` WRITE;
/*!40000 ALTER TABLE `finance_party` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_party` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_salary_payable`
--

DROP TABLE IF EXISTS `finance_salary_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_salary_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emp_id` varchar(50) NOT NULL,
  `pd_id` varchar(50) NOT NULL,
  `entry_date` datetime NOT NULL DEFAULT current_timestamp(),
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT 'admin',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT 'admin',
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `idx_bank` (`finance_bank_id`),
  KEY `idx_emp_pd_date` (`emp_id`,`pd_id`,`entry_date`),
  KEY `idx_emp_pd_entry_date` (`emp_id`,`pd_id`,`entry_date`),
  CONSTRAINT `finance_salary_payable_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `employee_master` (`emp_id`) ON DELETE CASCADE,
  CONSTRAINT `finance_salary_payable_ibfk_2` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_salary_payable`
--

LOCK TABLES `finance_salary_payable` WRITE;
/*!40000 ALTER TABLE `finance_salary_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_salary_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_salary_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_salary_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_salary_payable_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` enum('INSERT','UPDATE','DELETE') DEFAULT NULL,
  `finance_salary_payable_id` int(11) NOT NULL,
  `emp_id` varchar(50) NOT NULL,
  `pd_id` varchar(50) NOT NULL,
  `entry_date` datetime NOT NULL DEFAULT current_timestamp(),
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT 'admin',
  PRIMARY KEY (`id`),
  KEY `finance_salary_payable_id` (`finance_salary_payable_id`),
  KEY `idx_history_emp_pd` (`emp_id`,`pd_id`,`created_at`),
  CONSTRAINT `finance_salary_payable_edit_history_ibfk_1` FOREIGN KEY (`finance_salary_payable_id`) REFERENCES `finance_salary_payable` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_salary_payable_edit_history`
--

LOCK TABLES `finance_salary_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_salary_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_salary_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_scaffolding_payable`
--

DROP TABLE IF EXISTS `finance_scaffolding_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_scaffolding_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_creditors_client_id` int(11) NOT NULL,
  `pd_id` varchar(50) NOT NULL,
  `cost_category_id` int(11) NOT NULL,
  `period` varchar(255) DEFAULT NULL,
  `qty` varchar(100) DEFAULT NULL,
  `rate` varchar(100) DEFAULT NULL,
  `sale_amount` decimal(10,2) DEFAULT 0.00,
  `gst` decimal(10,2) DEFAULT 0.00,
  `total_payment_due` decimal(10,2) DEFAULT 0.00,
  `date_of_payment` date DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT 'admin',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT 'admin',
  `finance_bank_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_creditors_client_id` (`finance_creditors_client_id`),
  KEY `pd_id` (`pd_id`),
  KEY `cost_category_id` (`cost_category_id`),
  KEY `fk_scaffolding_payable_bank` (`finance_bank_id`),
  CONSTRAINT `finance_scaffolding_payable_ibfk_1` FOREIGN KEY (`finance_creditors_client_id`) REFERENCES `finance_creditors_client` (`id`),
  CONSTRAINT `finance_scaffolding_payable_ibfk_2` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE,
  CONSTRAINT `finance_scaffolding_payable_ibfk_3` FOREIGN KEY (`cost_category_id`) REFERENCES `finance_cost_category` (`id`),
  CONSTRAINT `fk_scaffolding_payable_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_scaffolding_payable`
--

LOCK TABLES `finance_scaffolding_payable` WRITE;
/*!40000 ALTER TABLE `finance_scaffolding_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_scaffolding_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_scaffolding_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_scaffolding_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_scaffolding_payable_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_scaffolding_payable_id` int(11) NOT NULL,
  `finance_creditors_client_id` int(11) NOT NULL,
  `pd_id` varchar(50) NOT NULL,
  `cost_category_id` int(11) NOT NULL,
  `period` varchar(255) DEFAULT NULL,
  `qty` varchar(100) DEFAULT NULL,
  `rate` varchar(100) DEFAULT NULL,
  `sale_amount` decimal(10,2) DEFAULT 0.00,
  `gst` decimal(10,2) DEFAULT 0.00,
  `total_payment_due` decimal(10,2) DEFAULT 0.00,
  `date_of_payment` date DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT 'admin',
  `finance_bank_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_scaffolding_payable_id` (`finance_scaffolding_payable_id`),
  KEY `fk_scaffolding_history_bank` (`finance_bank_id`),
  CONSTRAINT `finance_scaffolding_payable_edit_history_ibfk_1` FOREIGN KEY (`finance_scaffolding_payable_id`) REFERENCES `finance_scaffolding_payable` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scaffolding_history_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_scaffolding_payable_edit_history`
--

LOCK TABLES `finance_scaffolding_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_scaffolding_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_scaffolding_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_site_accomodation_payable`
--

DROP TABLE IF EXISTS `finance_site_accomodation_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_site_accomodation_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `finance_creditors_client_id` int(11) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `advance_amount` decimal(15,2) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `due_period` varchar(50) DEFAULT NULL,
  `due_amount` decimal(15,2) DEFAULT NULL,
  `payment` decimal(15,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `balance_due` decimal(15,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_finance_site_pd_id` (`pd_id`),
  KEY `fk_finance_site_creditors_client` (`finance_creditors_client_id`),
  KEY `fk_site_accom_bank` (`finance_bank_id`),
  CONSTRAINT `fk_finance_site_creditors_client` FOREIGN KEY (`finance_creditors_client_id`) REFERENCES `finance_creditors_client` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_finance_site_pd_id` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_site_accom_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_site_accomodation_payable`
--

LOCK TABLES `finance_site_accomodation_payable` WRITE;
/*!40000 ALTER TABLE `finance_site_accomodation_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_site_accomodation_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_site_accomodation_payable_history`
--

DROP TABLE IF EXISTS `finance_site_accomodation_payable_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_site_accomodation_payable_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_site_accomodation_payable_id` int(11) NOT NULL,
  `pd_id` varchar(30) NOT NULL,
  `finance_creditors_client_id` int(11) NOT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `advance_amount` decimal(15,2) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `due_period` varchar(50) DEFAULT NULL,
  `due_amount` decimal(15,2) DEFAULT NULL,
  `payment` decimal(15,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `balance_due` decimal(15,2) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  `operation` varchar(10) DEFAULT 'UPDATE',
  PRIMARY KEY (`history_id`),
  KEY `fk_history_main_id` (`finance_site_accomodation_payable_id`),
  CONSTRAINT `fk_history_main_id` FOREIGN KEY (`finance_site_accomodation_payable_id`) REFERENCES `finance_site_accomodation_payable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_site_accomodation_payable_history`
--

LOCK TABLES `finance_site_accomodation_payable_history` WRITE;
/*!40000 ALTER TABLE `finance_site_accomodation_payable_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_site_accomodation_payable_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_siteincharge_attendance`
--

DROP TABLE IF EXISTS `finance_siteincharge_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_siteincharge_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `siteincharge_assign_id` int(11) NOT NULL,
  `shift` varchar(50) NOT NULL,
  `created_by` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `entry_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `siteincharge_assign_id` (`siteincharge_assign_id`),
  CONSTRAINT `finance_siteincharge_attendance_ibfk_1` FOREIGN KEY (`siteincharge_assign_id`) REFERENCES `siteincharge_assign` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_siteincharge_attendance`
--

LOCK TABLES `finance_siteincharge_attendance` WRITE;
/*!40000 ALTER TABLE `finance_siteincharge_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_siteincharge_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_siteincharge_attendance_history`
--

DROP TABLE IF EXISTS `finance_siteincharge_attendance_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_siteincharge_attendance_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_siteincharge_attendance_id` int(11) NOT NULL,
  `siteincharge_assign_id` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `shift` varchar(50) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `finance_siteincharge_attendance_id` (`finance_siteincharge_attendance_id`),
  KEY `siteincharge_assign_id` (`siteincharge_assign_id`),
  CONSTRAINT `finance_siteincharge_attendance_history_ibfk_1` FOREIGN KEY (`finance_siteincharge_attendance_id`) REFERENCES `finance_siteincharge_attendance` (`id`),
  CONSTRAINT `finance_siteincharge_attendance_history_ibfk_2` FOREIGN KEY (`siteincharge_assign_id`) REFERENCES `siteincharge_assign` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_siteincharge_attendance_history`
--

LOCK TABLES `finance_siteincharge_attendance_history` WRITE;
/*!40000 ALTER TABLE `finance_siteincharge_attendance_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_siteincharge_attendance_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_tds_payable`
--

DROP TABLE IF EXISTS `finance_tds_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_tds_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) DEFAULT NULL,
  `month` varchar(20) NOT NULL,
  `payable` decimal(15,2) DEFAULT 0.00,
  `returnable` decimal(15,2) DEFAULT 0.00,
  `non_returnable` decimal(15,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pd_month` (`pd_id`,`month`),
  KEY `fk_tds_payable_bank` (`finance_bank_id`),
  CONSTRAINT `fk_tds_payable_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tds_pd_id` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_tds_payable`
--

LOCK TABLES `finance_tds_payable` WRITE;
/*!40000 ALTER TABLE `finance_tds_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_tds_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_tds_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_tds_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_tds_payable_edit_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_tds_payable_id` int(11) NOT NULL,
  `pd_id` varchar(30) NOT NULL,
  `month` varchar(20) NOT NULL,
  `payable` decimal(15,2) DEFAULT NULL,
  `returnable` decimal(15,2) DEFAULT NULL,
  `non_returnable` decimal(15,2) DEFAULT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `fk_tds_history_main` (`finance_tds_payable_id`),
  CONSTRAINT `fk_tds_history_main` FOREIGN KEY (`finance_tds_payable_id`) REFERENCES `finance_tds_payable` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_tds_payable_edit_history`
--

LOCK TABLES `finance_tds_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_tds_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_tds_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_transaction_audit_log`
--

DROP TABLE IF EXISTS `finance_transaction_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_transaction_audit_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `reference_id` bigint(20) NOT NULL,
  `reference_table` varchar(100) NOT NULL,
  `transaction_type` enum('PAYABLE','RECEIVABLE') NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE') NOT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`new_data`)),
  `amount_impact` decimal(15,2) DEFAULT NULL,
  `changed_by` int(11) NOT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `change_reason` text DEFAULT NULL,
  `finance_bank_id` int(11) DEFAULT NULL,
  `pd_id` int(11) DEFAULT NULL,
  `client_party_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ref_table` (`reference_table`),
  KEY `idx_type` (`transaction_type`),
  KEY `idx_bank` (`finance_bank_id`),
  KEY `idx_project` (`pd_id`),
  KEY `idx_date` (`changed_at`),
  KEY `idx_user` (`changed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_transaction_audit_log`
--

LOCK TABLES `finance_transaction_audit_log` WRITE;
/*!40000 ALTER TABLE `finance_transaction_audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_transaction_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_transport_payable`
--

DROP TABLE IF EXISTS `finance_transport_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_transport_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(50) NOT NULL,
  `cost_category_id` int(11) NOT NULL,
  `dc_number` varchar(100) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sale_amount` decimal(10,2) DEFAULT 0.00,
  `gst` decimal(10,2) DEFAULT 0.00,
  `total_payment_due` decimal(10,2) DEFAULT 0.00,
  `date_of_payment` date DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance_amount` decimal(10,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT 'admin',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT 'admin',
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `cost_category_id` (`cost_category_id`),
  KEY `fk_transport_bank` (`finance_bank_id`),
  CONSTRAINT `finance_transport_payable_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE,
  CONSTRAINT `finance_transport_payable_ibfk_2` FOREIGN KEY (`cost_category_id`) REFERENCES `finance_cost_category` (`id`),
  CONSTRAINT `fk_transport_bank` FOREIGN KEY (`finance_bank_id`) REFERENCES `finance_bank_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_transport_payable`
--

LOCK TABLES `finance_transport_payable` WRITE;
/*!40000 ALTER TABLE `finance_transport_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_transport_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_transport_payable_edit_history`
--

DROP TABLE IF EXISTS `finance_transport_payable_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_transport_payable_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finance_transport_payable_id` int(11) NOT NULL,
  `pd_id` varchar(50) NOT NULL,
  `cost_category_id` int(11) NOT NULL,
  `dc_number` varchar(100) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sale_amount` decimal(10,2) DEFAULT 0.00,
  `gst` decimal(10,2) DEFAULT 0.00,
  `total_payment_due` decimal(10,2) DEFAULT 0.00,
  `date_of_payment` date DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance_amount` decimal(10,2) DEFAULT 0.00,
  `finance_bank_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT 'admin',
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `finance_transport_payable_id` (`finance_transport_payable_id`),
  CONSTRAINT `finance_transport_payable_edit_history_ibfk_1` FOREIGN KEY (`finance_transport_payable_id`) REFERENCES `finance_transport_payable` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_transport_payable_edit_history`
--

LOCK TABLES `finance_transport_payable_edit_history` WRITE;
/*!40000 ALTER TABLE `finance_transport_payable_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_transport_payable_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incharge_details`
--

DROP TABLE IF EXISTS `incharge_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `incharge_details` (
  `incharge_id` varchar(30) NOT NULL,
  `incharge_name` varchar(100) NOT NULL,
  `incharge_role_id` varchar(30) NOT NULL,
  PRIMARY KEY (`incharge_id`),
  KEY `incharge_role_id` (`incharge_role_id`),
  CONSTRAINT `incharge_details_ibfk_1` FOREIGN KEY (`incharge_role_id`) REFERENCES `site_incharge` (`incharge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incharge_details`
--

LOCK TABLES `incharge_details` WRITE;
/*!40000 ALTER TABLE `incharge_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `incharge_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_category`
--

DROP TABLE IF EXISTS `item_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_category` (
  `category_id` varchar(30) NOT NULL,
  `category_name` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_category`
--

LOCK TABLES `item_category` WRITE;
/*!40000 ALTER TABLE `item_category` DISABLE KEYS */;
INSERT INTO `item_category` VALUES
('CA101','Structural Painting'),
('CA102','PipeLine'),
('CA103','stickering'),
('CA104','Cool Coating'),
('CA105','Coolroof Coating'),
('CA106','wall coating'),
('CA107','Cleaning '),
('CA108','Roof Work'),
('CA109','ROOF SHEET'),
('CA110','Roof Coating '),
('CA111','Tank work');
/*!40000 ALTER TABLE `item_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_subcategory`
--

DROP TABLE IF EXISTS `item_subcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_subcategory` (
  `subcategory_id` varchar(30) NOT NULL,
  `subcategory_name` varchar(70) DEFAULT NULL,
  `billing` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`subcategory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_subcategory`
--

LOCK TABLES `item_subcategory` WRITE;
/*!40000 ALTER TABLE `item_subcategory` DISABLE KEYS */;
INSERT INTO `item_subcategory` VALUES
('SC101','Cleaning',0),
('SC102','Primer',0),
('SC103','1st Coat',0),
('SC104','2nd Coat',0),
('SC105','Top Coat',1),
('SC106','Arrow',1),
('SC107','Font Sticker',1),
('SC108','Pasting',1),
('SC109','Technobond HS',0),
('SC110','FREP For Joints',0),
('SC111','Technobond for full area',0),
('SC112','Reflectkoat',0),
('SC113','Sathya nano coat',0),
('SC114','Sathya Nanokoat 2000',0),
('SC115','Sathya Nanokoat 2000',0),
('SC116','Grinding ',0),
('SC117','Sathya Omegakoat White (3:1)',0),
('SC118','Sathya TCPU UVR 500 White (5:1)',0);
/*!40000 ALTER TABLE `item_subcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour`
--

DROP TABLE IF EXISTS `labour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `date_of_joining` date NOT NULL,
  `company` varchar(255) NOT NULL,
  `branch` varchar(255) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `company_email` varchar(255) NOT NULL,
  `current_address` text NOT NULL,
  `permanent_address` text NOT NULL,
  `gender_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `emp_type_id` int(11) NOT NULL,
  `designation_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `esic_number` varchar(50) DEFAULT NULL,
  `pf_number` varchar(50) DEFAULT NULL,
  `contractor_id` int(11) DEFAULT NULL,
  `approved_salary` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contractor_id` (`contractor_id`),
  KEY `emp_type_id` (`emp_type_id`),
  KEY `labour_ibfk_2` (`gender_id`),
  KEY `labour_ibfk_3` (`dept_id`),
  KEY `labour_ibfk_5` (`designation_id`),
  KEY `labour_ibfk_6` (`status_id`),
  CONSTRAINT `labour_ibfk_1` FOREIGN KEY (`contractor_id`) REFERENCES `contractor` (`id`) ON DELETE SET NULL,
  CONSTRAINT `labour_ibfk_2` FOREIGN KEY (`gender_id`) REFERENCES `emp_gender` (`id`),
  CONSTRAINT `labour_ibfk_3` FOREIGN KEY (`dept_id`) REFERENCES `emp_department` (`id`),
  CONSTRAINT `labour_ibfk_4` FOREIGN KEY (`emp_type_id`) REFERENCES `employment_type` (`id`),
  CONSTRAINT `labour_ibfk_5` FOREIGN KEY (`designation_id`) REFERENCES `emp_designation` (`id`),
  CONSTRAINT `labour_ibfk_6` FOREIGN KEY (`status_id`) REFERENCES `emp_status` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour`
--

LOCK TABLES `labour` WRITE;
/*!40000 ALTER TABLE `labour` DISABLE KEYS */;
/*!40000 ALTER TABLE `labour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_assignment`
--

DROP TABLE IF EXISTS `labour_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `labour_id` int(11) DEFAULT NULL,
  `salary` decimal(15,2) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_assignment`
--

LOCK TABLES `labour_assignment` WRITE;
/*!40000 ALTER TABLE `labour_assignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `labour_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_assignment_edit_history`
--

DROP TABLE IF EXISTS `labour_assignment_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_assignment_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `labour_assignment_id` int(11) NOT NULL,
  `project_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int(11) NOT NULL,
  `labour_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `salary` decimal(15,2) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
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
  CONSTRAINT `labour_assignment_edit_history_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project_details` (`pd_id`),
  CONSTRAINT `labour_assignment_edit_history_ibfk_3` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`),
  CONSTRAINT `labour_assignment_edit_history_ibfk_4` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`),
  CONSTRAINT `labour_assignment_edit_history_ibfk_5` FOREIGN KEY (`labour_id`) REFERENCES `labour` (`id`),
  CONSTRAINT `labour_assignment_edit_history_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `labour_assignment_edit_history_ibfk_7` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_assignment_edit_history`
--

LOCK TABLES `labour_assignment_edit_history` WRITE;
/*!40000 ALTER TABLE `labour_assignment_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `labour_assignment_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_attendance`
--

DROP TABLE IF EXISTS `labour_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `labour_assignment_id` int(11) NOT NULL,
  `shift` decimal(3,1) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `entry_date` date NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labour_assignment_id` (`labour_assignment_id`),
  KEY `created_by` (`created_by`),
  KEY `fk_labour_attendance_updated_by` (`updated_by`),
  CONSTRAINT `fk_labour_attendance_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `labour_attendance_ibfk_1` FOREIGN KEY (`labour_assignment_id`) REFERENCES `labour_assignment` (`id`),
  CONSTRAINT `labour_attendance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_attendance`
--

LOCK TABLES `labour_attendance` WRITE;
/*!40000 ALTER TABLE `labour_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `labour_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_attendance_edit_history`
--

DROP TABLE IF EXISTS `labour_attendance_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_attendance_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `labour_attendance_id` int(11) NOT NULL,
  `labour_assignment_id` int(11) NOT NULL,
  `shift` decimal(3,1) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labour_attendance_id` (`labour_attendance_id`),
  KEY `labour_assignment_id` (`labour_assignment_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `labour_attendance_edit_history_ibfk_1` FOREIGN KEY (`labour_attendance_id`) REFERENCES `labour_attendance` (`id`) ON DELETE CASCADE,
  CONSTRAINT `labour_attendance_edit_history_ibfk_2` FOREIGN KEY (`labour_assignment_id`) REFERENCES `labour_assignment` (`id`),
  CONSTRAINT `labour_attendance_edit_history_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `labour_attendance_edit_history_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_attendance_edit_history`
--

LOCK TABLES `labour_attendance_edit_history` WRITE;
/*!40000 ALTER TABLE `labour_attendance_edit_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `labour_attendance_edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labour_overhead`
--

DROP TABLE IF EXISTS `labour_overhead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `labour_overhead` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int(11) NOT NULL,
  `calculation_type` enum('no_of_labours','total_shifts') NOT NULL,
  `no_of_labours` int(11) DEFAULT NULL,
  `total_shifts` int(11) DEFAULT NULL,
  `rate_per_shift` decimal(10,2) NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  `overhead_type` varchar(50) DEFAULT 'labour',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `projection_id` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labour_overhead`
--

LOCK TABLES `labour_overhead` WRITE;
/*!40000 ALTER TABLE `labour_overhead` DISABLE KEYS */;
/*!40000 ALTER TABLE `labour_overhead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `location_id` varchar(30) NOT NULL,
  `location_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES
('LO001','Kanchipuram'),
('LO002','Erode'),
('LO003','Chennai'),
('LO004','Chengalpattu'),
('LO005','Dindigul'),
('LO006','Coimbatore'),
('LO007','Pollachi'),
('LO008','Perundurai'),
('LO009','TIRUPATI');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `master_dc_no`
--

DROP TABLE IF EXISTS `master_dc_no`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_dc_no` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dc_no` varchar(100) NOT NULL,
  `company_id` varchar(10) DEFAULT NULL,
  `created_by` varchar(30) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `master_dc_no_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_dc_no`
--

LOCK TABLES `master_dc_no` WRITE;
/*!40000 ALTER TABLE `master_dc_no` DISABLE KEYS */;
/*!40000 ALTER TABLE `master_dc_no` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_acknowledgement`
--

DROP TABLE IF EXISTS `material_acknowledgement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_acknowledgement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_dispatch_id` int(11) NOT NULL,
  `comp_a_qty` int(11) DEFAULT NULL,
  `comp_b_qty` int(11) DEFAULT NULL,
  `comp_c_qty` int(11) DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `overall_quantity` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_dispatch_id` (`material_dispatch_id`),
  CONSTRAINT `material_acknowledgement_ibfk_1` FOREIGN KEY (`material_dispatch_id`) REFERENCES `material_dispatch` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_acknowledgement`
--

LOCK TABLES `material_acknowledgement` WRITE;
/*!40000 ALTER TABLE `material_acknowledgement` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_acknowledgement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_acknowledgement_history`
--

DROP TABLE IF EXISTS `material_acknowledgement_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_acknowledgement_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_acknowledgement_id` int(11) NOT NULL,
  `material_dispatch_id` int(11) NOT NULL,
  `comp_a_qty` int(11) DEFAULT NULL,
  `comp_b_qty` int(11) DEFAULT NULL,
  `comp_c_qty` int(11) DEFAULT NULL,
  `comp_a_remarks` text DEFAULT NULL,
  `comp_b_remarks` text DEFAULT NULL,
  `comp_c_remarks` text DEFAULT NULL,
  `overall_quantity` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `material_acknowledgement_id` (`material_acknowledgement_id`),
  CONSTRAINT `material_acknowledgement_history_ibfk_1` FOREIGN KEY (`material_acknowledgement_id`) REFERENCES `material_acknowledgement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_assign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `item_id` varchar(50) NOT NULL,
  `uom_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `comp_ratio_a` int(11) DEFAULT NULL,
  `comp_ratio_b` int(11) DEFAULT NULL,
  `comp_ratio_c` int(11) DEFAULT NULL,
  `desc_id` int(11) DEFAULT NULL,
  `rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_by` varchar(30) NOT NULL,
  `projection_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `site_id` (`site_id`),
  KEY `item_id` (`item_id`),
  KEY `uom_id` (`uom_id`),
  KEY `fk_material_assign_desc_id` (`desc_id`),
  CONSTRAINT `fk_material_assign_desc_id` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`),
  CONSTRAINT `material_assign_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`),
  CONSTRAINT `material_assign_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`),
  CONSTRAINT `material_assign_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `material_master` (`item_id`),
  CONSTRAINT `material_assign_ibfk_4` FOREIGN KEY (`uom_id`) REFERENCES `uom_master` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_assign`
--

LOCK TABLES `material_assign` WRITE;
/*!40000 ALTER TABLE `material_assign` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_assign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_dispatch`
--

DROP TABLE IF EXISTS `material_dispatch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_dispatch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_assign_id` int(11) NOT NULL,
  `desc_id` int(11) DEFAULT NULL,
  `dc_no` int(11) NOT NULL,
  `dispatch_date` date NOT NULL,
  `dispatch_qty` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comp_a_qty` int(11) DEFAULT NULL,
  `comp_b_qty` int(11) DEFAULT NULL,
  `comp_c_qty` int(11) DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_material_assign_id` (`material_assign_id`),
  KEY `fk_material_dispatch_desc_id` (`desc_id`),
  CONSTRAINT `fk_material_assign_id` FOREIGN KEY (`material_assign_id`) REFERENCES `material_assign` (`id`),
  CONSTRAINT `fk_material_dispatch_desc_id` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_dispatch`
--

LOCK TABLES `material_dispatch` WRITE;
/*!40000 ALTER TABLE `material_dispatch` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_dispatch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_master`
--

DROP TABLE IF EXISTS `material_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_master` (
  `item_id` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_master`
--

LOCK TABLES `material_master` WRITE;
/*!40000 ALTER TABLE `material_master` DISABLE KEYS */;
INSERT INTO `material_master` VALUES
('item_00129','material50'),
('item_1','CPS'),
('item_10','Sathya Omegakoat 6000 FR Grey'),
('item_100','Sathya Fluorocoat 9000'),
('item_101','DW CS BC'),
('item_102','No.1 sand'),
('item_103','DW CS TC Pastel Green'),
('item_104','SLF - SG Pastel Green'),
('item_105','Sathya SLF - G RAL 7040 Grey'),
('item_106','Sathya ZPP Primer Grey'),
('item_107','SCPU TCPU DA Grey'),
('item_108','NONO KOAT 2000'),
('item_109','OMEGAKOAT 6000'),
('item_11','Sathya Omegakoat FR PU Grey'),
('item_110','Sathya HB PA Pearl Grey'),
('item_111','Reflectkoat white'),
('item_11130','material56'),
('item_11131','new material3'),
('item_112','Powder For Light Green'),
('item_113','SCPL TCPU Light Green'),
('item_114','new materisl'),
('item_115','new material 2'),
('item_116','newmaterial3'),
('item_117','newmaterial4'),
('item_118','material5'),
('item_119','material6'),
('item_12','Sathya Omegakoat EPM 6000'),
('item_120','material7'),
('item_121','material8'),
('item_122','material9'),
('item_123','material10'),
('item_124','material11'),
('item_125','material12'),
('item_126','material12'),
('item_127','material13'),
('item_128','material22'),
('item_13','SCPL TCPU RAL 5017'),
('item_14','SCPL TCPU RAL 1026 yellow'),
('item_15','SCPL TCPU RAL 6037'),
('item_16','Sathya Nanokoat 2000'),
('item_17','TCPU Clear'),
('item_18','TCPU Clear'),
('item_19','SCPL TCPU Smoke Grey'),
('item_2','CPS PU'),
('item_20','DTM UHB 6000 Smoke Grey'),
('item_21','DTM 6000 UHB - 3K'),
('item_22','SCPL TCPU Golden yellow'),
('item_23','DTM 1K PU Maroon'),
('item_24','Sathya ROZP Brown'),
('item_25','Sathya TCPU UVR 750 Dark Green'),
('item_26','Sathya TCPU UVR 750 Smoke Grey'),
('item_27','Sathya DTM 600 Grey'),
('item_28','Sathya TCPU UVR 750 Golden yellow'),
('item_29','Sathya TCPU UVR 750 Sea Green'),
('item_3','Sathya Duramort EP'),
('item_30','Sathya TCPU UVR 750 Sky Blue'),
('item_31','Sathya TCPU PO Red'),
('item_32','Sathya TCPU UVR 750 Black'),
('item_33','Sathya TCPU UVR 750 Signal Red'),
('item_34','Sathya TCPU UVR 750 Canary yellow'),
('item_35','Sathya TCPU UVR 750 PO Red'),
('item_36','Stickers'),
('item_37','Sathya ZPP Primer'),
('item_38','Acrylic Primer'),
('item_39','Sathya HBE Epoxy Light Green'),
('item_4','Solvent'),
('item_40','Aliphatic TCPU UVR 500 Dark Green'),
('item_41','Fluorokoat 9000 - Comp.B'),
('item_42','Sathya Reflectkoat white'),
('item_43','All Surface Roller'),
('item_44','SCC'),
('item_45','DW CS Primer'),
('item_46','Sand'),
('item_47','DW CS TC Smoke Grey'),
('item_48','TCPU RAL 7043 Grey'),
('item_49','HBPU Int. Silver Grey'),
('item_5','Duracrete PU Pearl Grey'),
('item_50','HBPU Ext. Silver Grey'),
('item_51','AFC Topcot Crimson'),
('item_52','Rainguard PRO - Morning Glory'),
('item_53','Sathya Line Marking Golden yellow'),
('item_54','SCPL TCPU UVR 500 Golden yellow'),
('item_55','Sathya SF ZPP Grey'),
('item_56','SCPL TCPU RAL 2003 Orange'),
('item_57','SCPL TCPU UVR 500 Black'),
('item_58','Sathya DTM 1K PU Dark Grey'),
('item_59','Sathya DTM Red'),
('item_6','Duracrete PU Pearl Grey'),
('item_60','Sathya TCPU DA Grey'),
('item_61','H.B.C.1000 White'),
('item_62','Sathya DTM 2K PU Light Green'),
('item_63','Sathya TCPU UVR 500 Grey'),
('item_64','CLEANING SOLVENT'),
('item_65','Sathya HBE Epoxy Line Marking Golden yellow'),
('item_66','Sathya SF HBE Epoxy Pearl Grey'),
('item_67','Sathya SF PU Prime'),
('item_68','Sathya HYC PU LIGHT BLUE'),
('item_69','Roller'),
('item_7','SCPL TCPU Pink'),
('item_70','Tray'),
('item_71','Putty Blade 4'),
('item_72','Sheet'),
('item_73','Interior Royale Roller'),
('item_74','Sathya HYC PU Beige'),
('item_75','9\" Roller'),
('item_76','2\" Brush'),
('item_77','Empty Plastic pail'),
('item_78','Sathya HB PU RAL 7002 Olive Grey'),
('item_79','Sathya SLS Screed'),
('item_8','SCPL TCPU Blue RAL 5015'),
('item_80','Sathya HB PU RAL 7031 Grey'),
('item_81','Sathya HB PU RAL 7035 Grey'),
('item_82','SCPL TCPU Red'),
('item_83','SCPL TCPU Sky Blue'),
('item_84','Sathya SLF - SG Pearl Grey'),
('item_85','Sathya SLF - SG Pearl Grey'),
('item_86','Sathya SLF - G Pearl Grey'),
('item_87','Sathya SLF PU 2K P.Green'),
('item_88','Sathya SLF PU 2K French Blue'),
('item_89','ESDEE Coat PU Paint'),
('item_9','Sathya Omegakoat 6000 Grey'),
('item_90','Vertical Fall Arrest Equipment'),
('item_91','SCPL ZPP Grey'),
('item_92','Durakoat TCPU Oxford Blue'),
('item_93','SCPL TCPU Ivory'),
('item_94','Durakoat TCPU Opaline Green'),
('item_95','GREENSOL 9000'),
('item_96','CRE FR - Nile Blue'),
('item_97','Sathya Technobond FR EP Grey'),
('item_98','Sathya Technobond FR PU'),
('item_99','SCPL TCPU Silver Grey');
/*!40000 ALTER TABLE `material_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_usage`
--

DROP TABLE IF EXISTS `material_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_ack_id` int(11) DEFAULT NULL,
  `comp_a_qty` int(11) DEFAULT NULL,
  `comp_b_qty` int(11) DEFAULT NULL,
  `comp_c_qty` int(11) DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `overall_qty` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `material_ack_id` (`material_ack_id`),
  CONSTRAINT `material_usage_ibfk_1` FOREIGN KEY (`material_ack_id`) REFERENCES `material_acknowledgement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_usage`
--

LOCK TABLES `material_usage` WRITE;
/*!40000 ALTER TABLE `material_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_usage_edit_history`
--

DROP TABLE IF EXISTS `material_usage_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_usage_edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_usage_history_id` bigint(20) NOT NULL,
  `material_ack_id` int(11) NOT NULL,
  `comp_a_qty` int(11) DEFAULT NULL,
  `comp_b_qty` int(11) DEFAULT NULL,
  `comp_c_qty` int(11) DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `overall_qty` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` varchar(30) NOT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `material_usage_history_id` (`material_usage_history_id`),
  CONSTRAINT `material_usage_edit_history_ibfk_1` FOREIGN KEY (`material_usage_history_id`) REFERENCES `material_usage_history` (`entry_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_usage_history` (
  `entry_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `material_ack_id` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `comp_a_qty` int(11) DEFAULT NULL,
  `comp_b_qty` int(11) DEFAULT NULL,
  `comp_c_qty` int(11) DEFAULT NULL,
  `comp_a_remarks` varchar(255) DEFAULT NULL,
  `comp_b_remarks` varchar(255) DEFAULT NULL,
  `comp_c_remarks` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `overall_qty` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`entry_id`),
  KEY `material_ack_id` (`material_ack_id`),
  CONSTRAINT `material_usage_history_ibfk_1` FOREIGN KEY (`material_ack_id`) REFERENCES `material_acknowledgement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_usage_history`
--

LOCK TABLES `material_usage_history` WRITE;
/*!40000 ALTER TABLE `material_usage_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_usage_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `overhead`
--

DROP TABLE IF EXISTS `overhead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `overhead` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expense_name` varchar(100) NOT NULL,
  `is_default` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `overhead`
--

LOCK TABLES `overhead` WRITE;
/*!40000 ALTER TABLE `overhead` DISABLE KEYS */;
INSERT INTO `overhead` VALUES
(1,'materials',1),
(2,'labours',1),
(3,'consumables',0),
(4,'rent',0),
(5,'Accomadation',0),
(6,'Petty Cash',0),
(8,'labours',0),
(9,'materials',0),
(10,'consumables',0),
(11,'rent',0),
(12,'Accomadations',0);
/*!40000 ALTER TABLE `overhead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petty_cash`
--

DROP TABLE IF EXISTS `petty_cash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `petty_cash` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `assign_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `previous_remaining_amount` decimal(10,2) DEFAULT NULL,
  `desc_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `site_id` (`site_id`),
  KEY `fk_petty_cash_work_descriptions` (`desc_id`),
  CONSTRAINT `fk_petty_cash_work_descriptions` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`) ON UPDATE CASCADE,
  CONSTRAINT `petty_cash_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`),
  CONSTRAINT `petty_cash_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petty_cash`
--

LOCK TABLES `petty_cash` WRITE;
/*!40000 ALTER TABLE `petty_cash` DISABLE KEYS */;
/*!40000 ALTER TABLE `petty_cash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pipeline`
--

DROP TABLE IF EXISTS `pipeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pipeline` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `po_budget` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_id` varchar(50) NOT NULL,
  `desc_id` int(11) NOT NULL,
  `total_po_value` decimal(15,2) NOT NULL,
  `total_budget_value` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `projection_id` int(11) DEFAULT NULL,
  `projection_status` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_site_desc_projection` (`site_id`,`desc_id`,`projection_id`),
  KEY `desc_id` (`desc_id`),
  CONSTRAINT `po_budget_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`),
  CONSTRAINT `po_budget_ibfk_2` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po_budget`
--

LOCK TABLES `po_budget` WRITE;
/*!40000 ALTER TABLE `po_budget` DISABLE KEYS */;
/*!40000 ALTER TABLE `po_budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `po_reckoner`
--

DROP TABLE IF EXISTS `po_reckoner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `po_reckoner` (
  `rec_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` varchar(30) DEFAULT NULL,
  `subcategory_id` varchar(30) DEFAULT NULL,
  `po_quantity` int(11) DEFAULT NULL,
  `uom` varchar(10) DEFAULT NULL,
  `rate` float DEFAULT NULL,
  `value` float DEFAULT NULL,
  `site_id` varchar(30) DEFAULT NULL,
  `desc_id` varchar(10) DEFAULT NULL,
  `item_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`rec_id`),
  KEY `fk_category` (`category_id`),
  KEY `fk_subcategory` (`subcategory_id`),
  KEY `fk_po_reckoner_site` (`site_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `item_category` (`category_id`),
  CONSTRAINT `fk_po_reckoner_site` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `item_subcategory` (`subcategory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po_reckoner`
--

LOCK TABLES `po_reckoner` WRITE;
/*!40000 ALTER TABLE `po_reckoner` DISABLE KEYS */;
/*!40000 ALTER TABLE `po_reckoner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_details`
--

DROP TABLE IF EXISTS `project_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_details` (
  `pd_id` varchar(30) NOT NULL,
  `company_id` varchar(30) DEFAULT NULL,
  `project_type_id` varchar(30) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`pd_id`),
  KEY `fk_company_details` (`company_id`),
  KEY `fk_project_type` (`project_type_id`),
  CONSTRAINT `fk_company_details` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  CONSTRAINT `fk_project_type` FOREIGN KEY (`project_type_id`) REFERENCES `project_type` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_details`
--

LOCK TABLES `project_details` WRITE;
/*!40000 ALTER TABLE `project_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_type`
--

DROP TABLE IF EXISTS `project_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_type` (
  `type_id` varchar(30) NOT NULL,
  `type_description` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_type`
--

LOCK TABLES `project_type` WRITE;
/*!40000 ALTER TABLE `project_type` DISABLE KEYS */;
INSERT INTO `project_type` VALUES
('PT001','service'),
('PT002','supply');
/*!40000 ALTER TABLE `project_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_updation_history`
--

DROP TABLE IF EXISTS `project_updation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_updation_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) DEFAULT NULL,
  `company_id` varchar(30) DEFAULT NULL,
  `project_type_id` varchar(30) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_time` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  CONSTRAINT `project_updation_history_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projection_allocated` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int(11) NOT NULL,
  `overhead_type_id` int(11) NOT NULL,
  `projection_id` int(11) NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  `budget_percentage` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projection_allocated`
--

LOCK TABLES `projection_allocated` WRITE;
/*!40000 ALTER TABLE `projection_allocated` DISABLE KEYS */;
/*!40000 ALTER TABLE `projection_allocated` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projection_remaining`
--

DROP TABLE IF EXISTS `projection_remaining`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projection_remaining` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_id` varchar(50) NOT NULL,
  `desc_id` int(11) NOT NULL,
  `remaining_budget` decimal(15,2) DEFAULT 0.00,
  `remaining_percentage` decimal(5,2) DEFAULT 0.00,
  `projection_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `desc_id` (`desc_id`),
  KEY `idx_site_desc_proj` (`site_id`,`desc_id`,`projection_id`),
  CONSTRAINT `projection_remaining_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE CASCADE,
  CONSTRAINT `projection_remaining_ibfk_2` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projection_remaining`
--

LOCK TABLES `projection_remaining` WRITE;
/*!40000 ALTER TABLE `projection_remaining` DISABLE KEYS */;
/*!40000 ALTER TABLE `projection_remaining` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_master`
--

DROP TABLE IF EXISTS `provider_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `transport_type_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transport_type_id` (`transport_type_id`),
  CONSTRAINT `provider_master_ibfk_1` FOREIGN KEY (`transport_type_id`) REFERENCES `transport_type` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_master`
--

LOCK TABLES `provider_master` WRITE;
/*!40000 ALTER TABLE `provider_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `provider_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reckoner_types`
--

DROP TABLE IF EXISTS `reckoner_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reckoner_types` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reckoner_types`
--

LOCK TABLES `reckoner_types` WRITE;
/*!40000 ALTER TABLE `reckoner_types` DISABLE KEYS */;
INSERT INTO `reckoner_types` VALUES
(1,'Sample'),
(2,'Approved'),
(3,'Not Approved');
/*!40000 ALTER TABLE `reckoner_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_master`
--

DROP TABLE IF EXISTS `report_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_master` (
  `report_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `site_id` varchar(30) NOT NULL,
  PRIMARY KEY (`report_id`),
  KEY `site_id` (`site_id`),
  CONSTRAINT `report_master_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_master`
--

LOCK TABLES `report_master` WRITE;
/*!40000 ALTER TABLE `report_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_type`
--

DROP TABLE IF EXISTS `report_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_type` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_type`
--

LOCK TABLES `report_type` WRITE;
/*!40000 ALTER TABLE `report_type` DISABLE KEYS */;
INSERT INTO `report_type` VALUES
(1,'SPR'),
(2,'MDR'),
(3,'MUR');
/*!40000 ALTER TABLE `report_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_consumables`
--

DROP TABLE IF EXISTS `resource_consumables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_consumables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consumable_name` varchar(255) NOT NULL,
  `is_multi_use` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=278 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_consumables`
--

LOCK TABLES `resource_consumables` WRITE;
/*!40000 ALTER TABLE `resource_consumables` DISABLE KEYS */;
INSERT INTO `resource_consumables` VALUES
(1,'Safety helmet-02 nos',1,'2025-12-22 06:42:06'),
(2,'lifting rope',0,'2025-12-22 06:42:06'),
(3,'Labour safety shoe-01 nos',0,'2025-12-22 06:42:06'),
(4,'Goggles -10 nos',0,'2025-12-22 06:42:06'),
(5,'Hand gloves-20 nos',1,'2025-12-22 06:42:06'),
(6,'roller-20 nos',1,'2025-12-22 06:42:06'),
(7,'mask-10 nos',1,'2025-12-22 06:42:06'),
(8,'safety shoe(lenin)',0,'2025-12-22 06:42:06'),
(9,'ms scrabber -01 nos',0,'2025-12-22 06:42:06'),
(10,'wire brush-05 nos',0,'2025-12-22 06:42:06'),
(11,'16mm life line rope -2.6kg',0,'2025-12-22 06:42:06'),
(12,'Thinner-3L',1,'2025-12-22 06:42:06'),
(13,'roller-20 nos',0,'2025-12-22 06:42:06'),
(14,'MSS transport and pickup charge',0,'2025-12-22 06:42:06'),
(15,'roller-20 nos',0,'2025-12-22 06:42:06'),
(16,'Drinking can for workers',1,'2025-12-22 06:42:06'),
(17,'roller-20 nos',0,'2025-12-22 06:42:06'),
(18,'Goggles -10 nos',0,'2025-12-22 06:42:06'),
(19,'thinner-6L',0,'2025-12-22 06:42:06'),
(20,'thinner-6L',0,'2025-12-22 06:42:06'),
(21,'MSS transport and pickup charge',0,'2025-12-22 06:42:06'),
(22,'Labour safety shoe-01 nos(Gulab)',0,'2025-12-22 06:42:06'),
(23,'roller-20 nos',0,'2025-12-22 06:42:06'),
(24,'Emery roll-2m',1,'2025-12-22 06:42:06'),
(25,'Tester-01 nos',0,'2025-12-22 06:42:06'),
(26,'fan capacitor-01 nos',0,'2025-12-22 06:42:06'),
(27,'insulation tape-01 nos',0,'2025-12-22 06:42:06'),
(28,'Chipping Hamme-02 nos',0,'2025-12-22 06:42:06'),
(29,'roller-20 nos',1,'2025-12-22 06:42:06'),
(30,'scrapper-02 nos',1,'2025-12-22 06:42:06'),
(31,'scrapper handle-02 nos',0,'2025-12-22 06:42:06'),
(32,'MSS transport and pickup charge',0,'2025-12-22 06:42:06'),
(33,'touchup brush-30 nos',0,'2025-12-22 06:42:06'),
(34,'roller-20 nos',0,'2025-12-22 06:42:06'),
(35,'Room shifting pickup charge',1,'2025-12-22 06:42:06'),
(36,'roller-20 nos',0,'2025-12-22 06:42:06'),
(37,'scrapper-02 nos',0,'2025-12-22 06:42:06'),
(38,'scapper Handle -02 nos',0,'2025-12-22 06:42:06'),
(39,'Hand gloves-20 nos',0,'2025-12-22 06:42:06'),
(40,'Emery roll-1m',0,'2025-12-22 06:42:06'),
(41,'50W led light',1,'2025-12-22 06:42:06'),
(42,'cable 10m',0,'2025-12-22 06:42:06'),
(43,'3pin socket',0,'2025-12-22 06:42:06'),
(44,'roller-10 nos',0,'2025-12-22 06:42:06'),
(45,'life line rope -15kg',0,'2025-12-22 06:42:06'),
(46,'2 inch Brush-03 nos',1,'2025-12-22 06:42:06'),
(47,'roller-40 nos',1,'2025-12-22 06:42:06'),
(48,'Hand gloves-10 nos',0,'2025-12-22 06:42:06'),
(49,'Goggles -10 nos',0,'2025-12-22 06:42:06'),
(50,'height work suppotive doc Printout',0,'2025-12-22 06:42:06'),
(51,'sathya coating seal -02 nos',0,'2025-12-22 06:42:06'),
(52,'mask-10 nos',1,'2025-12-22 06:42:06'),
(53,'EB bill labour room',0,'2025-12-22 06:42:06'),
(54,'EB bill Eng room',1,'2025-12-22 06:42:06'),
(55,'roller-20 nos',0,'2025-12-22 06:42:06'),
(56,'Safety reflection jacket-10 nos',1,'2025-12-22 06:42:06'),
(57,'roller-20 nos',0,'2025-12-22 06:42:06'),
(58,'MSS transport and pickup charge',0,'2025-12-22 06:42:06'),
(59,'roller-20 nos',0,'2025-12-22 06:42:06'),
(60,'mask-10 nos',0,'2025-12-22 06:42:06'),
(61,'emri papper-2m',0,'2025-12-22 06:42:06'),
(62,'Helmet for engineer-1nos',1,'2025-12-22 06:42:06'),
(63,'safety reflection jacket for engineer-01 nos',1,'2025-12-22 06:42:06'),
(64,'MSS transport and pickup charge',1,'2025-12-22 06:42:06'),
(65,'safety horness 3rd party certificate -5nos',1,'2025-12-22 06:42:06'),
(66,'Handgloves-10nos',0,'2025-12-22 06:42:06'),
(67,'tie rope for pipe',0,'2025-12-22 06:42:06'),
(68,'scaffolding ring-4nos',1,'2025-12-22 06:42:06'),
(69,'emri papper-1m',0,'2025-12-22 06:42:06'),
(70,'roller-20 nos',0,'2025-12-22 06:42:06'),
(71,'AMOUNT SENT FROM OFFICE',0,'2025-12-22 06:42:06'),
(72,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(73,'thinner-6L',0,'2025-12-22 06:42:06'),
(74,'Thinner-3L',0,'2025-12-22 06:42:06'),
(75,'roller-20 nos',0,'2025-12-22 06:42:06'),
(76,'MSS transport and pickup charge',1,'2025-12-22 06:42:06'),
(77,'roller-20 nos',0,'2025-12-22 06:42:06'),
(78,'Handle with roller set-2nos',0,'2025-12-22 06:42:06'),
(79,'emri papper 2m',1,'2025-12-22 06:42:06'),
(80,'roller-10 nos',1,'2025-12-22 06:42:06'),
(81,'handgloves-4 set',0,'2025-12-22 06:42:06'),
(82,'googles-2 nos',0,'2025-12-22 06:42:06'),
(83,'mask-4 nos',0,'2025-12-22 06:42:06'),
(84,'roller-10 nos',0,'2025-12-22 06:42:06'),
(85,'2-inch touchup brush-3 nos',1,'2025-12-22 06:42:06'),
(86,'MSS transport and pickup charge(Bagalur)',1,'2025-12-22 06:42:06'),
(87,'MSS transport and pickup charge(hosur)',1,'2025-12-22 06:42:06'),
(88,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(89,'roller-20 nos',1,'2025-12-22 06:42:06'),
(90,'HandGloves-5set',1,'2025-12-22 06:42:06'),
(91,'emri papper-1m',1,'2025-12-22 06:42:06'),
(92,'4\" Brush-2nos',1,'2025-12-22 06:42:06'),
(93,'mask-5nos',0,'2025-12-22 06:42:06'),
(94,'Googles-3 nos',0,'2025-12-22 06:42:06'),
(95,'Printout',1,'2025-12-22 06:42:06'),
(96,'scrapper-4 nos',0,'2025-12-22 06:42:06'),
(97,'Travelling expenses berigai to banglore to berigai',0,'2025-12-22 06:42:06'),
(98,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(99,'ID card for 8 persons',0,'2025-12-22 06:42:06'),
(100,'safety shoe-5 set',0,'2025-12-22 06:42:06'),
(101,'emri papper-2m',1,'2025-12-22 06:42:06'),
(102,'googles-10 nos',0,'2025-12-22 06:42:06'),
(103,'mask-10 nos',0,'2025-12-22 06:42:06'),
(104,'handgloves-10 set',1,'2025-12-22 06:42:06'),
(105,'4-inch roller with handle set',0,'2025-12-22 06:42:06'),
(106,'Thinner-6L',0,'2025-12-22 06:42:06'),
(107,'touchup brush-3 nos',1,'2025-12-22 06:42:06'),
(108,'Thinner-6L',0,'2025-12-22 06:42:06'),
(109,'4-inch roller-20 nos',0,'2025-12-22 06:42:06'),
(110,'Thinner-6L',1,'2025-12-22 06:42:06'),
(111,'mss transport and pickup charges',0,'2025-12-22 06:42:06'),
(112,'4-inch roller-20 nos',0,'2025-12-22 06:42:06'),
(113,'Handgloves10-set',1,'2025-12-22 06:42:06'),
(114,'mask-10 nos',0,'2025-12-22 06:42:06'),
(115,'berigai to flexfood to berigai tansport charge',0,'2025-12-22 06:42:06'),
(116,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(117,'cylinder for labour room',0,'2025-12-22 06:42:06'),
(118,'Goggles-6 nos',0,'2025-12-22 06:42:06'),
(119,'roller-20 nos',0,'2025-12-22 06:42:06'),
(120,'Safety shoe for labours(5-nos)',1,'2025-12-22 06:42:06'),
(121,'Safety shoe for engineer',0,'2025-12-22 06:42:06'),
(122,'2-inch touchup brush-4 nos',0,'2025-12-22 06:42:06'),
(123,'Roller -20 nos',1,'2025-12-22 06:42:06'),
(124,'emir papper-2m',0,'2025-12-22 06:42:06'),
(125,'Handgloves -12set',0,'2025-12-22 06:42:06'),
(126,'googles-5 nos',1,'2025-12-22 06:42:06'),
(127,'Safety Helmet for labours-5nos',0,'2025-12-22 06:42:06'),
(128,'mask-12 nos',0,'2025-12-22 06:42:06'),
(129,'cooking vessles for new workers',0,'2025-12-22 06:42:06'),
(130,'Printout',0,'2025-12-22 06:42:06'),
(131,'ID card for 5 persons',0,'2025-12-22 06:42:06'),
(132,'Roller -40 nos',0,'2025-12-22 06:42:06'),
(133,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(134,'travelling expenses berigai to hosur to berigai',0,'2025-12-22 06:42:06'),
(135,'Safety Belt Remaining balance',0,'2025-12-22 06:42:06'),
(136,'Thinner-6L',0,'2025-12-22 06:42:06'),
(137,'Hand gloves-11set',0,'2025-12-22 06:42:06'),
(138,'Goggles-11 pcs',0,'2025-12-22 06:42:06'),
(139,'Thinner-5L',0,'2025-12-22 06:42:06'),
(140,'Thinner-06L',1,'2025-12-22 06:42:06'),
(141,'roller-40 nos',0,'2025-12-22 06:42:06'),
(142,'roller-40 nos',0,'2025-12-22 06:42:06'),
(143,'Thinner-06L',0,'2025-12-22 06:42:06'),
(144,'Printout',0,'2025-12-22 06:42:06'),
(145,'Googles-12 nos',0,'2025-12-22 06:42:06'),
(146,'mask-12 nos',0,'2025-12-22 06:42:06'),
(147,'roller-40 nos',1,'2025-12-22 06:42:06'),
(148,'2-inch brush-5nos',0,'2025-12-22 06:42:06'),
(149,'gloves-11',0,'2025-12-22 06:42:06'),
(150,'emeri paper-2m',0,'2025-12-22 06:42:06'),
(151,'Roller-40 nos',0,'2025-12-22 06:42:06'),
(152,'2-inch brush-2nos',0,'2025-12-22 06:42:06'),
(153,'4-inch brush-2nos',0,'2025-12-22 06:42:06'),
(154,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(155,'cylinder for labour room',0,'2025-12-22 06:42:06'),
(156,'Shoe for epoxy person-3 nos',0,'2025-12-22 06:42:06'),
(157,'masking tape-3Bundle',0,'2025-12-22 06:42:06'),
(158,'Hand gloves-15 set',0,'2025-12-22 06:42:06'),
(159,'Goggles-03 nos',0,'2025-12-22 06:42:06'),
(160,'Mask -3 nos',0,'2025-12-22 06:42:06'),
(161,'16A Top indicate socket-1nos',1,'2025-12-22 06:42:06'),
(162,'Screw Driver-01 nos',0,'2025-12-22 06:42:06'),
(163,'Tester-01 nos',0,'2025-12-22 06:42:06'),
(164,'Grinding wheel-4 nos',0,'2025-12-22 06:42:06'),
(165,'9-inch roller-2nos',0,'2025-12-22 06:42:06'),
(166,'cable for Grinding machine-10m',0,'2025-12-22 06:42:06'),
(167,'4-inch Roller-40 nos',0,'2025-12-22 06:42:06'),
(168,'9-inch roller-2nos',1,'2025-12-22 06:42:06'),
(169,'Machine guard-01 nos',0,'2025-12-22 06:42:06'),
(170,'ID card for 3 persons',0,'2025-12-22 06:42:06'),
(171,'Emery paper- 2m',0,'2025-12-22 06:42:06'),
(172,'Googles-13 nos',0,'2025-12-22 06:42:06'),
(173,'Handgloves-14 set',0,'2025-12-22 06:42:06'),
(174,'mask-13 nos',0,'2025-12-22 06:42:06'),
(175,'2-inch brush-3nos',1,'2025-12-22 06:42:06'),
(176,'4 inch roller-40 nos',0,'2025-12-22 06:42:06'),
(177,'9-inch roller-2nos',0,'2025-12-22 06:42:06'),
(178,'Abro tape 6 nos',0,'2025-12-22 06:42:06'),
(179,'mask-3 nos',0,'2025-12-22 06:42:06'),
(180,'handgloves-3 set',0,'2025-12-22 06:42:06'),
(181,'9-inch roller-1nos',1,'2025-12-22 06:42:06'),
(182,'masking tape-1 Bundle',0,'2025-12-22 06:42:06'),
(183,'masking tape-1 Bundle',0,'2025-12-22 06:42:06'),
(184,'AMOUNT SENT FROM OFFICE',0,'2025-12-22 06:42:06'),
(185,'2-inch brush-3nos',0,'2025-12-22 06:42:06'),
(186,'mask-11 nos',0,'2025-12-22 06:42:06'),
(187,'Hand gloves-11set',1,'2025-12-22 06:42:06'),
(188,'4-inch Roller-40 nos',0,'2025-12-22 06:42:06'),
(189,'masking tape-8',0,'2025-12-22 06:42:06'),
(190,'Goggles-11 pcs',0,'2025-12-22 06:42:06'),
(191,'6-inch patti blade-2 nos',0,'2025-12-22 06:42:06'),
(192,'4-inch patti blade-2 nos',0,'2025-12-22 06:42:06'),
(193,'3-inch patti blade-2 nos',1,'2025-12-22 06:42:06'),
(194,'measurement tape -5m-01 nos',0,'2025-12-22 06:42:06'),
(195,'4-inch Roller-40 nos',0,'2025-12-22 06:42:06'),
(196,'Hand gloves-6 nos',0,'2025-12-22 06:42:06'),
(197,'Mask-7 nos',0,'2025-12-22 06:42:06'),
(198,'2 inch Brush-03 nos',1,'2025-12-22 06:42:06'),
(199,'4 inch roller-20 nos',0,'2025-12-22 06:42:06'),
(200,'Hand gLoves-7 set',0,'2025-12-22 06:42:06'),
(201,'masking tape-1 Bundle',0,'2025-12-22 06:42:06'),
(202,'masking tape-3 nos',0,'2025-12-22 06:42:06'),
(203,'Printout',1,'2025-12-22 06:42:06'),
(204,'Speed post for sea green sample',0,'2025-12-22 06:42:06'),
(205,'handgloves-08 nos',0,'2025-12-22 06:42:06'),
(206,'Mask-09nos',0,'2025-12-22 06:42:06'),
(207,'roller-40 nos',0,'2025-12-22 06:42:06'),
(208,'2-inch brush-3nos',0,'2025-12-22 06:42:06'),
(209,'Goggles-8 nos',1,'2025-12-22 06:42:06'),
(210,'Safety shoe-2nos',0,'2025-12-22 06:42:06'),
(211,'AMOUNT SENT FROM OFFICE',0,'2025-12-22 06:42:06'),
(212,'4 inch roller-40 nos',0,'2025-12-22 06:42:06'),
(213,'Goggles-8 nos',0,'2025-12-22 06:42:06'),
(214,'Handgloves 8 set',0,'2025-12-22 06:42:06'),
(215,'mask-08 nos',0,'2025-12-22 06:42:06'),
(216,'2 inch Brush-04 nos',0,'2025-12-22 06:42:06'),
(217,'Emery paper- 2m',0,'2025-12-22 06:42:06'),
(218,'4 inch roller-40 nos',1,'2025-12-22 06:42:06'),
(219,'4 inch roller-40 nos',0,'2025-12-22 06:42:06'),
(220,'Goggles-8 nos',0,'2025-12-22 06:42:06'),
(221,'handgloves-7 set',0,'2025-12-22 06:42:06'),
(222,'mask-07 nos',0,'2025-12-22 06:42:06'),
(223,'2 inch Brush-06 nos',0,'2025-12-22 06:42:06'),
(224,'Printout',0,'2025-12-22 06:42:06'),
(225,'4 inch roller-40 nos',1,'2025-12-22 06:42:06'),
(226,'handgloves-7 set',1,'2025-12-22 06:42:06'),
(227,'mask-07 nos',1,'2025-12-22 06:42:06'),
(228,'sweets for pooja',0,'2025-12-22 06:42:06'),
(229,'pooja materials',0,'2025-12-22 06:42:06'),
(230,'roller with handle set-01',0,'2025-12-22 06:42:06'),
(231,'2inch brush-01 nos',0,'2025-12-22 06:42:06'),
(232,'200rps for each labour for pooja',1,'2025-12-22 06:42:06'),
(233,'mss hosur',1,'2025-12-22 06:42:06'),
(234,'mss bagalur and local pickup charge',1,'2025-12-22 06:42:06'),
(235,'4 inch roller-40 nos',0,'2025-12-22 06:42:06'),
(236,'handgloves-7 set',0,'2025-12-22 06:42:06'),
(237,'Emery paper- 2m',0,'2025-12-22 06:42:06'),
(238,'2-inch brush-4 nos',0,'2025-12-22 06:42:06'),
(239,'mask-07 nos',1,'2025-12-22 06:42:06'),
(240,'mss bagalur and local pickup charge',1,'2025-12-22 06:42:06'),
(241,'4 inch roller-20 nos',0,'2025-12-22 06:42:06'),
(242,'handgloves-7 set',0,'2025-12-22 06:42:06'),
(243,'yellow mask-7 nos',0,'2025-12-22 06:42:06'),
(244,'2-inch brush-4 nos',0,'2025-12-22 06:42:06'),
(245,'goggles-7 nos',0,'2025-12-22 06:42:06'),
(246,'wire brush-1 nos',0,'2025-12-22 06:42:06'),
(247,'Safety shoe for engineer',1,'2025-12-22 06:42:06'),
(248,'mss bagalur and local pickup charge',1,'2025-12-22 06:42:06'),
(249,'drinking can for workers-1 nos',1,'2025-12-22 06:42:06'),
(250,'4 inch roller-20 nos',0,'2025-12-22 06:42:06'),
(251,'cylinder for labour room',0,'2025-12-22 06:42:06'),
(252,'My travel expenses for home to berigai',0,'2025-12-22 06:42:06'),
(253,'yellow mask-7 nos',0,'2025-12-22 06:42:06'),
(254,'Hand gLoves-7 set',0,'2025-12-22 06:42:06'),
(255,'4-inch Roller-40 nos',0,'2025-12-22 06:42:06'),
(256,'AMOUNT SENT FROM OFFICE',0,'2025-12-22 06:42:06'),
(257,'Cleaning Scrapper-04 nos',0,'2025-12-22 06:42:06'),
(258,'4-inch Roller-40 nos',0,'2025-12-22 06:42:06'),
(259,'handgloves-7set',0,'2025-12-22 06:42:06'),
(260,'Mask-6 nos',0,'2025-12-22 06:42:06'),
(261,'4-inch Roller-40 nos',0,'2025-12-22 06:42:06'),
(262,'Emery paper- 2m',1,'2025-12-22 06:42:06'),
(263,'2-inch Brush',1,'2025-12-22 06:42:06'),
(264,'shoe -01 nos for labour',1,'2025-12-22 06:42:06'),
(265,'Clear Glass-8 nos',1,'2025-12-22 06:42:06'),
(266,'AMOUNT SENT FROM OFFICE',1,'2025-12-22 06:42:06'),
(267,'Mask-7 nos',1,'2025-12-22 06:42:06'),
(268,'Handgloves-7set',1,'2025-12-22 06:42:06'),
(269,'2\"-brush-5 nos',1,'2025-12-22 06:42:06'),
(270,'4\"-roller-40 nos',1,'2025-12-22 06:42:06'),
(271,'Emery paper- 2m',1,'2025-12-22 06:42:06'),
(272,'4\"-roller-40 nos',1,'2025-12-22 06:42:06'),
(273,'2\"-brush-5 nos',1,'2025-12-22 06:42:06'),
(274,'Printout',1,'2025-12-22 06:42:06'),
(275,'safety helmet - 3',1,'2026-01-19 04:38:45'),
(276,'gloves',1,'2026-01-19 05:30:01'),
(277,'labour gloves',0,'2026-01-19 05:35:39');
/*!40000 ALTER TABLE `resource_consumables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_dispatches`
--

DROP TABLE IF EXISTS `resource_dispatches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_dispatches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_consumable_id` int(11) NOT NULL,
  `quantity` varchar(100) NOT NULL,
  `dispatch_date` date NOT NULL,
  `vehicle_name_model` varchar(150) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `driver_mobile` varchar(20) DEFAULT NULL,
  `current_site` varchar(150) NOT NULL,
  `destination_site` varchar(150) NOT NULL,
  `transport_amount` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `current_incharge_name` varchar(100) DEFAULT NULL,
  `current_incharge_mobile` varchar(20) DEFAULT NULL,
  `from_address` text DEFAULT NULL,
  `destination_incharge_name` varchar(100) DEFAULT NULL,
  `destination_incharge_mobile` varchar(20) DEFAULT NULL,
  `to_address` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_consumable_id` (`resource_consumable_id`),
  KEY `idx_dispatch_date` (`dispatch_date`),
  CONSTRAINT `resource_dispatches_ibfk_1` FOREIGN KEY (`resource_consumable_id`) REFERENCES `resource_consumables` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_dispatches`
--

LOCK TABLES `resource_dispatches` WRITE;
/*!40000 ALTER TABLE `resource_dispatches` DISABLE KEYS */;
/*!40000 ALTER TABLE `resource_dispatches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'superadmin'),
(2,'admin'),
(3,'accounts_team'),
(4,'siteincharge');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roof_sheet`
--

DROP TABLE IF EXISTS `roof_sheet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roof_sheet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL,
  `cleaning` decimal(10,2) DEFAULT NULL,
  `cleaning_rate` decimal(10,2) DEFAULT NULL,
  `cleaning_value` decimal(10,2) DEFAULT NULL,
  `total_rate` decimal(10,2) DEFAULT NULL,
  `total_value` decimal(10,2) DEFAULT NULL,
  `sathya_nanokoat_2000` decimal(10,2) DEFAULT NULL,
  `sathya_nanokoat_2000_rate` decimal(10,2) DEFAULT NULL,
  `sathya_nanokoat_2000_value` decimal(10,2) DEFAULT NULL,
  `technobond_hs` decimal(10,2) DEFAULT NULL,
  `technobond_hs_rate` decimal(10,2) DEFAULT NULL,
  `technobond_hs_value` decimal(10,2) DEFAULT NULL,
  `frep_for_joints` decimal(10,2) DEFAULT NULL,
  `frep_for_joints_rate` decimal(10,2) DEFAULT NULL,
  `frep_for_joints_value` decimal(10,2) DEFAULT NULL,
  `reflectkoat` decimal(10,2) DEFAULT NULL,
  `reflectkoat_rate` decimal(10,2) DEFAULT NULL,
  `reflectkoat_value` decimal(10,2) DEFAULT NULL,
  `technobond_for_full_area` decimal(10,2) DEFAULT NULL,
  `technobond_for_full_area_rate` decimal(10,2) DEFAULT NULL,
  `technobond_for_full_area_value` decimal(10,2) DEFAULT NULL,
  `primer` decimal(10,2) DEFAULT NULL,
  `primer_rate` decimal(10,2) DEFAULT NULL,
  `primer_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_type` (`report_id`,`report_type_id`),
  KEY `report_type_id` (`report_type_id`),
  CONSTRAINT `roof_sheet_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report_master` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `roof_sheet_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`type_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=349 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roof_sheet`
--

LOCK TABLES `roof_sheet` WRITE;
/*!40000 ALTER TABLE `roof_sheet` DISABLE KEYS */;
INSERT INTO `roof_sheet` VALUES
(1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,1,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,1,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(5,2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(6,2,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(7,3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(8,3,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(9,3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(10,4,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(11,4,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(12,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(13,5,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(14,5,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(15,5,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(16,6,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(17,6,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(18,6,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(19,7,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(20,7,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(21,7,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(22,8,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(23,8,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(24,8,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(25,9,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(26,9,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(27,9,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(28,10,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(29,10,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(30,10,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(31,11,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(32,11,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(33,11,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(34,12,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(35,12,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(36,12,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(37,13,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(38,13,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(39,13,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(40,14,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(41,14,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(42,14,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(43,15,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(44,15,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(45,15,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(46,16,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(47,16,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(48,16,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(49,17,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(50,17,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(51,17,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(52,18,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(53,18,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(54,18,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(55,19,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(56,19,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(57,19,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(58,20,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(59,20,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(60,20,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(61,21,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(62,21,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(63,21,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(64,22,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(65,22,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(66,22,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(67,23,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(68,23,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(69,23,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(70,24,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(71,24,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(72,24,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(73,25,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(74,25,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(75,25,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(76,26,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(77,26,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(78,26,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(79,27,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(80,27,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(81,27,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(82,28,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(83,28,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(84,28,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(85,29,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(86,29,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(87,29,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(88,30,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(89,30,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(90,30,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(91,31,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(92,31,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(93,31,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(94,32,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(95,32,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(96,32,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(97,33,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(98,33,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(99,33,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(100,34,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(101,34,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(102,34,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(103,35,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(104,35,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(105,35,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(106,36,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(107,36,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(108,36,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(109,37,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(110,37,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(111,37,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(112,38,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(113,38,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(114,38,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(115,39,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(116,39,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(117,39,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(118,40,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(119,40,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(120,40,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(121,41,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(122,41,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(123,41,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(124,42,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(125,42,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(126,42,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(127,43,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(128,43,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(129,43,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(130,44,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(131,44,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(132,44,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(133,45,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(134,45,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(135,45,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(136,46,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(137,46,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(138,46,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(139,47,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(140,47,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(141,47,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(142,48,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(143,48,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(144,48,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(145,49,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(146,49,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(147,49,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(148,50,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(149,50,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(150,50,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(151,51,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(152,51,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(153,51,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(154,52,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(155,52,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(156,52,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(157,53,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(158,53,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(159,53,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(160,54,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(161,54,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(162,54,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(163,55,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(164,55,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(165,55,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(166,56,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(167,56,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(168,56,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(169,57,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(170,57,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(171,57,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(172,58,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(173,58,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(174,58,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(175,59,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(176,59,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(177,59,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(178,60,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(179,60,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(180,60,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(181,61,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(182,61,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(183,61,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(184,62,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(185,62,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(186,62,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(187,63,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(188,63,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(189,63,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(190,64,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(191,64,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(192,64,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(193,65,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(194,65,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(195,65,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(196,66,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(197,66,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(198,66,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(199,67,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(200,67,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(201,67,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(202,68,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(203,68,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(204,68,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(205,69,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(206,69,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(207,69,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(208,70,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(209,70,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(210,70,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(211,71,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(212,71,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(213,71,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(214,72,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(215,72,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(216,72,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(217,73,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(218,73,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(219,73,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(220,74,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(221,74,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(222,74,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(223,75,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(224,75,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(225,75,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(226,76,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(227,76,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(228,76,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(229,77,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(230,77,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(231,77,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(232,78,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(233,78,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(234,78,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(235,79,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(236,79,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(237,79,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(238,80,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(239,80,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(240,80,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(241,81,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(242,81,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(243,81,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(244,82,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(245,82,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(246,82,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(247,83,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(248,83,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(249,83,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(250,84,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(251,84,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(252,84,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(253,85,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(254,85,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(255,85,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(256,86,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(257,86,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(258,86,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(259,87,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(260,87,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(261,87,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(262,88,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(263,88,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(264,88,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(265,89,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(266,89,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(267,89,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(268,90,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(269,90,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(270,90,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(271,91,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(272,91,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(273,91,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(274,92,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(275,92,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(276,92,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(277,93,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(278,93,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(279,93,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(280,94,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(281,94,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(282,94,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(283,95,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(284,95,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(285,95,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(286,96,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(287,96,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(288,96,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(289,97,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(290,97,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(291,97,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(292,98,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(293,98,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(294,98,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(295,99,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(296,99,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(297,99,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(298,100,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(299,100,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(300,100,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(301,101,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(302,101,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(303,101,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(304,102,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(305,102,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(306,102,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(307,103,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(308,103,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(309,103,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(310,104,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(311,104,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(312,104,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(313,105,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(314,105,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(315,105,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(316,106,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(317,106,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(318,106,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(319,107,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(320,107,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(321,107,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(322,108,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(323,108,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(324,108,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(325,109,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(326,109,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(327,109,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(328,110,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(329,110,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(330,110,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(331,111,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(332,111,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(333,111,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(334,112,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(335,112,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(336,112,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(337,113,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(338,113,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(339,113,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(340,114,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(341,114,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(342,114,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(343,115,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(344,115,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(345,115,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(346,116,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(347,116,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(348,116,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `roof_sheet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_details`
--

DROP TABLE IF EXISTS `site_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_details` (
  `site_id` varchar(30) NOT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(70) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `incharge_id` varchar(30) DEFAULT NULL,
  `workforce_id` varchar(30) DEFAULT NULL,
  `pd_id` varchar(30) NOT NULL,
  `location_id` varchar(10) DEFAULT NULL,
  `reckoner_type_id` int(11) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_details`
--

LOCK TABLES `site_details` WRITE;
/*!40000 ALTER TABLE `site_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `site_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_incharge`
--

DROP TABLE IF EXISTS `site_incharge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_incharge` (
  `incharge_id` varchar(30) NOT NULL,
  `incharge_type` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`incharge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_incharge`
--

LOCK TABLES `site_incharge` WRITE;
/*!40000 ALTER TABLE `site_incharge` DISABLE KEYS */;
INSERT INTO `site_incharge` VALUES
('SI001','supervisor'),
('SI002','site engineer'),
('SI003','supervisor + site engineer');
/*!40000 ALTER TABLE `site_incharge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_updation_history`
--

DROP TABLE IF EXISTS `site_updation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_updation_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_id` varchar(30) DEFAULT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(70) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `incharge_id` varchar(30) DEFAULT NULL,
  `workforce_id` varchar(30) DEFAULT NULL,
  `pd_id` varchar(30) DEFAULT NULL,
  `location_id` varchar(10) DEFAULT NULL,
  `reckoner_type_id` int(11) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_time` timestamp NULL DEFAULT current_timestamp(),
  `previous_updated_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `site_id` (`site_id`),
  KEY `pd_id` (`pd_id`),
  CONSTRAINT `site_updation_history_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON DELETE CASCADE,
  CONSTRAINT `site_updation_history_ibfk_2` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_updation_history`
--

LOCK TABLES `site_updation_history` WRITE;
/*!40000 ALTER TABLE `site_updation_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `site_updation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siteincharge_assign`
--

DROP TABLE IF EXISTS `siteincharge_assign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `siteincharge_assign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `desc_id` int(11) DEFAULT NULL,
  `emp_id` varchar(30) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `pd_id` (`pd_id`),
  KEY `site_id` (`site_id`),
  KEY `emp_id` (`emp_id`),
  KEY `fk_siteincharge_desc_id` (`desc_id`),
  CONSTRAINT `fk_siteincharge_desc_id` FOREIGN KEY (`desc_id`) REFERENCES `work_descriptions` (`desc_id`),
  CONSTRAINT `siteincharge_assign_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `project_details` (`pd_id`) ON UPDATE CASCADE,
  CONSTRAINT `siteincharge_assign_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `site_details` (`site_id`) ON UPDATE CASCADE,
  CONSTRAINT `siteincharge_assign_ibfk_3` FOREIGN KEY (`emp_id`) REFERENCES `employee_master` (`emp_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siteincharge_assign`
--

LOCK TABLES `siteincharge_assign` WRITE;
/*!40000 ALTER TABLE `siteincharge_assign` DISABLE KEYS */;
/*!40000 ALTER TABLE `siteincharge_assign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siteincharge_exp_entry`
--

DROP TABLE IF EXISTS `siteincharge_exp_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `siteincharge_exp_entry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `petty_cash_id` int(11) NOT NULL,
  `expense_category_id` int(11) DEFAULT NULL,
  `expense_detail_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `amount_created_at` timestamp NULL DEFAULT NULL,
  `expense_details` varchar(300) DEFAULT NULL,
  `overhead_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `petty_cash_id` (`petty_cash_id`),
  KEY `expense_category_id` (`expense_category_id`),
  KEY `expense_detail_id` (`expense_detail_id`),
  KEY `overhead_id` (`overhead_id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_1` FOREIGN KEY (`petty_cash_id`) REFERENCES `petty_cash` (`id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_2` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_category` (`id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_3` FOREIGN KEY (`expense_detail_id`) REFERENCES `expense_details` (`id`),
  CONSTRAINT `siteincharge_exp_entry_ibfk_4` FOREIGN KEY (`overhead_id`) REFERENCES `overhead` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siteincharge_exp_entry`
--

LOCK TABLES `siteincharge_exp_entry` WRITE;
/*!40000 ALTER TABLE `siteincharge_exp_entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `siteincharge_exp_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `state`
--

DROP TABLE IF EXISTS `state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `state` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `state`
--

LOCK TABLES `state` WRITE;
/*!40000 ALTER TABLE `state` DISABLE KEYS */;
INSERT INTO `state` VALUES
(1,'Tamil Nadu'),
(2,'Andhra Pradesh');
/*!40000 ALTER TABLE `state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stickering`
--

DROP TABLE IF EXISTS `stickering`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stickering` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `structural_painting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL,
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
  `1st_coat` decimal(10,2) DEFAULT NULL,
  `1st_coat_rate` decimal(10,2) DEFAULT NULL,
  `1st_coat_value` decimal(10,2) DEFAULT NULL,
  `2nd_coat` decimal(10,2) DEFAULT NULL,
  `2nd_coat_rate` decimal(10,2) DEFAULT NULL,
  `2nd_coat_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_type` (`report_id`,`report_type_id`),
  KEY `report_type_id` (`report_type_id`),
  CONSTRAINT `structural_painting_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report_master` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `structural_painting_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `structural_painting`
--

LOCK TABLES `structural_painting` WRITE;
/*!40000 ALTER TABLE `structural_painting` DISABLE KEYS */;
/*!40000 ALTER TABLE `structural_painting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_company`
--

DROP TABLE IF EXISTS `supply_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_company` (
  `company_id` varchar(30) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `spoc_name` varchar(100) DEFAULT NULL,
  `spoc_contact_no` varchar(20) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_company`
--

LOCK TABLES `supply_company` WRITE;
/*!40000 ALTER TABLE `supply_company` DISABLE KEYS */;
/*!40000 ALTER TABLE `supply_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_master_dc_no`
--

DROP TABLE IF EXISTS `supply_master_dc_no`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_master_dc_no` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dc_no` varchar(100) NOT NULL,
  `company_id` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `supply_master_dc_no_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `supply_company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_master_dc_no`
--

LOCK TABLES `supply_master_dc_no` WRITE;
/*!40000 ALTER TABLE `supply_master_dc_no` DISABLE KEYS */;
/*!40000 ALTER TABLE `supply_master_dc_no` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_material_assign`
--

DROP TABLE IF EXISTS `supply_material_assign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_material_assign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pd_id` varchar(30) NOT NULL,
  `site_id` varchar(30) NOT NULL,
  `item_id` varchar(50) NOT NULL,
  `uom_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `production_cost_per_uom` decimal(10,2) NOT NULL,
  `production_cost` decimal(10,2) NOT NULL,
  `supply_cost_per_uom` decimal(10,2) NOT NULL,
  `supply_cost` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_material_assign`
--

LOCK TABLES `supply_material_assign` WRITE;
/*!40000 ALTER TABLE `supply_material_assign` DISABLE KEYS */;
/*!40000 ALTER TABLE `supply_material_assign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_material_dispatch`
--

DROP TABLE IF EXISTS `supply_material_dispatch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_material_dispatch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supply_material_assign_id` int(11) NOT NULL,
  `dc_no` int(11) NOT NULL,
  `dispatch_date` date NOT NULL,
  `order_no` varchar(50) NOT NULL,
  `vendor_code` varchar(50) NOT NULL,
  `dispatch_qty` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dispatch_cost` decimal(10,2) DEFAULT NULL,
  `created_by` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supply_material_assign_id` (`supply_material_assign_id`),
  CONSTRAINT `supply_material_dispatch_ibfk_1` FOREIGN KEY (`supply_material_assign_id`) REFERENCES `supply_material_assign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_material_dispatch`
--

LOCK TABLES `supply_material_dispatch` WRITE;
/*!40000 ALTER TABLE `supply_material_dispatch` DISABLE KEYS */;
/*!40000 ALTER TABLE `supply_material_dispatch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_project_details`
--

DROP TABLE IF EXISTS `supply_project_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_project_details` (
  `pd_id` varchar(30) NOT NULL,
  `company_id` varchar(30) DEFAULT NULL,
  `project_type_id` varchar(30) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`pd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_project_details`
--

LOCK TABLES `supply_project_details` WRITE;
/*!40000 ALTER TABLE `supply_project_details` DISABLE KEYS */;
INSERT INTO `supply_project_details` VALUES
('SPD001','SUPP001',NULL,'new cost center for supply company 1'),
('SPD002','SUPP001','PT002','new cost center'),
('SPD003','SUPP001','PT002','new testing'),
('SPD004','SUPP003','PT002','demoproject5'),
('SPD005','SUPP001','PT002','TI Avadi');
/*!40000 ALTER TABLE `supply_project_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_site_details`
--

DROP TABLE IF EXISTS `supply_site_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_site_details` (
  `site_id` varchar(30) NOT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `po_number` varchar(70) DEFAULT NULL,
  `pd_id` varchar(30) DEFAULT NULL,
  `location_id` varchar(10) DEFAULT NULL,
  `reckoner_type_id` int(11) DEFAULT NULL,
  `supply_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_site_details`
--

LOCK TABLES `supply_site_details` WRITE;
/*!40000 ALTER TABLE `supply_site_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `supply_site_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supply_transport_master`
--

DROP TABLE IF EXISTS `supply_transport_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supply_transport_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supply_dispatch_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `booking_expense` decimal(10,2) DEFAULT NULL,
  `travel_expense` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `supply_dispatch_id` (`supply_dispatch_id`),
  KEY `provider_id` (`provider_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `supply_transport_master_ibfk_1` FOREIGN KEY (`supply_dispatch_id`) REFERENCES `supply_material_dispatch` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supply_transport_master_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `provider_master` (`id`),
  CONSTRAINT `supply_transport_master_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle_master` (`id`),
  CONSTRAINT `supply_transport_master_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `driver_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supply_transport_master`
--

LOCK TABLES `supply_transport_master` WRITE;
/*!40000 ALTER TABLE `supply_transport_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `supply_transport_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tank_work`
--

DROP TABLE IF EXISTS `tank_work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tank_work` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL,
  `grinding_` decimal(10,2) DEFAULT NULL,
  `grinding__rate` decimal(10,2) DEFAULT NULL,
  `grinding__value` decimal(10,2) DEFAULT NULL,
  `total_rate` decimal(10,2) DEFAULT NULL,
  `total_value` decimal(10,2) DEFAULT NULL,
  `sathya_nanokoat_2000` decimal(10,2) DEFAULT NULL,
  `sathya_nanokoat_2000_rate` decimal(10,2) DEFAULT NULL,
  `sathya_nanokoat_2000_value` decimal(10,2) DEFAULT NULL,
  `sathya_omegakoat_white_(3:1)` decimal(10,2) DEFAULT NULL,
  `sathya_omegakoat_white_(3:1)_rate` decimal(10,2) DEFAULT NULL,
  `sathya_omegakoat_white_(3:1)_value` decimal(10,2) DEFAULT NULL,
  `sathya_tcpu_uvr_500_white_(5:1)` decimal(10,2) DEFAULT NULL,
  `sathya_tcpu_uvr_500_white_(5:1)_rate` decimal(10,2) DEFAULT NULL,
  `sathya_tcpu_uvr_500_white_(5:1)_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_type` (`report_id`,`report_type_id`),
  KEY `report_type_id` (`report_type_id`),
  CONSTRAINT `tank_work_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report_master` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `tank_work_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`type_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tank_work`
--

LOCK TABLES `tank_work` WRITE;
/*!40000 ALTER TABLE `tank_work` DISABLE KEYS */;
INSERT INTO `tank_work` VALUES
(1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,1,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,1,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(5,2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(6,2,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(7,3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(8,3,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(9,3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(10,4,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(11,4,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(12,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(13,5,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(14,5,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(15,5,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(16,6,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(17,6,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(18,6,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(19,7,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(20,7,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(21,7,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(22,8,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(23,8,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(24,8,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(25,9,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(26,9,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(27,9,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(28,10,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(29,10,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(30,10,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tank_work` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_master`
--

DROP TABLE IF EXISTS `transport_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `booking_expense` decimal(10,2) DEFAULT NULL,
  `travel_expense` decimal(10,2) DEFAULT NULL,
  `dispatch_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `dispatch_id` (`dispatch_id`),
  CONSTRAINT `transport_master_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `provider_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transport_master_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transport_master_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `driver_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transport_master_ibfk_4` FOREIGN KEY (`dispatch_id`) REFERENCES `material_dispatch` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_master`
--

LOCK TABLES `transport_master` WRITE;
/*!40000 ALTER TABLE `transport_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `transport_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_type`
--

DROP TABLE IF EXISTS `transport_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_type`
--

LOCK TABLES `transport_type` WRITE;
/*!40000 ALTER TABLE `transport_type` DISABLE KEYS */;
INSERT INTO `transport_type` VALUES
(1,'Freight Paid'),
(2,'Freight to Pay');
/*!40000 ALTER TABLE `transport_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uom_master`
--

DROP TABLE IF EXISTS `uom_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `uom_master` (
  `uom_id` int(11) NOT NULL AUTO_INCREMENT,
  `uom_name` varchar(10) NOT NULL,
  PRIMARY KEY (`uom_id`),
  UNIQUE KEY `uom_name` (`uom_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uom_master`
--

LOCK TABLES `uom_master` WRITE;
/*!40000 ALTER TABLE `uom_master` DISABLE KEYS */;
INSERT INTO `uom_master` VALUES
(4,'GMS'),
(2,'KGS'),
(1,'LIT'),
(3,'ML'),
(5,'NOS'),
(6,'SET');
/*!40000 ALTER TABLE `uom_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'superadmin1','superadmin1@gmail.com','12345678',1,'2025-10-06 09:41:56'),
(2,'superadmin2','superadmin2@gmail.com','12345678',1,'2025-10-06 09:41:56'),
(3,'admin1','admin1@gmail.com','12345678',2,'2025-10-06 09:41:56'),
(4,'admin2','admin2@gmail.com','12345678',2,'2025-10-06 09:41:56'),
(5,'accounts1','accounts1@gmail.com','12345678',3,'2025-10-06 09:41:56'),
(6,'accounts2','accounts2@gmail.com','12345678',3,'2025-10-06 09:41:56'),
(7,'siteincharge1','siteincharge1@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(8,'siteincharge2','siteincharge2@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(9,'siteincharge3','siteincharge3@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(10,'siteincharge4','siteincharge4@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(11,'siteincharge5','siteincharge5@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(12,'siteincharge6','siteincharge6@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(13,'siteincharge7','siteincharge7@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(14,'siteincharge8','siteincharge8@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(15,'siteincharge9','siteincharge9@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(16,'siteincharge10','siteincharge10@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(17,'siteincharge11','siteincharge11@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(18,'siteincharge12','siteincharge12@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(19,'siteincharge13','siteincharge13@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(20,'siteincharge14','siteincharge14@gmail.com','12345678',4,'2025-10-06 09:41:56'),
(21,'siteincharge15','siteincharge15@gmail.com','12345678',4,'2025-10-06 09:41:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_master`
--

DROP TABLE IF EXISTS `vehicle_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_name` varchar(255) DEFAULT NULL,
  `vehicle_model` varchar(255) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_master`
--

LOCK TABLES `vehicle_master` WRITE;
/*!40000 ALTER TABLE `vehicle_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicle_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_descriptions`
--

DROP TABLE IF EXISTS `work_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_descriptions` (
  `desc_id` int(11) NOT NULL AUTO_INCREMENT,
  `desc_name` varchar(100) NOT NULL,
  PRIMARY KEY (`desc_id`),
  UNIQUE KEY `desc_name` (`desc_name`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_descriptions`
--

LOCK TABLES `work_descriptions` WRITE;
/*!40000 ALTER TABLE `work_descriptions` DISABLE KEYS */;
INSERT INTO `work_descriptions` VALUES
(46,'1\" line arrow supply and pasting'),
(55,'1\" line font stickering work'),
(47,'1.5\" line arrow supply and pasting'),
(57,'1.5\" line font stickering work'),
(53,'10\" line arrow supply and pasting'),
(63,'10\" line font stickering work'),
(54,'12\" line arrow supply and pasting'),
(64,'12\" line font stickering work'),
(48,'2\" line arrow supply and pasting'),
(58,'2\" line font stickering work'),
(49,'3\" line arrow supply and pasting'),
(59,'3\" line font stickering work'),
(50,'4\" line arrow supply and pasting'),
(60,'4\" line font stickering work'),
(51,'6\" line arrow supply and pasting'),
(61,'6\" line font stickering work'),
(52,'8\" line arrow supply and pasting'),
(62,'8\" line font stickering work'),
(11,'Air line 1 coat blue'),
(33,'Chilled brine band supply and pasting'),
(19,'Chilled brine line painting'),
(32,'Chilled water band supply and pasting'),
(18,'Chilled water line painting'),
(31,'Cooling water band supply and pasting'),
(13,'Cooling water line 1 coat dark green'),
(17,'Cooling water line painting'),
(68,'dummy description'),
(38,'Eye wash shower band supply and pasting'),
(24,'Eye wash shower line'),
(44,'HSD band supply and pasting'),
(30,'HSD line painting work'),
(40,'Instrument air band supply and pasting'),
(26,'Instrument air line'),
(42,'LP Steam band supply and pasting'),
(28,'LP Steam line painting work'),
(43,'MP Steam band supply and pasting'),
(29,'MP Steam line painting'),
(5,'Nitrogen 2 coat redoxide + Canary Yellow'),
(35,'Nitrogen band supply and pasting'),
(20,'Nitrogen line painting'),
(9,'Plant Air 2 coat redoxide + sky blue'),
(41,'Plant air band supply and pasting'),
(27,'Plant air line painting'),
(16,'Primer coating with supply'),
(36,'Process water band supply and pasting'),
(21,'Process water line painting work'),
(37,'PSV band supply and pasting'),
(22,'PSV line painting'),
(7,'PSV quench 2 coat redoxide + black'),
(6,'Raw water 2 coat redoxide + sea green'),
(39,'Raw water band supply and pasting'),
(25,'Raw water line'),
(14,'Raw water line 1 coat sea green'),
(71,'ROOF SHEET'),
(12,'Sticker for cooling water return'),
(1,'Sticker for cooling water supply'),
(34,'Sticker for Eye wash'),
(45,'Sticker for High speed diesel'),
(3,'Sticker for Holding Tank'),
(66,'Sticker for LEV Scrubber'),
(2,'Sticker for Non Peso Tank'),
(67,'Sticker for Peso Tank'),
(23,'Sticker for process water'),
(65,'Sticker for scrubber'),
(56,'Sticker for Vacuum'),
(15,'Structural line painting'),
(10,'Structural paint incl cleaner 2 coat paint'),
(4,'Structural Painting Work'),
(69,'Surface Cleaning + RC + SFZPP + UVR 750DFT'),
(72,'Tank work'),
(8,'Vacuum White'),
(70,'wall coating');
/*!40000 ALTER TABLE `work_descriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workforce_type`
--

DROP TABLE IF EXISTS `workforce_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workforce_type` (
  `workforce_id` varchar(30) NOT NULL,
  `workforce_type` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`workforce_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workforce_type`
--

LOCK TABLES `workforce_type` WRITE;
/*!40000 ALTER TABLE `workforce_type` DISABLE KEYS */;
INSERT INTO `workforce_type` VALUES
('WF001','contract'),
('WF002','labour'),
('WF003','contract + labour');
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

-- Dump completed on 2026-10-09  4:36:42
