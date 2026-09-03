/* Scrap Radar SPIKE case importer v1.1
   Reads only the device-local handoff packet created by Board Sense.
   Evidence stays evidence. Only entered/configured values are copied into fields.
   Clear source clues may cue Critical Materials inspection, but never create composition or value. */
(function(){
'use strict';
const KEY='scrapRadarSpikeRecoveryPacketV1';
const SOURCE_LABELS={
  'hard-drive':'Hard drive',
  'speaker':'Speaker / audio magnet',
  'motor':'Motor / generator',
  'nimh':'NiMH battery pack',
  'li-ion':'Lithium-ion battery',
  'display':'Display / touchscreen / phosphor',
  'semiconductor':'RF / power / semiconductor electronics',
  'capacitors':'Capacitor-rich electronics',
  'carbide':'Carbide tooling / dense tool scrap',
  'solar':'Solar / photovoltaic material',
  'optics':'Fiber optics / lasers / specialty glass',
  'alloy':'Specialty alloy / solder stream'
};
function E(id){return document.getElementById(id)}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function fire(node,type){if(node)node.dispatchEvent(new Event(type,{bubbles:true}))}
function setValue(id,value){if(value==null)return;const n=E(id);if(!n)return;n.value=String(value);fire(n,'input');fire(n,'change')}
function sourceCue(packet){
  if(!packet)return null;
  const i=packet.identity||{},r=packet.recovery||{};
  const text=[i.boardType,i.subtype,r.condition,r.remainingOpportunity].concat(Array.isArray(r.signals)?r.signals:[]).filter(Boolean).join(' ').toLowerCase();
  if(/hard\s*drive|disk\s*drive|hdd/.test(text))return 'hard-drive';
  if(/speaker|audio\s*magnet/.test(text))return 'speaker';
  if(/motor|generator|servo/.test(text))return 'motor';
  if(/nimh|nickel[- ]metal hydride/.test(text))return 'nimh';
  if(/lithium[- ]ion|li[- ]ion|battery\s*(pack|cell)|cell\s*pack/.test(text))return 'li-ion';
  if(/display|touchscreen|touch\s*screen|lcd|oled|phosphor|backlight/.test(text))return 'display';
  if(/tantalum\s*cap|capacitor[- ]rich|capacitors?/.test(text))return 'capacitors';
  if(/rf\b|radio\s*frequency|power\s*(board|module|electronics)|semiconductor|telecom|baseband|mosfet|gan\b|gaas\b/.test(text))return 'semiconductor';
  if(/carbide|tungsten\s*tool/.test(text))return 'carbide';
  if(/solar|photovoltaic|pv\s*module/.test(text))return 'solar';
  if(/fiber\s*optic|laser|optical/.test(text))return 'optics';
  if(/specialty\s*alloy|solder\s*stream/.test(text))return 'alloy';
  return null;
}
function chooseCriticalSource(id,tries){
  const select=E('cm-source-select');
  if(select){if(id&&SOURCE_LABELS[id]){select.value=id;fire(select,'change')}E('critical-materials')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if((tries||0)<50)setTimeout(function(){chooseCriticalSource(id,(tries||0)+1)},100);
}
function openCritical(){const packet=read(),cue=sourceCue(packet);const section=E('critical-materials');if(section)section.scrollIntoView({behavior:'smooth',block:'start'});chooseCriticalSource(cue,0)}
function ensureCard(){
  const panel=E('board-recovery'),grid=panel&&panel.querySelector('.recovery-path-grid');if(!panel||!grid)return null;
  let card=E('spike-import-card');if(card)return card;
  card=document.createElement('div');card.id='spike-import-card';card.className='decision-box';
  card.style.borderColor='#b44cff';
  card.innerHTML='<h3 style="margin-top:0">🧠📡 SPIKE CASE HANDOFF</h3><div id="spike-import-detail">No SPIKE case loaded.</div><div class="eval-actions" style="margin-top:10px"><button id="spike-reapply" class="mini-btn" type="button">Reapply SPIKE Values</button><button id="spike-critical" class="mini-btn" type="button">Check Critical Materials</button><button id="spike-clear" class="mini-btn" type="button">Clear SPIKE Case</button><button id="spike-back" class="mini-btn" type="button">Back to Board Sense</button></div>';
  grid.parentNode.insertBefore(card,grid);
  E('spike-reapply').onclick=apply;
  E('spike-critical').onclick=openCritical;
  E('spike-clear').onclick=function(){localStorage.removeItem(KEY);render(null)};
  E('spike-back').onclick=function(){window.top.location.href='board_sense_case.html'};
  return card;
}
function render(packet){
  ensureCard();const d=E('spike-import-detail'),b=E('spike-critical');if(!d)return;
  if(!packet){d.innerHTML='<b>No SPIKE case loaded.</b> Analyze a board in Board Sense, then use Send Case to Scrap Radar.';if(b){b.disabled=true;b.textContent='Check Critical Materials'}return}
  const i=packet.identity||{},r=packet.recovery||{},e=packet.economics||{},same=packet.sameBoard||{};
  const signals=(r.signals||[]).slice(0,6),cue=sourceCue(packet),cueLabel=cue?SOURCE_LABELS[cue]:null;
  d.innerHTML='<b>'+safe(i.boardType||'Unknown Board')+'</b>'+(i.subtype?'<br>Subtype: '+safe(i.subtype):'')+(i.confidence!=null?'<br>Identity confidence: '+safe(i.confidence)+'%':'')+'<br><b>Recovery:</b> Grade '+safe(r.grade||'WITHHELD')+(r.score!=null?' • Score '+safe(r.score):'')+(r.condition?' • '+safe(r.condition):'')+(same.status?'<br><b>Same-board verification:</b> '+safe(same.status)+(same.confidence!=null?' '+safe(same.confidence)+'%':''):'')+(signals.length?'<br><b>SPIKE recovery signals:</b> '+signals.map(safe).join(' • '):'')+'<br><b>Transferred values:</b> '+(e.sellWholeValue!=null?'Whole offer $'+safe(e.sellWholeValue):'No whole offer')+' • '+(e.fullRecoveryValue!=null?'Deeper recovery $'+safe(e.fullRecoveryValue):'No recovery dollars')+' • '+(e.fullMinutes!=null?safe(e.fullMinutes)+' min':'No recovery time')+(cueLabel?'<br><b>Critical-material inspection cue:</b> '+safe(cueLabel)+' <span class="muted">(source clue only, not composition proof)</span>':'')+'<br><span class="muted">SPIKE supplied evidence and previously entered values only. Confirm buyer terms, distance, fuel, processing costs and hourly target here before acting.</span>';
  if(b){b.disabled=false;b.textContent=cueLabel?'Check Critical Materials: '+cueLabel:'Check Critical Materials'}
}
function apply(){
  const packet=read();render(packet);if(!packet)return;
  const e=packet.economics||{};
  if(e.sellWholeValue!=null)setValue('br-whole',e.sellWholeValue);
  if(e.fullRecoveryValue!=null)setValue('br-full-value',e.fullRecoveryValue);
  if(e.fullMinutes!=null)setValue('br-full-minutes',e.fullMinutes);
  setTimeout(function(){E('board-recovery')&&E('board-recovery').scrollIntoView({behavior:'smooth',block:'start'})},120);
}
function fixPageLinks(){
  document.querySelectorAll('a[href]').forEach(function(a){const h=a.getAttribute('href')||'';if(h&&h.charAt(0)!=='#')a.setAttribute('target','_top')});
}
function init(){ensureCard();fixPageLinks();const packet=read();render(packet);const qs=new URLSearchParams(location.search);if(packet&&(qs.get('source')==='spike'||window.top!==window))setTimeout(apply,120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();