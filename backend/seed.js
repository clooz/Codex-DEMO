/**
 * 往数据库插入默认用户，密码使用 bcrypt 哈希存储。
 * 使用方式：在 backend 目录执行  npm run seed
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seed() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.MYSQL_PASSWORD || ''
  };

  const conn = await mysql.createConnection(config);

  await conn.query('CREATE DATABASE IF NOT EXISTS testdb');
  await conn.query('USE testdb');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      username VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      PRIMARY KEY (username)
    )
  `);

  const users = [
    ['admin', '123456'],
    ['user1', '123456'],
    ['user2', '123456'],
    ['student1', '123456'],
    ['student2', '123456'],
    ['teacher1', '123456'],
    ['test', '123456']
  ];

  const saltRounds = 10;
  for (const [username, plainPassword] of users) {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    await conn.query(
      `INSERT INTO users (username, password) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [username, hash]
    );
  }

  console.log('已插入/更新用户:', users.map(([u]) => u).join(', '), '(密码已 bcrypt 哈希，明文均为 123456)');
  await conn.end();
}

seed().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
