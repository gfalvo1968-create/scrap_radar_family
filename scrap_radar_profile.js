/* Saved operating rates. Example rates are opt-in; job quantities stay per case. */
(function(){
'use strict';
const KEY='scrapRadarOperatingProfileV1',CREDENTIAL='scrapRadarProfileCredentialV1';
const API='https://scrapradar-backend-production.up.railway.app/api';
const FIELDS={fuel_cost_per_mile:'profile-fuel',target_hourly_wage:'profile-wage',chemical_cost_per_lb:'profile-processing'};
const LIMITS={fuel_cost_per_mile:1000,target_hourly_wage:1000000,chemical_cost_per_lb:1000000};
const EXAMPLE={fuel_cost_per_mile:0.45,target_hourly_wage:25,chemical_cost_per_lb:0.50};
let revision=0,dirty=false,backupQueue=Promise.resolve();
function E(id){return document.getElementById(id)}
function number(id){const s=E(id)?.value;if(s==null||String(s).trim()==='')return null;const n=Number(s);return Number.isFinite(n)&&n>=0?n:null}
function money(n){return '$'+n.toFixed(2)}
function read(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');return p?.version===1&&valid(p.rates)?p:null}catch(_){return null}}
function valid(p){return p&&typeof p==='object'&&Object.keys(FIELDS).every(k=>p[k]===null||(typeof p[k]==='number'&&Number.isFinite(p[k])&&p[k]>=0&&p[k]<=LIMITS[k]))}
function get(){return read()?.rates||Object.fromEntries(Object.keys(FIELDS).map(k=>[k,null]))}
function status(message){const n=E('profile-status');if(n)n.textContent=message}
function credential(){
  const existing=localStorage.getItem(CREDENTIAL);
  if(/^srp_[0-9a-f]{64}$/.test(existing||''))return existing;
  const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
  const token='srp_'+Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
  localStorage.setItem(CREDENTIAL,token);return token;
}
async function request(path,method,body){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(API+path,{method,signal:controller.signal,cache:'no-store',
      headers:{Authorization:'Bearer '+credential(),...(body?{'Content-Type':'application/json'}:{})},
      ...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok)throw Error('Profile service unavailable');
    return await response.json();
  }finally{clearTimeout(timer)}
}
function write(rates,pending){localStorage.setItem(KEY,JSON.stringify({version:1,rates,updatedAt:new Date().toISOString(),pending}))}
function backup(rates){
  const result=backupQueue.then(()=>request('/update-profile','POST',rates));
  backupQueue=result.catch(()=>{});return result;
}
function fillForm(){const rates=get();for(const [key,id] of Object.entries(FIELDS))if(E(id))E(id).value=rates[key]===null?'':String(rates[key])}
function defaultField(id,value){
  const node=E(id);if(!node)return;
  if(node.value===''||(node.dataset.profileDefault!==undefined&&node.value===node.dataset.profileDefault)){
    node.value=value==null?'':String(value);
    if(value==null)delete node.dataset.profileDefault;else node.dataset.profileDefault=node.value;
    node.dispatchEvent(new Event('input',{bubbles:true}));
  }
}
function applyDefaults(){
  const rates=get();
  defaultField('trip-fuel-rate',rates.fuel_cost_per_mile);
  defaultField('trip-target',rates.target_hourly_wage);
  const method=E('trip-cost-method');
  if(method&&(method.value===''||method.dataset.profileDefault!==undefined)){
    method.value=rates.fuel_cost_per_mile!==null&&!E('trip-mpg')?.value&&!E('trip-gas')?.value?'rate':'mpg';
    method.dataset.profileDefault=method.value;
  }
  window.dispatchEvent(new Event('scrapRadarProfileUpdated'));
}
async function save(clear){
  const rates={};
  for(const [key,id] of Object.entries(FIELDS)){
    rates[key]=clear?null:number(id);
    if(!clear&&E(id)?.value!==''&&(rates[key]===null||rates[key]>LIMITS[key])){status('Enter a valid nonnegative rate, or leave it blank.');E(id)?.focus();return}
  }
  const current=++revision;
  try{write(rates,true)}catch(_){status('Rates could not be saved on this browser. Your previous rates remain in use.');return}
  dirty=false;fillForm();applyDefaults();
  status(clear?'Saved rates cleared on this browser. Updating backup…':'Saved on this browser. Backing up your rates…');
  try{
    await backup(rates);
    if(current!==revision)return;
    write(rates,false);status(clear?'Saved rates cleared. Existing case amounts are kept.':'Rates saved for this browser and backed up.');
  }catch(_){if(current===revision)status(clear?'Rates cleared locally. Backup will update when the service reconnects.':'Rates saved on this browser. Backup is unavailable; local rates still work.')}
}
async function restoreBackup(){
  const p=read();if(!p||!localStorage.getItem(CREDENTIAL))return;
  const current=revision;
  try{
    if(p.pending){
      await backup(p.rates);
      if(current===revision){write(p.rates,false);status('Rates saved for this browser and backed up.')}
    }else{
      const result=await request('/profile','GET');
      if(current!==revision)return;
      const rates=result.saved?Object.fromEntries(Object.keys(FIELDS).map(k=>[k,result.profile?.[k]??null])):Object.fromEntries(Object.keys(FIELDS).map(k=>[k,null]));
      if(!valid(rates))return;
      write(rates,false);if(!dirty)fillForm();applyDefaults();
    }
  }catch(_){if(current===revision)status('Using rates saved on this browser. Backup is temporarily unavailable.')}
}
function vehicleCost(miles,mpg,gas,method,rate){
  method=method??E('trip-cost-method')?.value;
  rate=rate??number('trip-fuel-rate');
  if(method==='rate')return rate!==null&&Number.isFinite(rate)&&rate>=0?miles*rate:0;
  return mpg!==null&&mpg>0&&gas!==null&&gas>=0?miles/mpg*gas:0;
}
function localOverhead(input,rates){
  const values=[['travel',input.distance_miles,'fuel_cost_per_mile',2],
    ['labor',input.labor_hours_invested,'target_hourly_wage',1],
    ['processing',input.processing_weight_lbs,'chemical_cost_per_lb',1]];
  const breakdown={},missing=[];
  for(const [name,quantity,key,factor] of values){
    if(quantity===0)breakdown[name]=0;
    else if(quantity==null||rates[key]==null){missing.push(name);breakdown[name]=null}
    else breakdown[name]=quantity*rates[key]*factor;
  }
  breakdown.other=input.other_costs;if(input.other_costs==null)missing.push('other costs');
  const total=missing.length?null:Object.values(breakdown).reduce((a,b)=>a+b,0);
  if(total!==null&&!Number.isFinite(total))missing.push('invalid costs');
  return {breakdown,total:missing.length?null:total,missing};
}
async function calculateOverhead(input){
  const rates=get(),local=localOverhead(input,rates);
  if(local.total===null)return local;
  try{
    const saved=await request('/profile','GET');
    if(!saved.saved||Object.keys(FIELDS).some(k=>saved.profile?.[k]!==rates[k]))throw Error('Use the current local rates');
    const result=await request('/calculate-yield','POST',input);
    const total=result.financial_summary?.total_overhead_deductions;
    if(typeof total!=='number'||!Number.isFinite(total)||Math.abs(total-local.total)>0.011)throw Error('Cost validation failed');
    return {...local,total,backedUp:true};
  }catch(_){return {...local,backedUp:false}}
}
function attachRecoveryCosts(){
  const costs=E('spike-gold-costs');if(!costs||E('profile-recovery-costs'))return;
  const box=document.createElement('details');box.id='profile-recovery-costs';box.className='sr-profile-costs';
  box.innerHTML='<summary>Calculate costs from my saved rates</summary><p>Use the material you plan to process. These costs replace the total recovery costs above.</p>'+
    '<label>Material to process (lb)<input id="profile-process-lbs" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter processed weight"></label>'+
    '<label>Buyer/refiner miles one way<input id="profile-recovery-miles" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter miles, or 0"></label>'+
    '<label>Additional fees / costs $<input id="profile-recovery-other" type="number" min="0" step="any" inputmode="decimal" value="0"></label>'+
    '<p>Recovery minutes come from the field above. Cost per mile includes your chosen vehicle allowance; MPG fuel is not added again.</p>'+
    '<button id="profile-apply-recovery" class="mini-btn" type="button">Apply saved rates to these costs</button>'+
    '<p id="profile-recovery-status" role="status" aria-live="polite">Save your rates in the Load + Trip Evaluator.</p>';
  costs.parentElement.parentElement.insertAdjacentElement('afterend',box);
  const packet=(()=>{try{return JSON.parse(localStorage.getItem('scrapRadarSpikeRecoveryPacketV1')||'null')}catch(_){return null}})();
  if(packet?.planning?.weightGrams>0)E('profile-process-lbs').value=String(packet.planning.weightGrams/453.59237);
  const recoveryMiles=E('br-full-miles');
  if(recoveryMiles&&recoveryMiles.value!=='')E('profile-recovery-miles').value=recoveryMiles.value;
  E('profile-apply-recovery').onclick=async function(){
    const out=E('profile-recovery-status'),weight=number('profile-process-lbs'),minutes=number('spike-gold-minutes'),
      miles=number('profile-recovery-miles'),other=number('profile-recovery-other');
    if([weight,minutes,miles,other].some(n=>n===null)){out.textContent='Enter processing weight, recovery minutes, one-way miles and other costs. Use 0 where none applies.';return}
    const snapshot=['profile-process-lbs','spike-gold-minutes','profile-recovery-miles','profile-recovery-other','spike-gold-costs'].map(id=>E(id)?.value).join('|'),rev=revision;
    const packetNow=localStorage.getItem('scrapRadarSpikeRecoveryPacketV1');
    let board;try{board=JSON.parse(packetNow||'null')}catch(_){}
    const gross=board?.planning?.weightGrams/453.59237;
    // The API also validates mass and uses the sourced market feed. Only its cost
    // breakdown is applied here; the existing scenario keeps its displayed price basis.
    const input={scrap_data:{category:'electronics',subcategory:'board',grade_type:'user_scenario',
      gross_weight_lbs:Number.isFinite(gross)&&gross>0?gross:Math.max(weight,0.000001)},
      recovered_metals:[],yield_basis:'assumed',distance_miles:miles,labor_hours_invested:minutes/60,
      processing_weight_lbs:weight,other_costs:other};
    if(weight>input.scrap_data.gross_weight_lbs){out.textContent='Processing weight exceeds this board’s measured weight.';return}
    out.textContent='Calculating with your saved rates…';
    const result=await calculateOverhead(input);
    if(rev!==revision||packetNow!==localStorage.getItem('scrapRadarSpikeRecoveryPacketV1')||snapshot!==['profile-process-lbs','spike-gold-minutes','profile-recovery-miles','profile-recovery-other','spike-gold-costs'].map(id=>E(id)?.value).join('|')){
      out.textContent='Inputs or the board case changed. Apply the rates again for the current values.';return;
    }
    if(result.total===null){out.textContent='Save a rate for: '+result.missing.join(', ')+'.';return}
    costs.value=(Math.round((result.total+Number.EPSILON)*100)/100).toFixed(2);costs.dispatchEvent(new Event('input',{bubbles:true}));
    out.textContent='Travel '+money(result.breakdown.travel)+' + labor '+money(result.breakdown.labor)+
      ' + processing '+money(result.breakdown.processing)+' + other '+money(result.breakdown.other)+
      ' = '+money(result.total)+'. Counted once. '+(result.backedUp?'Saved rates checked with the service.':'Used rates saved on this browser.');
  };
}
function bind(){
  if(!E('evaluator')||E('operating-profile'))return;
  const box=document.createElement('details');box.id='operating-profile';box.className='sr-profile';
  box.innerHTML='<summary>My operating rates</summary><p>Save the rates you use repeatedly. These rates belong to this browser; each load and board keeps its own quantities.</p>'+
    '<div class="sr-profile-grid"><label>Vehicle cost per mile $ (fuel + wear)<input id="profile-fuel" type="number" min="0" step="any" inputmode="decimal" placeholder="Your rate"></label>'+
    '<label>Target pay per hour $<input id="profile-wage" type="number" min="0" step="any" inputmode="decimal" placeholder="Your hourly target"></label>'+
    '<label>Processing cost per lb $<input id="profile-processing" type="number" min="0" step="any" inputmode="decimal" placeholder="Your processing rate"></label></div>'+
    '<div class="eval-actions"><button id="profile-save" class="mini-btn" type="button">Save my rates</button><button id="profile-example" class="mini-btn" type="button">Try example rates</button><button id="profile-clear" class="mini-btn" type="button">Clear saved rates</button></div>'+
    '<p class="material-meta">Example only: $0.45/mi, $25/hr and $0.50/lb. Review and save to use them.</p>'+
    '<p id="profile-status" role="status" aria-live="polite">No saved rates. Enter your costs or try the labeled examples.</p>';
  E('evaluator').querySelector('.eval-grid').insertAdjacentElement('beforebegin',box);
  E('profile-save').onclick=()=>save(false);E('profile-clear').onclick=()=>save(true);
  E('profile-example').onclick=function(){for(const [k,id] of Object.entries(FIELDS))E(id).value=String(EXAMPLE[k]);dirty=true;status('Example rates filled. Review and save to use them.')};
  Object.values(FIELDS).forEach(id=>E(id).addEventListener('input',()=>{dirty=true}));
  ['trip-fuel-rate','trip-target','trip-cost-method'].forEach(id=>E(id)?.addEventListener('input',e=>{if(e.isTrusted)delete e.currentTarget.dataset.profileDefault}));
  E('trip-cost-method')?.addEventListener('change',e=>{if(e.isTrusted)delete e.currentTarget.dataset.profileDefault});
  fillForm();applyDefaults();if(read())status('Using rates saved on this browser.');restoreBackup();attachRecoveryCosts();
}
window.ScrapRadarOperatingProfile={get,vehicleCost,localOverhead,calculateOverhead,applyDefaults,attachRecoveryCosts};
window.addEventListener('scrapRadarRecoveryScenarioReady',attachRecoveryCosts);
window.addEventListener('scrapRadarCaseValuesApplied',applyDefaults);
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){revision++;if(!dirty)fillForm();applyDefaults()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
