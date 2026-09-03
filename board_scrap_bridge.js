/* Board Sense -> Scrap Radar local handoff v1.0
   Captures a completed SPIKE multi-photo case and stores a small, versioned
   recovery packet in this browser only. Identity/evidence never creates dollars. */
(function(){
'use strict';
const KEY='scrapRadarSpikeRecoveryPacketV1';
const DEST='scrap_radar_spike_case.html?source=spike#board-recovery';
let latest=null;
function E(id){return document.getElementById(id)}
function N(id){const x=E(id);if(!x||x.value==='')return null;const n=Number(x.value);return Number.isFinite(n)?n:null}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function readSaved(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function isBlocked(p,d){const g=d&&d.same_board_verification||{};return !d||p&&p.mode==='multi_photo_identity_blocked'||d.status==='case_identity_failed'||g.block_reconciliation===true}
function normalize(p){
  const d=p&&p.combined;if(isBlocked(p,d))return null;
  const t=d.three_answers||{},ti=t.identity||{},tr=t.recovery||{},cond=d.condition_and_harvest||(d.spike_evidence||{}).condition_and_harvest||{},same=d.same_board_verification||{};
  const sell=N('sellValue'),recovered=N('recoveredValue'),minutes=N('laborMinutes');
  return {
    version:1,
    createdAt:new Date().toISOString(),
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
  card.innerHTML='<h3>📡 SPIKE → SCRAP RADAR</h3><div id="spikeScrapBridgeStatus" class="muted">Analyze a multi-photo board case to prepare a recovery handoff.</div><div class="scan-actions" style="margin-top:10px"><button id="sendSpikeToScrap" type="button" disabled>Send Case to Scrap Radar</button><button id="clearSpikeHandoff" type="button">Clear Saved Handoff</button></div>';
  box.insertAdjacentElement('afterend',card);
  E('sendSpikeToScrap').onclick=send;
  E('clearSpikeHandoff').onclick=function(){localStorage.removeItem(KEY);latest=null;render(null)};
  return card;
}
function render(packet,blocked){
  ensureCard();const s=E('spikeScrapBridgeStatus'),b=E('sendSpikeToScrap');if(!s||!b)return;
  if(blocked){s.innerHTML='<b>HANDOFF BLOCKED:</b> SPIKE did not verify these photos as one physical board. Split the case first.';b.disabled=true;return}
  if(!packet){s.textContent='Analyze a multi-photo board case to prepare a recovery handoff.';b.disabled=true;return}
  const i=packet.identity||{},r=packet.recovery||{},e=packet.economics||{};
  s.innerHTML='<b>Case ready:</b> '+safe(i.boardType)+' • Grade '+safe(r.grade)+(r.score!=null?' • Recovery '+safe(r.score):'')+(r.condition?' • '+safe(r.condition):'')+'<br><b>Verified inputs ready to transfer:</b> '+(e.sellWholeValue!=null?'whole offer $'+safe(e.sellWholeValue):'no whole offer')+' • '+(e.fullRecoveryValue!=null?'recovery value $'+safe(e.fullRecoveryValue):'no recovery dollars')+' • '+(e.fullMinutes!=null?safe(e.fullMinutes)+' min':'no time')+'<br><span class="muted">Evidence travels with the case. It does not manufacture value.</span>';
  b.disabled=false;
}
function save(packet){latest=packet;localStorage.setItem(KEY,JSON.stringify(packet));render(packet,false)}
function capture(payload){
  const d=payload&&payload.combined;
  if(isBlocked(payload,d)){latest=null;render(null,true);return}
  const packet=normalize(payload);if(packet)save(packet);
}
function send(){
  const packet=latest||readSaved();if(!packet){render(null,false);return}
  localStorage.setItem(KEY,JSON.stringify(packet));
  window.top.location.href=DEST;
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
function init(){patchFetch();ensureCard();const saved=readSaved();if(saved){latest=saved;render(saved,false)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();