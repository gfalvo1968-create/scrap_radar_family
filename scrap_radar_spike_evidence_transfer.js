/* Phase 7: provenance-aware transfer of existing Board Sense/SPIKE packet evidence.
   Does not fetch images, perform computer vision, infer yields, or assign buyer grades. */
(function(){
'use strict';
var KEY='scrapRadarSpikeRecoveryPacketV1',tries=0;
function packet(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function str(v){return v==null?'':String(v).trim()}
function add(parent,tag,txt){var e=document.createElement(tag);e.textContent=txt;parent.appendChild(e);return e}
function mount(){
 var parent=document.getElementById('spike-evidence-coach-body');
 if(!parent){if(tries++<100)setTimeout(mount,150);return}
 if(document.getElementById('spike-phase7'))return;
 var panel=document.createElement('section');panel.id='spike-phase7';
 panel.style.cssText='margin-top:14px;padding:12px;border:1px solid #8b9c70;border-radius:8px';
 add(panel,'h3','📷 Phase 7: Board Sense evidence transfer');
 add(panel,'p','This view reads evidence already present in the transferred case. Descriptions and model-generated signals remain UNVERIFIED. It does not inspect or transfer original photographs.');
 var status=add(panel,'p','');
 var items=document.createElement('ul');panel.appendChild(items);
 var note=add(panel,'p','');
 function render(){
  items.textContent='';
  var p=packet();
  if(!p){status.textContent='No transferred case loaded.';note.textContent='Send a case from Board Sense first.';return}
  var i=p.identity||{},r=p.recovery||{},sb=p.sameBoard||{};
  var id=str(p.caseId||p.createdAt);
  status.textContent='Case reference: '+(id||'Not provided')+' • Source: transferred SPIKE case • Evidence status: unverified';
  var fields=[
   ['Board type',i.boardType],['Subtype',i.subtype],
   ['Identity confidence',i.confidence==null?'':String(i.confidence)+'%'],
   ['Recovery grade',r.grade],['Recovery condition',r.condition],
   ['Same-board assessment',sb.status||sb.result||sb.verdict],
   ['Same-board confidence',sb.confidence==null?'':String(sb.confidence)+'%']
  ];
  var count=0;
  fields.forEach(function(f){if(str(f[1])){add(items,'li',f[0]+': '+str(f[1])+' [reported by transferred case, not independently verified]');count++}});
  if(Array.isArray(r.signals))r.signals.slice(0,12).forEach(function(v){if(str(v)){add(items,'li','Recovery signal: '+str(v)+' [model-reported, unverified]');count++}});
  if(!count)add(items,'li','No structured observation fields available in this case.');
  note.textContent='Photograph evidence: NOT LINKED in this phase. No photo IDs, image authenticity, component measurements, plating, precious-metal yield or buyer category are verified here. Phase 6 manual checks remain separate and do not become verified automatically.';
 }
 parent.appendChild(panel);render();
 window.addEventListener('storage',function(e){if(e.key===KEY||e.key===null)render()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();