/**
 * 创建招生咨询/在线留言表 inquiries
 * 使用方式：npm run seed:inquiries
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
    CREATE TABLE IF NOT EXISTS inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT '姓名',
      phone VARCHAR(20) NOT NULL COMMENT '联系电话',
      inquiry_type VARCHAR(50) DEFAULT NULL COMMENT '咨询类型',
      content TEXT NOT NULL COMMENT '留言内容',
      status ENUM('pending', 'replied', 'processed') DEFAULT 'pending' COMMENT '状态：待处理/已回复/已处理',
      admin_reply TEXT DEFAULT NULL COMMENT '后台回复内容',
      replied_at DATETIME DEFAULT NULL COMMENT '回复时间',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='招生咨询在线留言';
  `);

  console.log('表 inquiries 已就绪');
  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
