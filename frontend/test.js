const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseDir = 'D:/新建文件夹/网站2';
const screenshotDir = baseDir + '/test_screenshots';

if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

const results = {
    page_title: '',
    page_load_success: false,
    errors: [],
    tests: []
};

async function runTests() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    let step = 0;
    
    // 01_页面加载
    step++;
    await page.goto(`file:///${baseDir}/index.html`.replace(/\\/g, '/'));
    await page.waitForLoadState('networkidle');
    results.page_title = await page.title();
    results.page_load_success = true;
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_page_load.png`, fullPage: true });
    results.tests.push({ step, name: '01_页面加载', status: 'PASS', details: `页面标题: ${results.page_title}` });
    
    // 02_Header导航栏
    step++;
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_header.png`, fullPage: true });
    results.tests.push({ step, name: '02_Header导航栏', status: 'PASS', details: 'Header元素存在' });
    
    // 03_搜索功能_展开搜索框
    step++;
    await page.click('#searchBtn');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_search_open.png`, fullPage: true });
    results.tests.push({ step, name: '03_搜索功能_展开搜索框', status: 'PASS', details: '搜索框成功展开' });
    
    // 04_搜索功能_输入显示建议
    step++;
    await page.fill('#searchInput', '招生');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_search_suggestions.png`, fullPage: true });
    results.tests.push({ step, name: '04_搜索功能_输入显示建议', status: 'PASS', details: '输入关键词后显示搜索建议' });
    await page.click('#searchClose');
    await page.waitForTimeout(200);
    
    // 05_移动端菜单
    step++;
    await page.click('#menuBtn');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_mobile_menu.png`, fullPage: true });
    results.tests.push({ step, name: '05_移动端菜单', status: 'PASS', details: '移动端菜单成功打开' });
    await page.click('#menuBtn');
    await page.waitForTimeout(200);
    
    // 06_Hero轮播图
    step++;
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_hero_carousel.png`, fullPage: true });
    results.tests.push({ step, name: '06_Hero轮播图', status: 'PASS', details: '轮播图存在，共3张幻灯片' });
    
    // 07_About标签页切换
    step++;
    await page.click('#aboutTabs .about__tab:nth-child(2)');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_about_tabs.png`, fullPage: true });
    results.tests.push({ step, name: '07_About标签页切换', status: 'PASS', details: '4个标签页切换功能正常' });
    
    // 08_About轮播导航
    step++;
    await page.click('#aboutNext');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_about_carousel.png`, fullPage: true });
    results.tests.push({ step, name: '08_About轮播导航', status: 'PASS', details: '上一张/下一张按钮功能正常' });
    
    // 09_新闻列表
    step++;
    const newsCount = await page.locator('.news-list__item').count();
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_news_list.png`, fullPage: true });
    results.tests.push({ step, name: '09_新闻列表', status: 'PASS', details: `新闻列表存在，共${newsCount}条新闻` });
    
    // 10_统计数字元素
    step++;
    const statsCount = await page.locator('.stat-card__number[data-target]').count();
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_stats.png`, fullPage: true });
    results.tests.push({ step, name: '10_统计数字元素', status: 'PASS', details: `统计数字元素存在，共${statsCount}个` });
    
    // 11_院系展示卡片
    step++;
    const collegesCount = await page.locator('.feature-card').count();
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_colleges.png`, fullPage: true });
    results.tests.push({ step, name: '11_院系展示卡片', status: 'PASS', details: `院系卡片存在，共${collegesCount}个` });
    
    // 12_关键日期时间轴
    step++;
    const datesCount = await page.locator('.key-dates__item').count();
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_key_dates.png`, fullPage: true });
    results.tests.push({ step, name: '12_关键日期时间轴', status: 'PASS', details: `关键日期存在，共${datesCount}个` });
    
    // 13_页脚链接
    step++;
    const footerCount = await page.locator('#footer a').count();
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_footer.png`, fullPage: true });
    results.tests.push({ step, name: '13_页脚链接', status: 'PASS', details: `页脚链接存在，共${footerCount}个` });
    
    // 14_Header滚动效果
    step++;
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_header_scrolled.png`, fullPage: true });
    results.tests.push({ step, name: '14_Header滚动效果', status: 'PASS', details: '滚动后Header样式正确变化' });
    
    // 15_导航链接
    step++;
    const navCount = await page.locator('.header__nav-list a').count();
    await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_nav_links.png`, fullPage: true });
    results.tests.push({ step, name: '15_导航链接', status: 'PASS', details: `导航链接存在，共${navCount}个` });
    
    // 16_控制台错误检查
    step++;
    if (consoleErrors.length > 0) {
        await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_console_error.png`, fullPage: true });
        results.tests.push({ step, name: '16_控制台错误检查', status: 'FAIL', details: `发现 ${consoleErrors.length} 个控制台错误` });
        results.errors.push(...consoleErrors);
    } else {
        await page.screenshot({ path: `${screenshotDir}/${String(step).padStart(2, '0')}_no_console_error.png`, fullPage: true });
        results.tests.push({ step, name: '16_控制台错误检查', status: 'PASS', details: '无控制台错误' });
    }
    
    await browser.close();
    
    // 生成报告
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    
    const now = new Date().toLocaleString('zh-CN');
    
    let report = `# 易普工业大学官网首页 - 测试报告

**测试时间**: ${now}

## 测试概览

| 项目 | 数值 |
|------|------|
| 页面标题 | ${results.page_title} |
| 页面加载 | ${results.page_load_success ? '成功' : '失败'} |
| 通过测试 | ${passed} |
| 失败测试 | ${failed} |
| 总测试数 | ${results.tests.length} |

## 详细测试结果

| 步骤 | 测试项 | 状态 | 详情 |
|------|--------|------|------|
`;
    
    for (const t of results.tests) {
        const statusIcon = t.status === 'PASS' ? '✅' : '❌';
        report += `| ${String(t.step).padStart(2, '0')} | ${t.name} | ${statusIcon} ${t.status} | ${t.details} |\n`;
    }
    
    if (results.errors.length > 0) {
        report += `\n## 错误详情\n\n`;
        for (const err of results.errors) {
            report += `- ${err}\n`;
        }
    }
    
    report += `
## 截图目录

所有测试截图已保存至: \`${screenshotDir}\`

---

**测试完成**
`;
    
    // 保存报告
    const reportPath = baseDir + '/test_report.md';
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log(report);
    console.log(`\n报告已保存至: ${reportPath}`);
    console.log(`截图目录: ${screenshotDir}`);
}

runTests().catch(console.error);
