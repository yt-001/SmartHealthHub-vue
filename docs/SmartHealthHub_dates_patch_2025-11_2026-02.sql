-- 将模拟数据的时间统一调整到：2025-11 / 2025-12 / 2026-01 / 2026-02（随机分布）
-- 说明：
-- 1) 该脚本为“更新补丁”，用于在已有数据的数据库上直接执行
-- 2) 默认库名为 smarthealthhub，如你的库名不同请修改下行 USE
-- 3) 为避免客户端“安全更新”限制，脚本会关闭 SQL_SAFE_UPDATES

USE `smarthealthhub`;
SET SQL_SAFE_UPDATES = 0;

SET @rand_start := DATE('2025-11-01');
SET @rand_days := 120; -- 2025-11-01 ~ 2026-02-28 共 120 天

-- appointments：created_at / updated_at
UPDATE `appointments`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'appointments_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'appointments_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'appointments_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'appointments_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'appointments_updated'))) * 172800) SECOND
  );

-- article_categories：created_at / updated_at
UPDATE `article_categories`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'article_categories_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'article_categories_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'article_categories_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'article_categories_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'article_categories_updated'))) * 172800) SECOND
  );

-- article_category_relations：created_at
UPDATE `article_category_relations`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'article_category_relations_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'article_category_relations_created_t'))) * 86400))
  );

-- carousel_items：created_at / updated_at
UPDATE `carousel_items`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'carousel_items_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'carousel_items_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'carousel_items_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'carousel_items_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'carousel_items_updated'))) * 172800) SECOND
  );

-- departments：created_at / updated_at
UPDATE `departments`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'departments_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'departments_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'departments_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'departments_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'departments_updated'))) * 172800) SECOND
  );

-- doctor_profiles：created_at / updated_at
UPDATE `doctor_profiles`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_profiles_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_profiles_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_profiles_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_profiles_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_profiles_updated'))) * 172800) SECOND
  );

-- doctor_schedules：schedule_date / created_at / updated_at
UPDATE `doctor_schedules`
SET
  `schedule_date` = DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_schedules_date'))) * @rand_days) DAY),
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_schedules_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_schedules_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_schedules_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_schedules_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'doctor_schedules_updated'))) * 172800) SECOND
  );

-- health_articles：created_at / updated_at
UPDATE `health_articles`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_articles_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'health_articles_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_articles_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'health_articles_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_articles_updated'))) * 172800) SECOND
  );

-- health_video_comments：created_at / updated_at
UPDATE `health_video_comments`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_video_comments_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'health_video_comments_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_video_comments_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'health_video_comments_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_video_comments_updated'))) * 172800) SECOND
  );

-- health_videos：created_at / updated_at
UPDATE `health_videos`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_videos_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'health_videos_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_videos_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'health_videos_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'health_videos_updated'))) * 172800) SECOND
  );

-- medical_records：visit_date / completed_date / created_at / updated_at
UPDATE `medical_records`
SET
  `visit_date` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medical_records_visit'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medical_records_visit_t'))) * 86400))
  ),
  `completed_date` = CASE
    WHEN `completed_date` IS NULL THEN NULL
    ELSE DATE_ADD(
      `visit_date`,
      INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medical_records_completed'))) * 72) HOUR
    )
  END,
  `created_at` = `visit_date`,
  `updated_at` = DATE_ADD(
    `visit_date`,
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medical_records_updated'))) * 172800) SECOND
  );

-- medicine_categories：created_at / updated_at
UPDATE `medicine_categories`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_categories_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_categories_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_categories_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_categories_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_categories_updated'))) * 172800) SECOND
  );

-- medicine_category_relations：created_at
UPDATE `medicine_category_relations`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_category_relations_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_category_relations_created_t'))) * 86400))
  );

-- medicine_orders：payment_time / created_at / updated_at（payment_time 仅更新非 NULL 行）
UPDATE `medicine_orders`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_orders_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_orders_created_t'))) * 86400))
  ),
  `payment_time` = CASE
    WHEN `payment_time` IS NULL THEN NULL
    ELSE DATE_ADD(
      `created_at`,
      INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_orders_pay'))) * 48) HOUR
    )
  END,
  `updated_at` = DATE_ADD(
    `created_at`,
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_orders_updated'))) * 172800) SECOND
  );

-- medicine_recommendation_levels：created_at / updated_at
UPDATE `medicine_recommendation_levels`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_levels_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_levels_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_levels_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_levels_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_levels_updated'))) * 172800) SECOND
  );

-- medicine_recommendation_relations：created_at
UPDATE `medicine_recommendation_relations`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_relations_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_recommendation_relations_created_t'))) * 86400))
  );

-- medicine_tag_relations：created_at
UPDATE `medicine_tag_relations`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tag_relations_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tag_relations_created_t'))) * 86400))
  );

-- medicine_tags：created_at / updated_at
UPDATE `medicine_tags`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tags_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tags_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tags_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tags_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicine_tags_updated'))) * 172800) SECOND
  );

-- medicines：created_at / updated_at
UPDATE `medicines`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicines_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicines_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicines_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'medicines_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'medicines_updated'))) * 172800) SECOND
  );

-- pharmacy_locations：created_at / updated_at
UPDATE `pharmacy_locations`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'pharmacy_locations_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'pharmacy_locations_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'pharmacy_locations_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'pharmacy_locations_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'pharmacy_locations_updated'))) * 172800) SECOND
  );

-- prescriptions：created_at / updated_at（允许原本为 NULL 的行被补齐）
UPDATE `prescriptions`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'prescriptions_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'prescriptions_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    `created_at`,
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'prescriptions_updated'))) * 172800) SECOND
  );

-- user_profiles：created_at / updated_at
UPDATE `user_profiles`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'user_profiles_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'user_profiles_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    `created_at`,
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'user_profiles_updated'))) * 172800) SECOND
  );

-- users：created_at / updated_at（不改 birth_date）
UPDATE `users`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'users_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'users_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    `created_at`,
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'users_updated'))) * 172800) SECOND
  );

-- video_categories：created_at / updated_at
UPDATE `video_categories`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'video_categories_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'video_categories_created_t'))) * 86400))
  ),
  `updated_at` = DATE_ADD(
    TIMESTAMP(
      DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'video_categories_created'))) * @rand_days) DAY),
      SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'video_categories_created_t'))) * 86400))
    ),
    INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'video_categories_updated'))) * 172800) SECOND
  );

-- video_category_relations：created_at
UPDATE `video_category_relations`
SET
  `created_at` = TIMESTAMP(
    DATE_ADD(@rand_start, INTERVAL FLOOR(RAND(CRC32(CONCAT(`id`, 'video_category_relations_created'))) * @rand_days) DAY),
    SEC_TO_TIME(FLOOR(RAND(CRC32(CONCAT(`id`, 'video_category_relations_created_t'))) * 86400))
  );

SET SQL_SAFE_UPDATES = 1;
