(function(){
'use strict';
function el(id){return document.getElementById(id)}
function num(id){const x=el(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function val(id){return el(id)?.value??''}
function cash(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function set(id,text){const x=el(id);if(x)x.textContent=text}

function ensureCard(){
  const panel=el('board-recovery');
  const grid=panel?.querySelector('.recovery-path-grid');
  if(!panel||!grid)return null;
  let card=el('br-economic-card');
  if(!card){
    card=document.createElement('div');
    card.id='br-economic-card';
    card.className='eval-decision recovery-economic-decision';
    card.setAttribute('aria-live','polite');
    card.innerHTML='<strong id="br-economic-title">RECOVERY RECOMMENDATION</strong><small id="br-economic-detail">Enter board values to compare the recovery paths.</small>';
    grid.insertAdjacentElement('afterend',card);
  }
  const old=panel.querySelector('.recovery-decision');
  if(old&&old!==card)old.style.display='none';
  return card;
}

function logistics(prefix,mpg,gas){
  const miles=Math.max(0,num('br-'+prefix+'-miles')||0);
  const fees=Math.max(0,num('br-'+prefix+'-fees')||0);
  const travel=Math.max(0,num('br-'+prefix+'-travel')||0);
  const fuel=mpg!==null&&mpg>0&&gas!==null&&gas>=0?(miles*2/mpg)*gas:0;
  return {miles,fees,travel,fuel,cost:fuel+fees};
}

function recalc(){
  if(!ensureCard())return;
  const mpg=num('br-shared-mpg')!==null?num('br-shared-mpg'):num('trip-mpg');
  const gas=num('br-shared-gas')!==null?num('br-shared-gas'):num('trip-gas');
  const target=num('trip-target');
  const wholeOffer=num('br-whole');
  // A cost or time entry alone does not establish a recovery value.
  const partialEntered=['br-partial-value','br-residual'].some(id=>val(id)!=='');
  const fullEntered=['br-full-value','br-full-residual'].some(id=>val(id)!=='');
  const wl=logistics('whole',mpg,gas),pl=logistics('partial',mpg,gas),fl=logistics('full',mpg,gas);
  const paths=[];
  if(wholeOffer!==null)paths.push({name:'SELL WHOLE',net:wholeOffer-wl.cost,minutes:wl.travel});
  if(partialEntered){
    const net=Math.max(0,num('br-partial-value')||0)+Math.max(0,num('br-residual')||0)-Math.max(0,num('br-partial-costs')||0)-pl.cost;
    paths.push({name:'SELECTIVE HARVEST',net,minutes:Math.max(0,num('br-partial-minutes')||0)+pl.travel});
  }
  if(fullEntered){
    const net=Math.max(0,num('br-full-value')||0)+Math.max(0,num('br-full-residual')||0)-Math.max(0,num('br-full-costs')||0)-fl.cost;
    paths.push({name:'DEEPER RECOVERY',net,minutes:Math.max(0,num('br-full-minutes')||0)+fl.travel});
  }
  if(!paths.length){
    set('br-economic-title','RECOVERY RECOMMENDATION');
    set('br-economic-detail','No recovery path has a value yet. Add a board weight for the whole-board estimate, or enter a verified buyer quote or recovery value.');
    return;
  }
  const missing=['SELL WHOLE','SELECTIVE HARVEST','DEEPER RECOVERY'].filter(name=>!paths.some(p=>p.name===name));
  const planning=el('br-whole')?.dataset.basis==='planning_estimate';
  const estimateNote=planning?'The whole-board value is a planning estimate, not a buyer offer. ':'';
  const missingNote=missing.length?' Still unpriced: '+missing.join(' and ')+'.':'';
  const costNote=' Blank travel, processing, and time inputs are excluded.';
  if(paths.length===1){
    const only=paths[0];
    set('br-economic-title',planning?'📌 WHOLE-BOARD PLANNING ESTIMATE':'📌 ONE PATH PRICED: '+only.name);
    set('br-economic-detail',estimateNote+only.name+' shows '+cash(only.net)+' after entered costs. No recovery winner can be named yet.'+missingNote+costNote);
    return;
  }
  const highest=[...paths].sort((a,b)=>b.net-a.net)[0];
  if(target!==null&&target>=0){
    paths.forEach(p=>p.score=p.net-(p.minutes/60)*target);
    const best=[...paths].sort((a,b)=>b.score-a.score)[0];
    set('br-economic-title',missing.length||planning?'⏱️ LIMITED PLANNING COMPARISON: '+best.name:'⏱️ ECONOMIC RECOMMENDATION: '+best.name);
    const fuelText=gas!==null?' Fuel '+cash(gas)+'/gal is included.':'';
    set('br-economic-detail',estimateNote+'Highest priced net: '+highest.name+' at '+cash(highest.net)+'. At your '+cash(target)+'/hr target, '+best.name+' has the strongest net-after-time score among priced paths using '+best.minutes.toFixed(0)+' entered minutes.'+fuelText+missingNote+costNote);
    return;
  }
  set('br-economic-title',missing.length||planning?'📌 HIGHEST OF '+paths.length+' PRICED PATHS: '+highest.name:'📌 HIGHEST ENTERED NET: '+highest.name);
  set('br-economic-detail',estimateNote+highest.name+' shows '+cash(highest.net)+' after entered costs among the priced paths.'+missingNote+' Enter an hourly target to compare the value of your time.'+costNote);
}

function schedule(){setTimeout(recalc,0)}
function relevant(node){
  const id=node?.id||'';
  return id==='trip-target'||id==='trip-mpg'||id==='trip-gas'||id.startsWith('br-');
}
function bind(){
  ensureCard();
  document.addEventListener('input',e=>{if(relevant(e.target))schedule()},true);
  document.addEventListener('change',e=>{if(relevant(e.target))schedule()},true);
  new MutationObserver(()=>{ensureCard();schedule()}).observe(document.body,{childList:true,subtree:true});
  setTimeout(recalc,250);
  setTimeout(recalc,900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
