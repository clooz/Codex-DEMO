/**
 * 首页「院系与学科」表及初始数据
 * 使用方式：npm run seed:colleges
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
    CREATE TABLE IF NOT EXISTS colleges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT '院系名称',
      description VARCHAR(500) DEFAULT NULL COMMENT '简介',
      image_url VARCHAR(500) DEFAULT NULL COMMENT '图片地址',
      link VARCHAR(500) DEFAULT '#' COMMENT '详情链接',
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='院系与学科'
  `);

  const rows = [
    { name: '机械工程学院', description: '面向先进制造与装备，培养工程实践与创新能力。', image_url: 'https://picsum.photos/id/14/400/300', link: '#', sort_order: 3 },
    { name: '信息与计算机学院', description: '计算机科学与技术、软件工程、人工智能等方向。', image_url: 'https://picsum.photos/id/15/400/300', link: '#', sort_order: 2 },
    { name: '材料科学与工程学院', description: '新材料研发与工程应用，服务国家战略需求。', image_url: 'https://picsum.photos/id/16/400/300', link: '#', sort_order: 1 }
  ];

  await conn.query('DELETE FROM colleges WHERE id > 0');
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const values = rows.flatMap((r) => [r.name, r.description, r.image_url, r.link, r.sort_order]);
  await conn.query(
    `INSERT INTO colleges (name, description, image_url, link, sort_order) VALUES ${placeholders}`,
    values
  );

  console.log('表 colleges 已就绪，已插入 3 条数据');
  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
