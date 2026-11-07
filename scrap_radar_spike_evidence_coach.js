/* SPIKE evidence coach v1: read-only case-specific buyer-category screening.
   Never assigns grade, price, composition, or precious-metal yield. */
(function(){
'use strict';
var tries=0, KEY='scrapRadarSpikeRecoveryPacketV1', ORIGIN='scrapRadarCaseReportedOriginV1';
function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function packet(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function origin(p){try{var x=JSON.parse(localStorage.getItem(ORIGIN)||'null');return x&&p&&x.caseId===p.caseId&&x.createdAt===p.createdAt&&typeof x.label==='string'?x.label.slice(0,120):''}catch(_){return ''}}
function text(p){var i=p.identity||{},r=p.recovery||{};return [i.boardType,i.subtype,(r.signals||[]).join(' ')].filter(Boolean).join(' ').toLowerCase()}
function render(){
 var box=el('spike-evidence-coach-report');if(!box)return;
 var p=packet();if(!p){box.textContent='No SPIKE case is loaded. Send a board from Board Sense to see case-specific screening.';return}
 var i=p.identity||{},r=p.recovery||{},reported=origin(p),t=text(p),grade=String(r.grade||'').toUpperCase();
 var input=el('spike-reported-origin');if(input&&document.activeElement!==input)input.value=reported;
 var telecom=/telecom|telephone|switching|pbx|network backplane/.test(t);
 var peripheral=/peripheral|add.in|graphics card|sound card|pci|pcie/.test(t);
 var controller=/controller|embedded|proprietary|logic board/.test(t);
 var gradeVerified=['HIGH','MEDIUM','LOW'].includes(grade);
 var notes=[];
 if(reported)notes.push('<b>Owner-reported equipment origin:</b> '+esc(reported)+' (user statement only; not independently verified and not a buyer grade).');
 if(telecom)notes.push('<b>Telecom candidate:</b> SPIKE text mentions telecom-related equipment. Verify origin, markings, connectors and the buyer\'s category before treating this as telecom grade.');
 else notes.push('<b>Telecom:</b> No explicit telecom origin found in the transferred case description. Do not use telecom prices solely because the board is dense.');
 if(peripheral)notes.push('<b>Peripheral candidate:</b> SPIKE text mentions a peripheral/add-in function. Confirm the board type and buyer requirements.');
 else notes.push('<b>Peripheral:</b> No clear add-in/peripheral function established by the transferred description.');
 if(controller)notes.push('<b>General/controller:</b> Controller or embedded logic function is described. Compare against buyer-specific general PCB categories after checking both faces and attachments.');
 else notes.push('<b>General circuit board:</b> Category remains possible, but the physical features and buyer acceptance rules still need confirmation.');
 var evidence=[];
 if(controller)evidence.push('Controller / embedded logic description supports investigating general PCB buyer categories.');
 if(telecom)evidence.push('Telecom-related wording supports investigating telecom origin, but is not proof of buyer grade.');
 if(peripheral)evidence.push('Peripheral-related wording supports investigating add-in card classification.');
 if(!evidence.length)evidence.push('No category-specific features are established by the transferred description.');
 var cautions=[];
 if(controller&&!telecom)cautions.push('Controller function alone does not support a telecom buyer category.');
 if(controller&&!peripheral)cautions.push('Embedded logic function alone does not support a peripheral buyer category.');
 if(!gradeVerified)cautions.push('Recovery grade remains withheld, so no automatic buyer grade is appropriate.');
 if(!cautions.length)cautions.push('No direct contradictions have been verified; missing evidence must not be treated as a contradiction.');
 var missing=['Independent front/back image verification','Manufacturer/model and verified equipment origin','Connector types and markings','Daughterboards and attached metal','Buyer-specific written grade criteria'];
 var recommendation=controller?'Investigate general/controller PCB buyer categories first; do not assign a grade.':telecom?'Investigate telecom origin and buyer requirements first; do not assign a grade.':peripheral?'Investigate peripheral function and buyer requirements first; do not assign a grade.':'Obtain clearer identification before comparing buyer categories.';
 var coach='<section style="margin-top:12px;padding:10px;border:1px solid #7a996b;border-radius:8px"><b>🧭 Phase 5: Evidence-based recommendation</b>'+
 '<p><b>Suggested next investigation:</b> '+esc(recommendation)+'</p>'+
 '<p><b>Supporting clues (transferred text only):</b><br>'+evidence.map(esc).join('<br>')+'</p>'+
 '<p><b>Limitations and possible category conflicts:</b><br>'+cautions.map(esc).join('<br>')+'</p>'+
 '<p><b>Missing verification:</b><br>'+missing.map(esc).join('<br>')+'</p>'+
 '<p><b>Decision:</b> REVIEW REQUIRED. This is a screening recommendation, not a buyer grade, payout, assay or verified visual analysis.</p></section>';
 var confidence=Number(i.confidence),conf=Number.isFinite(confidence)?'Identity confidence: '+esc(i.confidence)+'%. ':'';
 box.innerHTML='<p><b>Case:</b> '+esc(i.boardType||'Unclassified')+(i.subtype?' • '+esc(i.subtype):'')+'. '+conf+
 '<b>Recovery grade:</b> '+(gradeVerified?esc(grade)+' (not a verified buyer category)':'WITHHELD / MANUAL REVIEW')+'.</p>'+
 notes.map(function(n){return '<p>'+n+'</p>'}).join('')+coach+
 '<p><b>Evidence still needed:</b> clear front and back, manufacturer/model identification, connector details, metal/heatsink attachments, daughterboard count, and written buyer grading definitions.</p>'+
 '<p><b>Screening only:</b> This is a rule-based reading of SPIKE\'s transferred text, not a fresh visual inspection. No buyer grade or price has been selected.</p>';
}
function installOrigin(){
 var body=el('spike-evidence-coach-body');if(!body||el('spike-reported-origin-form'))return;
 var wrapper=document.createElement('div');wrapper.id='spike-reported-origin-form';
 wrapper.style.cssText='padding:10px;margin:10px 0;border:1px solid #687a66;border-radius:8px';
 var label=document.createElement('label');label.textContent='Equipment origin (reported by owner; unverified): ';
 var input=document.createElement('input');input.id='spike-reported-origin';input.maxLength=120;input.placeholder='e.g. tower equipment';input.style.cssText='max-width:100%;box-sizing:border-box';
 label.appendChild(input);wrapper.appendChild(label);
 var button=document.createElement('button');button.type='button';button.textContent='Save reported origin';button.style.marginLeft='8px';wrapper.appendChild(button);
 var note=document.createElement('p');note.style.fontSize='0.85em';note.textContent='This note stays in this browser and is tied to this case. It does not verify the source, change SPIKE grade, or assign a telecom price.';wrapper.appendChild(note);
 button.onclick=function(){var p=packet();if(!p||!p.caseId){note.textContent='No active case to annotate.';return}
  try{localStorage.setItem(ORIGIN,JSON.stringify({caseId:p.caseId,createdAt:p.createdAt,label:input.value.trim().slice(0,120)}));note.textContent='Reported origin saved for this case only. Buyer category remains unverified.';render()}
  catch(_){note.textContent='Could not save this note on the device.'}
 };
 body.insertBefore(wrapper,body.firstChild);
}
function init(){
 var quick=el('spike-quick-estimate');
 if(!quick){if(tries++<80)setTimeout(init,150);return}
 if(el('spike-evidence-coach')){var existing=el('spike-evidence-coach');var body=el('spike-evidence-coach-body');if(!body){body=document.createElement('div');body.id='spike-evidence-coach-body';existing.appendChild(body)}var report=el('spike-evidence-coach-report');if(!report){report=document.createElement('div');report.id='spike-evidence-coach-report';body.textContent='';body.appendChild(report)}installOrigin();render();window.addEventListener('storage',render);window.addEventListener('scrapRadarSpikeCaseChanged',render);return}
 var section=document.createElement('details');section.id='spike-evidence-coach';
 section.style.cssText='margin-top:12px;padding:12px;border:1px solid #668a9c;border-radius:8px';
 var summary=document.createElement('summary');summary.textContent='🔎 SPIKE case-specific evidence screening';summary.style.cursor='pointer';summary.style.color='#a8e8ff';
 var body=document.createElement('div');body.id='spike-evidence-coach-body';
 var report=document.createElement('div');report.id='spike-evidence-coach-report';body.appendChild(report);
 section.appendChild(summary);section.appendChild(body);quick.appendChild(section);installOrigin();render();
 window.addEventListener('storage',render);window.addEventListener('scrapRadarSpikeCaseChanged',render);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();