/**
 * 创建校园开放日预约表 reservations
 * 使用方式：npm run seed:reservations
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
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_name VARCHAR(100) NOT NULL COMMENT '学生姓名',
      parent_name VARCHAR(100) DEFAULT NULL COMMENT '家长姓名',
      contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
      reservation_date DATE NOT NULL COMMENT '预约日期',
      num_people TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '预约人数',
      current_school VARCHAR(200) DEFAULT NULL COMMENT '所在学校',
      grade VARCHAR(50) DEFAULT NULL COMMENT '年级',
      desired_college_major TEXT DEFAULT NULL COMMENT '想了解的学院/专业',
      other_requirements TEXT DEFAULT NULL COMMENT '其他需求',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校园开放日预约报名';
  `);

  console.log('表 reservations 已就绪');
  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
