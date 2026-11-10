"""E2E V1.2.1 without remote CDN: use Python qrcode to generate valid test matrices for each ECC.
The UI, export handlers, logo, margins, and PNG/SVG rendering use real browser code.
"""
from pathlib import Path
import json,re,base64
from PIL import Image,ImageDraw
import numpy as np
import cv2,qrcode
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
URL='https://example.com/tai-lieu.pdf'
matrices={}
for ec,cc in [('L',qrcode.constants.ERROR_CORRECT_L),('M',qrcode.constants.ERROR_CORRECT_M),('Q',qrcode.constants.ERROR_CORRECT_Q),('H',qrcode.constants.ERROR_CORRECT_H)]:
    q=qrcode.QRCode(error_correction=cc,border=0)
    q.add_data(URL)
    q.make(fit=True)
    matrices[ec]=q.get_matrix()

def decode(path):
    im=Image.open(path).convert('RGBA')
    bg=Image.new('RGBA',im.size,'white');bg.alpha_composite(im)
    data=np.array(bg.convert('RGB'))
    text,_,_=cv2.QRCodeDetector().detectAndDecode(cv2.cvtColor(data,cv2.COLOR_RGB2BGR))
    return text, im

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1400,'height':1100},accept_downloads=True)
    html=(ROOT/'index.html').read_text()
    css=(ROOT/'src/styles.css').read_text()
    html=html.replace('<link rel="stylesheet" href="./src/styles.css" />','<style>'+css+'</style>')
    html=html.replace('<script type="module" src="./src/app.js"></script>','')
    for f in (ROOT/'assets/icons').glob('*.png'):
        uri='data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
        html=html.replace('./assets/icons/'+f.name,uri)
    page.set_content(html,wait_until='domcontentloaded')
    page.evaluate('''matrixByECC => {
      window.qrcode = (_, ec) => {
        window._currentECC = ec;
        const matrix = matrixByECC[ec];
        return { addData(){},make(){},getModuleCount(){return matrix.length},isDark(r,c){return matrix[r][c]} };
      };
    }''',matrices)
    render_js=(ROOT/'src/qr-renderer.js').read_text().replace('export const','const').replace('export function','function')
    app_js=re.sub(r"import\s*\{.*?\}\s*from\s*'./qr-renderer.js';",'',(ROOT/'src/app.js').read_text(),flags=re.S)
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.add_script_tag(content=render_js+'\n'+app_js)
    page.wait_for_timeout(200)
    assert page.locator('#qr-margin').input_value()=='2'
    assert page.evaluate('Array.from(document.images).filter(i=>i.hasAttribute("src")).every(i=>i.complete&&i.naturalWidth>0)'), 'Broken image icon'
    for f in [ROOT/'assets/icons/url.png',ROOT/'assets/icons/customize.png']:
        im=Image.open(f).convert('RGBA')
        assert im.getpixel((0,0))[3]==0, f'icon background not transparent: {f}'
    page.locator('#url-input').fill(URL)
    page.wait_for_timeout(200)
    assert page.locator('#download-btn').is_enabled()
    def save_png(name):
        with page.expect_download() as dl: page.locator('#download-btn').click()
        target=ROOT/'tests'/name
        dl.value.save_as(target)
        got,im=decode(target)
        print(name,'QR decoded',got,'size',im.size,'ECC',page.evaluate('window._currentECC'))
        assert got==URL,(name,got)
        return im
    im=save_png('v121-compact.png')
    assert im.getpixel((0,0))[3]==0
    assert 'viewBox="0 0 ' in page.locator('#qr-preview svg').evaluate('(e)=>e.outerHTML')
    compact_box=page.locator('#qr-preview svg').get_attribute('viewBox')
    page.locator('#qr-margin').select_option('4')
    page.wait_for_timeout(200)
    standard_box=page.locator('#qr-preview svg').get_attribute('viewBox')
    assert int(standard_box.split()[-1])-int(compact_box.split()[-1])==4,(compact_box,standard_box)
    save_png('v121-standard.png')
    page.locator('#qr-margin').select_option('2')
    page.get_by_role('tab',name='Hình dạng').click()
    page.locator('#ecc-options button[data-value="L"]').click()
    page.wait_for_timeout(200)
    assert page.evaluate('window._currentECC')=='L'
    page.get_by_role('tab',name='Logo').click()
    f=ROOT/'tests'/'sample-logo-v121.png'
    logo=Image.new('RGBA',(128,128),(0,0,0,0));dr=ImageDraw.Draw(logo)
    dr.rounded_rectangle((26,26,102,102),radius=15,fill='#0066CC')
    dr.line((40,84,65,43,88,84),fill='white',width=7)
    logo.save(f)
    page.locator('#logo-input').set_input_files(str(f))
    page.wait_for_timeout(250)
    assert page.evaluate('window._currentECC')=='M', 'Must auto-upgrade L to M when uploading logo'
    page.get_by_role('tab',name='Hình dạng').click()
    assert page.locator('#ecc-options button[data-value="L"]').is_disabled()
    for level in ['M','Q','H']:
        page.locator(f'#ecc-options button[data-value="{level}"]').click()
        page.wait_for_timeout(230)
        assert page.evaluate('window._currentECC')==level
        max_size={'M':15,'Q':18,'H':22}[level]
        assert int(page.locator('#logo-size').get_attribute('max'))==max_size
        save_png(f'v121-logo-{level}.png')
    page.locator('#ecc-options button[data-value="M"]').click()
    page.wait_for_timeout(180)
    page.get_by_role('tab',name='Logo').click()
    page.locator('#logo-border-options button[data-value="thin"]').click()
    page.wait_for_timeout(180)
    save_png('v121-logo-M-gap.png')
    # SVG export preserves margin and file size and embeds PNG logo
    page.locator('input[name="format"][value="svg"]').check()
    with page.expect_download() as dl:page.locator('#download-btn').click()
    fsvg=ROOT/'tests'/'v121-output.svg';dl.value.save_as(fsvg)
    svg=fsvg.read_text()
    assert 'data:image/png;base64' in svg
    assert f'viewBox="0 0 {len(matrices["M"])+4} {len(matrices["M"])+4}"' in svg
    assert not errors,errors
    print('V1.2.1 browser tests PASS')
    browser.close()
