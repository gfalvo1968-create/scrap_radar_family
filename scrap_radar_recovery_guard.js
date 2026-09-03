(function(){
'use strict';
function el(id){return document.getElementById(id)}
function num(id){const x=el(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function cash(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function set(id,value){const x=el(id);if(x)x.textContent=value}
function value(id){return el(id)?.value??''}

function ensureStyle(){
  if(el('br-logistics-style'))return;
  const s=document.createElement('style');
  s.id='br-logistics-style';
  s.textContent=`
  .br-logistics{margin:14px 0;padding:14px;border:1px solid rgba(65,220,255,.26);border-radius:14px;background:rgba(0,18,20,.62)}
  .br-logistics h3{margin:0 0 5px;color:#bff7ff;font-size:1rem}.br-logistics p{margin:0 0 12px;color:#7fa6a8;font-size:.82rem;line-height:1.4}
  .br-logistics-shared{display:grid;grid-template-columns:repeat(2,minmax(0,220px));gap:10px;margin-bottom:11px}.br-shared-field{display:block;color:#a9dfe3;font-size:.78rem}.br-shared-field input{width:100%;box-sizing:border-box;margin-top:4px;background:#010b0d;border:1px solid rgba(65,220,255,.35);color:#efffff;border-radius:9px;padding:9px;font:inherit}
  .br-logistics-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.br-logistics-card{padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#020805}
  .br-logistics-card b{display:block;color:#d9ffe0;margin-bottom:7px}.br-logistics-card label{display:block;color:#8fb89a;font-size:.78rem;margin-top:7px}.br-logistics-card input{width:100%;box-sizing:border-box;margin-top:4px;background:#010704;border:1px solid rgba(57,255,20,.28);color:#effff2;border-radius:9px;padding:8px;font:inherit}
  .br-logistics-cost{display:block;margin-top:9px;color:#7defff;font-weight:800}.br-logistics-note{display:block;margin-top:9px;color:#6e8b75;font-size:.72rem;line-height:1.35}
  @media(max-width:760px){.br-logistics-grid,.br-logistics-shared{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}

function syncFromEvaluator(){
  const mpg=el('br-shared-mpg'),gas=el('br-shared-gas');
  if(mpg&&el('trip-mpg')&&document.activeElement!==mpg)mpg.value=el('trip-mpg').value;
  if(gas&&el('trip-gas')&&document.activeElement!==gas)gas.value=el('trip-gas').value;
}

function syncToEvaluator(sharedId,tripId){
  const shared=el(sharedId),trip=el(tripId);if(!shared||!trip)return;
  trip.value=shared.value;
  trip.dispatchEvent(new Event('input',{bubbles:true}));
}

function ensureLogistics(){
  if(el('br-logistics'))return;
  const anchor=document.querySelector('#board-recovery .recovery-decision');
  if(!anchor)return;
  ensureStyle();
  const box=document.createElement('div');
  box.id='br-logistics';box.className='br-logistics';
  box.innerHTML=`
    <h3>🚚 Recovery Logistics</h3>
    <p>Distance and fuel can change the winning path. MPG and fuel stay synchronized with the Load + Trip Evaluator, but you can enter them right here.</p>
    <div class="br-logistics-shared">
      <label class="br-shared-field">Vehicle MPG<input id="br-shared-mpg" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter MPG"></label>
      <label class="br-shared-field">Fuel $ / Gallon<input id="br-shared-gas" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter fuel price"></label>
    </div>
    <div class="br-logistics-grid">
      <div class="br-logistics-card"><b>SELL WHOLE</b><label>Buyer miles one way<input id="br-whole-miles" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Travel minutes<input id="br-whole-travel" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Tolls / fees $<input id="br-whole-fees" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00"></label><span id="br-whole-log-cost" class="br-logistics-cost">Travel cost $0.00</span></div>
      <div class="br-logistics-card"><b>SELECTIVE HARVEST</b><label>Buyer/refiner miles one way<input id="br-partial-miles" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Travel minutes<input id="br-partial-travel" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Tolls / fees $<input id="br-partial-fees" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00"></label><span id="br-partial-log-cost" class="br-logistics-cost">Travel cost $0.00</span></div>
      <div class="br-logistics-card"><b>DEEPER RECOVERY</b><label>Buyer/refiner miles one way<input id="br-full-miles" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Travel minutes<input id="br-full-travel" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label><label>Tolls / fees $<input id="br-full-fees" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00"></label><span id="br-full-log-cost" class="br-logistics-cost">Travel cost $0.00</span></div>
    </div>
    <small class="br-logistics-note">Travel minutes are entered separately so Scrap Radar never invents an average road speed. Recovery minutes + travel minutes become the total time for that path.</small>`;
  anchor.parentNode.insertBefore(box,anchor);
  syncFromEvaluator();
}

function tripCost(prefix,mpg,gas){
  const miles=Math.max(0,num('br-'+prefix+'-miles')||0);
  const fees=Math.max(0,num('br-'+prefix+'-fees')||0);
  const fuel=mpg!==null&&mpg>0&&gas!==null&&gas>=0?(miles*2/mpg)*gas:0;
  return {miles,fees,fuel,total:fuel+fees,travel:Math.max(0,num('br-'+prefix+'-travel')||0)};
}

function pathData(){
  const mpg=num('br-shared-mpg')!==null?num('br-shared-mpg'):num('trip-mpg');
  const gas=num('br-shared-gas')!==null?num('br-shared-gas'):num('trip-gas');
  const target=num('trip-target');
  const wholeOffer=num('br-whole');
  const partialValue=Math.max(0,num('br-partial-value')||0);
  const partialResidual=Math.max(0,num('br-residual')||0);
  const partialCosts=Math.max(0,num('br-partial-costs')||0);
  const partialWork=Math.max(0,num('br-partial-minutes')||0);
  const fullValue=Math.max(0,num('br-full-value')||0);
  const fullResidual=Math.max(0,num('br-full-residual')||0);
  const fullCosts=Math.max(0,num('br-full-costs')||0);
  const fullWork=Math.max(0,num('br-full-minutes')||0);
  const partialEntered=['br-partial-value','br-residual','br-partial-costs'].some(id=>value(id)!=='');
  const fullEntered=['br-full-value','br-full-residual','br-full-costs'].some(id=>value(id)!=='');
  const wl=tripCost('whole',mpg,gas),pl=tripCost('partial',mpg,gas),fl=tripCost('full',mpg,gas);
  const whole=wholeOffer===null?null:wholeOffer-wl.total;
  const partial=partialEntered?partialValue+partialResidual-partialCosts-pl.total:null;
  const full=fullEntered?fullValue+fullResidual-fullCosts-fl.total:null;
  const wholeMinutes=wl.travel;
  const partialMinutes=partialWork+pl.travel;
  const fullMinutes=fullWork+fl.travel;
  return {mpg,gas,target,wholeOffer,whole,partial,full,wholeMinutes,partialMinutes,fullMinutes,wl,pl,fl};
}

function updateLogistics(d){
  set('br-whole-log-cost','Travel cost '+cash(d.wl.total));
  set('br-partial-log-cost','Travel cost '+cash(d.pl.total));
  set('br-full-log-cost','Travel cost '+cash(d.fl.total));
  set('br-whole-net',d.whole===null?'$0.00':cash(d.whole));
  set('br-partial-net',d.partial===null?'$0.00':cash(d.partial));
  set('br-full-net',d.full===null?'$0.00':cash(d.full));
}

function compareRate(path,whole){
  if(!whole)return null;
  const extraNet=path.net-whole.net;
  const extraMinutes=path.minutes-whole.minutes;
  if(extraNet>0&&extraMinutes<=0)return {rate:Infinity,extraNet,extraMinutes,dominates:true};
  if(extraNet>0&&extraMinutes>0)return {rate:extraNet/(extraMinutes/60),extraNet,extraMinutes,dominates:false};
  return {rate:null,extraNet,extraMinutes,dominates:false};
}

function recalc(){
  ensureLogistics();
  if(!el('br-decision'))return;
  const d=pathData();
  updateLogistics(d);
  const paths=[];
  if(d.whole!==null)paths.push({name:'SELL WHOLE',net:d.whole,minutes:d.wholeMinutes,kind:'whole'});
  if(d.partial!==null)paths.push({name:'SELECTIVE HARVEST',net:d.partial,minutes:d.partialMinutes,kind:'partial'});
  if(d.full!==null)paths.push({name:'DEEPER RECOVERY',net:d.full,minutes:d.fullMinutes,kind:'full'});
  if(!paths.length){set('br-decision','ENTER BOARD VALUES');set('br-detail','Use known offers, recovered values, time, distance and costs.');return}

  const whole=paths.find(p=>p.kind==='whole')||null;
  const partial=paths.find(p=>p.kind==='partial')||null;
  const full=paths.find(p=>p.kind==='full')||null;
  const pr=partial&&whole?compareRate(partial,whole):null;
  const fr=full&&whole?compareRate(full,whole):null;
  if(partial)set('br-partial-hourly',pr&&pr.rate===Infinity?'Faster + higher net vs whole':pr&&pr.rate!==null?cash(pr.rate)+'/hr incremental vs whole':'— / hr incremental vs whole');
  if(full)set('br-full-hourly',fr&&fr.rate===Infinity?'Faster + higher net vs whole':fr&&fr.rate!==null?cash(fr.rate)+'/hr incremental vs whole':'— / hr incremental vs whole');

  const highest=[...paths].sort((a,b)=>b.net-a.net)[0];
  const hasTarget=d.target!==null&&d.target>=0;
  if(hasTarget){
    paths.forEach(p=>p.score=p.net-(p.minutes/60)*d.target);
    const best=[...paths].sort((a,b)=>b.score-a.score)[0];
    set('br-decision','⏱️ ECONOMIC RECOMMENDATION: '+best.name);
    const highText='Highest entered net is '+highest.name+' at '+cash(highest.net)+'. ';
    const travelText='Fuel is '+(d.gas!==null?cash(d.gas)+'/gal':'not entered')+' and the entered path distances are included. ';
    const timeText=best.minutes>0?'At your '+cash(d.target)+'/hr target, '+best.name+' has the strongest net-after-time score using '+best.minutes.toFixed(0)+' total entered minutes. ':'At your '+cash(d.target)+'/hr target, '+best.name+' preserves the most value after entered logistics and time.';
    set('br-detail',highText+travelText+timeText);
    return;
  }

  const timed=[partial,full].filter(Boolean).map(p=>({path:p,cmp:whole?compareRate(p,whole):null})).filter(x=>x.cmp&&(x.cmp.rate===Infinity||x.cmp.rate!==null));
  if(timed.length){
    timed.sort((a,b)=>{const ar=a.cmp.rate===Infinity?Number.MAX_VALUE:a.cmp.rate;const br=b.cmp.rate===Infinity?Number.MAX_VALUE:b.cmp.rate;return br-ar});
    const best=timed[0];
    set('br-decision','⏱️ BEST ENTERED TIME-VALUE: '+best.path.name);
    set('br-detail','Highest entered net is '+highest.name+' at '+cash(highest.net)+'. '+best.path.name+' has the strongest entered incremental time-value after travel costs. Enter an hourly target for a full economic recommendation.');
    return;
  }

  set('br-decision','📌 HIGHEST ENTERED NET: '+highest.name);
  set('br-detail',highest.name+' currently shows '+cash(highest.net)+' after entered travel costs. Add travel minutes and an hourly target to compare the value of your time as well as fuel and distance.');
}

function schedule(){setTimeout(recalc,0)}
function bind(){
  ensureLogistics();
  el('br-shared-mpg')?.addEventListener('input',()=>{syncToEvaluator('br-shared-mpg','trip-mpg');schedule()});
  el('br-shared-gas')?.addEventListener('input',()=>{syncToEvaluator('br-shared-gas','trip-gas');schedule()});
  ['trip-mpg','trip-gas'].forEach(id=>el(id)?.addEventListener('input',()=>{syncFromEvaluator();schedule()}));
  ['br-whole','br-partial-value','br-residual','br-partial-minutes','br-partial-costs','br-full-value','br-full-residual','br-full-minutes','br-full-costs','trip-target','br-whole-miles','br-whole-travel','br-whole-fees','br-partial-miles','br-partial-travel','br-partial-fees','br-full-miles','br-full-travel','br-full-fees'].forEach(id=>{
    const node=el(id);if(!node)return;node.addEventListener('input',schedule);node.addEventListener('change',schedule);
  });
  setTimeout(()=>{syncFromEvaluator();recalc()},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
