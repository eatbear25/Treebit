SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 設定字符集
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- 資料表結構 `users`
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` enum('local','google') NOT NULL DEFAULT 'local',
  `provider_user_id` varchar(191) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email_provider` (`email`,`provider`),
  UNIQUE KEY `uniq_provider_provider_user_id` (`provider`,`provider_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- 資料表結構 `habits`
-- --------------------------------------------------------

CREATE TABLE `habits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `total_weeks` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_archived` tinyint DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- 資料表結構 `habit_weeks`
-- --------------------------------------------------------

CREATE TABLE `habit_weeks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `habit_id` int NOT NULL,
  `week_number` int NOT NULL,
  `start_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `habit_id` (`habit_id`),
  FOREIGN KEY (`habit_id`) REFERENCES `habits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- 資料表結構 `habit_week_tasks`
-- --------------------------------------------------------

CREATE TABLE `habit_week_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `habit_week_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `target_days` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `habit_week_id` (`habit_week_id`),
  FOREIGN KEY (`habit_week_id`) REFERENCES `habit_weeks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- 資料表結構 `habit_task_logs`
-- --------------------------------------------------------

CREATE TABLE `habit_task_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `date` date NOT NULL,
  `is_completed` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  UNIQUE KEY `task_date_unique` (`task_id`, `date`),
  FOREIGN KEY (`task_id`) REFERENCES `habit_week_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- 資料表結構 `habit_weekly_notes`
-- --------------------------------------------------------

CREATE TABLE `habit_weekly_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `habit_week_id` int NOT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `habit_week_id` (`habit_week_id`),
  FOREIGN KEY (`habit_week_id`) REFERENCES `habit_weeks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT;