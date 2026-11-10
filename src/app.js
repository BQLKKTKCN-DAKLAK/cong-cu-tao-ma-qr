import {
  DOT_TYPES, EYE_OUTER_TYPES, EYE_INNER_TYPES, DENSITIES,
  normalizeHex, normalizeUrl, buildQrSvg, qrMatrixFromFactory,
} from './qr-renderer.js';

const $=id=>document.getElementById(id);
const state={
  url:'',dotType:'square',eyeOuter:'square',eyeInner:'square',roundness:0,ecc:'H',density:'high',
  fg:'#000000',bg:'#FFFFFF',transparent:true,logoData:'',logoSize:15,
  logoBackground:'transparent',logoRadius:8,logoBorder:'none',outputSize:1024,qrMargin:2,
};
let libraryReady=false,svgMarkup='',timer=null,renderSerial=0;
const svgPlaceholder=$('qr-placeholder');
const preview=$('qr-preview');
const status=$('status');

function setStatus(message,kind=''){
  status.textContent=message;
  status.className=`status ${kind ? `is-${kind}` : ''}`;
}
function setReady(ready){
  $('download-btn').disabled=!ready;
  $('copy-btn').disabled=!ready;
  svgPlaceholder.hidden=ready;
  preview.hidden=!ready;
}
function selectTab(name,focus=false){
  for(const btn of document.querySelectorAll('[role="tab"]')){
    const active=btn.dataset.tab===name;
    btn.setAttribute('aria-selected',String(active));
    btn.tabIndex=active?0:-1;
    btn.classList.toggle('is-active',active);
    if(focus&&active)btn.focus();
  }
  for(const name2 of ['shape','color','logo'])$(`panel-${name2}`).hidden=name2!==name;
}
function makeChoice(containerId,entries,key,mini=false){
  const box=$(containerId);
  box.innerHTML='';
  entries.forEach(({value,label})=>{
    const b=document.createElement('button');
    b.type='button';b.dataset.value=value;b.title=label;b.setAttribute('aria-label',label);
    b.setAttribute('aria-pressed',String(state[key]===value));
    b.className=mini?'visual-choice':'segment-button';
    b.classList.toggle('is-selected',state[key]===value);
    if(mini)b.innerHTML=containerId.startsWith('eye-') ? miniEyeIcon(value,containerId.includes('inner')) : miniIcon(value);
    else b.textContent=label;
    b.addEventListener('click',()=>{
      state[key]=value;
      if(key==='ecc') updateLogoSizeLimit();
      for(const child of box.querySelectorAll('button')){
        const yes=child.dataset.value===value;
        child.classList.toggle('is-selected',yes);
        child.setAttribute('aria-pressed',String(yes));
      }
      if(key==='ecc') syncEccUi();
      scheduleRender();
    });
    box.appendChild(b);
  });
}
function miniIcon(type){
  const pos=[[8,8],[24,8],[8,24],[24,24]];
  let shapes='';
  for(const [x,y] of pos){
    if(type==='dots'||type==='round') shapes+=`<circle cx="${x+4}" cy="${y+4}" r="4.4"/>`;
    else if(type==='diamond')shapes+=`<path d="M${x+4} ${y-1}l5 5-5 5-5-5z"/>`;
    else if(type==='pill')shapes+=`<rect x="${x+1}" y="${y-1}" width="6" height="11" rx="3"/>`;
    else if(type==='leaf'||type==='classy')shapes+=`<rect x="${x}" y="${y}" width="9" height="9" rx="3"/>`;
    else if(type==='rounded'||type==='extra')shapes+=`<rect x="${x}" y="${y}" width="9" height="9" rx="2.5"/>`;
    else shapes+=`<rect x="${x}" y="${y}" width="9" height="9"/>`;
  }
  return `<svg viewBox="0 0 45 45" fill="currentColor" aria-hidden="true">${shapes}</svg>`;
}
function miniEyeIcon(type,inside){
  const radius=type==='round'?9:type==='rounded'?4:type==='extra'?7:type==='leaf'?5:0;
  if(inside){
    if(type==='diamond')return '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 5L27 16 16 27 5 16Z"/></svg>';
    if(type==='round')return '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><circle cx="16" cy="16" r="10"/></svg>';
    return `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="20" height="20" rx="${radius}"/></svg>`;
  }
  if(type==='round')return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><circle cx="16" cy="16" r="11"/></svg>';
  return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="${radius}"/></svg>`;
}
function makePalette(id,key,colors,withTransparent=false){
  const root=$(id);root.innerHTML='';
  const items=withTransparent?[{value:'transparent',label:'Trong suốt'},...colors.map(c=>({value:c,label:c}))]:colors.map(c=>({value:c,label:c}));
  for(const item of items){
    const b=document.createElement('button');b.type='button';b.className='swatch';
    b.title=item.label;b.setAttribute('aria-label',item.label);
    if(item.value==='transparent')b.classList.add('transparent');
    else b.style.setProperty('--swatch',item.value);
    b.dataset.color=item.value;
    b.addEventListener('click',()=>{
      if(item.value==='transparent'){
        state.transparent=true;$('background-transparent').checked=true;
      }else{
        state[key]=item.value;
        if(key==='bg'){state.transparent=false;$('background-transparent').checked=false;}
      }
      syncColors();scheduleRender();
    });
    root.appendChild(b);
  }
  syncPalette();
}
function syncPalette(){
  for(const [id,key] of [['foreground-palette','fg'],['background-palette','bg']]){
    for(const b of $(id).querySelectorAll('.swatch')){
      const value=key==='bg' && state.transparent?'transparent':state[key];
      b.classList.toggle('is-selected',b.dataset.color?.toUpperCase()===value.toUpperCase());
    }
  }
}
function syncColors(){
  $('foreground-picker').value=state.fg;$('foreground-hex').value=state.fg;
  $('background-picker').value=state.bg;$('background-hex').value=state.bg;
  $('background-transparent').checked=state.transparent;
  syncPalette();
}
function bindColor(key){
  const id=key==='fg'?'foreground':'background';
  $(`${id}-picker`).addEventListener('input',e=>{
    state[key]=e.target.value.toUpperCase();
    if(key==='bg'){state.transparent=false;$('background-transparent').checked=false;}
    syncColors();scheduleRender();
  });
  $(`${id}-hex`).addEventListener('change',e=>{
    const color=normalizeHex(e.target.value);
    if(!color){e.target.value=state[key];setStatus('Màu HEX phải có dạng #RRGGBB.','error');return;}
    state[key]=color;
    if(key==='bg')state.transparent=false;
    syncColors();scheduleRender();
  });
}
function bindSlider(id,key,suffix=''){
  const el=$(id),out=$(`${id}-value`);
  el.addEventListener('input',()=>{
    state[key]=Number(el.value);out.textContent=`${el.value}${suffix}`;
    scheduleRender();
  });
}
function scheduleRender(){
  clearTimeout(timer);
  timer=setTimeout(()=>render(),120);
}
function makeOptions(){
  makeChoice('dot-style-options',DOT_TYPES,'dotType',true);
  makeChoice('eye-outer-options',EYE_OUTER_TYPES,'eyeOuter',true);
  makeChoice('eye-inner-options',EYE_INNER_TYPES,'eyeInner',true);
  makeChoice('ecc-options',[{value:'L',label:'Thấp (L)'},{value:'M',label:'Trung bình (M)'},{value:'Q',label:'Cao (Q)'},{value:'H',label:'Rất cao (H)'}],'ecc');
  makeChoice('density-options',DENSITIES,'density');
  makeChoice('logo-background-options',[{value:'transparent',label:'Trong suốt'},{value:'white',label:'Nền trắng'},{value:'rounded-white',label:'Bo góc nền'}],'logoBackground');
  makeChoice('logo-border-options',[{value:'none',label:'Không viền'},{value:'thin',label:'Vừa'},{value:'medium',label:'Rộng'}],'logoBorder');
  makePalette('foreground-palette','fg',['#000000','#0B3D7E','#F4511E','#008FA6','#35A553','#8158BD','#EC5555','#FFB200','#079D9F']);
  makePalette('background-palette','bg',['#FFFFFF','#F0F0F0','#FFF3D5','#DCEBFF','#DCE2FF','#FCE1E6','#D6FBE1','#E7F4E9'],true);
}
function bindTabs(){
  const buttons=[...document.querySelectorAll('[role="tab"]')];
  buttons.forEach((b,i)=>{
    b.addEventListener('click',()=>selectTab(b.dataset.tab));
    b.addEventListener('keydown',e=>{
      const dir=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(!dir && e.key!=='Home' && e.key!=='End')return;
      e.preventDefault();
      const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+dir+buttons.length)%buttons.length;
      selectTab(buttons[index].dataset.tab,true);
    });
  });
}
async function parsePng(file){
  if(!file)return;
  if(file.size>2*1024*1024)throw new Error('Logo vượt 2 MB. Vui lòng chọn ảnh PNG nhỏ hơn.');
  if(!/\.png$/i.test(file.name) && file.type!=='image/png')throw new Error('Chỉ hỗ trợ tệp PNG.');
  const buffer=await file.arrayBuffer();
  const bytes=new Uint8Array(buffer);
  const signature=[137,80,78,71,13,10,26,10];
  if(bytes.length<24||signature.some((v,i)=>bytes[i]!==v))throw new Error('Tệp không phải hình ảnh PNG hợp lệ.');
  const dataUrl=await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Không đọc được tệp PNG.'));
    reader.readAsDataURL(file);
  });
  await new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=> img.naturalWidth<=4096&&img.naturalHeight<=4096?resolve():reject(new Error('Kích thước ảnh quá lớn (tối đa 4096 × 4096 px).'));
    img.onerror=()=>reject(new Error('Không thể mở hình ảnh PNG.'));
    img.src=dataUrl;
  });
  return dataUrl;
}
function resetLogo(){
  state.logoData='';$('logo-input').value='';$('logo-file').hidden=true;
  $('logo-thumb').removeAttribute('src');
  updateLogoSizeLimit();
  syncEccUi();
  scheduleRender();
}
// Giữ linh hoạt M / Q / H khi chèn logo. Mức L bị khóa để giảm rủi ro quét lỗi.
// Giới hạn tỷ lệ logo nhỏ hơn tại mức M và Q để giảm diện tích dữ liệu bị che.
const LOGO_LIMITS={M:15,Q:18,H:22};
function updateLogoSizeLimit(){
  const slider=$('logo-size');
  const cap=state.logoData?(LOGO_LIMITS[state.ecc] || 15):22;
  slider.max=String(cap);
  if(state.logoSize>cap){
    state.logoSize=cap;
    slider.value=String(cap);
  }
  $('logo-size-value').textContent=`${state.logoSize}%`;
}
function syncEccUi(){
  for(const button of $('ecc-options').querySelectorAll('button')){
    const yes=button.dataset.value===state.ecc;
    button.disabled=Boolean(state.logoData)&&button.dataset.value==='L';
    button.classList.toggle('is-selected',yes);
    button.setAttribute('aria-pressed',String(yes));
  }
  $('ecc-notice').hidden=!state.logoData;
  if(state.logoData) $('ecc-notice').textContent=`Logo đang dùng mức ${state.ecc}. Mức M yêu cầu logo nhỏ; Q hoặc H giúp quét ổn định hơn.`;
}
function bindLogo(){
  $('choose-logo').addEventListener('click',()=>$('logo-input').click());
  $('logo-input').addEventListener('change',e=>{if(e.target.files?.[0])useLogo(e.target.files[0]);});
  const zone=$('logo-dropzone');
  for(const ev of ['dragenter','dragover'])zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add('is-dragover');});
  for(const ev of ['dragleave','drop'])zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove('is-dragover');});
  zone.addEventListener('drop',e=>{const f=e.dataTransfer?.files?.[0];if(f)useLogo(f);});
  $('remove-logo').addEventListener('click',resetLogo);
}
async function useLogo(file){
  try{
    const data=await parsePng(file);
    state.logoData=data;
    $('logo-thumb').src=data;
    $('logo-filename').textContent=file.name;
    $('logo-filesize').textContent=`PNG • ${(file.size/1024).toFixed(0)} KB`;
    $('logo-file').hidden=false;
    if(state.ecc==='L')state.ecc='M';
    updateLogoSizeLimit();
    syncEccUi();
    setStatus(`Đã nhận logo PNG • sửa lỗi ${state.ecc}. Có thể chọn M, Q hoặc H trong tab Hình dạng.`,'success');
    scheduleRender();
  }catch(err){
    $('logo-input').value='';setStatus(err.message,'error');
  }
}
function render(){
  const serial=++renderSerial;
  $('url-error').hidden=true;
  const normalized=normalizeUrl($('url-input').value);
  if(!normalized.value){
    svgMarkup='';preview.replaceChildren();setReady(false);
    if(normalized.error){$('url-error').textContent=normalized.error;$('url-error').hidden=false;setStatus(normalized.error,'error');}
    else setStatus(libraryReady?'Nhập URL để bắt đầu.':'Đang tải thư viện tạo QR...');
    return;
  }
  if(!libraryReady){svgMarkup='';setReady(false);setStatus('Đang tải thư viện tạo QR...');return;}
  try{
    const level=state.ecc;
    const matrix=qrMatrixFromFactory(window.qrcode,normalized.value,level);
    const newSvg=buildQrSvg(matrix,state);
    if(serial!==renderSerial)return;
    // Chỉ phần SVG do chính ứng dụng tạo ra được đưa vào vùng xem trước.
    svgMarkup=newSvg;
    preview.innerHTML=newSvg;
    setReady(true);
    setStatus(state.logoData?`Đã cập nhật QR có logo • sửa lỗi ${state.ecc}.`:'Đã cập nhật mã QR theo tùy chỉnh.','success');
  }catch(error){
    svgMarkup='';preview.replaceChildren();setReady(false);
    setStatus('Không thể tạo mã QR. Có thể URL quá dài so với mức sửa lỗi đã chọn.','error');
    console.error('QR render error:',error);
  }
}
function saveBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function svgToPng(svg,size){
  const src=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(src);
  try{
    const img=await new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Không thể chuyển QR sang PNG.'));image.src=url;
    });
    const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Trình duyệt không hỗ trợ Canvas.');
    ctx.drawImage(img,0,0,size,size);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Không thể xuất PNG.')),'image/png'));
  }finally{URL.revokeObjectURL(url);}
}
async function exportQr(copy=false){
  if(!svgMarkup)return;
  const original=$('download-btn').disabled;
  $('download-btn').disabled=true;$('copy-btn').disabled=true;
  try{
    // Render lại ở trạng thái hiện tại trước khi xuất tránh bản xem trước bị cũ.
    render();
    if(!svgMarkup)throw new Error('Mã QR chưa sẵn sàng.');
    const format=document.querySelector('input[name="format"]:checked')?.value || 'png';
    if(copy){
      if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined')throw new Error('Trình duyệt không hỗ trợ sao chép hình ảnh. Hãy tải PNG.');
      const blob=await svgToPng(svgMarkup,state.outputSize);
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      setStatus('Đã sao chép mã QR để dán vào Word hoặc PowerPoint.','success');
    }else if(format==='svg'){
      saveBlob(new Blob([svgMarkup],{type:'image/svg+xml;charset=utf-8'}),'ma-qr.svg');
      setStatus('Đã tạo tệp SVG.','success');
    }else{
      const blob=await svgToPng(svgMarkup,state.outputSize);
      saveBlob(blob,'ma-qr.png');
      setStatus('Đã tạo tệp PNG.','success');
    }
  }catch(error){setStatus(error.message||'Không thể xuất tệp.','error');}
  finally{$('download-btn').disabled=original;$('copy-btn').disabled=original;}
}
function bindBasics(){
  $('url-input').addEventListener('input',scheduleRender);
  $('clear-url').addEventListener('click',()=>{$('url-input').value='';$('url-input').focus();scheduleRender();});
  $('background-transparent').addEventListener('change',e=>{state.transparent=e.target.checked;syncPalette();scheduleRender();});
  bindColor('fg');bindColor('bg');
  bindSlider('roundness','roundness','%');
  bindSlider('logo-size','logoSize','%');
  bindSlider('logo-radius','logoRadius',' px');
  $('output-size').addEventListener('change',e=>{state.outputSize=Number(e.target.value);$('output-size-value').textContent=`${state.outputSize} px`;scheduleRender();});
  $('qr-margin').addEventListener('change',e=>{state.qrMargin=Number(e.target.value);scheduleRender();});
  $('download-btn').addEventListener('click',()=>exportQr(false));
  $('copy-btn').addEventListener('click',()=>exportQr(true));
}
function loadLibrary(url,timeout=9000){
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');let done=false;
    const finish=(err)=>{if(done)return;done=true;clearTimeout(t);if(err){script.remove();reject(err);}else resolve();};
    const t=setTimeout(()=>finish(new Error('Hết thời gian tải thư viện QR.')),timeout);
    script.src=url;script.async=true;
    script.onload=()=>typeof window.qrcode==='function'?finish():finish(new Error('Thư viện không hợp lệ.'));
    script.onerror=()=>finish(new Error('Không tải được thư viện.'));
    document.head.append(script);
  });
}
async function init(){
  bindTabs();makeOptions();bindBasics();bindLogo();syncColors();updateLogoSizeLimit();syncEccUi();setReady(false);
  const sources=[
    './vendor/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js',
  ];
  libraryReady = typeof window.qrcode === 'function';
  for(const src of (libraryReady ? [] : sources)){
    try{await loadLibrary(src,src.startsWith('http')?9000:900);libraryReady=true;break;}
    catch(e){console.warn('QR library fallback:',src,e.message);}
  }
  if(!libraryReady){setStatus('Không thể tải bộ tạo QR. Hãy kiểm tra Internet hoặc bổ sung tệp vendor/qrcode.min.js.','error');return;}
  render();
}
init();
