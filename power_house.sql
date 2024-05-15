-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2024 at 09:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `power_house`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Admin', 'admin@powerhouse.com', '$2b$10$ySdQnzuHc2MnRFuBBlPCfeDaIhmbH2aXbRberSP5TOztKhDdaGtua', '2024-05-15 12:01:34');

-- --------------------------------------------------------

--
-- Table structure for table `scout`
--

CREATE TABLE `scout` (
  `id` int(99) NOT NULL,
  `projectName` varchar(250) NOT NULL,
  `projectType` varchar(250) NOT NULL,
  `city` varchar(250) NOT NULL,
  `area` varchar(250) NOT NULL,
  `block` varchar(250) NOT NULL,
  `buildingType` varchar(250) NOT NULL,
  `size` varchar(250) NOT NULL,
  `address` varchar(250) NOT NULL,
  `pinLocation` varchar(250) NOT NULL,
  `contractorName` varchar(250) NOT NULL,
  `contractorNumber` varchar(250) NOT NULL,
  `status` varchar(200) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scout`
--

INSERT INTO `scout` (`id`, `projectName`, `projectType`, `city`, `area`, `block`, `buildingType`, `size`, `address`, `pinLocation`, `contractorName`, `contractorNumber`, `status`, `created_at`, `updated_at`) VALUES
(1, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Pending', '2024-05-15 00:58:17', '0000-00-00 00:00:00'),
(2, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Rejected', '2024-05-15 12:12:00', '0000-00-00 00:00:00'),
(3, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Success', '2024-05-15 12:12:02', '0000-00-00 00:00:00'),
(4, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Success', '2024-05-15 12:12:03', '0000-00-00 00:00:00'),
(5, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Success', '2024-05-15 12:12:05', '0000-00-00 00:00:00'),
(6, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Pending', '2024-05-15 12:12:06', '0000-00-00 00:00:00'),
(7, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Pending', '2024-05-15 12:12:07', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `scout_member`
--

CREATE TABLE `scout_member` (
  `id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `phoneNumber` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `address` varchar(250) NOT NULL,
  `position` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scout_member`
--

INSERT INTO `scout_member` (`id`, `name`, `phoneNumber`, `email`, `address`, `position`, `password`, `created_at`, `updated_at`) VALUES
(2, 'test', '090078601', 'umair123@gmail.com', 'xyz street', 'sale Person', '$2b$10$HZ7KE78qxxFkqnVkI9FrTusC7UplSWNg6TfljCdNbX9utBgiFNRSm', '2024-05-15 11:57:22', '0000-00-00 00:00:00'),
(3, 'test', '123', 'umair123@gmail.com', 'xyz street', 'sale Person', '$2b$10$ySdQnzuHc2MnRFuBBlPCfeDaIhmbH2aXbRberSP5TOztKhDdaGtua', '2024-05-15 12:01:34', '0000-00-00 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scout`
--
ALTER TABLE `scout`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scout_member`
--
ALTER TABLE `scout_member`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `scout`
--
ALTER TABLE `scout`
  MODIFY `id` int(99) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `scout_member`
--
ALTER TABLE `scout_member`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
