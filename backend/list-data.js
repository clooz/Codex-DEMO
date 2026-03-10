/**
 * 查看 testdb 中 users、reservations、news 三张表的数据概况
 * 使用方式：npm run data 或 node list-data.js
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

  console.log('========== testdb 表与数据概况 ==========\n');

  // 1. users
  const [[uc]] = await conn.query('SELECT COUNT(*) AS n FROM users');
  const [uRows] = await conn.query('SELECT username FROM users ORDER BY username LIMIT 20');
  console.log('【users】 共', uc.n, '条');
  console.log('  用户名:', uRows.map((r) => r.username).join(', '));
  if (uc.n > 20) console.log('  ... 仅显示前 20 条');
  console.log('');

  // 2. reservations
  const [[rc]] = await conn.query('SELECT COUNT(*) AS n FROM reservations');
  const [rRows] = await conn.query(
    'SELECT id, student_name, contact_phone, reservation_date, created_at FROM reservations ORDER BY id DESC LIMIT 10'
  );
  console.log('【reservations】 共', rc.n, '条');
  if (rRows.length) {
    rRows.forEach((r) => {
      console.log('  id', r.id, '|', r.student_name, '|', r.contact_phone, '|', r.reservation_date, '|', r.created_at);
    });
    if (rc.n > 10) console.log('  ... 仅显示最新 10 条');
  } else console.log('  (暂无数据)');
  console.log('');

  // 3. news
  const [[nc]] = await conn.query('SELECT COUNT(*) AS n FROM news');
  const [nRows] = await conn.query('SELECT id, date_display, title FROM news ORDER BY sort_order DESC, id DESC LIMIT 10');
  console.log('【news】 共', nc.n, '条');
  if (nRows.length) {
    nRows.forEach((r) => console.log('  ', r.date_display, '|', r.title));
  } else console.log('  (暂无数据)');

  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
