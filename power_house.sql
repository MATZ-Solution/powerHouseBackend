-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2024 at 07:36 AM
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
-- Table structure for table `area`
--

CREATE TABLE `area` (
  `id` int(11) NOT NULL,
  `cityId` varchar(250) NOT NULL,
  `AreaName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `area`
--

INSERT INTO `area` (`id`, `cityId`, `AreaName`) VALUES
(1, '2', 'North Nazimabad');

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int(11) NOT NULL,
  `cityName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `cityName`) VALUES
(1, 'asdfg'),
(2, 'qwert'),
(3, 'zxcvbgt'),
(4, 'dcdcd'),
(5, 'fvfvf'),
(6, 'sdcsc'),
(7, 'vv'),
(8, 'dvdfv'),
(9, 'vdfvdv'),
(10, 'dfvdfv'),
(11, 'fvdfv'),
(12, 'karachi'),
(13, 'lahore'),
(14, 'islamabad');

-- --------------------------------------------------------

--
-- Table structure for table `meetingmembers`
--

CREATE TABLE `meetingmembers` (
  `id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `phoneNumber` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `address` varchar(250) NOT NULL,
  `position` varchar(250) NOT NULL,
  `cityId` varchar(250) NOT NULL,
  `areaIds` varchar(250) NOT NULL,
  `subAreaIds` varchar(250) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meetingmembers`
--

INSERT INTO `meetingmembers` (`id`, `name`, `phoneNumber`, `email`, `address`, `position`, `cityId`, `areaIds`, `subAreaIds`, `created_at`, `updated_at`) VALUES
(1, 'asdfg', '090078601', 'umait@hhghg.yhb', 'kjkj', 'kkjkk', '1,2,3,4', '5,4,7,8', '3,4,5,6,7,8', '2024-05-20 14:36:52', NULL),
(2, 'asdfg', '090078601', 'umait@hhghg.yhb', 'kjkj', 'kkjkk', '1,2,3,4', '5,4,7,8', '3,4,5,6,7,8', '2024-05-20 22:16:44', NULL),
(3, 'asdfg', '090078601', 'umait@hhghg.yhb', 'kjkj', 'kkjkk', '1,2,3,4', '5,4,7,8', '3,4,5,6,7,8', '2024-05-20 22:20:26', NULL);

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
(7, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Pending', '2024-05-15 12:12:07', '0000-00-00 00:00:00'),
(8, 'testProject', 'testType', '', '', '', '', '', '', '', '', '', 'Pending', '2024-05-15 21:26:19', '0000-00-00 00:00:00');

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
(2, 'test', '090078601', 'umair123@gmail.com', 'xyz street', 'sale Person', '$2b$10$ySdQnzuHc2MnRFuBBlPCfeDaIhmbH2aXbRberSP5TOztKhDdaGtua', '2024-05-15 11:57:22', '0000-00-00 00:00:00'),
(3, 'test', '123', 'umair123@gmail.com', 'xyz street', 'sale Person', '$2b$10$ySdQnzuHc2MnRFuBBlPCfeDaIhmbH2aXbRberSP5TOztKhDdaGtua', '2024-05-15 12:01:34', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `subarea`
--

CREATE TABLE `subarea` (
  `id` int(11) NOT NULL,
  `areaId` varchar(250) NOT NULL,
  `subAreaName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subarea`
--

INSERT INTO `subarea` (`id`, `areaId`, `subAreaName`) VALUES
(1, '2', 'BlockT');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meetingmembers`
--
ALTER TABLE `meetingmembers`
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
-- Indexes for table `subarea`
--
ALTER TABLE `subarea`
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
-- AUTO_INCREMENT for table `area`
--
ALTER TABLE `area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `meetingmembers`
--
ALTER TABLE `meetingmembers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `scout`
--
ALTER TABLE `scout`
  MODIFY `id` int(99) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `scout_member`
--
ALTER TABLE `scout_member`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subarea`
--
ALTER TABLE `subarea`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
