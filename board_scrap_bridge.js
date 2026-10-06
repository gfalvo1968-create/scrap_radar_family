/* Board Sense <-> Scrap Radar local handoff v1.5
   Captures a completed SPIKE multi-photo case and stores a small, versioned
   recovery packet in this browser only. Identity/evidence never creates dollars.
   An active Scrap Radar inspection mission quarantines prior whole-board handoffs. */
(function(){
'use strict';
const KEY='scrapRadarSpikeRecoveryPacketV1';
const INSPECTION_KEY='scrapRadarInspectionTargetV1';
let latest=null,pendingPlanning=null;
function E(id){return document.getElementById(id)}
function N(id){const x=E(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function readSaved(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function caseId(p){return p?String(p.caseId||p.createdAt||''):''}
function amount(v){return v!=null&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null}
function returnedValues(packet){
  const review=packet.scrapRadarReturn;
  return review&&review.version===1&&review.caseId===caseId(packet)?review:null;
}
function money(v){return '$'+Number(v).toFixed(2)}
function goldScenarioHTML(packet){
  const s=packet.planning&&packet.planning.goldRecoveryScenario;
  if(!s||s.version!==1||s.kind!=='hypothetical'||s.caseId!==caseId(packet))return '';
  let html='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #826d2c"><b>Gold recovery what-if • assumed yield</b>';
  const grams=amount(s.recoveredFineGrams),weight=amount(packet.planning.weightGrams),input=s.input||{},q=s.benchmark||{};
  if(grams!=null)html+='<br>'+(input.unit==='scale_points'&&amount(input.amount)!=null?safe(input.amount)+' scale point'+(Number(input.amount)===1?'':'s')+' = ':'')+safe(Number(grams.toPrecision(8)))+' grams of recovered 24K gold (assumed)';
  if(s.status==='calculated'&&amount(s.grossMetalValue)!=null&&!(weight>0&&grams>weight)){
    html+='<br><b>Gross metal value:</b> '+money(s.grossMetalValue)+'<br><span class="muted">Saved gold benchmark dated '+safe(q.date||'unverified')+(q.stale?' • stale or unverified; confirm before use':'')+'. Buyer deductions and recovery costs affect proceeds.</span>';
    if(!q.stale&&q.date&&s.netAfterEnteredCosts!=null&&Number.isFinite(Number(s.netAfterEnteredCosts)))html+='<br>Scenario after entered costs: '+money(s.netAfterEnteredCosts);
    else html+='<br>Scenario proceeds: '+(q.stale||!q.date?'refresh market prices':'enter buyer percentage and costs');
  }else html+='<br>Gold scenario value unavailable: check the assumed weight and market benchmark.';
  return html+'<br><span class="muted">This board’s actual gold yield remains unmeasured. Recovery payouts stay unpriced until supported by measurements and buyer terms.</span></div>';
}
function materialScenarioHTML(packet){
  const s=packet.planning&&packet.planning.materialRecoveryScenario;
  if(!s||s.version!==1||s.kind!=='hypothetical'||s.caseId!==caseId(packet)||!Array.isArray(s.materials))return '';
  const labels={gold:'Gold',silver:'Silver',copper:'Copper'},ids=['gold','silver','copper'];
  if(s.materials.length!==3||ids.some(id=>s.materials.filter(row=>row&&row.metal===id).length!==1))return '';
  const rows=ids.map(id=>s.materials.find(row=>row.metal===id));
  const fresh=rows.every(row=>row.recoveredGrams==null||row.recoveredGrams===0||(!row.benchmark?.stale&&row.benchmark?.date&&Number.isFinite(Date.parse(row.benchmark.date))));
  const grams=rows.map(row=>amount(row.recoveredGrams)),mass=grams.reduce((sum,n)=>sum+(n==null?0:n),0),weight=amount(packet.planning.weightGrams);
  const withinWeight=Number.isFinite(mass)&&!(weight>0&&mass>weight+1e-9*Math.max(1,weight));
  const valid=withinWeight&&['partial','complete'].includes(s.status);
  let html='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #826d2c"><b>Gold + silver + copper recovery • assumed yields</b>';
  html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;margin-top:8px"><thead><tr><th style="text-align:left">Metal</th><th style="text-align:left">Assumed grams</th><th style="text-align:right">Gross value</th></tr></thead><tbody>';
  rows.forEach(function(row,index){const value=amount(row.grossMetalValue);html+='<tr><td>'+labels[row.metal]+'</td><td>'+(grams[index]!=null?safe(Number(grams[index].toPrecision(8))):'Unknown')+'</td><td style="text-align:right">'+(valid&&value!=null?money(value):'Unpriced')+'</td></tr>'});
  html+='</tbody></table></div>';
  if(valid&&amount(s.grossMetalValue)!=null){
    html+='<br><b>'+(s.status==='complete'?'Combined gross metal value':'Priced metal subtotal • partial scenario')+':</b> '+money(s.grossMetalValue);
    if(fresh&&s.netAfterEnteredCosts!=null&&Number.isFinite(Number(s.netAfterEnteredCosts)))html+='<br>Scenario after entered costs: '+money(s.netAfterEnteredCosts)+(s.status==='partial'?' (priced metals only; partial estimate)':'');
    else html+='<br>Scenario proceeds: '+(!fresh?'refresh market prices':'enter each metal’s buyer percentage and total costs');
    if(fresh&&s.hourlyAfterEnteredCosts!=null&&Number.isFinite(Number(s.hourlyAfterEnteredCosts)))html+='<br>After entered costs per hour: '+money(s.hourlyAfterEnteredCosts);
  }else html+='<br>Combined value withheld: check recovered amounts, total board weight and benchmarks.';
  rows.forEach(function(row){const q=row.benchmark;if(q)html+='<br><span class="muted">Saved '+labels[row.metal].toLowerCase()+' benchmark dated '+safe(q.date||'unverified')+(q.stale?' • stale or unverified; confirm before use':'')+'.</span>'});
  if(grams.some(n=>n==null))html+='<br>Unknown quantities: '+rows.filter((row,i)=>grams[i]==null).map(row=>labels[row.metal]).join(', ')+'.';
  return html+'<br><span class="muted">Gold, silver and copper only; other materials and residual board value are not included. Individual values are rounded; the subtotal uses full precision. Total recovery costs are counted once. Actual board yields remain unmeasured; these scenarios do not become buyer offers or recovery payouts.</span></div>';
}
function returnHTML(packet){
  const p=packet.planning||{},estimate=p.wholeBoardEstimate,review=returnedValues(packet),inputs=review&&review.inputs||{};
  const scenario=materialScenarioHTML(packet)||goldScenarioHTML(packet);
  if(!estimate&&!review&&!scenario)return '';
  let html='<div style="margin-top:12px;padding:12px;border:1px solid #39ff14;border-radius:10px"><b>Values from Scrap Radar</b>';
  if(amount(p.weightGrams)>0)html+='<br><b>Board weight:</b> '+safe(Number(Number(p.weightGrams).toFixed(6)))+' grams';
  if(estimate&&amount(estimate.value)!=null&&amount(estimate.pricePerLb)!=null){
    html+='<br><b>Whole-board planning estimate:</b> '+money(estimate.value)+'<br><span class="muted">'+money(estimate.pricePerLb)+'/lb • '+safe(estimate.basis==='saved_quote'?'saved local quote; confirm it is current':'buyer-sample planning rate dated '+(estimate.priceDate||'unknown'))+'. Estimated value is not an exact buyer price.</span>';
  }
  if(estimate?.buyerCategoryId)html+='<br><b>Selected buyer category:</b> '+safe(estimate.label||estimate.buyerCategoryId)+' • buyer acceptance unconfirmed';
  if(review){
    if(amount(inputs['br-whole'])!=null&&review.wholeBasis==='entered_offer')html+='<br><b>Entered whole-board buyer offer:</b> '+money(inputs['br-whole']);
    const labels=[['br-partial-value','Entered parts payout'],['br-residual','Entered remaining board value'],['br-full-value','Entered material payout'],['br-full-residual','Entered downstream value']];
    labels.forEach(function(row){if(amount(inputs[row[0]])!=null)html+='<br>'+row[1]+': '+money(inputs[row[0]])});
    if(amount(inputs['br-partial-value'])==null&&amount(inputs['br-residual'])==null)html+='<br>Selective harvest: unpriced';
    if(amount(inputs['br-full-value'])==null&&amount(inputs['br-full-residual'])==null)html+='<br>Deeper recovery: unpriced';
    html+='<br><span class="muted">Entered recovery time, costs and travel stay with this saved case. Use Send Case to Scrap Radar to continue the comparison.</span>';
  }
  return html+scenario+'</div>';
}
function readInspection(){try{return JSON.parse(localStorage.getItem(INSPECTION_KEY)||'null')}catch(_){return null}}
function inspectionActive(){const p=readInspection();return !!(p&&p.target)}
function upper(v){return String(v==null?'':v).trim().toUpperCase()}
function isConfirmedPCB(d){
  if(!d)return false;
  const t=d.three_answers||{},ti=t.identity||{},tr=t.recovery||{};
  const gate=d.object_gate||d.input_gate||d.pcb_gate||(d.case_analysis||{}).object_gate||{};
  const type=upper(d.board_type||ti.answer),grade=upper(d.grade||tr.grade);
  const signals=[].concat(d.recovery_signals||[],gate.reasons||[],d.warnings||[]).map(upper).join(' | ');
  if(gate.block===true||gate.block_downstream===true||gate.confirmed_pcb===false)return false;
  if(['REJECTED','BLOCKED','NON_PCB','NOT_A_PCB','UNKNOWN_OBJECT'].includes(upper(gate.status)))return false;
  if(!type||type==='UNKNOWN'||type==='UNKNOWN OBJECT'||type.includes('NON-PCB')||type.includes('NOT A BOARD'))return false;
  if(!grade||['N/A','NA','WITHHELD','UNKNOWN','UNRESOLVED'].includes(grade))return false;
  if(signals.includes('INSUFFICIENT BOARD EVIDENCE')||signals.includes('NOT ENOUGH EVIDENCE'))return false;
  return true;
}
function isBlocked(p,d){const g=d&&d.same_board_verification||{};return !isConfirmedPCB(d)||p&&p.mode==='multi_photo_identity_blocked'||d&&['case_identity_failed','case_identity_clarification'].includes(d.status)||g.block_reconciliation===true}
function normalize(p){
  const d=p&&p.combined;if(isBlocked(p,d))return null;
  const t=d.three_answers||{},ti=t.identity||{},tr=t.recovery||{},cond=d.condition_and_harvest||(d.spike_evidence||{}).condition_and_harvest||{},same=d.same_board_verification||{};
  const sell=N('sellValue'),recovered=N('recoveredValue'),minutes=N('laborMinutes');
  const createdAt=new Date().toISOString();
  return {
    version:1,
    caseId:window.crypto&&window.crypto.randomUUID?window.crypto.randomUUID():createdAt+'-'+Math.random().toString(36).slice(2),
    createdAt:createdAt,
    source:'Board Sense / SPIKE',
    sourceMode:p.mode||'same_board_multi_photo',
    identity:{
      boardType:d.board_type||ti.answer||'Unknown Board',
      subtype:ti.subtype||((d.equipment_subtype||{}).subtype)||null,
      confidence:d.confidence!=null?d.confidence:(ti.confidence!=null?ti.confidence:null)
    },
    recovery:{
      grade:d.grade||tr.grade||'WITHHELD',
      score:d.score!=null?d.score:(tr.score!=null?tr.score:null),
      condition:cond.condition||tr.condition||null,
      remainingOpportunity:tr.remaining_opportunity||cond.remaining_opportunity||null,
      signals:Array.isArray(d.recovery_signals)?d.recovery_signals.slice(0,12):[]
    },
    sameBoard:{status:same.status||null,confidence:same.confidence!=null?same.confidence:null},
    planning:pendingPlanning||null,
    economics:{
      sellWholeValue:sell!=null&&sell>0?sell:null,
      fullRecoveryValue:recovered!=null&&recovered>0?recovered:null,
      fullMinutes:minutes!=null&&minutes>=0?minutes:null,
      sellValueBasis:(d.recovery_economics||{}).sell_value_basis||'NOT PROVIDED'
    },
    integrity:{
      physicalBoardFirst:true,
      rule:'SPIKE evidence may support identity and recovery classification, but it does not create a dollar value. Scrap Radar decides economics from entered values, time, distance, fuel and buyer terms.'
    }
  };
}
function ensureCard(){
  let card=E('spikeScrapBridge');if(card)return card;
  const box=E('predictionBox');if(!box)return null;
  card=document.createElement('div');card.id='spikeScrapBridge';card.className='decision-box';
  card.innerHTML='<h3>📡 BOARD SENSE ↔ SCRAP RADAR</h3><div id="spikeScrapBridgeStatus" class="muted">Analyze a multi-photo board case to prepare a recovery handoff.</div><div class="scan-actions" style="margin-top:10px"><form id="sendSpikeForm" action="scrap_radar_spike_case.html" method="get" target="_top" style="display:inline"><input type="hidden" name="source" value="spike"><input id="sendSpikeBuild" type="hidden" name="build" value=""><button id="sendSpikeToScrap" type="submit" disabled>Send Case to Scrap Radar</button></form><button id="clearSpikeHandoff" type="button">Clear Saved Handoff</button></div>';
  box.insertAdjacentElement('afterend',card);
  E('sendSpikeForm').onsubmit=send;
  E('clearSpikeHandoff').onclick=function(){localStorage.removeItem(KEY);latest=null;render(null)};
  return card;
}
function parkForInspection(){
  try{localStorage.removeItem(KEY)}catch(_){}
  latest=null;ensureCard();
  const s=E('spikeScrapBridgeStatus'),b=E('sendSpikeToScrap');
  if(s)s.innerHTML='<b>INSPECTION MISSION ACTIVE:</b> prior whole-board handoff parked.<br><span class="muted">Finish or clear the Scrap Radar target mission before preparing another board transfer.</span>';
  if(b)b.disabled=true;
}
function render(packet,blocked){
  if(inspectionActive()){parkForInspection();return}
  ensureCard();const s=E('spikeScrapBridgeStatus'),b=E('sendSpikeToScrap');if(!s||!b)return;
  if(blocked){s.innerHTML='<b>HANDOFF BLOCKED:</b> SPIKE did not confirm a valid single-board PCB case. Board grading, recovery economics, and Scrap Radar transfer were withheld.';b.disabled=true;return}
  if(!packet){s.textContent='Analyze a multi-photo board case to prepare a recovery handoff.';b.disabled=true;return}
  const i=packet.identity||{},r=packet.recovery||{},e=packet.economics||{};
  s.innerHTML='<b>Case ready:</b> '+safe(i.boardType)+' • Grade '+safe(r.grade)+(r.score!=null?' • Recovery '+safe(r.score):'')+(r.condition?' • '+safe(r.condition):'')+'<br><b>Entered inputs ready to transfer:</b> '+(e.sellWholeValue!=null?'whole offer $'+safe(e.sellWholeValue):'no whole offer')+' • '+(e.fullRecoveryValue!=null?'recovery value $'+safe(e.fullRecoveryValue):'no recovery dollars')+' • '+(e.fullMinutes!=null?safe(e.fullMinutes)+' min':'no time entered')+'<br><span class="muted">Evidence travels with the case. It does not manufacture value.</span>';
  s.innerHTML+=returnHTML(packet);
  b.disabled=false;
}
function save(packet){
  if(inspectionActive()){parkForInspection();return}
  if(pendingPlanning)packet.planning=pendingPlanning;
  try{localStorage.setItem(KEY,JSON.stringify(packet))}
  catch(_){const s=E('spikeScrapBridgeStatus');if(s)s.textContent='Board analysis completed, but this browser could not save the case for Scrap Radar. Check browser storage and retry.';const b=E('sendSpikeToScrap');if(b)b.disabled=true;return}
  latest=packet;render(packet,false)
}
function updatePlanning(detail){
  if(!detail||inspectionActive())return;
  const w=Number(detail.weightGrams);
  pendingPlanning={gradeId:detail.gradeId||null,weightGrams:detail.weightGrams!=null&&Number.isFinite(w)&&w>0?w:null};
  if(latest){
    const saved=readSaved();
    if(!saved||caseId(saved)!==caseId(latest)){latest=saved;render(saved,false);return}
    const old=saved.planning||{},changed=old.gradeId!==pendingPlanning.gradeId||old.weightGrams!==pendingPlanning.weightGrams;
    saved.planning=Object.assign({},old,pendingPlanning);
    if(changed){
      delete saved.planning.wholeBoardEstimate;delete saved.planning.weightEntry;
      const review=returnedValues(saved);
      if(review&&review.wholeBasis!=='entered_offer'&&review.inputs)review.inputs['br-whole']=null;
    }
    try{localStorage.setItem(KEY,JSON.stringify(saved));latest=saved;render(saved,false)}catch(_){}
  }
}
function capture(payload){
  if(inspectionActive()){parkForInspection();return}
  const d=payload&&payload.combined;
  if(isBlocked(payload,d)){try{localStorage.removeItem(KEY)}catch(_){}latest=null;render(null,true);return}
  const packet=normalize(payload);if(packet)save(packet);
}
function send(event){
  if(inspectionActive()){event.preventDefault();parkForInspection();return false}
  const packet=readSaved();if(!packet){event.preventDefault();latest=null;render(null,false);return false}
  latest=packet;
  try{localStorage.setItem(KEY,JSON.stringify(packet))}
  catch(_){event.preventDefault();const s=E('spikeScrapBridgeStatus');if(s)s.textContent='Could not save this board for the handoff. Check browser storage and try again.';return false}
  const build=E('sendSpikeBuild');if(build)build.value=String(Date.now());
  const s=E('spikeScrapBridgeStatus');if(s)s.textContent='Case saved. Opening Scrap Radar…';
  return true;
}
function patchFetch(){
  if(window.__spikeScrapFetchPatched)return;window.__spikeScrapFetchPatched=true;
  const original=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const response=await original(input,init);
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(url.indexOf('/analyze-case')>=0){response.clone().json().then(capture).catch(function(){})}
    }catch(_){ }
    return response;
  };
}
function init(){
  patchFetch();ensureCard();
  if(inspectionActive()){parkForInspection();return}
  const saved=readSaved();if(saved){latest=saved;render(saved,false)}
  if(saved&&returnedValues(saved)&&/[?&]from=scrap-radar(?:&|$)/.test(window.top&&window.top.location?window.top.location.search:''))setTimeout(function(){const card=E('spikeScrapBridge');if(card)card.scrollIntoView({behavior:'auto',block:'center'})},300);
}
window.addEventListener('boardSenseObjectGateBlocked',function(){try{localStorage.removeItem(KEY)}catch(_){}latest=null;render(null,true)});
window.addEventListener('boardSensePlanningUpdated',function(e){updatePlanning(e.detail)});
window.addEventListener('boardSenseCaseReportReset',function(){
  pendingPlanning=null;latest=null;
  try{localStorage.removeItem(KEY)}catch(_){}
  render(null,false);
});
window.addEventListener('storage',function(e){if(e.key===INSPECTION_KEY||e.key===KEY||e.key===null){if(inspectionActive())parkForInspection();else{latest=readSaved();render(latest,false)}}});
window.addEventListener('boardSenseInspectionMission',function(){if(inspectionActive())parkForInspection();else{latest=readSaved();render(latest,false)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
