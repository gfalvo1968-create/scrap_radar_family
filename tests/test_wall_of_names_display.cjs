'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const source = fs.readFileSync('hall.js','utf8');
const html = fs.readFileSync('hall.html','utf8');
const css = fs.readFileSync('hall.css','utf8');

const approved = [
  {display_name:'Gerald Falvo', remark:'We created this to help scrappers.'},
  {display_name:'Another approved visitor', remark:'Knowledge matters.'},
  {display_name:'Third visitor', remark:'Welcome to the island.'},
];

function prepare(rows = approved) {
  let loadHandler, requests = [], periods = [], addCount = 0;
  const labels = [];
  const radar = {
    appendChild(label) {
      labels.push(label);
      addCount++;
      return label;
    }
  };
  const count = {textContent:'0'};
  const buttonContainer = {insertAdjacentElement() {}};
  const context = vm.createContext({
    document: {
      getElementById(id) {return id === 'megaRadar' ? radar : id === 'approvedCount' ? count : null;},
      querySelector(q) {return q === '.hall-terminal' ? buttonContainer : null;},
      createElement(tag) {
        assert.equal(tag, 'div', 'No new submit buttons created during isolated rotation test');
        return {
          style: {}, textContent:'', className:'',
          remove() {const i = labels.indexOf(this); if (i >= 0) labels.splice(i, 1);}
        };
      }
    },
    window: {
      addEventListener(event, listener) {if(event==='load') loadHandler=listener;}
    },
    setInterval(fn, ms) { periods.push(ms); },
    fetch(url, options) {
      requests.push({url,options});
      return Promise.resolve({ok:true, json:()=>Promise.resolve(rows)});
    },
    console,
    Math
  });
  // Suppress only the dynamic sign-button injection. The separate moderated
  // submission function and its backend write behavior are not modified.
  vm.runInContext(source.replace('  installSignButton();\n  await loadApprovedNames();', '  await loadApprovedNames();'),context);
  assert.equal(typeof loadHandler,'function');
  return {context, labels, count, requests, periods, load:loadHandler,
    get addCount(){return addCount;}
  };
}

test('one approved record shown at a time and all approved names rotate without deletion', async () => {
  const app=prepare();
  await app.load();
  assert.equal(app.count.textContent,'3');
  assert.equal(app.labels.length,1);
  assert.equal(app.labels[0].textContent,'Gerald Falvo: We created this to help scrappers.');
  assert.equal(app.labels[0].style.left,'50%');
  assert.equal(app.labels[0].style.top,'50%');

  vm.runInContext('createHallSignal()',app.context);
  assert.equal(app.labels.length,1);
  assert.equal(app.labels[0].textContent,'Another approved visitor: Knowledge matters.');
  vm.runInContext('createHallSignal()',app.context);
  assert.equal(app.labels.length,1);
  assert.equal(app.labels[0].textContent,'Third visitor: Welcome to the island.');
  vm.runInContext('createHallSignal()',app.context);
  assert.equal(app.labels.length,1);
  assert.equal(app.labels[0].textContent,'Gerald Falvo: We created this to help scrappers.');
  assert.deepEqual(app.periods,[6000,60000]);
  assert.equal(app.requests.length,1);
  assert.match(app.requests[0].url,/wall_of_names\?select=display_name,remark&status=eq.approved/);
  assert.equal(app.requests[0].options.method,undefined);
  assert.deepEqual(approved[0],{display_name:'Gerald Falvo',remark:'We created this to help scrappers.'});
});

test('empty approved wall displays no labels and no phantom count',async()=>{
  const app=prepare([]);
  await app.load();
  assert.equal(app.count.textContent,'0');
  assert.equal(app.labels.length,0);
  vm.runInContext('createHallSignal()',app.context);
  assert.equal(app.labels.length,0);
});

test('iPad wall uses cache-versioned assets and constrained readable label',()=>{
  assert.match(html,/hall\.js\?v=one-at-a-time-1/);
  assert.match(html,/hall\.css\?v=one-at-a-time-1/);
  assert.match(css,/#megaRadar \.hall-label\{[^}]*overflow-wrap:anywhere/);
  assert.match(source,/label\.style\.width = "min\(80%, 360px\)"/);
  assert.doesNotMatch(source,/Math\.random\(\)\*76\+12/);
  assert.doesNotMatch(source,/createHallSignal\(\);createHallSignal\(\);/);
});
