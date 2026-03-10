# 登录服务后端

Node.js + Express，连接 MySQL，提供 `POST /login` 接口。

## 环境要求

- Node.js（建议 18+）
- MySQL 5.7+（运行在 localhost:3306）

## 1. 数据库准备

在 MySQL 中执行以下 SQL（或执行项目中的 `init-db.sql`）：

```sql
CREATE DATABASE IF NOT EXISTS testdb;
USE testdb;

CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (username)
);

-- 可选：插入测试用户
INSERT INTO users (username, password) VALUES ('admin', '123456');
```

若 root 有密码，请设置环境变量 `MYSQL_PASSWORD` 或在 `server.js` 中修改 `password` 配置。

## 2. 安装依赖

在 `backend` 目录下执行：

```bash
cd backend
npm install
```

## 3. 启动服务

```bash
npm start
```

服务运行在 **http://localhost:3000**。

- **开发时**可改用 `npm run dev`（nodemon）：修改 `server.js` 等文件保存后会自动重启，无需手动重启。
- **测试 / 生产**用 `npm start` 即可。

## 4. 接口说明

### POST /login

- **请求体**（JSON）：`{ "username": "xxx", "password": "xxx" }`
- **成功**（用户存在）：`{ "success": true }`
- **失败**（用户不存在或密码错误）：`{ "success": false }`

### GET /health

- 返回 `{ "ok": true }`，用于检查服务是否存活。

### 校园开放日预约报名

- **创建预约表**（首次使用前执行一次）：`npm run seed:reservations`
- **POST /api/reservations**：提交预约。请求体示例：
  ```json
  {
    "student_name": "张三",
    "parent_name": "张父",
    "contact_phone": "13800138000",
    "reservation_date": "2025-04-26",
    "num_people": 2,
    "current_school": "某中学",
    "grade": "高二",
    "desired_college_major": "计算机学院",
    "other_requirements": "无"
  }
  ```
  必填：`student_name`、`contact_phone`、`reservation_date`。成功返回 `201` 及 `{ "success": true, "id": 1 }`。
- **GET /api/reservations**：查询预约列表。可选参数 `?date=YYYY-MM-DD`、`?limit=50`。返回 `{ "success": true, "data": [...] }`。
- **GET /api/news**：首页新闻列表。可选参数 `?limit=10`。返回 `{ "success": true, "data": [{ "title", "date_display", "link" }] }`。需先执行 `npm run seed:news` 初始化新闻表与数据。

## 5. 自动化测试（预约接口）

先启动后端（`npm start`），再**另开一个终端**在 `backend` 目录执行：

```bash
npm run test:reservations
```

脚本会校验：正常提交返回 201、列表包含新记录、缺必填项返回 400、兼容前端字段名。

## 6. 前端说明

- 登录：`login.html` 请求 `http://localhost:3000/login`。
- 校园开放日预约：`opencampus.html` 中预约表单提交到 `POST http://localhost:3000/api/reservations`。  
若前端通过 `file://` 打开，部分浏览器可能限制跨域，建议用本地静态服务器打开前端（如 `npx serve frontend`）。
