-- 易普工业大学 testdb 常用查询
-- 使用方式：在 MySQL 中先 USE testdb; 再执行下面任意一条或全部

-- ========== 在线留言表 inquiries ==========
SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 50;

-- ========== 预约表 reservations ==========
SELECT * FROM reservations ORDER BY created_at DESC LIMIT 50;

-- ========== 新闻表 news（只看标题和日期）==========
SELECT id, title, date_display, LEFT(summary, 60) AS summary_preview FROM news ORDER BY id DESC LIMIT 20;

-- ========== 首页统计 homepage_stats ==========
SELECT * FROM homepage_stats ORDER BY sort_order, id;

-- ========== 院系 colleges ==========
SELECT id, name, LEFT(description, 80) AS desc_preview FROM colleges ORDER BY sort_order, id;

-- ========== 重要节点 key_dates ==========
SELECT id, tag, date_display, label FROM key_dates ORDER BY sort_order, id;

-- ========== 用户表（仅看用户名，不看密码）==========
SELECT username FROM users;
