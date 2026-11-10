"""Smoke-test hai theme V1.3.0 trên Chromium; QR matrix từ qrcode tạo riêng để không phụ thuộc CDN.
Chạy: python tests/browser_theme.py
"""
from pathlib import Path
import re,base64,hashlib
import qrcode
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DOCS=ROOT/'docs';DOCS.mkdir(exist_ok=True)
URL='https://example.com/tai-lieu.pdf'
Q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,border=0);Q.add_data(URL);Q.make(fit=True)
M=Q.get_matrix()
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1536,'height':1080},accept_downloads=True)
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    html=(ROOT/'index.html').read_text();css=(ROOT/'src/styles.css').read_text()
    html=html.replace('<link rel="stylesheet" href="./src/styles.css" />','<style>'+css+'</style>')
    html=html.replace('<script type="module" src="./src/app.js"></script>','')
    for icon in (ROOT/'assets/icons').glob('*.png'):
        html=html.replace('./assets/icons/'+icon.name,'data:image/png;base64,'+base64.b64encode(icon.read_bytes()).decode('ascii'))
    page.set_content(html,wait_until='domcontentloaded')
    renderer=(ROOT/'src/qr-renderer.js').read_text().replace('export const','const').replace('export function','function')
    app=(ROOT/'src/app.js').read_text()
    app=re.sub(r"import\s*\{.*?\}\s*from\s*'./qr-renderer.js';",'',app,flags=re.S)
    page.evaluate('matrix => window.qrcode = () => ({addData(){},make(){},getModuleCount(){return matrix.length},isDark(r,c){return matrix[r][c]}})', M)
    page.add_script_tag(content=renderer+'\n'+app)
    page.wait_for_timeout(500)
    page.locator('#url-input').fill(URL);page.wait_for_timeout(350)
    assert page.locator('#download-btn').is_enabled()
    assert page.locator('html').get_attribute('data-theme')=='light'
    assert page.evaluate('getComputedStyle(document.body).backgroundColor')=='rgb(255, 255, 255)'
    assert page.locator('[data-theme-choice="light"]').get_attribute('aria-pressed')=='true'
    assert page.locator('[data-theme-choice="dark"]').get_attribute('aria-pressed')=='false'
    page.screenshot(path=str(DOCS/'giao-dien-sang-v1.3.png'),full_page=True)
    with page.expect_download() as dl:page.locator('#download-btn').click()
    a=ROOT/'tests'/'v13-light.png';dl.value.save_as(a)
    assert Image.open(a).getpixel((0,0))[3]==0
    svgLight=page.locator('#qr-preview').inner_html()
    page.locator('[data-theme-choice="dark"]').click()
    page.wait_for_timeout(300)
    assert page.locator('html').get_attribute('data-theme')=='dark'
    assert page.locator('[data-theme-choice="dark"]').get_attribute('aria-pressed')=='true'
    assert page.locator('[data-theme-choice="light"]').get_attribute('aria-pressed')=='false'
    assert page.evaluate('getComputedStyle(document.querySelector(".agency-name")).color')=='rgb(255, 255, 255)'
    assert page.evaluate('getComputedStyle(document.querySelector(".tool-brand h1")).webkitTextFillColor')=='rgba(0, 0, 0, 0)'
    assert page.locator('#qr-preview').inner_html()==svgLight, 'Switching theme changed the QR SVG'
    page.screenshot(path=str(DOCS/'giao-dien-toi-v1.3.png'),full_page=True)
    with page.expect_download() as dl:page.locator('#download-btn').click()
    b=ROOT/'tests'/'v13-dark.png';dl.value.save_as(b)
    assert hashlib.sha256(a.read_bytes()).digest()==hashlib.sha256(b.read_bytes()).digest(), 'QR export should be identical in both themes'
    page.get_by_role('tab',name='Logo').click()
    assert page.locator('#panel-logo').is_visible() and page.locator('#panel-shape').is_hidden()
    page.screenshot(path=str(DOCS/'giao-dien-toi-logo-v1.3.png'),full_page=True)
    page.locator('[data-theme-choice="light"]').click()
    page.get_by_role('tab',name='Hình dạng').click()
    assert page.locator('#qr-preview').inner_html()==svgLight
    for width in [320,390,590,800,1024,1536]:
      page.set_viewport_size({'width':width,'height':920});page.wait_for_timeout(70)
      for theme in ['light','dark']:
        page.locator('[data-theme-choice="'+theme+'"]').click()
        result=page.evaluate('({scroll:document.documentElement.scrollWidth,view:innerWidth})')
        print('viewport',width,theme,result)
        assert result['scroll']<=result['view']+1,f'Overflow at {width} {theme}: {result}'
    page.set_viewport_size({'width':390,'height':844})
    page.locator('[data-theme-choice="dark"]').click()
    page.screenshot(path=str(DOCS/'giao-dien-toi-dien-thoai-v1.3.png'),full_page=True)
    assert not errors,errors
    browser.close()
print('THEME BROWSER TEST PASSED — light/dark, QR unchanged, PNG identical, mobile no overflow')
