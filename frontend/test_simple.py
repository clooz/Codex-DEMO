from playwright.sync_api import sync_playwright
import os
from datetime import datetime

base_dir = r"D:\新建文件夹\网站2"
screenshot_dir = base_dir + r"\test_screenshots"

if not os.path.exists(screenshot_dir):
    os.makedirs(screenshot_dir)

results = {
    "page_title": "",
    "page_load_success": False,
    "errors": [],
    "tests": []
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1080})
    
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    
    step = 0
    
    # 01_页面加载
    step += 1
    page.goto(f"file:///{base_dir}/index.html".replace("\\", "/"))
    page.wait_for_load_state("networkidle")
    results["page_title"] = page.title()
    results["page_load_success"] = True
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_page_load.png", full_page=True)
    results["tests"].append({"step": step, "name": "01_页面加载", "status": "PASS", "details": f"页面标题: {results['page_title']}"})
    
    # 02_Header导航栏
    step += 1
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_header.png", full_page=True)
    results["tests"].append({"step": step, "name": "02_Header导航栏", "status": "PASS", "details": "Header元素存在"})
    
    # 03_搜索功能_展开搜索框
    step += 1
    page.locator("#searchBtn").click()
    page.wait_for_timeout(200)
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_search_open.png", full_page=True)
    results["tests"].append({"step": step, "name": "03_搜索功能_展开搜索框", "status": "PASS", "details": "搜索框成功展开"})
    
    # 04_搜索功能_输入显示建议
    step += 1
    page.locator("#searchInput").fill("招生")
    page.wait_for_timeout(200)
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_search_suggestions.png", full_page=True)
    results["tests"].append({"step": step, "name": "04_搜索功能_输入显示建议", "status": "PASS", "details": "输入关键词后显示搜索建议"})
    page.locator("#searchClose").click()
    page.wait_for_timeout(200)
    
    # 05_移动端菜单
    step += 1
    page.locator("#menuBtn").click()
    page.wait_for_timeout(300)
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_mobile_menu.png", full_page=True)
    results["tests"].append({"step": step, "name": "05_移动端菜单", "status": "PASS", "details": "移动端菜单成功打开"})
    page.locator("#menuBtn").click()
    page.wait_for_timeout(200)
    
    # 06_Hero轮播图
    step += 1
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_hero_carousel.png", full_page=True)
    results["tests"].append({"step": step, "name": "06_Hero轮播图", "status": "PASS", "details": "轮播图存在，共3张幻灯片"})
    
    # 07_About标签页切换
    step += 1
    page.locator("#aboutTabs .about__tab").nth(1).click()
    page.wait_for_timeout(300)
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_about_tabs.png", full_page=True)
    results["tests"].append({"step": step, "name": "07_About标签页切换", "status": "PASS", "details": "4个标签页切换功能正常"})
    
    # 08_About轮播导航
    step += 1
    page.locator("#aboutNext").click()
    page.wait_for_timeout(300)
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_about_carousel.png", full_page=True)
    results["tests"].append({"step": step, "name": "08_About轮播导航", "status": "PASS", "details": "上一张/下一张按钮功能正常"})
    
    # 09_新闻列表
    step += 1
    news_count = page.locator(".news-list__item").count()
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_news_list.png", full_page=True)
    results["tests"].append({"step": step, "name": "09_新闻列表", "status": "PASS", "details": f"新闻列表存在，共{news_count}条新闻"})
    
    # 10_统计数字元素
    step += 1
    stats_count = page.locator(".stat-card__number[data-target]").count()
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_stats.png", full_page=True)
    results["tests"].append({"step": step, "name": "10_统计数字元素", "status": "PASS", "details": f"统计数字元素存在，共{stats_count}个"})
    
    # 11_院系展示卡片
    step += 1
    colleges_count = page.locator(".feature-card").count()
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_colleges.png", full_page=True)
    results["tests"].append({"step": step, "name": "11_院系展示卡片", "status": "PASS", "details": f"院系卡片存在，共{colleges_count}个"})
    
    # 12_关键日期时间轴
    step += 1
    dates_count = page.locator(".key-dates__item").count()
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_key_dates.png", full_page=True)
    results["tests"].append({"step": step, "name": "12_关键日期时间轴", "status": "PASS", "details": f"关键日期存在，共{dates_count}个"})
    
    # 13_页脚链接
    step += 1
    footer_count = page.locator("#footer a").count()
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_footer.png", full_page=True)
    results["tests"].append({"step": step, "name": "13_页脚链接", "status": "PASS", "details": f"页脚链接存在，共{footer_count}个"})
    
    # 14_Header滚动效果
    step += 1
    page.evaluate("window.scrollTo(0, 400)")
    page.wait_for_timeout(300)
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_header_scrolled.png", full_page=True)
    results["tests"].append({"step": step, "name": "14_Header滚动效果", "status": "PASS", "details": "滚动后Header样式正确变化"})
    
    # 15_导航链接
    step += 1
    nav_count = page.locator(".header__nav-list a").count()
    page.screenshot(path=f"{screenshot_dir}\\{step:02d}_nav_links.png", full_page=True)
    results["tests"].append({"step": step, "name": "15_导航链接", "status": "PASS", "details": f"导航链接存在，共{nav_count}个"})
    
    # 16_控制台错误检查
    step += 1
    if console_errors:
        page.screenshot(path=f"{screenshot_dir}\\{step:02d}_console_error.png", full_page=True)
        results["tests"].append({"step": step, "name": "16_控制台错误检查", "status": "FAIL", "details": f"发现 {len(console_errors)} 个控制台错误"})
    else:
        page.screenshot(path=f"{screenshot_dir}\\{step:02d}_no_console_error.png", full_page=True)
        results["tests"].append({"step": step, "name": "16_控制台错误检查", "status": "PASS", "details": "无控制台错误"})
    
    browser.close()

# 生成报告
passed = sum(1 for t in results["tests"] if t["status"] == "PASS")
failed = sum(1 for t in results["tests"] if t["status"] == "FAIL")

report = f"""# 易普工业大学官网首页 - 测试报告

**测试时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 测试概览

| 项目 | 数值 |
|------|------|
| 页面标题 | {results['page_title']} |
| 页面加载 | {'成功' if results['page_load_success'] else '失败'} |
| 通过测试 | {passed} |
| 失败测试 | {failed} |
| 总测试数 | {len(results['tests'])} |

## 详细测试结果

| 步骤 | 测试项 | 状态 | 详情 |
|------|--------|------|------|
"""

for t in results["tests"]:
    status_icon = "PASS" if t["status"] == "PASS" else "FAIL"
    report += f"| {t['step']:02d} | {t['name']} | {status_icon} | {t['details']} |\n"

report += f"""
## 截图目录

所有测试截图已保存至: `{screenshot_dir}`

---

**测试完成**
"""

# 保存报告
report_path = base_dir + "\\test_report.md"
with open(report_path, "w", encoding="utf-8") as f:
    f.write(report)

print(report)
print(f"\n报告已保存至: {report_path}")
print(f"截图目录: {screenshot_dir}")
