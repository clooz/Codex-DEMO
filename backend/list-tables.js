/**
 * 查看 testdb 中的表及 reservations 表结构
 * 使用方式：在 backend 目录执行  npm run tables
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

  const [tables] = await conn.query("SHOW TABLES");
  console.log('testdb 中的表:', tables.map((r) => Object.values(r)[0]).join(', ') || '(无)');

  const [rows] = await conn.query("SHOW TABLES LIKE 'reservations'");
  if (rows.length === 0) {
    console.log('\nreservations 表不存在，请执行: npm run seed:reservations');
    await conn.end();
    return;
  }

  const [cols] = await conn.query("DESCRIBE reservations");
  console.log('\nreservations 表结构:');
  console.log('字段名\t\t类型\t\t允许空\t键\t默认\t说明');
  console.log('-'.repeat(60));
  cols.forEach((c) => console.log(c.Field + '\t\t' + c.Type + '\t' + c.Null + '\t' + (c.Key || '') + '\t' + (c.Default || '') + '\t' + (c.Comment || '')));

  const [[cnt]] = await conn.query('SELECT COUNT(*) AS n FROM reservations');
  console.log('\n当前预约记录数:', cnt.n);

  await conn.end();
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
