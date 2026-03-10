/**
 * 为 news 表增加 subtitle、summary 字段（若不存在）
 * 使用方式：npm run migrate:news
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

  const [cols] = await conn.query("SHOW COLUMNS FROM news LIKE 'subtitle'");
  if (cols.length === 0) {
    await conn.query('ALTER TABLE news ADD COLUMN subtitle VARCHAR(300) DEFAULT NULL COMMENT "副标题" AFTER title');
    console.log('已添加字段 subtitle');
  }
  const [cols2] = await conn.query("SHOW COLUMNS FROM news LIKE 'summary'");
  if (cols2.length === 0) {
    await conn.query('ALTER TABLE news ADD COLUMN summary TEXT DEFAULT NULL COMMENT "新闻摘要" AFTER subtitle');
    console.log('已添加字段 summary');
  }
  const [cols3] = await conn.query("SHOW COLUMNS FROM news LIKE 'body'");
  if (cols3.length === 0) {
    await conn.query('ALTER TABLE news ADD COLUMN body TEXT DEFAULT NULL COMMENT "正文" AFTER summary');
    console.log('已添加字段 body');
  }

  await conn.end();
  console.log('migrate-news 完成');
}

run().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
