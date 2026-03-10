-- 请逐条执行，不要一次性执行整段

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS testdb;

-- 2. 创建 users 表（使用 testdb.users 避免 USE 语句）
CREATE TABLE IF NOT EXISTS testdb.users (
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (username)
);

-- 3. 插入测试用户（admin / 123456）
INSERT INTO testdb.users (username, password) VALUES ('admin', '123456');
