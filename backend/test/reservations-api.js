/**
 * 校园开放日预约接口自动化测试，并输出测试报告
 * 使用方式：先启动后端 npm start，再在 backend 目录执行 npm run test:reservations
 */
const fs = require('fs');
const path = require('path');
const BASE = 'http://localhost:3000';

function request(method, pathUrl, body) {
  const url = pathUrl.startsWith('http') ? pathUrl : BASE + pathUrl;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  return fetch(url, opts).then(async (r) => {
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch (_) { throw new Error('后端未返回 JSON，请确认已启动 npm start。响应片段: ' + text.slice(0, 80)); }
    return { status: r.status, data };
  });
}

function writeReport(cases, passed, failed, durationMs, errorMessage) {
  const reportDir = path.join(__dirname, '..', 'test-reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'reservations-report.md');

  const total = passed + failed;
  const status = failed === 0 ? '通过' : '失败';
  const lines = [
    '# 校园开放日预约接口 - 自动化测试报告',
    '',
    '| 项目 | 值 |',
    '|------|-----|',
    `| 执行时间 | ${new Date().toLocaleString('zh-CN')} |`,
    `| 总用例数 | ${total} |`,
    `| 通过 | ${passed} |`,
    `| 失败 | ${failed} |`,
    `| 结果 | **${status}** |`,
    `| 耗时 | ${durationMs} ms |`,
    '',
    '## 用例明细',
    '',
    '| 序号 | 用例名称 | 结果 |',
    '|------|----------|------|'
  ];

  cases.forEach((c, i) => {
    lines.push(`| ${i + 1} | ${c.name} | ${c.pass ? '✓ 通过' : '✗ 失败'} |`);
  });

  if (errorMessage) {
    lines.push('');
    lines.push('## 执行异常');
    lines.push('');
    lines.push('```');
    lines.push(errorMessage);
    lines.push('```');
  }

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  return reportPath;
}

async function run() {
  const start = Date.now();
  const cases = [];
  let passed = 0;
  let failed = 0;

  function ok(cond, name) {
    if (cond) { passed++; console.log('  ✓', name); }
    else { failed++; console.log('  ✗', name); }
    cases.push({ name, pass: !!cond });
  }

  console.log('\n--- 预约接口自动化测试 ---\n');

  try {
    // 1. POST 正常预约
    const payload = {
      student_name: '测试学生',
      parent_name: '测试家长',
      contact_phone: '13800138000',
      reservation_date: '2025-04-26',
      num_people: 2,
      current_school: '测试中学',
      grade: '高二',
      desired_college_major: '计算机学院',
      other_requirements: '无'
    };
    let res = await request('POST', '/api/reservations', payload);
    ok(res.status === 201 && res.data && res.data.success && res.data.id, 'POST /api/reservations 正常提交返回 201 且带 id');

    // 2. GET 列表包含刚提交的数据
    res = await request('GET', '/api/reservations');
    ok(res.status === 200 && Array.isArray(res.data && res.data.data), 'GET /api/reservations 返回 200 且 data 为数组');
    const list = (res.data && res.data.data) || [];
    const found = list.some((r) => r.contact_phone === payload.contact_phone && r.student_name === payload.student_name);
    ok(found, 'GET 列表中包含刚提交的预约记录');

    // 3. 缺少必填项应返回 400
    res = await request('POST', '/api/reservations', { student_name: '仅姓名' });
    ok(res.status === 400 && res.data && !res.data.success, '缺少联系电话/日期时返回 400');

    res = await request('POST', '/api/reservations', { contact_phone: '13800000000', reservation_date: '2025-05-01' });
    ok(res.status === 400 && res.data && !res.data.success, '缺少学生姓名时返回 400');

    // 4. 兼容前端字段名
    res = await request('POST', '/api/reservations', {
      name: '兼容测试',
      phone: '13900139000',
      date: '2025-05-31',
      people: '3'
    });
    ok(res.status === 201 && res.data && res.data.success, '兼容 name/phone/date/people 字段名');

    const duration = Date.now() - start;
    const reportPath = writeReport(cases, passed, failed, duration, null);
    console.log('\n--- 结果 ---');
    console.log('通过:', passed, '失败:', failed, '耗时:', duration + 'ms');
    console.log('测试报告已生成:', reportPath);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    const duration = Date.now() - start;
    writeReport(cases, passed, failed, duration, err.message);
    console.error('测试执行异常:', err.message);
    process.exit(1);
  }
}

run();
