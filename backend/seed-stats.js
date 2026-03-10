/**
 * 首页「数据见证实力」统计表及初始数据
 * 使用方式：npm run seed:stats
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
    CREATE TABLE IF NOT EXISTS homepage_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      value INT NOT NULL DEFAULT 0 COMMENT '数字',
      unit VARCHAR(20) DEFAULT '' COMMENT '单位如 +、所',
      label VARCHAR(100) NOT NULL COMMENT '标题如 一级学科',
      description VARCHAR(200) DEFAULT NULL COMMENT '副标题',
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页实力数据'
  `);

  const rows = [
    { value: 12, unit: '+', label: '一级学科', description: '博士/硕士授权点', sort_order: 4 },
    { value: 200, unit: '+', label: '科研项目', description: '国家级、省部级课题', sort_order: 3 },
    { value: 50, unit: '+', label: '专利成果', description: '发明专利与转化', sort_order: 2 },
    { value: 27, unit: '所', label: '合作院校', description: '海外高校与机构', sort_order: 1 }
  ];

  await conn.query('DELETE FROM homepage_stats WHERE id > 0');
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const values = rows.flatMap((r) => [r.value, r.unit, r.label, r.description, r.sort_order]);
  await conn.query(
    `INSERT INTO homepage_stats (value, unit, label, description, sort_order) VALUES ${placeholders}`,
    values
  );

  console.log('表 homepage_stats 已就绪，已插入 4 条数据');
  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
