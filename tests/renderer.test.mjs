import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeHex,normalizeUrl,buildQrSvg,qrMatrixFromFactory,DENSITIES } from '../src/qr-renderer.js';

const matrix=Array.from({length:21},(_,r)=>Array.from({length:21},(_,c)=>((r*31+c*7)%11)<5));
for(const [raw,expected] of [
 ['https://example.com/a.pdf','https://example.com/a.pdf'],
 ['  http://example.org/image.png  ','http://example.org/image.png'],
 ['javascript:alert(1)',''],['ftp://example.com',''],['',''],['example.com',''],
])test(`URL validation: ${raw}`,()=>assert.equal(normalizeUrl(raw).value,expected));
test('HEX input strict',()=>{
 assert.equal(normalizeHex('acbdef'),'#ACBDEF');assert.equal(normalizeHex('#123'),null);
 assert.equal(normalizeHex('"/><script>'),null);
});
test('SVG size, viewBox and finder count',()=>{
 const svg=buildQrSvg(matrix,{outputSize:1024,fg:'#123456',bg:'#FFFFFF'});
 assert.match(svg,/width="1024" height="1024"/);
 assert.match(svg,/viewBox="0 0 29 29"/);
 assert.equal((svg.match(/stroke-width="1"/g)||[]).length,3);
 assert.ok(svg.includes('#123456'));
});
test('three dot density levels retain matrix and alter point fill',()=>{
 const imgs=DENSITIES.map(d=>buildQrSvg(matrix,{density:d.value,dotType:'dots'}));
 assert.equal(DENSITIES.length,3);
 assert.notEqual(imgs[0],imgs[1]);assert.notEqual(imgs[1],imgs[2]);
 assert.equal((imgs[0].match(/<ellipse /g)||[]).length,(imgs[2].match(/<ellipse /g)||[]).length);
});
test('logo PNG inserted; never inject arbitrary image urls',()=>{
 const b64='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+xHqkAAAAASUVORK5CYII=';
 const svg=buildQrSvg(matrix,{logoData:b64,logoSize:15,logoBackground:'rounded-white'});
 assert.ok(svg.includes('clipPath'));
 assert.ok(svg.includes('href="data:image/png;base64,'));
 const unsafe=buildQrSvg(matrix,{logoData:'javascript:alert(1)'});
 assert.ok(!unsafe.includes('javascript:'));
});
test('invalid matrix rejected',()=>assert.throws(()=>buildQrSvg([[true]])));
test('mock QR factory matrix conversion',()=>{
 let ec='';
 const got=qrMatrixFromFactory((_,level)=>{ec=level;return {addData(){},make(){},getModuleCount(){return 21;},isDark(){return true;}}},'https://example.com','H');
 assert.equal(ec,'H');assert.equal(got.length,21);assert.ok(got[5][5]);
});
