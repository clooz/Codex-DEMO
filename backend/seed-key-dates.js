/**
 * 首页「重要节点」招生/入学日程表及初始数据
 * 使用方式：npm run seed:key-dates
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: 'testdb'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS key_dates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tag VARCHAR(50) NOT NULL COMMENT '标签如 新生入学、校园开放',
      date_display VARCHAR(30) NOT NULL COMMENT '显示日期如 9月1日',
      datetime DATE DEFAULT NULL COMMENT '用于排序的日期',
      label VARCHAR(200) NOT NULL COMMENT '标题',
      description TEXT DEFAULT NULL COMMENT '说明',
      link VARCHAR(500) DEFAULT '#' COMMENT '链接',
      card_type VARCHAR(50) DEFAULT NULL COMMENT '样式类 enrollment/campus/graduate/admission',
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='重要节点日程'
  `);

  const rows = [
    { tag: '新生入学', date_display: '9月1日', datetime: '2025-09-01', label: '2025 级新生报到', description: '请按录取通知书要求携带材料到校办理注册与入住手续。', link: '#', card_type: 'enrollment', sort_order: 4 },
    { tag: '校园开放', date_display: '8月23日', datetime: '2025-08-23', label: '校园开放日 · 预约访校', description: '欢迎考生与家长走进校园，参观实验室、图书馆与生活设施。', link: 'opencampus.html', card_type: 'campus', sort_order: 3 },
    { tag: '研究生', date_display: '7月10日', datetime: '2025-07-10', label: '研究生复试结果公布', description: '硕士、博士复试成绩及拟录取名单将统一在研招系统发布。', link: '#', card_type: 'graduate', sort_order: 2 },
    { tag: '本科招生', date_display: '6月15日', datetime: '2025-06-15', label: '2025 年本科招生报名截止', description: '请在此日期前完成网上报名并提交材料，逾期不予受理。', link: '#', card_type: 'admission', sort_order: 1 }
  ];

  await conn.query('DELETE FROM key_dates WHERE id > 0');
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
  const values = rows.flatMap((r) => [r.tag, r.date_display, r.datetime, r.label, r.description, r.link, r.card_type, r.sort_order]);
  await conn.query(
    `INSERT INTO key_dates (tag, date_display, datetime, label, description, link, card_type, sort_order) VALUES ${placeholders}`,
    values
  );

  console.log('表 key_dates 已就绪，已插入 4 条数据');
  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
