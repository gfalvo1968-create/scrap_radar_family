(function(){
'use strict';
const YARD_KEY='scrapRadarSavedYardsV1';
function el(id){return document.getElementById(id)}
function text(id,value){const x=el(id);if(x)x.textContent=value}
function val(id){return el(id)?.value??''}
function num(id){const x=el(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function cash(x){return '$'+Number(x||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function getJson(k,f){try{return JSON.parse(localStorage.getItem(k)||'')||f}catch(_){return f}}
function putJson(k,x){try{localStorage.setItem(k,JSON.stringify(x))}catch(_){}}
function dispatch(id){const x=el(id);if(x)x.dispatchEvent(new Event('input',{bubbles:true}))}

function ensureStyle(){if(document.querySelector('link[data-sr-features]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='scrap_radar_features.css?v=1';l.dataset.srFeatures='1';document.head.appendChild(l)}

function injectDecisionCenter(){
 if(el('decision-center'))return;
 const gauges=document.querySelector('.cockpit-summary');if(!gauges)return;
 gauges.insertAdjacentHTML('afterend',`<section id="decision-center" class="sr-panel decision-center" aria-live="polite">
  <div class="decision-head"><div><h2>🧭 Decision Center</h2><p>One glance at the active signals. Scrap Radar does not turn missing inputs into fake certainty.</p></div><span id="dc-state" class="decision-pill">WAITING FOR INPUT</span></div>
  <div class="decision-signals">
   <div class="decision-signal"><span>Load / Trip</span><strong id="dc-load">Waiting for load details</strong></div>
   <div class="decision-signal"><span>Best Buyer</span><strong id="dc-yard">Waiting for buyer prices</strong></div>
   <div class="decision-signal"><span>Board Recovery</span><strong id="dc-board">Waiting for board values</strong></div>
   <div class="decision-signal"><span>ROI</span><strong id="dc-roi">No realized results entered</strong></div>
  </div>
  <div class="decision-answer"><strong id="dc-answer">ENTER A JOB OR RECOVERY CASE</strong><small id="dc-detail">As the cockpit gets real inputs, the strongest current action signal will appear here.</small></div>
 </section>`);
 refreshDecision();
}
function cleanSignal(id,fallback){const s=(el(id)?.textContent||'').trim();return s||fallback}
function refreshDecision(){
 const load=cleanSignal('op-decision','ENTER LOAD DETAILS'),yard=cleanSignal('yard-decision','ENTER BUYER PRICES'),board=cleanSignal('br-decision','ENTER BOARD VALUES'),roi=cleanSignal('roi-decision','NO REALIZED RESULTS ENTERED');
 text('dc-load',load);text('dc-yard',yard);text('dc-board',board);text('dc-roi',roi);
 let state='WAITING FOR INPUT',kind='',answer='ENTER A JOB OR RECOVERY CASE',detail='As the cockpit gets real inputs, the strongest current action signal will appear here.';
 if(load.includes('NEGATIVE')){state='RECHECK';kind='warn';answer='⚠️ RECHECK THE LOAD ECONOMICS';detail='The current single-load evaluator is negative after the costs you entered.'}
 else if(load.includes('BELOW YOUR HOURLY TARGET')){state='TIME WARNING';kind='warn';answer='🟡 THE JOB IS BELOW YOUR TIME TARGET';detail='The load may still be cash-positive, but the entered time return is below your target.'}
 else if(yard.includes('BEST ENTERED NET')){state='BUYER SIGNAL';kind='good';answer=yard;detail=cleanSignal('yard-detail','The buyer comparison has enough entered data to identify the best current net.')}
 else if(board.includes('HIGHEST ENTERED NET')){state='RECOVERY SIGNAL';kind='good';answer=board;detail=cleanSignal('br-detail','The Board Recovery panel has enough entered values to compare paths.')}
 else if(load.includes('MEETS YOUR HOURLY TARGET')){state='JOB SIGNAL';kind='good';answer=load;detail=cleanSignal('op-detail','The entered job meets your current hourly target.')}
 else if(load.includes('NET POSITIVE')){state='JOB SIGNAL';kind='good';answer=load;detail=cleanSignal('op-detail','The job is positive on the costs currently entered.')}
 else if(!roi.includes('NO REALIZED')){state='ROI ACTIVE';kind='good';answer=roi;detail=cleanSignal('roi-detail','The ROI ledger has realized results entered.')}
 const pill=el('dc-state');if(pill){pill.textContent=state;pill.className='decision-pill '+kind}text('dc-answer',answer);text('dc-detail',detail)
}
function watchDecision(){['op-decision','yard-decision','br-decision','roi-decision','op-detail','yard-detail','br-detail','roi-detail'].forEach(id=>{const x=el(id);if(x)new MutationObserver(refreshDecision).observe(x,{childList:true,subtree:true,characterData:true})});document.addEventListener('input',()=>setTimeout(refreshDecision,0),{passive:true})}

function yardIds(){return ['yard-weight','yard-mpg','yard-gas','yard-name-1','yard-price-1','yard-miles-1','yard-fees-1','yard-name-2','yard-price-2','yard-miles-2','yard-fees-2','yard-name-3','yard-price-3','yard-miles-3','yard-fees-3']}
function injectYardMemory(){
 const panel=el('yard-comparison');if(!panel||el('save-yard-set'))return;
 const kicker=panel.querySelector('.panel-kicker');if(!kicker)return;
 kicker.insertAdjacentHTML('afterend',`<div class="saved-yard-tools"><button id="save-yard-set" class="mini-btn" type="button">Save Yard Set</button><button id="load-yard-set" class="mini-btn" type="button">Load Saved Yards</button><button id="clear-yard-set" class="mini-btn" type="button">Clear Saved Set</button><span id="saved-yard-status" class="saved-yard-status">No saved yard set on this device.</span></div><div class="saved-yard-note">Saved payout prices are a last-entered reference, not a promise from the yard. Refresh the quote before a sale.</div>`);
 el('save-yard-set').addEventListener('click',saveYards);el('load-yard-set').addEventListener('click',loadYards);el('clear-yard-set').addEventListener('click',clearYards);renderYardStatus()
}
function saveYards(){const fields={};yardIds().forEach(id=>fields[id]=val(id));putJson(YARD_KEY,{savedAt:new Date().toISOString(),fields});renderYardStatus('Saved yard set on this device.')}
function loadYards(){const d=getJson(YARD_KEY,null);if(!d||!d.fields){renderYardStatus('No saved yard set found.');return}yardIds().forEach(id=>{if(el(id)&&d.fields[id]!==undefined)el(id).value=d.fields[id]});yardIds().forEach(dispatch);renderYardStatus('Loaded saved yard set.')}
function clearYards(){try{localStorage.removeItem(YARD_KEY)}catch(_){}renderYardStatus('Saved yard set cleared.')}
function renderYardStatus(prefix){const d=getJson(YARD_KEY,null),x=el('saved-yard-status');if(!x)return;if(d&&d.savedAt){const when=new Date(d.savedAt);x.textContent=(prefix?prefix+' ':'')+'Last saved '+when.toLocaleString();x.className='saved-yard-status fresh'}else{x.textContent=prefix||'No saved yard set on this device.';x.className='saved-yard-status'}}

function injectRecoveryGuide(){
 const panel=el('board-recovery');if(!panel||el('harvest-guide'))return;
 const flow=panel.querySelector('.compact-flow')||panel.querySelector('.recovery-flow');if(!flow)return;
 flow.insertAdjacentHTML('afterend',`<details id="harvest-guide" class="recovery-guide" open><summary>🔧 Recovery Field Guide + Component Time Check</summary><div class="recovery-guide-body">
  <div class="harvest-guide-grid">
   <div class="harvest-guide-card"><b>1. Preserve before stripping</b><small>Check intact resale/reuse first. Socketed processors, RAM, removable daughtercards/modules and working assemblies can be worth more intact than reduced to material.</small></div>
   <div class="harvest-guide-card"><b>2. Inspect high-value candidates</b><small>Gold-finger cards/connectors, plated contacts, legacy ceramic processors and specialty components deserve inspection. Color alone does not prove precious-metal content.</small></div>
   <div class="harvest-guide-card"><b>3. Separate obvious bulk streams</b><small>Copper coils/chokes/transformers, wire, aluminum heat sinks and steel shields/hardware can be separated when the added value justifies the labor.</small></div>
   <div class="harvest-guide-card"><b>4. Revalue the board</b><small>After harvesting, weigh and grade what remains. A partially harvested board is not automatically worthless.</small></div>
   <div class="harvest-guide-card"><b>5. Choose sale, stockpile or refiner</b><small>Use actual buyer/refiner terms, quantity, time and processing cost. Stockpile can be valid when current recovery economics are weak.</small></div>
   <div class="harvest-guide-card"><b>6. Mechanical reduction comes later</b><small>Remove worthwhile reusable/recovery streams first. Mechanical size reduction should use proper dust/noise controls and an appropriate downstream recycler or refiner.</small></div>
  </div>
  <div class="harvest-calc"><h3>Component / Chip Time-Value Check</h3><div class="harvest-calc-grid">
   <label>Component / chip<input id="hg-name" placeholder="CPU, RAM, connector…"></label><label>Added value $<input id="hg-value" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00"></label><label>Removal minutes<input id="hg-minutes" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Added costs $<input id="hg-cost" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00"></label>
  </div><div class="harvest-result"><div><span>Net Added Value</span><strong id="hg-net">$0.00</strong></div><div><span>Value / Hour</span><strong id="hg-hour">—</strong></div><div class="recommend"><span>Action</span><strong id="hg-action">ENTER COMPONENT VALUES</strong></div></div><div class="saved-yard-note">Use supported value, not appearance. The action compares your entered net/time with the hourly target in the Load + Trip Evaluator when one is provided.</div></div>
 </div></details>`);
 ['hg-name','hg-value','hg-minutes','hg-cost','trip-target'].forEach(id=>el(id)?.addEventListener('input',calcHarvest));calcHarvest()
}
function calcHarvest(){const value=num('hg-value'),mins=num('hg-minutes'),cost=Math.max(0,num('hg-cost')||0),target=num('trip-target'),net=value===null?0:value-cost,rate=value!==null&&mins!==null&&mins>0?net/(mins/60):null;let action='ENTER COMPONENT VALUES';if(value!==null&&net<=0)action='NOT WORTH THE TIME';else if(value!==null&&(mins===null||mins<=0))action='ADD REMOVAL TIME';else if(rate!==null&&target!==null&&target>0&&rate>=target)action='REMOVE FIRST • MEETS TIME TARGET';else if(rate!==null&&target!==null&&target>0&&rate>=target*.5)action='OPTIONAL • BELOW TARGET';else if(rate!==null&&target!==null&&target>0)action='LEAVE ON BOARD • LOW TIME RETURN';else if(rate!==null&&rate>0)action='OPTIONAL • ADD YOUR HOURLY TARGET';text('hg-net',cash(net));text('hg-hour',rate===null?'—':cash(rate)+'/hr');text('hg-action',action)}

function tweakToolCard(){const card=document.querySelector('.tool-card[href="#roi"]');if(card)card.href='#inventory'}
function init(){ensureStyle();injectDecisionCenter();injectYardMemory();injectRecoveryGuide();tweakToolCard();watchDecision();refreshDecision()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
