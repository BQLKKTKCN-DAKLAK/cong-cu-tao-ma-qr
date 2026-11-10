/**
 * QR renderer. Ma trận QR do qrcode-generator (MIT) tạo ra; các tùy chọn này chỉ vẽ lại
 * các mô-đun, không sửa dữ liệu, mẫu định vị hay mã sửa lỗi đã mã hóa.
 */
export const DOT_TYPES = [
  { value: 'square', label: 'Vuông' },
  { value: 'dots', label: 'Tròn' },
  { value: 'rounded', label: 'Bo góc' },
  { value: 'classy', label: 'Cánh mềm' },
  { value: 'diamond', label: 'Hình thoi' },
  { value: 'pill', label: 'Ô dài' },
];
export const EYE_OUTER_TYPES = [
  { value: 'square', label: 'Vuông' },
  { value: 'round', label: 'Tròn' },
  { value: 'rounded', label: 'Bo góc' },
  { value: 'extra', label: 'Bo tròn lớn' },
  { value: 'leaf', label: 'Góc cách điệu' },
];
export const EYE_INNER_TYPES = [
  { value: 'square', label: 'Vuông' },
  { value: 'round', label: 'Tròn' },
  { value: 'rounded', label: 'Bo góc' },
  { value: 'extra', label: 'Bo tròn lớn' },
  { value: 'leaf', label: 'Góc cách điệu' },
  { value: 'diamond', label: 'Thoi' },
];
export const DENSITIES = [
  { value: 'sparse', label: 'Thưa', scale: 0.84 },
  { value: 'medium', label: 'Trung bình', scale: 0.93 },
  { value: 'high', label: 'Cao', scale: 1 },
];

export function normalizeHex(input) {
  const raw = String(input ?? '').trim();
  const hex = raw.startsWith('#') ? raw : `#${raw}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  return hex.toUpperCase();
}

export function normalizeUrl(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return { value: '', error: '' };
  if (raw.length > 2500) return { value: '', error: 'Đường link quá dài (giới hạn 2.500 ký tự).' };
  try {
    const u = new URL(raw);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname || /\s/.test(raw)) {
      return { value: '', error: 'Vui lòng nhập URL đầy đủ bắt đầu bằng https:// hoặc http://.' };
    }
    return { value: u.href, error: '' };
  } catch {
    return { value: '', error: 'URL chưa hợp lệ. Ví dụ: https://website.vn/tai-lieu.pdf' };
  }
}

const decimal = n => Number(n.toFixed(4));
const rect = (x, y, w, h, rx, color) => `<rect x="${decimal(x)}" y="${decimal(y)}" width="${decimal(w)}" height="${decimal(h)}" rx="${decimal(rx)}" fill="${color}"/>`;
const ellipse = (cx, cy, rx, ry, color) => `<ellipse cx="${decimal(cx)}" cy="${decimal(cy)}" rx="${decimal(rx)}" ry="${decimal(ry)}" fill="${color}"/>`;
const diamond = (x, y, w, color) => `<path d="M${decimal(x + w/2)} ${decimal(y)} L${decimal(x+w)} ${decimal(y+w/2)} L${decimal(x+w/2)} ${decimal(y+w)} L${decimal(x)} ${decimal(y+w/2)}Z" fill="${color}"/>`;

function moduleSvg(type, cx, cy, size, fg, roundness) {
  const x = cx - size / 2, y = cy - size / 2;
  switch (type) {
    case 'dots': return ellipse(cx, cy, size / 2, size / 2, fg);
    case 'rounded': return rect(x, y, size, size, size * Math.max(.22, roundness / 200), fg);
    case 'classy': return `<path d="M${decimal(x+size*.3)} ${decimal(y)} H${decimal(x+size)} V${decimal(y+size*.70)} Q${decimal(x+size)} ${decimal(y+size)} ${decimal(x+size*.7)} ${decimal(y+size)} H${decimal(x)} V${decimal(y+size*.3)} Q${decimal(x)} ${decimal(y)} ${decimal(x+size*.3)} ${decimal(y)}Z" fill="${fg}"/>`;
    case 'diamond': return diamond(x, y, size, fg);
    case 'pill': return rect(x+size*.15, y, size*.7, size, size*.35, fg);
    default: return rect(x, y, size, size, size * (roundness / 200), fg);
  }
}

function eyeSvg(row, col, outer, inner, fg) {
  const x = col, y = row;
  const rx = outer === 'round' ? 3.01 : outer === 'rounded' ? 1.3 : outer === 'extra' ? 2.35 : outer === 'leaf' ? 1.8 : 0;
  const rr = (x2, y2, w, h, r) => `<rect x="${x2}" y="${y2}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${fg}" stroke-width="1"/>`;
  let ring;
  if (outer === 'round') ring = `<circle cx="${x+3.5}" cy="${y+3.5}" r="3" fill="none" stroke="${fg}" stroke-width="1"/>`;
  else if (outer === 'leaf') ring = `<path d="M${x+.5} ${y+2.4} Q${x+.5} ${y+.5} ${x+2.4} ${y+.5} H${x+6.5} V${y+4.6} Q${x+6.5} ${y+6.5} ${x+4.6} ${y+6.5} H${x+.5}Z" fill="none" stroke="${fg}" stroke-width="1"/>`;
  else ring = rr(x+.5,y+.5,6,6,rx);
  const ix=x+2, iy=y+2;
  let center;
  if (inner==='round') center=ellipse(x+3.5,y+3.5,1.5,1.5,fg);
  else if (inner==='diamond') center=diamond(ix,iy,3,fg);
  else if (inner==='leaf') center=`<path d="M${ix+.9} ${iy} H${ix+3} V${iy+2.1} Q${ix+3} ${iy+3} ${ix+2.1} ${iy+3} H${ix} V${iy+.9} Q${ix} ${iy} ${ix+.9} ${iy}Z" fill="${fg}"/>`;
  else center=rect(ix,iy,3,3,inner==='rounded'?.6:inner==='extra'?1.1:0,fg);
  return ring+center;
}

export function buildQrSvg(matrix, options = {}) {
  if (!Array.isArray(matrix) || matrix.length < 21 || !matrix.every(r => Array.isArray(r) && r.length === matrix.length)) {
    throw new Error('Ma trận QR không hợp lệ.');
  }
  const n = matrix.length;
  const cfg = {
    fg:'#000000', bg:'#FFFFFF', transparent:false, dotType:'square', eyeOuter:'square', eyeInner:'square',
    density:'high', roundness:0, outputSize:1000, logoData:'', logoSize:15, logoBackground:'transparent',
    logoRadius:8, logoBorder:'none', ...options,
  };
  cfg.fg=normalizeHex(cfg.fg);cfg.bg=normalizeHex(cfg.bg);
  if(!cfg.fg||!cfg.bg) throw new Error('Màu HEX không hợp lệ.');
  if (!DOT_TYPES.some(e=>e.value===cfg.dotType)) cfg.dotType='square';
  if (!EYE_OUTER_TYPES.some(e=>e.value===cfg.eyeOuter)) cfg.eyeOuter='square';
  if (!EYE_INNER_TYPES.some(e=>e.value===cfg.eyeInner)) cfg.eyeInner='square';
  const ratio=DENSITIES.find(e=>e.value===cfg.density)?.scale ?? 1;
  const quiet=4, view=n+quiet*2;
  const size=Math.min(2000,Math.max(200,Number(cfg.outputSize)||1000));
  let out=[`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${view} ${view}" shape-rendering="geometricPrecision" role="img" aria-label="Mã QR">`,`<title>Mã QR</title>`];
  if(!cfg.transparent) out.push(rect(0,0,view,view,0,cfg.bg));

  const logoActive = typeof cfg.logoData==='string' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(cfg.logoData);
  const logoWidth=logoActive ? n * Math.min(22,Math.max(5,Number(cfg.logoSize)||15))/100 : 0;
  const logoCenter=quiet+n/2;
  const logoExtra=logoActive ? Math.max(.35,logoWidth*.045) : 0;
  const shieldLeft=logoCenter-(logoWidth/2+logoExtra), shieldRight=logoCenter+(logoWidth/2+logoExtra);
  const isEye=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
  let elems=[];
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) {
    if(!matrix[r][c]||isEye(r,c)) continue;
    const cx=quiet+c+.5,cy=quiet+r+.5;
    if(logoActive && cx>=shieldLeft && cx<=shieldRight && cy>=shieldLeft && cy<=shieldRight) continue;
    elems.push(moduleSvg(cfg.dotType,cx,cy,ratio,cfg.fg,Number(cfg.roundness)||0));
  }
  out.push(`<g>${elems.join('')}</g>`);
  // Cấu trúc 3 mắt định vị luôn giữ đúng vị trí và tỷ lệ 7x7.
  out.push(`<g transform="translate(${quiet} ${quiet})">`);
  out.push(eyeSvg(0,0,cfg.eyeOuter,cfg.eyeInner,cfg.fg));
  out.push(eyeSvg(0,n-7,cfg.eyeOuter,cfg.eyeInner,cfg.fg));
  out.push(eyeSvg(n-7,0,cfg.eyeOuter,cfg.eyeInner,cfg.fg));
  out.push('</g>');

  if(logoActive){
    const x=logoCenter-logoWidth/2,y=x;
    const clipRadius=Math.min(logoWidth/2,(Number(cfg.logoRadius)||0)*view/size);
    const bgRounded=cfg.logoBackground==='rounded-white';
    const bgRadius=bgRounded ? Math.max(logoWidth*.13,clipRadius) : clipRadius;
    out.push(`<defs><clipPath id="qr-logo-clip">${rect(x,y,logoWidth,logoWidth,clipRadius,'#FFFFFF')}</clipPath></defs>`);
    if(cfg.logoBackground!=='transparent')out.push(rect(x-logoExtra/2,y-logoExtra/2,logoWidth+logoExtra,logoWidth+logoExtra,bgRadius,cfg.bg));
    out.push(`<image x="${decimal(x)}" y="${decimal(y)}" width="${decimal(logoWidth)}" height="${decimal(logoWidth)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#qr-logo-clip)" href="${cfg.logoData}"/>`);
    if(cfg.logoBorder!=='none'){
      const stroke=cfg.logoBorder==='medium'?.22:.11;
      out.push(`<rect x="${decimal(x)}" y="${decimal(y)}" width="${decimal(logoWidth)}" height="${decimal(logoWidth)}" rx="${decimal(clipRadius)}" fill="none" stroke="${cfg.bg}" stroke-width="${stroke}"/>`);
    }
  }
  out.push('</svg>');
  return out.join('');
}

export function qrMatrixFromFactory(factory, text, level='Q') {
  if (typeof factory !== 'function') throw new Error('Thư viện tạo QR chưa sẵn sàng.');
  const q=factory(0,level);
  q.addData(text,'Byte');
  q.make();
  const count=q.getModuleCount();
  return Array.from({length:count},(_,r)=>Array.from({length:count},(_,c)=>!!q.isDark(r,c)));
}
