/* Gold, silver and copper recovery what-if. Assumed yields never populate actual payouts.
   Troy conversion: NIST, 1 troy ounce = 31.1034768 grams.
   Scale points here explicitly mean 0.1 gram each, not gemstone points. */
(function(){
'use strict';
const KEY='scrapRadarSpikeRecoveryPacketV1',TROY_GRAMS=31.1034768,LB_GRAMS=453.59237;
const LABELS={gold:'Gold',silver:'Silver',copper:'Copper'};
const IDS=['spike-gold-amount','spike-gold-unit','spike-gold-pay-percent','spike-gold-costs','spike-gold-minutes'].concat(['silver','copper'].flatMap(id=>['spike-'+id+'-amount','spike-'+id+'-unit','spike-'+id+'-pay-percent']));
function E(id){return document.getElementById(id)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function token(p){return p?String(p.caseId||p.createdAt||''):''}
const loadedCase=token(read());
function numeric(id){const v=E(id)?.value,n=Number(v);return v!=null&&String(v).trim()!==''&&Number.isFinite(n)&&n>=0?n:null}
function cash(v){return Number.isFinite(v)?'$'+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}
function cents(v){const n=Math.round((v+Number.EPSILON)*100)/100;return Number.isFinite(n)?n:null}
function text(id,value){const e=E(id);if(e)e.textContent=value}
function validBinding(){return token(read())===loadedCase}
function additionalMetalHTML(id){
  const label=LABELS[id];
  return '<div style="margin-top:12px;padding:10px;border:1px solid #625b38;border-radius:8px"><label for="spike-'+id+'-amount">Recovered '+label.toLowerCase()+' (assumed) <input id="spike-'+id+'-amount" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter amount" style="max-width:130px"></label> '+
    '<select id="spike-'+id+'-unit" aria-label="Assumed '+id+' weight unit"><option value="g">grams</option><option value="mg">milligrams</option>'+(id==='copper'?'<option value="lb">pounds</option><option value="kg">kilograms</option>':'')+'</select>'+
    '<div style="margin-top:8px"><b>'+label+' scenario • gross metal value</b> <strong id="spike-'+id+'-gross" style="color:#ffe39b">—</strong></div><div id="spike-'+id+'-basis" class="muted" style="margin-top:5px">Enter an assumed recovered amount.</div></div>';
}
function ensure(){
  if(E('spike-gold-scenario'))return true;
  const anchor=E('spike-quick-estimate');if(!anchor)return false;
  const box=document.createElement('section');box.id='spike-gold-scenario';
  box.style.cssText='margin-top:14px;padding:14px;border:1px solid #d9b34d;border-radius:10px;background:#101006';
  box.innerHTML='<h3 style="margin:0 0 7px;color:#ffe39b">🥇 WHAT IF WE RECOVER METALS?</h3>'+
    '<p class="muted" style="margin:0 0 12px"><b>Assumed recovery • board yields unmeasured.</b> Compare recovered gold, silver and copper with selling the board whole. Amounts describe recovered metal, not the weight of components or the entire board.</p>'+
    '<label for="spike-gold-amount">Recovered 24K gold (assumed) <input id="spike-gold-amount" type="number" min="0" step="any" inputmode="decimal" style="max-width:130px"></label> '+
    '<select id="spike-gold-unit" aria-label="Assumed gold weight unit"><option value="scale_points">Scale points (0.1 g each)</option><option value="g">grams</option><option value="mg">milligrams</option></select> '+
    '<button id="spike-gold-one-point" class="mini-btn" type="button">Try 1 point</button>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px">'+
      '<div style="padding:10px;border:1px solid #234323;border-radius:8px"><b id="spike-gold-whole-label">Sell whole (planning)</b><br><strong id="spike-gold-whole" style="font-size:1.4em">—</strong></div>'+
      '<div style="padding:10px;border:1px solid #826d2c;border-radius:8px"><b>Gold scenario • gross metal value</b><br><strong id="spike-gold-gross" style="font-size:1.4em;color:#ffe39b">—</strong></div></div>'+
    '<div id="spike-gold-basis" class="muted" role="status" aria-live="polite" style="margin-top:9px"></div>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">'+additionalMetalHTML('silver')+additionalMetalHTML('copper')+'</div>'+
    '<div style="margin-top:12px;padding:12px;border:1px solid #d9b34d;border-radius:8px"><b id="spike-material-total-label">Priced metal subtotal</b><br><strong id="spike-material-gross" style="font-size:1.4em;color:#ffe39b">—</strong><div id="spike-material-basis" class="muted" role="status" aria-live="polite" style="margin-top:6px"></div></div>'+
    '<details style="margin-top:12px"><summary>Add buyer terms, costs and time (optional)</summary><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px">'+
      '<label>Gold buyer payout (% of benchmark)<input id="spike-gold-pay-percent" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="Enter buyer percentage" style="width:100%;box-sizing:border-box"></label>'+
      ['silver','copper'].map(id=>'<label>'+LABELS[id]+' buyer payout (% of benchmark)<input id="spike-'+id+'-pay-percent" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="Enter buyer percentage" style="width:100%;box-sizing:border-box"></label>').join('')+
      '<label>Total recovery costs + buyer fees $ (count once)<input id="spike-gold-costs" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter costs" style="width:100%;box-sizing:border-box"></label>'+
      '<label>Recovery minutes<input id="spike-gold-minutes" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter minutes" style="width:100%;box-sizing:border-box"></label></div>'+ 
      '<p><b id="spike-material-net-label">Priced metals after entered costs:</b> <span id="spike-gold-net">—</span> <span id="spike-gold-hourly" class="muted"></span></p></details>'+
    '<p id="spike-gold-net-note" class="muted" style="margin-bottom:0">Enter buyer percentages and costs to compare scenario proceeds. Actual recovery payouts remain unpriced.</p>';
  anchor.insertAdjacentElement('afterend',box);
  IDS.forEach(function(id){E(id).addEventListener(id.endsWith('-unit')?'change':'input',function(){update(true)})});
  E('spike-gold-one-point').onclick=function(){E('spike-gold-amount').value='1';E('spike-gold-unit').value='scale_points';update(true)};
  E('br-whole')?.addEventListener('input',function(){update(false)});
  E('spike-board-weight')?.addEventListener('input',function(){update(true)});
  E('spike-weight-unit')?.addEventListener('change',function(){update(true)});
  return true;
}
function restore(){
  const p=read(),s=p?.planning?.goldRecoveryScenario;
  const input=s&&s.version===1&&s.kind==='hypothetical'&&s.caseId===token(p)?s.input:null;
  E('spike-gold-amount').value=input?(input.amount==null?'':String(input.amount)):'1';
  E('spike-gold-unit').value=input&&['scale_points','g','mg'].includes(input.unit)?input.unit:'scale_points';
  [['spike-gold-pay-percent','buyerPayPercent'],['spike-gold-costs','costs'],['spike-gold-minutes','minutes']].forEach(function(pair){E(pair[0]).value=input&&input[pair[1]]!=null?String(input[pair[1]]):''});
  const saved=p?.planning?.materialRecoveryScenario;
  const valid=saved&&saved.version===1&&saved.kind==='hypothetical'&&saved.caseId===token(p)&&Array.isArray(saved.materials);
  ['silver','copper'].forEach(function(id){
    const row=valid&&saved.materials.find(x=>x&&x.metal===id),v=row?.input;
    E('spike-'+id+'-amount').value=v&&v.amount!=null?String(v.amount):'';
    E('spike-'+id+'-unit').value=v&&['g','mg'].concat(id==='copper'?['lb','kg']:[]).includes(v.unit)?v.unit:'g';
    E('spike-'+id+'-pay-percent').value=v&&v.buyerPayPercent!=null?String(v.buyerPayPercent):'';
  });
}
function calculate(){
  const amount=numeric('spike-gold-amount'),unit=E('spike-gold-unit').value;
  const factor={scale_points:0.1,g:1,mg:0.001}[unit];
  const grams=amount!=null&&factor?amount*factor:null;
  const input={amount:amount,unit:unit,buyerPayPercent:numeric('spike-gold-pay-percent'),costs:numeric('spike-gold-costs'),minutes:numeric('spike-gold-minutes')};
  const s={version:1,kind:'hypothetical',caseId:loadedCase,input:input,recoveredFineGrams:grams,status:'needs_yield',benchmark:null,grossMetalValue:null,netAfterEnteredCosts:null,hourlyAfterEnteredCosts:null,calculatedAt:new Date().toISOString()};
  if(grams==null||!Number.isFinite(grams)||grams<0){if(String(E('spike-gold-amount').value).trim()!==''||grams!=null)s.status='invalid_value';return s}
  const boardWeight=Number(read()?.planning?.weightGrams);
  if(boardWeight>0&&grams>boardWeight){s.status='exceeds_board_weight';return s}
  if(grams===0){s.status='excluded';s.grossMetalValue=0;return s}
  const q=window.getScrapRadarMetalBenchmark?.('gold'),price=Number(q?.price);
  const marketUnit=q?.unit,pricePerGram=marketUnit==='troy_oz'?price/TROY_GRAMS:marketUnit==='g'?price:null;
  if(!q?.available||q.price==null||!Number.isFinite(price)||price<=0||pricePerGram==null){s.status='needs_benchmark';return s}
  s.benchmark={price:price,unit:marketUnit,date:q.date||null,stale:q.stale===true||!q.date||!Number.isFinite(Date.parse(q.date)),source:q.source||'Scrap Radar market bridge'};
  const gross=grams*pricePerGram;
  if(!Number.isFinite(gross)){s.status='invalid_value';return s}
  s.grossMetalValue=cents(gross);if(s.grossMetalValue==null){s.status='invalid_value';return s}s.status='calculated';
  if(!s.benchmark.stale&&input.buyerPayPercent!=null&&input.buyerPayPercent<=100&&input.costs!=null){
    const net=gross*input.buyerPayPercent/100-input.costs;
    if(Number.isFinite(net)){s.netAfterEnteredCosts=cents(net);if(input.minutes>0&&Number.isFinite(net*60/input.minutes))s.hourlyAfterEnteredCosts=cents(net*60/input.minutes)}
  }
  return s;
}
function pricePerGram(q,id){
  const price=Number(q?.price);if(q?.price==null||!Number.isFinite(price)||price<=0)return null;
  if(q.unit==='g')return price;
  if(['gold','silver'].includes(id)&&q.unit==='troy_oz')return price/TROY_GRAMS;
  if(id==='copper'&&q.unit==='lb')return price/LB_GRAMS;
  if(id==='copper'&&q.unit==='kg')return price/1000;
  if(id==='copper'&&q.unit==='metric_ton')return price/1000000;
  return null;
}
function calculateAdditional(id){
  const amount=numeric('spike-'+id+'-amount'),unit=E('spike-'+id+'-unit').value;
  const factor={g:1,mg:0.001,lb:LB_GRAMS,kg:1000}[unit];
  const grams=amount!=null&&factor?amount*factor:null;
  const row={metal:id,input:{amount:amount,unit:unit,buyerPayPercent:numeric('spike-'+id+'-pay-percent')},recoveredGrams:grams,status:'needs_yield',benchmark:null,grossMetalValue:null};
  if(grams==null){if(String(E('spike-'+id+'-amount').value).trim()!=='')row.status='invalid_value';return row}
  if(!Number.isFinite(grams)){row.status='invalid_value';return row}
  const weight=Number(read()?.planning?.weightGrams);
  if(weight>0&&grams>weight){row.status='exceeds_board_weight';return row}
  if(grams===0){row.status='excluded';row.grossMetalValue=0;return row}
  const q=window.getScrapRadarMetalBenchmark?.(id),rate=pricePerGram(q,id);
  if(!q?.available||rate==null){row.status='needs_benchmark';return row}
  row.benchmark={price:Number(q.price),unit:q.unit,date:q.date||null,stale:q.stale===true||!q.date||!Number.isFinite(Date.parse(q.date)),source:q.source||'Scrap Radar market bridge'};
  const gross=grams*rate;
  if(!Number.isFinite(gross)){row.status='invalid_value';return row}
  row.grossMetalValue=cents(gross);row.status=row.grossMetalValue==null?'invalid_value':'calculated';return row;
}
function exactGross(row){return row.recoveredGrams===0?0:row.recoveredGrams*pricePerGram(row.benchmark,row.metal)}
function calculateBreakdown(gold){
  const rows=[{metal:'gold',input:{amount:gold.input.amount,unit:gold.input.unit,buyerPayPercent:gold.input.buyerPayPercent},recoveredGrams:gold.recoveredFineGrams,status:gold.status,benchmark:gold.benchmark,grossMetalValue:gold.grossMetalValue},calculateAdditional('silver'),calculateAdditional('copper')];
  const mass=rows.reduce((sum,row)=>sum+(row.recoveredGrams==null?0:row.recoveredGrams),0),weight=Number(read()?.planning?.weightGrams);
  const missing=rows.filter(row=>row.recoveredGrams==null).map(row=>row.metal);
  const unpriced=rows.filter(row=>row.recoveredGrams!=null&&row.grossMetalValue==null).map(row=>row.metal);
  const s={version:1,kind:'hypothetical',caseId:loadedCase,materials:rows,input:{costs:gold.input.costs,minutes:gold.input.minutes},knownRecoveredGrams:mass,missingQuantities:missing,unpricedMetals:unpriced,status:'needs_yields',grossMetalValue:null,netAfterEnteredCosts:null,hourlyAfterEnteredCosts:null,calculatedAt:new Date().toISOString()};
  if(!Number.isFinite(mass)||rows.some(row=>row.status==='invalid_value')){s.status='invalid_value';return s}
  if(rows.some(row=>row.status==='exceeds_board_weight')||(weight>0&&mass>weight+1e-9*Math.max(1,weight))){s.status='exceeds_board_weight';return s}
  const priced=rows.filter(row=>row.grossMetalValue!=null);
  if(!priced.length)return s;
  const gross=priced.reduce((sum,row)=>sum+exactGross(row),0);
  if(!Number.isFinite(gross)){s.status='invalid_value';return s}
  s.grossMetalValue=cents(gross);if(s.grossMetalValue==null){s.status='invalid_value';return s}s.status=missing.length||unpriced.length?'partial':'complete';
  // Terms differ by metal. Apply each entered percentage before subtracting
  // shared recovery costs once; unpriced entered metal blocks scenario proceeds.
  const termsOK=rows.every(row=>row.input.buyerPayPercent==null||row.input.buyerPayPercent<=100)&&priced.every(row=>row.recoveredGrams===0||row.input.buyerPayPercent!=null);
  s.staleBenchmarks=priced.filter(row=>row.benchmark?.stale).map(row=>row.metal);
  if(!s.staleBenchmarks.length&&!unpriced.length&&termsOK&&gold.input.costs!=null){
    const payout=priced.reduce((sum,row)=>sum+exactGross(row)*(row.recoveredGrams===0?0:row.input.buyerPayPercent/100),0),net=payout-gold.input.costs;
    if(Number.isFinite(net)){s.netAfterEnteredCosts=cents(net);if(gold.input.minutes>0&&Number.isFinite(net*60/gold.input.minutes))s.hourlyAfterEnteredCosts=cents(net*60/gold.input.minutes)}
  }
  return s;
}
function showBreakdown(s){
  s.materials.filter(row=>row.metal!=='gold').forEach(function(row){
    const id=row.metal;let note='Enter an assumed recovered '+id+' amount. Blank quantities remain unknown; enter 0 only to exclude a metal from this scenario.';
    text('spike-'+id+'-gross',row.grossMetalValue!=null?cash(row.grossMetalValue):'—');
    if(row.status==='excluded')note=LABELS[id]+' excluded by your entered zero; no yield is assumed.';
    else if(row.status==='needs_benchmark')note=LABELS[id]+' benchmark unavailable or unsupported. Refresh Prices; this entered metal is not included in the subtotal.';
    else if(row.status==='exceeds_board_weight')note='Assumed recovered '+id+' exceeds this board’s scale weight.';
    else if(row.status==='invalid_value')note='Check the assumed '+id+' amount; enter a nonnegative amount that can be calculated.';
    else if(row.status==='calculated'){
      const q=row.benchmark,unit={troy_oz:'troy oz',metric_ton:'metric ton'}[q.unit]||q.unit;
      const quote='$'+q.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
      note=Number(row.recoveredGrams.toPrecision(8))+' g recovered '+id+' (assumed). Benchmark '+quote+'/'+unit+' • price date '+(q.date||'unverified')+(q.stale?' • stale or unverified; confirm before use':'')+'.';
    }
    text('spike-'+id+'-basis',note);
  });
  text('spike-material-total-label',s.status==='complete'?'Gold + silver + copper • gross metal value':'Priced metal subtotal • partial scenario');
  text('spike-material-gross',s.grossMetalValue!=null?cash(s.grossMetalValue):'—');
  text('spike-material-net-label',s.status==='complete'?'Scenario after entered costs:':'Partial scenario after entered costs:');
  text('spike-gold-net',s.netAfterEnteredCosts!=null?cash(s.netAfterEnteredCosts):'—');
  text('spike-gold-hourly',s.hourlyAfterEnteredCosts!=null?' • '+cash(s.hourlyAfterEnteredCosts)+'/hr':'');
  let note='Gold, silver and copper only. Other materials and residual board value are not included. Individual values are rounded; the subtotal uses full precision.';
  if(s.missingQuantities.length)note+=' Quantities still unknown: '+s.missingQuantities.map(id=>LABELS[id]).join(', ')+'.';
  if(s.unpricedMetals.length)note+=' Entered metal still unpriced: '+s.unpricedMetals.map(id=>LABELS[id]).join(', ')+'.';
  if(s.status==='exceeds_board_weight')note='Combined recovered metal exceeds this board’s scale weight. Adjust the assumed quantities before using a total.';
  else if(s.status==='invalid_value')note='Check the assumed recovered weights; one or more amounts are invalid or too large to calculate.';
  else if(s.status!=='needs_yields')note+=' Assumed metal mass: '+Number(s.knownRecoveredGrams.toPrecision(8))+' g.';
  if(s.materials.some(row=>row.benchmark?.stale))note+=' One or more benchmarks are stale or unverified; net proceeds are withheld until fresh prices arrive.';
  text('spike-material-basis',note);
  const invalidTerms=s.materials.some(row=>row.input.buyerPayPercent>100);
  text('spike-gold-net-note',invalidTerms?'Buyer percentage must be between 0 and 100 for every metal.':s.staleBenchmarks?.length?'Refresh Prices before comparing net proceeds. The dated gross example remains visible; yields and buyer terms are still assumptions.':s.netAfterEnteredCosts!=null?'Uses each priced metal’s entered buyer percentage; total recovery costs are subtracted once. '+(s.status==='partial'?'Partial estimate only; unknown quantities remain excluded. ':'')+'Actual recovery payouts remain unpriced.':'Enter a buyer percentage for each nonzero priced metal and total costs to see scenario proceeds. Actual recovery payouts remain unpriced; board yields are assumptions.');
}
function update(persist){
  if(!ensure())return true;
  const whole=numeric('br-whole');text('spike-gold-whole',whole!=null?cash(whole):'—');
  text('spike-gold-whole-label',E('br-whole')?.dataset.basis==='entered_offer'?'Sell whole (entered offer)':'Sell whole (planning)');
  const bound=validBinding();IDS.concat(['spike-gold-one-point']).forEach(function(id){E(id).disabled=!bound});
  if(!bound){['spike-gold-gross','spike-gold-net','spike-silver-gross','spike-copper-gross','spike-material-gross'].forEach(function(id){text(id,'—')});text('spike-gold-hourly','');text('spike-gold-basis','The saved board case changed. Reload Scrap Radar before saving a scenario.');text('spike-material-basis','The saved board case changed. Reload before entering recovery amounts.');return false}
  const s=calculate(),breakdown=calculateBreakdown(s);text('spike-gold-gross',s.grossMetalValue!=null?cash(s.grossMetalValue):'—');
  let note='Enter an assumed recovered gold weight.';
  if(s.status==='exceeds_board_weight')note='Assumed recovered gold exceeds this board’s scale weight. Enter an amount within the board weight.';
  else if(s.status==='needs_benchmark')note='Gold benchmark unavailable. Tap Refresh Prices to check the market feed. No gold value is calculated without a benchmark.';
  else if(s.status==='invalid_value')note='Check the assumed gold weight; enter a nonnegative amount that can be calculated.';
  else if(s.status==='excluded')note='Gold excluded by your entered zero; no yield is assumed.';
  else if(s.status==='calculated'){
    const q=s.benchmark,pricePerGram=q.unit==='g'?q.price:q.price/TROY_GRAMS;
    const entry=s.input.unit==='scale_points'?s.input.amount+' scale point'+(s.input.amount===1?'':'s')+' = ':'';
    note=entry+Number(s.recoveredFineGrams.toPrecision(8))+' g recovered gold (assumed) × '+cash(pricePerGram)+'/g. Gold benchmark '+cash(q.price)+'/'+(q.unit==='g'?'g':'troy oz')+' • price date '+(q.date||'unverified')+(q.stale?' • stale or unverified; confirm before use':'')+'. Gross metal value before buyer deductions and recovery costs.';
  }
  text('spike-gold-basis',note);
  showBreakdown(breakdown);
  if(persist&&loadedCase){
    const p=read();if(token(p)!==loadedCase)return false;
    p.planning=Object.assign({},p.planning,{goldRecoveryScenario:s,materialRecoveryScenario:breakdown});
    try{localStorage.setItem(KEY,JSON.stringify(p))}
    catch(_){text('spike-gold-basis','Could not save this scenario. Check browser storage before returning to Board Sense.');return false}
  }
  return true;
}
function init(){if(!ensure())return;restore();update(true);window.ScrapRadarOperatingProfile?.attachRecoveryCosts()}
window.ScrapRadarGoldScenario={save:function(){return update(true)},refresh:function(){return update(false)}};
window.addEventListener('scrapRadarMarketUpdated',function(){update(true)});
window.addEventListener('storage',function(e){if(e.key===KEY||e.key===null){if(validBinding()&&E('spike-gold-scenario'))restore();update(false)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
