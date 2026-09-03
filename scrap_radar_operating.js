(function(){
'use strict';

function el(id){return document.getElementById(id)}
function num(id){const node=el(id);if(!node||node.value==='')return null;const n=Number(node.value);return Number.isFinite(n)?n:null}
function money(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function fixed(v,d=1){return Number.isFinite(v)?Number(v).toFixed(d):'—'}

function calculateOperating(){
  const weight=num('calc-weight');
  const price=num('calc-price');
  const oneWay=Math.max(0,num('trip-miles')||0);
  const mpg=num('trip-mpg');
  const gas=num('trip-gas');
  const other=Math.max(0,num('trip-other')||0);
  const minutes=num('trip-minutes');
  const target=num('trip-target');

  const hasLoad=weight!==null&&weight>=0&&price!==null&&price>=0;
  const gross=hasLoad?weight*price:0;
  const roundTrip=oneWay*2;
  const gallons=mpg!==null&&mpg>0?roundTrip/mpg:0;
  const fuelCost=gas!==null&&gas>=0&&mpg!==null&&mpg>0?gallons*gas:0;
  const totalCosts=fuelCost+other;
  const net=hasLoad?gross-totalCosts:0;
  const hourly=hasLoad&&minutes!==null&&minutes>0?net/(minutes/60):null;

  if(el('calc-value'))el('calc-value').textContent=money(gross);
  if(el('op-roundtrip'))el('op-roundtrip').textContent=fixed(roundTrip,1)+' mi';
  if(el('op-fuel'))el('op-fuel').textContent=money(fuelCost);
  if(el('op-costs'))el('op-costs').textContent=money(totalCosts);
  if(el('op-net'))el('op-net').textContent=money(net);
  if(el('op-hourly'))el('op-hourly').textContent=hourly===null?'—':money(hourly)+'/hr';
  if(el('gauge-single-net'))el('gauge-single-net').textContent=money(net);

  let decision='ENTER LOAD DETAILS';
  let detail='Choose a material, enter weight and confirm the price basis.';
  if(hasLoad){
    if(net<0){decision='⚠️ LOAD IS NEGATIVE AFTER ENTERED COSTS';detail='The entered payout does not cover the fuel and other trip costs currently included.'}
    else if(hourly!==null&&target!==null&&target>=0){
      if(hourly>=target){decision='✅ MEETS YOUR HOURLY TARGET';detail=`Net return is ${money(hourly)}/hr against your ${money(target)}/hr target.`}
      else{decision='🟡 BELOW YOUR HOURLY TARGET';detail=`Net return is ${money(hourly)}/hr against your ${money(target)}/hr target.`}
    }else if(net>0){decision='🟢 NET POSITIVE ON ENTERED COSTS';detail='Add total job minutes and an hourly target to judge whether the trip is worth your time.'}
    else{decision='⚪ BREAK EVEN ON ENTERED COSTS';detail='The entered payout and entered trip costs are currently equal.'}
  }
  if(el('op-decision'))el('op-decision').textContent=decision;
  if(el('op-detail'))el('op-detail').textContent=detail;
}

function resetEvaluator(){['calc-weight','trip-miles','trip-mpg','trip-gas','trip-other','trip-minutes','trip-target'].forEach(id=>{const node=el(id);if(node)node.value=''});calculateOperating()}
function bindEvaluator(){['calc-material','calc-weight','calc-price','trip-miles','trip-mpg','trip-gas','trip-other','trip-minutes','trip-target'].forEach(id=>{const node=el(id);if(!node)return;node.addEventListener('input',calculateOperating);node.addEventListener('change',()=>setTimeout(calculateOperating,0))});el('reset-evaluator')?.addEventListener('click',resetEvaluator);calculateOperating()}
function loadScript(src,marker){if(document.querySelector('script['+marker+']'))return;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(marker,'1');document.head.appendChild(s)}
function loadModules(){loadScript('scrap_radar_cockpit.js?v=3','data-sr-cockpit');loadScript('scrap_radar_features.js?v=1','data-sr-features');loadScript('scrap_radar_inventory.js?v=1','data-sr-inventory');loadScript('scrap_radar_smart.js?v=1','data-sr-smart');loadScript('scrap_radar_attic.js?v=1','data-sr-attic');loadScript('scrap_radar_recovery_guard.js?v=4','data-sr-recovery-guard');loadScript('scrap_radar_recommendation.js?v=1','data-sr-recommendation')}
document.addEventListener('DOMContentLoaded',()=>{bindEvaluator();loadModules()});
})();
