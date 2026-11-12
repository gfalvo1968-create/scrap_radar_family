const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','board_sense_case.html'),'utf8');
const start=html.indexOf('  function testerKeyAllowed(input){');
const end=html.indexOf('  function add(d,id,src,onload)',start);
assert.ok(start>=0&&end>start,'tester route allowlist must exist');
const sandbox={URL};
vm.runInNewContext(html.slice(start,end),sandbox);
const allowed=sandbox.testerKeyAllowed;
for(const route of ['/analyze','/analyze-case','/analyze-pair','/analyze-spike-pair']){
  assert.equal(allowed('https://boardsense.scrapradarfamily.com'+route),true,route);
  assert.equal(allowed({url:'https://boardsense.scrapradarfamily.com'+route}),true,'Request-style target');
}
for(const address of [
  'https://evil.example.com/analyze',
  'http://boardsense.scrapradarfamily.com/analyze',
  'https://boardsense.scrapradarfamily.com.evil.example/analyze',
  'https://boardsense.scrapradarfamily.com:8443/analyze',
  'https://boardsense.scrapradarfamily.com/analyze-case/extra',
  'https://boardsense.scrapradarfamily.com/market-intelligence',
  'https://boardsense.scrapradarfamily.com/free-usage',
  '/analyze',
  'https://boardsense.scrapradarfamily.com@evil.example.com/analyze',
  'javascript:alert(1)',
]){
  assert.equal(allowed(address),false,address);
}
assert.equal(allowed(null),false);
console.log('Tester key destination allowlist tests passed');