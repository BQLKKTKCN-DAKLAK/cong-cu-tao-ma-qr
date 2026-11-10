"""Kiểm thử trình duyệt khi có Python playwright, OpenCV và Chromium cục bộ.
Mô phỏng thư viện QR bằng ma trận thật tạo từ Python qrcode để kiểm tra UI, SVG, PNG.
Không dùng test này để xác nhận CDN hoạt động ngoài Internet.
"""
from pathlib import Path
import sys, os, json, tempfile, subprocess, time, socket, base64
import qrcode, cv2, numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
URL='https://example.com/tai-lieu.pdf'
q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,border=0)
q.add_data(URL);q.make(fit=True)
matrix=q.get_matrix()
assert len(matrix)>=21
server=None
try:
 time.sleep(.5)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1320,'height':1000},device_scale_factor=1,accept_downloads=True)
  page.add_init_script('window.qrcode=()=>{const matrix=' + json.dumps(matrix) + ';return {addData(){},make(){},getModuleCount(){return matrix.length},isDark(r,c){return matrix[r][c]}}}')
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  import re
  html=(ROOT/'index.html').read_text()
  css=(ROOT/'src/styles.css').read_text()
  html=html.replace('<link rel="stylesheet" href="./src/styles.css" />', '<style>'+css+'</style>')
  update_css=(ROOT/'src/updates-v1.1.css').read_text()
  html=html.replace('<link rel="stylesheet" href="./src/updates-v1.1.css" />','<style>'+update_css+'</style>')
  html=html.replace('<script type="module" src="./src/app.js"></script>','')
  # set_content không có base URL; nhúng PNG vào tài liệu thử để ảnh hiện đúng.
  for icon_name in ['url','customize','shape','color','logo']:
   icon_bytes=(ROOT/'assets/icons'/f'{icon_name}.png').read_bytes()
   uri='data:image/png;base64,'+base64.b64encode(icon_bytes).decode()
   html=html.replace(f'./assets/icons/{icon_name}.png',uri)
  page.set_content(html,wait_until='domcontentloaded')
  page.evaluate('matrix => {window.qrcode=()=>({addData(){},make(){},getModuleCount(){return matrix.length},isDark(r,c){return matrix[r][c]}})}',matrix)
  renderer=(ROOT/'src/qr-renderer.js').read_text().replace('export const','const').replace('export function','function')
  app=(ROOT/'src/app.js').read_text()
  app=re.sub(r"import\s*\{.*?\}\s*from\s*'./qr-renderer.js';",'',app,flags=re.S)
  page.add_script_tag(content=renderer+'\n'+app)
  page.wait_for_timeout(800)
  assert page.locator('.section-icon').count()==2
  assert page.evaluate('Array.from(document.querySelectorAll("img.section-icon,img.tab-icon")).every(i=>i.complete && i.naturalWidth>0)')
  assert page.locator('#download-btn').is_disabled()
  assert page.locator('#panel-logo').is_hidden()
  page.locator('#url-input').fill(URL)
  page.locator('#download-btn').wait_for(state='visible')
  page.wait_for_timeout(300)
  assert page.locator('#download-btn').is_enabled(),page.locator('#status').inner_text()
  assert page.locator('#qr-preview svg').count()==1
  with page.expect_download() as dl:page.locator('#download-btn').click()
  dest=ROOT/'tests'/'smoke-output.png';dl.value.save_as(dest)
  rgba=Image.open(dest).convert('RGBA')
  assert rgba.getpixel((0,0))[3]==0, 'QR mặc định phải có nền trong suốt'
  white=Image.new('RGBA',rgba.size,'white');white.alpha_composite(rgba)
  img=cv2.cvtColor(np.array(white.convert('RGB')),cv2.COLOR_RGB2BGR)
  data,points,_=cv2.QRCodeDetector().detectAndDecode(img)
  print('Default PNG decoded:', data)
  assert data==URL
  page.get_by_role('tab',name='Logo').click()
  assert page.locator('#panel-logo').is_visible()
  assert page.locator('#panel-shape').is_hidden()
  png=ROOT/'tests'/'sample-logo.png'
  im=Image.new('RGBA',(200,200),'white');d=ImageDraw.Draw(im)
  d.polygon([(100,15),(180,140),(20,140)],fill=(2,103,207,255));d.rectangle((42,147,158,168),fill=(255,152,0,255))
  im.save(png)
  page.locator('#logo-input').set_input_files(str(png))
  page.wait_for_timeout(500)
  assert not page.locator('#logo-file').is_hidden()
  assert page.locator('#qr-preview svg image').count()==1
  page.screenshot(path=str(ROOT/'docs'/'giao-dien-logo-thuc-te.png'),full_page=True)
  with page.expect_download() as dl:page.locator('#download-btn').click()
  dest_logo=ROOT/'tests'/'smoke-logo.png';dl.value.save_as(dest_logo)
  rgba=Image.open(dest_logo).convert('RGBA')
  white=Image.new('RGBA',rgba.size,'white');white.alpha_composite(rgba)
  img=cv2.cvtColor(np.array(white.convert('RGB')),cv2.COLOR_RGB2BGR)
  data,points,_=cv2.QRCodeDetector().detectAndDecode(img)
  print('With logo PNG decoded:', data)
  assert data==URL
  # Kiểm tra cả 3 mức vùng bảo vệ logo: kết quả phải khác biệt và QR còn quét được.
  gap_counts=[]
  for gap in ['none','thin','medium']:
   page.locator(f'#logo-border-options button[data-value="{gap}"]').click()
   page.wait_for_timeout(250)
   count=page.locator('#qr-preview svg > g > ellipse, #qr-preview svg > g > rect, #qr-preview svg > g > path').count()
   gap_counts.append(count)
   with page.expect_download() as dl:page.locator('#download-btn').click()
   dest_gap=ROOT/'tests'/f'smoke-gap-{gap}.png';dl.value.save_as(dest_gap)
   rgba=Image.open(dest_gap).convert('RGBA')
   white=Image.new('RGBA',rgba.size,'white');white.alpha_composite(rgba)
   rgb=cv2.cvtColor(np.array(white.convert('RGB')),cv2.COLOR_RGB2BGR)
   got,_,_=cv2.QRCodeDetector().detectAndDecode(rgb)
   print('Logo gap:',gap,'visible modules:',count,'decoded:',got)
   assert got==URL,f'QR không quét được ở mức viền {gap}'
  assert gap_counts[0]>gap_counts[1]>gap_counts[2],gap_counts
  page.locator('#export-format').select_option('svg')
  with page.expect_download() as dl:page.locator('#download-btn').click()
  dest_svg=ROOT/'tests'/'smoke-logo.svg';dl.value.save_as(dest_svg)
  assert 'data:image/png;base64' in dest_svg.read_text()
  page.get_by_role('tab',name='Màu sắc').click()
  assert page.locator('#panel-color').is_visible()
  assert page.locator('#panel-logo').is_hidden()
  page.screenshot(path=str(ROOT/'docs'/'giao-dien-mau-sac-thuc-te.png'),full_page=True)
  page.get_by_role('tab',name='Hình dạng').click()
  assert page.locator('#panel-shape').is_visible()
  page.screenshot(path=str(ROOT/'docs'/'giao-dien-hinh-dang-thuc-te.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path=str(ROOT/'docs'/'giao-dien-dien-thoai-thuc-te.png'),full_page=True)
  sizes=page.evaluate('({scroll:document.documentElement.scrollWidth,view:innerWidth})')
  print('Mobile viewport:',sizes)
  assert sizes['scroll']<=sizes['view']+1
  print('Browser errors:',errors)
  assert not errors
  browser.close()
finally:
 if server: server.terminate();server.wait(timeout=3)
