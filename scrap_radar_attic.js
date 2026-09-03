(function(){
'use strict';
const DONE_KEY='scrapRadarAtticMonthV1';
const SNOOZE_KEY='scrapRadarAtticSnoozeV1';
function monthKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function doneThisMonth(){try{return localStorage.getItem(DONE_KEY)===monthKey()}catch(_){return false}}
function snoozedThisVisit(){try{return sessionStorage.getItem(SNOOZE_KEY)==='1'}catch(_){return false}}
function rememberDone(){try{localStorage.setItem(DONE_KEY,monthKey())}catch(_){}}
function snooze(){try{sessionStorage.setItem(SNOOZE_KEY,'1')}catch(_){}}
function close(){document.getElementById('attic-reminder')?.remove()}
function addStyle(){if(document.getElementById('attic-reminder-style'))return;const s=document.createElement('style');s.id='attic-reminder-style';s.textContent=`
.attic-reminder{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.76);backdrop-filter:blur(4px)}
.attic-card{width:min(560px,94vw);border:1px solid rgba(57,255,20,.45);border-radius:18px;background:linear-gradient(180deg,#07170d,#020805);box-shadow:0 0 38px rgba(57,255,20,.15);padding:20px;color:#eaffef}
.attic-card h2{margin:0;color:#39ff14;font-size:1.35rem}.attic-card .attic-sub{margin:6px 0 14px;color:#91b49b;line-height:1.45}.attic-list{display:grid;gap:9px}.attic-step{padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#020805}.attic-step b{display:block;color:#cffff0}.attic-step small{display:block;margin-top:3px;color:#78917f;line-height:1.4}.attic-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}.attic-btn{border:1px solid rgba(57,255,20,.35);background:#06140a;color:#eaffef;border-radius:10px;padding:10px 14px;font:inherit;cursor:pointer}.attic-btn.primary{background:#0b2a11;color:#7dff89;font-weight:800}.attic-foot{margin-top:11px;color:#607768;font-size:.72rem;line-height:1.4}
`;
document.head.appendChild(s)}
function show(){if(doneThisMonth()||snoozedThisVisit()||document.getElementById('attic-reminder'))return;addStyle();const wrap=document.createElement('div');wrap.id='attic-reminder';wrap.className='attic-reminder';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-labelledby','attic-title');wrap.innerHTML=`<div class="attic-card">
<h2 id="attic-title">🧹 Monthly Attic Check</h2>
<p class="attic-sub">Time to <strong>CHECK • CLEAN • REFRESH THE ATTIC</strong> so old test data and stale prices do not start growing cobwebs.</p>
<div class="attic-list">
<div class="attic-step"><b>🔎 CHECK</b><small>Review saved yard quotes, inventory, ROI/history, test records and notes for anything stale or no longer trusted.</small></div>
<div class="attic-step"><b>🧹 CLEAN</b><small>Remove obsolete tests, duplicates and records that should not be treated as current business data.</small></div>
<div class="attic-step"><b>↻ REFRESH</b><small>Refresh market prices, real buyer quotes and reference material before relying on them for a decision.</small></div>
</div>
<div class="attic-actions"><button id="attic-done" class="attic-btn primary" type="button">Done for This Month</button><button id="attic-later" class="attic-btn" type="button">Remind Me Later</button></div>
<div class="attic-foot">This reminder never deletes or changes data by itself. The attic broom stays in your hands.</div>
</div>`;document.body.appendChild(wrap);document.getElementById('attic-done')?.addEventListener('click',()=>{rememberDone();close()});document.getElementById('attic-later')?.addEventListener('click',()=>{snooze();close()});}
function init(){setTimeout(show,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
