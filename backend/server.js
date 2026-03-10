require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// 解析 JSON 请求体
app.use(express.json());

// 允许前端跨域（前端在 file:// 或不同端口时需此项）
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// MySQL 连接池配置
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD || '',  // 无密码则留空，有密码请设环境变量
  database: 'testdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// POST /login：接收 username、password，查询 users 表
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || password === undefined) {
      return res.status(400).json({ success: false, message: '缺少 username 或 password' });
    }

    const user = String(username).trim();
    const pwd = String(password);
    const [rows] = await pool.query(
      'SELECT password FROM users WHERE username = ? LIMIT 1',
      [user]
    );

    const found = Array.isArray(rows) && rows.length > 0;
    const success = found && (await bcrypt.compare(pwd, rows[0].password));
    console.log('[登录]', user, success ? '成功' : '失败');
    return res.json({ success });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: err.message  // 便于排查：如 MySQL 未启动、密码错误、testdb 不存在等
    });
  }
});

// ---------- 校园开放日预约报名 ----------
// POST /api/reservations：提交预约
app.post('/api/reservations', async (req, res) => {
  try {
    const body = req.body || {};
    const studentName = String(body.student_name || body.name || '').trim();
    const contactPhone = String(body.contact_phone || body.phone || '').trim();
    const reservationDate = String(body.reservation_date || body.date || '').trim();
    const numPeople = Math.max(1, Math.min(10, parseInt(body.num_people || body.people || '1', 10) || 1));

    if (!studentName) return res.status(400).json({ success: false, message: '请填写学生姓名' });
    if (!contactPhone) return res.status(400).json({ success: false, message: '请填写联系电话' });
    if (!reservationDate) return res.status(400).json({ success: false, message: '请选择预约日期' });

    const parentName = (body.parent_name || body.parentName || '').trim() || null;
    const currentSchool = (body.current_school || body.school || '').trim() || null;
    const grade = (body.grade || '').trim() || null;
    const desiredCollegeMajor = (body.desired_college_major || body.interest || '').trim() || null;
    const otherRequirements = (body.other_requirements || body.remark || '').trim() || null;

    const [result] = await pool.query(
      `INSERT INTO reservations (
        student_name, parent_name, contact_phone, reservation_date, num_people,
        current_school, grade, desired_college_major, other_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentName, parentName, contactPhone, reservationDate, numPeople, currentSchool, grade, desiredCollegeMajor, otherRequirements]
    );

    const id = result.insertId;
    console.log('[预约]', studentName, reservationDate, 'id:', id);
    return res.status(201).json({ success: true, id, message: '预约成功' });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:reservations 创建预约表' });
    }
    console.error('Reservation error:', err.message);
    return res.status(500).json({ success: false, message: '服务器错误', error: err.message });
  }
});

// ---------- 招生咨询 / 在线留言 ----------
// POST /api/inquiries：提交留言
app.post('/api/inquiries', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim().replace(/\s/g, '');
    const inquiryType = (body.inquiry_type || body.type || '').trim() || null;
    const content = String(body.content || '').trim();

    if (!name) return res.status(400).json({ success: false, message: '请填写姓名' });
    if (!phone) return res.status(400).json({ success: false, message: '请填写联系电话' });
    if (!content) return res.status(400).json({ success: false, message: '请填写留言内容' });

    const [result] = await pool.query(
      'INSERT INTO inquiries (name, phone, inquiry_type, content) VALUES (?, ?, ?, ?)',
      [name, phone, inquiryType, content]
    );
    const id = result.insertId;
    console.log('[留言]', name, phone, 'id:', id);
    return res.status(201).json({ success: true, id, message: '留言提交成功' });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:inquiries 创建留言表' });
    }
    console.error('Inquiry POST error:', err.message);
    return res.status(500).json({ success: false, message: '服务器错误', error: err.message });
  }
});

// GET /api/inquiries：查询留言（?phone=手机号 按手机号筛选；不传则返回全部，便于管理端）
app.get('/api/inquiries', async (req, res) => {
  try {
    const phone = (req.query.phone || '').trim().replace(/\s/g, '');
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    let sql = 'SELECT id, name, phone, inquiry_type, content, status, admin_reply, replied_at, created_at FROM inquiries';
    const params = [];
    if (phone) {
      sql += ' WHERE REPLACE(phone, \' \', \'\') = ?';
      params.push(phone);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:inquiries 创建留言表' });
    }
    console.error('Inquiries list error:', err.message);
    return res.status(500).json({ success: false, message: '服务器错误', error: err.message });
  }
});

// PATCH /api/inquiries/:id：回复留言或标记已处理（改）
app.patch('/api/inquiries/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: '无效的留言 ID' });
    const body = req.body || {};
    const status = (body.status || '').trim(); // 'replied' | 'processed'
    const adminReply = (body.admin_reply || body.reply || '').trim() || null;

    const updates = [];
    const values = [];
    if (adminReply !== null && adminReply !== '') {
      updates.push('admin_reply = ?');
      values.push(adminReply);
      updates.push('replied_at = NOW()');
    }
    const newStatus = (status === 'replied' || status === 'processed') ? status : ((adminReply !== null && adminReply !== '') ? 'replied' : null);
    if (newStatus) {
      updates.push('status = ?');
      values.push(newStatus);
    }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '请提供 status 或 admin_reply' });
    }
    values.push(id);
    const sql = 'UPDATE inquiries SET ' + updates.join(', ') + ' WHERE id = ?';
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '未找到该留言' });
    }
    console.log('[留言更新] id:', id, 'status:', status || '-', 'reply:', !!adminReply);
    return res.json({ success: true, message: '已更新' });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:inquiries 创建留言表' });
    }
    console.error('Inquiry PATCH error:', err.message);
    return res.status(500).json({ success: false, message: '服务器错误', error: err.message });
  }
});

// 新闻接口仅从数据库返回数据，不提供兜底假数据；失败时返回 success: false，由前端展示“加载失败”

// GET /api/news：新闻列表（支持 ?limit=10&page=1），数据仅来自数据库
app.get('/api/news', async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      'SELECT id, title, subtitle, summary, date_display, link FROM news ORDER BY sort_order DESC, id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    let total = 0;
    try {
      const [[t]] = await pool.query('SELECT COUNT(*) AS total FROM news');
      total = t && t.total != null ? Number(t.total) : (rows ? rows.length : 0);
    } catch (_) {
      total = rows ? rows.length : 0;
    }
    const list = (rows || []).map((r, i) => {
      const rawId = r.id !== undefined && r.id !== null && r.id !== '' ? r.id : (i + 1);
      return {
        id: parseInt(rawId, 10) || (i + 1),
        title: r.title,
        subtitle: r.subtitle,
        summary: r.summary,
        date_display: r.date_display,
        link: r.link
      };
    });
    return res.json({ success: true, data: list, total });
  } catch (err) {
    console.error('News list error:', err.message);
    return res.status(500).json({
      success: false,
      message: '新闻列表加载失败，请确认数据库已启动并已执行 npm run seed:news',
      data: [],
      total: 0
    });
  }
});

// GET /api/news/:id：单条新闻详情（含 body），数据仅来自数据库
app.get('/api/news/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: '无效的新闻 ID' });
    const [rows] = await pool.query(
      'SELECT id, title, subtitle, summary, body, date_display, link FROM news WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows && rows.length) {
      const row = rows[0];
      const bodyRaw = row.body ?? row.BODY ?? row.Body;
      const body = (bodyRaw != null && String(bodyRaw).trim() !== '') ? String(bodyRaw) : (row.summary != null ? String(row.summary) : '');
      return res.json({
        success: true,
        data: {
          id: row.id,
          title: row.title,
          subtitle: row.subtitle,
          summary: row.summary,
          date_display: row.date_display,
          link: row.link,
          body
        }
      });
    }
    return res.status(404).json({ success: false, message: '未找到该新闻' });
  } catch (err) {
    console.error('News detail error:', err.message);
    return res.status(500).json({ success: false, message: '新闻详情加载失败，请确认数据库已启动', error: err.message });
  }
});

// GET /api/stats：首页「数据见证实力」统计，数据仅来自数据库
app.get('/api/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, value, unit, label, description FROM homepage_stats ORDER BY sort_order DESC, id ASC'
    );
    const data = (rows || []).map((r) => ({
      id: r.id,
      value: Number(r.value) || 0,
      unit: r.unit || '',
      label: r.label || '',
      description: r.description || ''
    }));
    return res.json({ success: true, data });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:stats 创建首页统计表' });
    }
    console.error('Stats error:', err.message);
    return res.status(500).json({ success: false, message: '首页统计加载失败', data: [] });
  }
});

// GET /api/colleges：首页「院系与学科」列表，数据仅来自数据库
app.get('/api/colleges', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, image_url, link FROM colleges ORDER BY sort_order DESC, id ASC'
    );
    const data = (rows || []).map((r) => ({
      id: r.id,
      name: r.name || '',
      description: r.description || '',
      image_url: r.image_url || '',
      link: r.link || '#'
    }));
    return res.json({ success: true, data });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:colleges 创建院系表' });
    }
    console.error('Colleges error:', err.message);
    return res.status(500).json({ success: false, message: '院系列表加载失败', data: [] });
  }
});

// GET /api/key-dates：首页「重要节点」招生/入学日程，数据仅来自数据库
app.get('/api/key-dates', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, tag, date_display, datetime, label, description, link, card_type FROM key_dates ORDER BY sort_order DESC, id ASC'
    );
    const data = (rows || []).map((r) => ({
      id: r.id,
      tag: r.tag || '',
      date_display: r.date_display || '',
      datetime: r.datetime ? String(r.datetime).slice(0, 10) : '',
      label: r.label || '',
      description: r.description || '',
      link: r.link || '#',
      card_type: r.card_type || ''
    }));
    return res.json({ success: true, data });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:key-dates 创建重要节点表' });
    }
    console.error('Key-dates error:', err.message);
    return res.status(500).json({ success: false, message: '重要节点加载失败', data: [] });
  }
});

// GET /api/reservations：查询预约列表（支持 ?date=YYYY-MM-DD&contact_phone=手机号&limit=50）
app.get('/api/reservations', async (req, res) => {
  try {
    const date = (req.query.date || '').trim();
    const contactPhone = (req.query.contact_phone || req.query.phone || '').trim().replace(/\s/g, '');
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    let sql = 'SELECT id, student_name, parent_name, contact_phone, reservation_date, num_people, current_school, grade, desired_college_major, other_requirements, created_at FROM reservations';
    const params = [];
    const conditions = [];
    if (date) {
      conditions.push('reservation_date = ?');
      params.push(date);
    }
    if (contactPhone) {
      conditions.push('REPLACE(contact_phone, \' \', \'\') = ?');
      params.push(contactPhone);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: '请先执行 npm run seed:reservations 创建预约表' });
    }
    console.error('List reservations error:', err.message);
    return res.status(500).json({ success: false, message: '服务器错误', error: err.message });
  }
});

// 根路径：说明这是接口服务，登录请访问前端页面
app.get('/', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>接口服务</title></head>
    <body style="font-family:sans-serif;padding:2rem;">
      <h1>接口服务已运行</h1>
      <ul>
        <li><strong>POST /login</strong> — 登录</li>
        <li><strong>POST /api/reservations</strong> — 校园开放日预约报名</li>
        <li><strong>GET /api/reservations</strong> — 查询预约列表</li>
        <li><strong>POST /api/inquiries</strong> — 在线留言</li>
        <li><strong>GET /api/inquiries</strong> — 查询留言（?phone=手机号）</li>
        <li><strong>PATCH /api/inquiries/:id</strong> — 回复/标记已处理</li>
        <li><strong>GET /api/news</strong> — 首页新闻列表</li>
        <li><strong>GET /api/stats</strong> — 首页实力统计</li>
        <li><strong>GET /api/colleges</strong> — 院系与学科</li>
        <li><strong>GET /api/key-dates</strong> — 重要节点日程</li>
        <li><strong>GET /health</strong> — 健康检查</li>
      </ul>
    </body></html>
  `);
});

// 健康检查（可选）
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// 启动前检查 MySQL 是否可用
pool.query('SELECT 1')
  .then(() => console.log('MySQL 连接成功 (testdb)'))
  .catch((err) => console.error('MySQL 连接失败:', err.message, '\n请检查: 1) MySQL 是否已启动 2) 数据库 testdb 是否存在 3) root 密码是否正确(有密码请设置环境变量 MYSQL_PASSWORD)'));

app.listen(PORT, () => {
  console.log(`登录服务已启动: http://localhost:${PORT}`);
});
