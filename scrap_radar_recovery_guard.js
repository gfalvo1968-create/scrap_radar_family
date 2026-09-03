(function(){
'use strict';
function el(id){return document.getElementById(id)}
function num(id){const x=el(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function cash(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function set(id,value){const x=el(id);if(x)x.textContent=value}

function pathData(){
  const whole=num('br-whole');
  const partialValue=Math.max(0,num('br-partial-value')||0);
  const partialResidual=Math.max(0,num('br-residual')||0);
  const partialCosts=Math.max(0,num('br-partial-costs')||0);
  const partialMinutes=num('br-partial-minutes');
  const fullValue=Math.max(0,num('br-full-value')||0);
  const fullResidual=Math.max(0,num('br-full-residual')||0);
  const fullCosts=Math.max(0,num('br-full-costs')||0);
  const fullMinutes=num('br-full-minutes');
  const partialEntered=['br-partial-value','br-residual','br-partial-costs'].some(id=>el(id)?.value!=='');
  const fullEntered=['br-full-value','br-full-residual','br-full-costs'].some(id=>el(id)?.value!=='');
  const partial=partialEntered?partialValue+partialResidual-partialCosts:null;
  const full=fullEntered?fullValue+fullResidual-fullCosts:null;
  const partialRate=partial!==null&&partialMinutes!==null&&partialMinutes>0?((whole!==null?partial-whole:partial)/(partialMinutes/60)):null;
  const fullRate=full!==null&&fullMinutes!==null&&fullMinutes>0?((whole!==null?full-whole:full)/(fullMinutes/60)):null;
  return {whole,partial,full,partialMinutes,fullMinutes,partialRate,fullRate,target:num('trip-target')};
}

function refreshRates(d){
  if(d.partialRate===null)set('br-partial-hourly','— / hr');
  else set('br-partial-hourly',cash(d.partialRate)+'/hr '+(d.whole!==null?'incremental vs whole':'entered value rate'));
  if(d.fullRate===null)set('br-full-hourly','— / hr');
  else set('br-full-hourly',cash(d.fullRate)+'/hr '+(d.whole!==null?'incremental vs whole':'entered value rate'));
}

function recalc(){
  if(!el('br-decision'))return;
  const d=pathData();
  refreshRates(d);
  const paths=[];
  if(d.whole!==null)paths.push({name:'SELL WHOLE',net:d.whole,rate:null,minutes:0});
  if(d.partial!==null)paths.push({name:'SELECTIVE HARVEST',net:d.partial,rate:d.partialRate,minutes:d.partialMinutes});
  if(d.full!==null)paths.push({name:'DEEPER RECOVERY',net:d.full,rate:d.fullRate,minutes:d.fullMinutes});
  if(!paths.length){
    set('br-decision','ENTER BOARD VALUES');
    set('br-detail','Use known offers, recovered values, time and costs. Do not add value just because a component looks valuable.');
    return;
  }

  const highest=[...paths].sort((a,b)=>b.net-a.net)[0];
  const timed=paths.filter(p=>p.name!=='SELL WHOLE'&&p.rate!==null&&Number.isFinite(p.rate));
  const positiveTimed=timed.filter(p=>d.whole===null?p.net>0:p.net>d.whole);
  const bestTime=[...positiveTimed].sort((a,b)=>b.rate-a.rate)[0]||null;
  const hasTarget=d.target!==null&&d.target>=0;

  if(d.whole!==null&&timed.length&&hasTarget){
    const clears=[...positiveTimed].filter(p=>p.rate>=d.target).sort((a,b)=>b.rate-a.rate);
    if(!clears.length){
      set('br-decision','✅ TIME-VALUE RECOMMENDATION: SELL WHOLE');
      const timeText=bestTime?bestTime.name+' has the best entered recovery time rate at '+cash(bestTime.rate)+'/hr incremental, but that is below your '+cash(d.target)+'/hr target. ':'No entered recovery path currently improves on selling whole at a verified time rate. ';
      set('br-detail','Highest entered net is '+highest.name+' at '+cash(highest.net)+'. '+timeText+'Selling whole preserves your time unless additional verified value changes the math.');
      return;
    }
    const best=clears[0];
    set('br-decision','⏱️ BEST TIME-VALUE ABOVE TARGET: '+best.name);
    set('br-detail',best.name+' adds '+cash(best.net-d.whole)+' over selling whole at '+cash(best.rate)+'/hr incremental, clearing your '+cash(d.target)+'/hr target. Highest entered net is '+highest.name+' at '+cash(highest.net)+'.');
    return;
  }

  if(bestTime){
    set('br-decision','⏱️ BEST ENTERED TIME-VALUE: '+bestTime.name);
    const gain=d.whole!==null?' It adds '+cash(bestTime.net-d.whole)+' over selling whole.':'';
    const targetHint=hasTarget?' Your current target is '+cash(d.target)+'/hr.':' Enter an hourly target to judge whether the extra work clears your threshold.';
    set('br-detail',bestTime.name+' has the strongest entered time rate at '+cash(bestTime.rate)+'/hr.'+gain+' Highest entered net is '+highest.name+' at '+cash(highest.net)+'.'+targetHint);
    return;
  }

  set('br-decision','📌 HIGHEST ENTERED NET: '+highest.name);
  set('br-detail',highest.name+' currently shows '+cash(highest.net)+' net. Add recovery minutes and an hourly target to compare the value of your time, not just total dollars.');
}

function schedule(){setTimeout(recalc,0)}
function bind(){
  ['br-whole','br-partial-value','br-residual','br-partial-minutes','br-partial-costs','br-full-value','br-full-residual','br-full-minutes','br-full-costs','trip-target'].forEach(id=>{
    const node=el(id);if(!node)return;node.addEventListener('input',schedule);node.addEventListener('change',schedule);
  });
  setTimeout(recalc,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
