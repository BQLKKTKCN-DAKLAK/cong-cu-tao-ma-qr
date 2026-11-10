import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('two accessible display-mode buttons and no duplicate customization tabs',()=>{
  assert.match(html,/data-theme-choice="light" aria-pressed="true"/);
  assert.match(html,/data-theme-choice="dark" aria-pressed="false"/);
  for(const tab of ['shape','color','logo']) assert.match(html,new RegExp(`id="tab-${tab}"`));
  assert.equal((html.match(/id="panel-/g)||[]).length,3);
});
test('light mode is plain white with no decorative shell overlays',()=>{
  assert.match(css,/html\[data-theme="light"\] body\s*\{ background: #FFFFFF; \}/);
  assert.match(css,/html\[data-theme="light"\] \.site-shell::after\s*\{ display: none; \}/);
});
test('dark mode has white agency header and metallic gold title',()=>{
  assert.match(css,/html\[data-theme="dark"\] \.agency-name\s*\{ color:#ffffff;/);
  assert.match(css,/html\[data-theme="dark"\] \.tool-brand h1[\s\S]*?background:linear-gradient\(180deg,#fff6c8/);
  assert.match(css,/-webkit-background-clip:text;background-clip:text/);
});
test('theme persists only the UI preference, not QR data',()=>{
  assert.match(app,/localStorage\.setItem\('qr-display-theme',theme\)/);
  assert.doesNotMatch(app,/localStorage\.setItem\('qr-(url|logo|data)'/);
  assert.match(app,/const theme=value==='dark'\?'dark':'light'/);
});
