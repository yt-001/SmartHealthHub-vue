-- 余涛(yt2) 医生每日排班补丁（确保每天都有排班）
-- doctor_id: 1760190067234
-- 日期范围：2026-01-01 ~ 2026-04-30（如需调整，修改 @start_date/@end_date）
-- 规则：
-- 1) 2026 年 1/2/3/4 月每天都有排班（至少 AM）
-- 2) 工作日（非节假日的周一~周五）号源 >= 20
-- 3) 周末与节假日号源更少但不为 0
-- 4) 工作日额外生成 PM（更贴近真实排班）；周末/节假日仅 AM
-- 5) dept_id / room_no 优先取 doctor_profiles；缺失时使用默认值（避免无数据）

USE `smarthealthhub`;
SET SQL_SAFE_UPDATES = 0;

SET @doctor_id := 1760190067234;
SET @start_date := DATE('2026-01-01');
SET @end_date := DATE('2026-04-30');
SET @day_span := DATEDIFF(@end_date, @start_date);

-- 节假日（与项目内 2026 年常见节假日对齐：元旦、春节、清明）
DROP TEMPORARY TABLE IF EXISTS `tmp_holidays`;
CREATE TEMPORARY TABLE `tmp_holidays` (
  `d` date NOT NULL PRIMARY KEY
);

INSERT INTO `tmp_holidays` (`d`) VALUES
('2026-01-01'),
('2026-02-17'),('2026-02-18'),('2026-02-19'),('2026-02-20'),('2026-02-21'),('2026-02-22'),('2026-02-23'),
('2026-04-04'),('2026-04-05'),('2026-04-06');

-- 生成日期序列（0..999）
DROP TEMPORARY TABLE IF EXISTS `tmp_dates`;
CREATE TEMPORARY TABLE `tmp_dates` (
  `d` date NOT NULL PRIMARY KEY,
  `dow` tinyint NOT NULL
);

INSERT INTO `tmp_dates` (`d`, `dow`)
SELECT
  DATE_ADD(@start_date, INTERVAL seq DAY) AS d,
  DAYOFWEEK(DATE_ADD(@start_date, INTERVAL seq DAY)) AS dow
FROM (
  SELECT ones.i + tens.i * 10 + hundreds.i * 100 AS seq
  FROM (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
  CROSS JOIN (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
  CROSS JOIN (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) hundreds
) s
WHERE seq <= @day_span;

-- 若重复执行：先删除该医生在范围内的旧排班（避免 uk_doctor_date_shift 冲突）
DELETE FROM `doctor_schedules`
WHERE `doctor_id` = @doctor_id
  AND `schedule_date` BETWEEN @start_date AND @end_date;

-- 插入每日排班：AM 每天都有；PM 仅工作日（非节假日的周一~周五）
INSERT INTO `doctor_schedules` (
  `id`, `doctor_id`, `dept_id`, `schedule_date`, `shift_code`, `room_no`,
  `max_appoint`, `used_appoint`, `extra_json`, `status`, `is_deleted`, `created_at`, `updated_at`
)
SELECT
  CAST(CONCAT(
    DATE_FORMAT(dt.d, '%Y%m%d'),
    LPAD(MOD(@doctor_id, 1000000), 6, '0'),
    CASE WHEN sh.shift_code = 'AM' THEN '1' ELSE '2' END
  ) AS UNSIGNED) AS id,
  @doctor_id AS doctor_id,
  COALESCE(dp.dept_id, 1) AS dept_id,
  dt.d AS schedule_date,
  sh.shift_code AS shift_code,
  COALESCE(NULLIF(dp.office_room, ''), CONCAT('A', LPAD(MOD(@doctor_id, 1000), 3, '0'))) AS room_no,
  CASE
    WHEN h.d IS NOT NULL THEN 12 + MOD(CRC32(CONCAT(@doctor_id, dt.d, sh.shift_code, 'Hcap')), 5)       -- 节假日：12~16
    WHEN dt.dow IN (1,7) THEN 15 + MOD(CRC32(CONCAT(@doctor_id, dt.d, sh.shift_code, 'Wcap')), 5)      -- 周末：15~19
    ELSE 22 + MOD(CRC32(CONCAT(@doctor_id, dt.d, sh.shift_code, 'Dcap')), 6)                           -- 工作日：22~27（>=20）
  END AS max_appoint,
  0 AS used_appoint,
  NULL AS extra_json,
  1 AS status,
  0 AS is_deleted,
  TIMESTAMP(dt.d, '00:00:00') AS created_at,
  TIMESTAMP(dt.d, '00:00:00') AS updated_at
FROM `tmp_dates` dt
LEFT JOIN `tmp_holidays` h ON h.d = dt.d
LEFT JOIN `doctor_profiles` dp ON dp.user_id = @doctor_id AND dp.is_deleted = 0
CROSS JOIN (
  SELECT 'AM' AS shift_code
  UNION ALL
  SELECT 'PM' AS shift_code
) sh
WHERE
  sh.shift_code = 'AM'
  OR (h.d IS NULL AND dt.dow BETWEEN 2 AND 6 AND sh.shift_code = 'PM');

SET SQL_SAFE_UPDATES = 1;
