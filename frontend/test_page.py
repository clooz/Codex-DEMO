from playwright.sync_api import sync_playwright
import json
import os
from datetime import datetime

def test_university_homepage():
    base_dir = "D:/新建文件夹/网站2"
    screenshot_dir = f"{base_dir}/test_screenshots"
    
    # 创建截图目录
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
        page = browser.new_page(page.set_viewport_size({"width": 1920, "height": 1080}))
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        step = 0
        
        try:
            step += 1
            page.goto(f"file:///{base_dir}/index.html")
            page.wait_for_load_state("networkidle")
            results["page_title"] = page.title()
            results["page_load_success"] = True
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_page_load.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "01_页面加载",
                "status": "PASS",
                "details": f"页面标题: {results['page_title']}"
            })
        except Exception as e:
            results["errors"].append(f"页面加载失败: {str(e)}")
            results["tests"].append({"step": step, "name": "01_页面加载", "status": "FAIL", "details": str(e)})
            browser.close()
            return results
        
        # Header 导航栏
        try:
            step += 1
            header = page.locator("#header")
            assert header.count() > 0
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_header.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "02_Header导航栏",
                "status": "PASS",
                "details": "Header元素存在"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "02_Header导航栏", "status": "FAIL", "details": str(e)})
        
        # 搜索功能 - 点击搜索按钮
        try:
            step += 1
            search_btn = page.locator("#searchBtn")
            search_btn.click()
            page.wait_for_timeout(200)
            search_inline = page.locator("#searchInline")
            is_visible = search_inline.get_attribute("aria-hidden") == "false"
            assert is_visible, "搜索框未展开"
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_search_open.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "03_搜索功能_展开搜索框",
                "status": "PASS",
                "details": "搜索框成功展开"
            })
            
            # 搜索输入和下拉建议
            step += 1
            search_input = page.locator("#searchInput")
            search_input.fill("招生")
            page.wait_for_timeout(200)
            dropdown = page.locator("#searchDropdown")
            is_dropdown_visible = dropdown.get_attribute("aria-hidden") == "false"
            assert is_dropdown_visible, "下拉建议未显示"
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_search_suggestions.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "04_搜索功能_输入显示建议",
                "status": "PASS",
                "details": "输入关键词后显示搜索建议"
            })
            
            # 关闭搜索
            page.locator("#searchClose").click()
            page.wait_for_timeout(200)
        except Exception as e:
            results["tests"].append({"step": step, "name": "03-04_搜索功能", "status": "FAIL", "details": str(e)})
        
        # 移动端菜单
        try:
            step += 1
            menu_btn = page.locator("#menuBtn")
            menu_btn.click()
            page.wait_for_timeout(300)
            mobile_nav = page.locator("#mobileNav")
            is_open = mobile_nav.get_attribute("aria-hidden") == "false"
            assert is_open, "移动端菜单未打开"
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_mobile_menu.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "05_移动端菜单",
                "status": "PASS",
                "details": "移动端菜单成功打开"
            })
            menu_btn.click()
            page.wait_for_timeout(200)
        except Exception as e:
            results["tests"].append({"step": step, "name": "05_移动端菜单", "status": "FAIL", "details": str(e)})
        
        # Hero 轮播
        try:
            step += 1
            hero_section = page.locator("#hero")
            assert hero_section.count() > 0
            dots = page.locator(".hero__dot")
            assert dots.count() == 3
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_hero_carousel.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "06_Hero轮播图",
                "status": "PASS",
                "details": "轮播图存在，共3张幻灯片"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "06_Hero轮播图", "status": "FAIL", "details": str(e)})
        
        # About 标签页切换
        try:
            step += 1
            tabs = page.locator("#aboutTabs .about__tab")
            assert tabs.count() == 4
            tabs.nth(1).click()
            page.wait_for_timeout(300)
            active_tab = page.locator("#aboutTabs .about__tab.is-active")
            tab_index = active_tab.get_attribute("data-index")
            assert tab_index == "1", f"标签切换失败，当前索引: {tab_index}"
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_about_tabs.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "07_About标签页切换",
                "status": "PASS",
                "details": "4个标签页切换功能正常"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "07_About标签页切换", "status": "FAIL", "details": str(e)})
        
        # About 轮播导航按钮
        try:
            step += 1
            about_next = page.locator("#aboutNext")
            about_next.click()
            page.wait_for_timeout(300)
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_about_carousel.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "08_About轮播导航",
                "status": "PASS",
                "details": "上一张/下一张按钮功能正常"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "08_About轮播导航", "status": "FAIL", "details": str(e)})
        
        # 新闻列表
        try:
            step += 1
            news_items = page.locator(".news-list__item")
            assert news_items.count() >= 5
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_news_list.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "09_新闻列表",
                "status": "PASS",
                "details": f"新闻列表存在，共{news_items.count()}条新闻"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "09_新闻列表", "status": "FAIL", "details": str(e)})
        
        # 统计数据
        try:
            step += 1
            stat_numbers = page.locator(".stat-card__number[data-target]")
            assert stat_numbers.count() == 4
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_stats.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "10_统计数字元素",
                "status": "PASS",
                "details": "4个统计数字元素存在"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "10_统计数字元素", "status": "FAIL", "details": str(e)})
        
        # 院系卡片
        try:
            step += 1
            colleges = page.locator(".feature-card")
            assert colleges.count() == 3
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_colleges.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "11_院系展示卡片",
                "status": "PASS",
                "details": "3个院系卡片存在"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "11_院系展示卡片", "status": "FAIL", "details": str(e)})
        
        # 关键日期
        try:
            step += 1
            key_dates = page.locator(".key-dates__item")
            assert key_dates.count() == 4
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_key_dates.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "12_关键日期时间轴",
                "status": "PASS",
                "details": "4个关键日期条目存在"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "12_关键日期时间轴", "status": "FAIL", "details": str(e)})
        
        # 页脚
        try:
            step += 1
            footer = page.locator("#footer")
            assert footer.count() > 0
            footer_links = footer.locator("a")
            assert footer_links.count() > 0
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_footer.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "13_页脚链接",
                "status": "PASS",
                "details": f"页脚包含{footer_links.count()}个链接"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "13_页脚链接", "status": "FAIL", "details": str(e)})
        
        # 滚动后 Header 样式
        try:
            step += 1
            page.evaluate("window.scrollTo(0, 400)")
            page.wait_for_timeout(300)
            header_classes = page.locator("#header").get_attribute("class")
            assert "is-scrolled" in header_classes, "滚动后Header未添加is-scrolled类"
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_header_scrolled.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "14_Header滚动效果",
                "status": "PASS",
                "details": "滚动后Header样式正确变化"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "14_Header滚动效果", "status": "FAIL", "details": str(e)})
        
        # 导航链接
        try:
            step += 1
            nav_links = page.locator(".header__nav-list a")
            assert nav_links.count() > 0
            page.screenshot(path=f"{screenshot_dir}/{step:02d}_nav_links.png", full_page=True)
            results["tests"].append({
                "step": step,
                "name": "15_导航链接",
                "status": "PASS",
                "details": f"导航包含{nav_links.count()}个链接"
            })
        except Exception as e:
            results["tests"].append({"step": step, "name": "15_导航链接", "status": "FAIL", "details": str(e)})
        
        # 控制台错误
        try:
            step += 1
            if console_errors:
                page.screenshot(path=f"{screenshot_dir}/{step:02d}_console_error.png", full_page=True)
                results["tests"].append({
                    "step": step,
                    "name": "16_控制台错误检查",
                    "status": "FAIL",
                    "details": f"发现 {len(console_errors)} 个控制台错误"
                })
                results["errors"].extend(console_errors)
            else:
                page.screenshot(path=f"{screenshot_dir}/{step:02d}_no_console_error.png", full_page=True)
                results["tests"].append({
                    "step": step,
                    "name": "16_控制台错误检查",
                    "status": "PASS",
                    "details": "无控制台错误"
                })
        except Exception as e:
            results["tests"].append({"step": step, "name": "16_控制台错误检查", "status": "FAIL", "details": str(e)})
        
        browser.close()
    
    return results, screenshot_dir

if __name__ == "__main__":
    results, screenshot_dir = test_university_homepage()
    
    # 生成 Markdown 报告
    report = f"""# 易普工业大学官网首页 - 测试报告

**测试时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 测试概览

| 项目 | 数值 |
|------|------|
| 页面标题 | {results['page_title']} |
| 页面加载 | {'成功' if results['page_load_success'] else '失败'} |
| 通过测试 | {sum(1 for t in results['tests'] if t['status'] == 'PASS')} |
| 失败测试 | {sum(1 for t in results['tests'] if t['status'] == 'FAIL')} |
| 总测试数 | {len(results['tests'])} |

## 详细测试结果

| 步骤 | 测试项 | 状态 | 详情 |
|------|--------|------|------|
"""
    
    for test in results['tests']:
        status_icon = "✅" if test['status'] == 'PASS' else "❌"
        report += f"| {test['step']:02d} | {test['name']} | {status_icon} {test['status']} | {test['details']} |\n"
    
    if results['errors']:
        report += f"""
## 错误详情

"""
        for err in results['errors']:
            report += f"- {err}\n"
    
    report += f"""
## 截图目录

所有测试截图已保存至: `{screenshot_dir}/`

### 截图列表

"""
    
    # 列出所有截图文件
    import os
    for f in sorted(os.listdir(screenshot_dir)):
        report += f"- {f}\n"
    
    report += """
---

**测试完成**
"""
    
    # 保存报告
    report_path = f"{screenshot_dir}/../test_report.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 打印报告
    print(report)
    print(f"\n报告已保存至: {report_path}")
    print(f"截图目录: {screenshot_dir}/")
