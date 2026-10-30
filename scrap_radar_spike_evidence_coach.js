/* SPIKE evidence coach v1: read-only case-specific buyer-category screening.
   Never assigns grade, price, composition, or precious-metal yield. */
(function(){
'use strict';
var tries=0, KEY='scrapRadarSpikeRecoveryPacketV1';
function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function packet(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function text(p){var i=p.identity||{},r=p.recovery||{};return [i.boardType,i.subtype,(r.signals||[]).join(' ')].filter(Boolean).join(' ').toLowerCase()}
function render(){
 var box=el('spike-evidence-coach-body');if(!box)return;
 var p=packet();if(!p){box.textContent='No SPIKE case is loaded. Send a board from Board Sense to see case-specific screening.';return}
 var i=p.identity||{},r=p.recovery||{},t=text(p),grade=String(r.grade||'').toUpperCase();
 var telecom=/telecom|telephone|switching|pbx|network backplane/.test(t);
 var peripheral=/peripheral|add.in|graphics card|sound card|pci|pcie/.test(t);
 var controller=/controller|embedded|proprietary|logic board/.test(t);
 var gradeVerified=['HIGH','MEDIUM','LOW'].includes(grade);
 var notes=[];
 if(telecom)notes.push('<b>Telecom candidate:</b> SPIKE text mentions telecom-related equipment. Verify origin, markings, connectors and the buyer\'s category before treating this as telecom grade.');
 else notes.push('<b>Telecom:</b> No explicit telecom origin found in the transferred case description. Do not use telecom prices solely because the board is dense.');
 if(peripheral)notes.push('<b>Peripheral candidate:</b> SPIKE text mentions a peripheral/add-in function. Confirm the board type and buyer requirements.');
 else notes.push('<b>Peripheral:</b> No clear add-in/peripheral function established by the transferred description.');
 if(controller)notes.push('<b>General/controller:</b> Controller or embedded logic function is described. Compare against buyer-specific general PCB categories after checking both faces and attachments.');
 else notes.push('<b>General circuit board:</b> Category remains possible, but the physical features and buyer acceptance rules still need confirmation.');
 var confidence=Number(i.confidence),conf=Number.isFinite(confidence)?'Identity confidence: '+esc(i.confidence)+'%. ':'';
 box.innerHTML='<p><b>Case:</b> '+esc(i.boardType||'Unclassified')+(i.subtype?' • '+esc(i.subtype):'')+'. '+conf+
 '<b>Recovery grade:</b> '+(gradeVerified?esc(grade)+' (not a verified buyer category)':'WITHHELD / MANUAL REVIEW')+'.</p>'+
 notes.map(function(n){return '<p>'+n+'</p>'}).join('')+
 '<p><b>Evidence still needed:</b> clear front and back, manufacturer/model identification, connector details, metal/heatsink attachments, daughterboard count, and written buyer grading definitions.</p>'+
 '<p><b>Screening only:</b> This is a rule-based reading of SPIKE\'s transferred text, not a fresh visual inspection. No buyer grade or price has been selected.</p>';
}
function init(){
 var quick=el('spike-quick-estimate');
 if(!quick){if(tries++<80)setTimeout(init,150);return}
 if(el('spike-evidence-coach')){render();return}
 var section=document.createElement('details');section.id='spike-evidence-coach';
 section.style.cssText='margin-top:12px;padding:12px;border:1px solid #668a9c;border-radius:8px';
 var summary=document.createElement('summary');summary.textContent='🔎 SPIKE case-specific evidence screening';summary.style.cursor='pointer';summary.style.color='#a8e8ff';
 var body=document.createElement('div');body.id='spike-evidence-coach-body';
 section.appendChild(summary);section.appendChild(body);quick.appendChild(section);render();
 window.addEventListener('storage',render);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();