/* Board Sense target-area display patch v0.1 */
(function(){
'use strict';
function E(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function list(a){return Array.isArray(a)&&a.length?'<ul class="signal-list">'+a.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':''}
function install(){
 if(window.__targetAreaDisplayPatched)return true;
 if(typeof window.renderSpike!=='function')return false;
 window.__targetAreaDisplayPatched=true;
 var prior=window.renderSpike;
 window.renderSpike=function(data){
  var t=data&&data.inspection_target;
  if(!t||t.status!=='target_area_candidate')return prior(data);
  var vt=t.visual_target||{},quality=typeof window.renderQuality==='function'?window.renderQuality(data):'';
  var generic=t.generic_top_match||{};
  return quality+'<div class="it-result"><b>🎯 TARGET AREA CANDIDATE: '+esc(t.target||'Inspection target')+'</b><p>'+esc(t.message||'Target-specific geometry found the expected inspection area.')+'</p>'+(vt.confidence!=null?'<p><strong>Target-area confidence:</strong> '+esc(vt.confidence)+'%</p>':'')+list(vt.evidence)+(t.look?'<p><strong>Next close-up clue:</strong> '+esc(t.look)+'</p>':'')+'<div class="it-generic">Generic visual recognition: <strong>'+esc(generic.label||'none')+'</strong>'+(generic.confidence!=null?' • '+esc(generic.confidence)+'%':'')+'. Kept as background only.</div></div><p class="muted">SPIKE found the expected actuator area. A tighter photo of the metal-backed magnet assembly can move this from target-area candidate to component-level confirmation.</p>';
 };
 return true;
}
var tries=0;(function wait(){tries++;if(install()||tries>80)return;setTimeout(wait,100)})();
})();
