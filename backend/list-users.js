/**
 * 查看 users 表里的所有用户
 * 使用方式：在 backend 目录执行  npm run users
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function list() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: 'testdb'
  });

  const [rows] = await conn.query('SELECT username, password FROM users ORDER BY username');
  await conn.end();

  if (rows.length === 0) {
    console.log('用户表为空');
    return;
  }

  console.log('testdb.users 表中共', rows.length, '条用户（密码已 bcrypt 哈希存储）：\n');
  console.log('用户名');
  console.log('--------');
  rows.forEach((r) => console.log(r.username));
}

list().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
