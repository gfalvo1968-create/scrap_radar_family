/* Gold recovery what-if. Assumed fine-gold yield never populates actual recovery payouts.
   Troy conversion: NIST, 1 troy ounce = 31.1034768 grams.
   Scale points here explicitly mean 0.1 gram each, not gemstone points. */
(function(){
'use strict';
const KEY='scrapRadarSpikeRecoveryPacketV1',TROY_GRAMS=31.1034768;
const IDS=['spike-gold-amount','spike-gold-unit','spike-gold-pay-percent','spike-gold-costs','spike-gold-minutes'];
function E(id){return document.getElementById(id)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function token(p){return p?String(p.caseId||p.createdAt||''):''}
const loadedCase=token(read());
function numeric(id){const v=E(id)?.value,n=Number(v);return v!=null&&String(v).trim()!==''&&Number.isFinite(n)&&n>=0?n:null}
function cash(v){return Number.isFinite(v)?'$'+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}
function cents(v){return Math.round((v+Number.EPSILON)*100)/100}
function text(id,value){const e=E(id);if(e)e.textContent=value}
function validBinding(){return token(read())===loadedCase}
function ensure(){
  if(E('spike-gold-scenario'))return true;
  const anchor=E('spike-quick-estimate');if(!anchor)return false;
  const box=document.createElement('section');box.id='spike-gold-scenario';
  box.style.cssText='margin-top:14px;padding:14px;border:1px solid #d9b34d;border-radius:10px;background:#101006';
  box.innerHTML='<h3 style="margin:0 0 7px;color:#ffe39b">🥇 WHAT IF WE RECOVER GOLD?</h3>'+
    '<p class="muted" style="margin:0 0 12px"><b>Assumed recovery • board yield unmeasured.</b> Try an amount of recovered 24K gold and compare its gross metal value with selling the board whole.</p>'+
    '<label for="spike-gold-amount">Recovered 24K gold (assumed) <input id="spike-gold-amount" type="number" min="0" step="any" inputmode="decimal" style="max-width:130px"></label> '+
    '<select id="spike-gold-unit" aria-label="Assumed gold weight unit"><option value="scale_points">Scale points (0.1 g each)</option><option value="g">grams</option><option value="mg">milligrams</option></select> '+
    '<button id="spike-gold-one-point" class="mini-btn" type="button">Try 1 point</button>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px">'+
      '<div style="padding:10px;border:1px solid #234323;border-radius:8px"><b id="spike-gold-whole-label">Sell whole (planning)</b><br><strong id="spike-gold-whole" style="font-size:1.4em">—</strong></div>'+
      '<div style="padding:10px;border:1px solid #826d2c;border-radius:8px"><b>Gold scenario • gross metal value</b><br><strong id="spike-gold-gross" style="font-size:1.4em;color:#ffe39b">—</strong></div></div>'+
    '<div id="spike-gold-basis" class="muted" role="status" aria-live="polite" style="margin-top:9px"></div>'+
    '<details style="margin-top:12px"><summary>Add buyer terms, costs and time (optional)</summary><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px">'+
      '<label>Buyer payout assumption (% of benchmark)<input id="spike-gold-pay-percent" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="Enter buyer percentage" style="width:100%;box-sizing:border-box"></label>'+
      '<label>Recovery costs + buyer fees $<input id="spike-gold-costs" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter costs" style="width:100%;box-sizing:border-box"></label>'+
      '<label>Recovery minutes<input id="spike-gold-minutes" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter minutes" style="width:100%;box-sizing:border-box"></label></div>'+ 
      '<p><b>Scenario after entered costs:</b> <span id="spike-gold-net">—</span> <span id="spike-gold-hourly" class="muted"></span></p></details>'+
    '<p id="spike-gold-net-note" class="muted" style="margin-bottom:0">Enter a buyer percentage and costs to compare proceeds. Recovery payouts remain unpriced until supported by measurements and buyer terms.</p>';
  anchor.insertAdjacentElement('afterend',box);
  IDS.forEach(function(id){E(id).addEventListener(id==='spike-gold-unit'?'change':'input',function(){update(true)})});
  E('spike-gold-one-point').onclick=function(){E('spike-gold-amount').value='1';E('spike-gold-unit').value='scale_points';update(true)};
  E('br-whole')?.addEventListener('input',function(){update(false)});
  return true;
}
function restore(){
  const p=read(),s=p?.planning?.goldRecoveryScenario;
  const input=s&&s.version===1&&s.kind==='hypothetical'&&s.caseId===token(p)?s.input:null;
  E('spike-gold-amount').value=input?(input.amount==null?'':String(input.amount)):'1';
  E('spike-gold-unit').value=input&&['scale_points','g','mg'].includes(input.unit)?input.unit:'scale_points';
  [['spike-gold-pay-percent','buyerPayPercent'],['spike-gold-costs','costs'],['spike-gold-minutes','minutes']].forEach(function(pair){E(pair[0]).value=input&&input[pair[1]]!=null?String(input[pair[1]]):''});
}
function calculate(){
  const amount=numeric('spike-gold-amount'),unit=E('spike-gold-unit').value;
  const factor={scale_points:0.1,g:1,mg:0.001}[unit];
  const grams=amount!=null&&factor?amount*factor:null;
  const input={amount:amount,unit:unit,buyerPayPercent:numeric('spike-gold-pay-percent'),costs:numeric('spike-gold-costs'),minutes:numeric('spike-gold-minutes')};
  const s={version:1,kind:'hypothetical',caseId:loadedCase,input:input,recoveredFineGrams:grams,status:'needs_yield',benchmark:null,grossMetalValue:null,netAfterEnteredCosts:null,hourlyAfterEnteredCosts:null,calculatedAt:new Date().toISOString()};
  if(grams==null||!Number.isFinite(grams)||grams<0)return s;
  const boardWeight=Number(read()?.planning?.weightGrams);
  if(boardWeight>0&&grams>boardWeight){s.status='exceeds_board_weight';return s}
  const q=window.getScrapRadarMetalBenchmark?.('gold'),price=Number(q?.price);
  const marketUnit=q?.unit,pricePerGram=marketUnit==='troy_oz'?price/TROY_GRAMS:marketUnit==='g'?price:null;
  if(!q?.available||q.price==null||!Number.isFinite(price)||price<=0||pricePerGram==null){s.status='needs_benchmark';return s}
  s.benchmark={price:price,unit:marketUnit,date:q.date||null,stale:q.stale===true,source:q.source||'Scrap Radar market bridge'};
  const gross=grams*pricePerGram;
  if(!Number.isFinite(gross)){s.status='invalid_value';return s}
  s.status='calculated';s.grossMetalValue=cents(gross);
  if(input.buyerPayPercent!=null&&input.buyerPayPercent<=100&&input.costs!=null){
    const net=gross*input.buyerPayPercent/100-input.costs;
    if(Number.isFinite(net)){s.netAfterEnteredCosts=cents(net);if(input.minutes>0&&Number.isFinite(net*60/input.minutes))s.hourlyAfterEnteredCosts=cents(net*60/input.minutes)}
  }
  return s;
}
function update(persist){
  if(!ensure())return true;
  const whole=numeric('br-whole');text('spike-gold-whole',whole!=null?cash(whole):'—');
  text('spike-gold-whole-label',E('br-whole')?.dataset.basis==='entered_offer'?'Sell whole (entered offer)':'Sell whole (planning)');
  const bound=validBinding();IDS.concat(['spike-gold-one-point']).forEach(function(id){E(id).disabled=!bound});
  if(!bound){['spike-gold-gross','spike-gold-net'].forEach(function(id){text(id,'—')});text('spike-gold-hourly','');text('spike-gold-basis','The saved board case changed. Reload Scrap Radar before saving a scenario.');return false}
  const s=calculate();text('spike-gold-gross',s.grossMetalValue!=null?cash(s.grossMetalValue):'—');
  text('spike-gold-net',s.netAfterEnteredCosts!=null?cash(s.netAfterEnteredCosts):'—');
  text('spike-gold-hourly',s.hourlyAfterEnteredCosts!=null?' • '+cash(s.hourlyAfterEnteredCosts)+'/hr':'');
  let note='Enter an assumed recovered gold weight.';
  if(s.status==='exceeds_board_weight')note='Assumed recovered gold exceeds this board’s scale weight. Enter an amount within the board weight.';
  else if(s.status==='needs_benchmark')note='Gold benchmark unavailable. Tap Refresh Prices to check the market feed. No gold value is calculated without a benchmark.';
  else if(s.status==='invalid_value')note='This amount is too large to calculate. Check the assumed gold weight.';
  else if(s.status==='calculated'){
    const q=s.benchmark,pricePerGram=q.unit==='g'?q.price:q.price/TROY_GRAMS;
    const entry=s.input.unit==='scale_points'?s.input.amount+' scale point'+(s.input.amount===1?'':'s')+' = ':'';
    note=entry+Number(s.recoveredFineGrams.toPrecision(8))+' g recovered gold (assumed) × '+cash(pricePerGram)+'/g. Gold benchmark '+cash(q.price)+'/'+(q.unit==='g'?'g':'troy oz')+' • price date '+(q.date||'unverified')+(q.stale?' • stale or unverified; confirm before use':'')+'. Gross metal value before buyer deductions and recovery costs.';
  }
  text('spike-gold-basis',note);
  text('spike-gold-net-note',s.input.buyerPayPercent>100?'Buyer percentage must be between 0 and 100.':s.netAfterEnteredCosts!=null?'Scenario uses your buyer percentage and entered costs. Add all applicable costs and time before comparing paths.':'Enter a buyer percentage and costs to compare proceeds. Actual recovery payouts remain unpriced; this yield is an assumption.');
  if(persist&&loadedCase){
    const p=read();if(token(p)!==loadedCase)return false;
    p.planning=Object.assign({},p.planning,{goldRecoveryScenario:s});
    try{localStorage.setItem(KEY,JSON.stringify(p))}
    catch(_){text('spike-gold-basis','Could not save this scenario. Check browser storage before returning to Board Sense.');return false}
  }
  return true;
}
function init(){if(!ensure())return;restore();update(true)}
window.ScrapRadarGoldScenario={save:function(){return update(true)},refresh:function(){return update(false)}};
window.addEventListener('scrapRadarMarketUpdated',function(){update(true)});
window.addEventListener('storage',function(e){if(e.key===KEY||e.key===null){if(validBinding()&&E('spike-gold-scenario'))restore();update(false)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
