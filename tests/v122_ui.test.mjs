import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('default black foreground in UI state and HTML controls',()=>{
  assert.match(app,/fg:'#000000',bg:/);
  assert.match(html,/id="foreground-picker" value="#000000"/);
  assert.match(html,/id="foreground-hex" value="#000000"/);
  assert.match(app,/\['#000000','#0B3D7E'/);
});
test('ECC options span full width and stay on one row',()=>{
  assert.match(html,/class="segment-wrap ecc-row"/);
  assert.match(css,/#ecc-options\.ecc-row\s*\{/);
  assert.match(css,/grid-template-columns:\s*repeat\(4,/);
  assert.match(css,/#ecc-options\.ecc-row \.segment-button[\s\S]*?white-space:\s*nowrap/);
});
