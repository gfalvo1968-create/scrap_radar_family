(function(){
'use strict';
function el(id){return document.getElementById(id)}
function num(id){const x=el(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function val(id){return el(id)?.value??''}
function cash(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function set(id,text){const x=el(id);if(x&&x.textContent!==text)x.textContent=text}

function ensureCard(){
  const panel=el('board-recovery');
  const grid=panel?.querySelector('.recovery-path-grid');
  if(!panel||!grid)return null;
  const yard=el('yard-comparison');
  if(yard&&!el('yard-recovery-targets')){
    const link=document.createElement('a');
    link.id='yard-recovery-targets';link.className='mini-btn';
    link.href='#br-break-even';link.textContent='↗ See Board Recovery Break-Even Targets';
    link.style.cssText='display:inline-block;margin:0 0 12px';
    yard.querySelector('.panel-kicker')?.insertAdjacentElement('afterend',link);
  }
  let card=el('br-economic-card');
  if(!card){
    card=document.createElement('div');
    card.id='br-economic-card';
    card.className='eval-decision recovery-economic-decision';
    card.setAttribute('aria-live','polite');
    card.innerHTML='<strong id="br-economic-title">RECOVERY RECOMMENDATION</strong><small id="br-economic-detail">Enter board values to compare the recovery paths.</small>';
    grid.insertAdjacentElement('afterend',card);
  }
  if(!el('br-break-even')){
    const box=document.createElement('div');
    box.id='br-break-even';
    box.className='eval-decision';
    box.setAttribute('aria-live','polite');
    box.innerHTML='<strong>↗ RECOVERY BREAK-EVEN TARGETS</strong><small id="br-break-even-basis">Enter a board weight to calculate a whole-board planning value.</small><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;margin-top:10px"><div style="padding:10px;border:1px solid rgba(57,255,20,.16);border-radius:10px"><b>SELECTIVE HARVEST</b><strong id="br-partial-target" style="margin-top:5px">—</strong><small>Minimum parts payout to match selling whole</small></div><div style="padding:10px;border:1px solid rgba(57,255,20,.16);border-radius:10px"><b>DEEPER RECOVERY</b><strong id="br-full-target" style="margin-top:5px">—</strong><small>Minimum material payout to match selling whole</small></div></div><small id="br-break-even-note">These are payout targets, not estimates of recoverable metal or a buyer quote.</small>';
    card.insertAdjacentElement('afterend',box);
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

function breakEven(whole,wl,pl,fl,target){
  if(whole===null||whole<0){
    set('br-partial-target','—');set('br-full-target','—');
    set('br-break-even-basis','Enter a board weight to calculate a whole-board planning value.');
    set('br-break-even-note','These are payout targets, not estimates of recoverable metal or a buyer quote.');
    return;
  }
  const rate=target!==null&&target>=0?target/60:0;
  const wholeScore=whole-wl.cost-wl.travel*rate;
  function needed(prefix,route,residual){
    const work=Math.max(0,num('br-'+prefix+'-minutes')||0);
    const processing=Math.max(0,num('br-'+prefix+'-costs')||0);
    // Round the required payout upward so the displayed cents never understate break-even.
    const exact=Math.max(0,wholeScore+route.cost+processing+(work+route.travel)*rate-Math.max(0,num(residual)||0));
    return Math.ceil(exact*100-1e-8)/100;
  }
  set('br-partial-target',cash(needed('partial',pl,'br-residual')));
  set('br-full-target',cash(needed('full',fl,'br-full-residual')));
  const planning=el('br-whole')?.dataset.basis==='planning_estimate';
  set('br-break-even-basis','Compared with '+cash(whole)+' '+(planning?'whole-board planning value':'entered whole-board value')+'.');
  set('br-break-even-note','Uses entered processing and travel costs'+(rate?' plus your hourly target for entered minutes':'')+'. Blank costs, time and residual values count as zero. These are minimum payout targets to match selling whole, not predicted recovery dollars or buyer quotes.');
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
  breakEven(wholeOffer,wl,pl,fl,target);
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
