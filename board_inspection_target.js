/* Board Sense inspection-target handoff v0.1 */
(function(){
'use strict';
const KEY='scrapRadarInspectionTargetV1';
function E(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
function style(){if(E('inspectionTargetStyle'))return;const s=document.createElement('style');s.id='inspectionTargetStyle';s.textContent=`
#inspectionTargetPanel{border-color:#00d4ff;background:linear-gradient(180deg,rgba(0,212,255,.09),rgba(8,20,26,.86));box-shadow:0 0 24px rgba(0,212,255,.10)}
.it-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.it-kicker{font-size:.72rem;font-weight:900;letter-spacing:.12em;color:#72e8ff}.it-head h2{margin:4px 0 4px;color:#eaffff}.it-source{color:#a5eefb;font-size:.9rem}.it-target{margin:12px 0;padding:13px;border-radius:12px;border:1px solid rgba(57,255,20,.35);background:#071207}.it-target span{display:block;font-size:.68rem;letter-spacing:.1em;font-weight:900;color:#39ff14}.it-target strong{display:block;margin-top:5px;font-size:1.15rem;color:#fff}.it-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.it-grid>div{padding:11px 12px;border-radius:11px;background:#080d0d;border:1px solid rgba(255,255,255,.1)}.it-grid b{display:block;margin-bottom:5px;font-size:.68rem;letter-spacing:.07em;color:#72e8ff}.it-grid p{margin:0;color:#d7e6e2;line-height:1.42;font-size:.84rem}.it-materials{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.it-chip{padding:6px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:#080808;color:#eee;font-size:.75rem}.it-chip.strong{border-color:rgba(57,255,20,.5);color:#8dff7a}.it-rule{font-size:.76rem;line-height:1.4;color:#aaa}.it-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.it-actions button{border-color:#00d4ff;color:#8aeaff}.it-actions .clear{border-color:#777;color:#bbb}@media(max-width:700px){.it-head{display:block}.it-grid{grid-template-columns:1fr}.it-actions button{width:100%}}
`;document.head.appendChild(s)}
function clear(){localStorage.removeItem(KEY);const p=E('inspectionTargetPanel');if(p)p.remove();const status=E('spikeStatus');if(status&&/Inspection target loaded/.test(status.textContent||''))status.textContent='Recognition mode ready.'}
function aim(packet){
 if(typeof window.openBoardSenseDashboard==='function')window.openBoardSenseDashboard();
 window.ScrapRadarInspectionTarget=packet;
 const status=E('spikeStatus');if(status)status.textContent='Inspection target loaded: '+packet.target+'. Take a clear close photo of that area, plus enough surrounding context to place it on the item.';
 const box=E('spikeBox');if(box&&/recognition candidates will appear here/i.test(box.textContent||''))box.innerHTML='<div class="type-box"><div class="type-name">🎯 '+esc(packet.target)+'</div><b>SPIKE inspection mission:</b> '+esc(packet.where)+'<p><b>Look for:</b> '+esc(packet.look)+'</p><p class="muted">Target guidance narrows the inspection area. It does not tell SPIKE what material must be present.</p></div>';
 const spike=E('spikeImage')?.closest('.spike-panel')||E('spikeImage');if(spike)setTimeout(()=>spike.scrollIntoView({behavior:'smooth',block:'start'}),120);
}
function render(){
 const packet=read();if(!packet||!packet.target)return false;
 style();window.ScrapRadarInspectionTarget=packet;
 const dash=E('dashboard');if(!dash)return false;
 let panel=E('inspectionTargetPanel');if(panel)panel.remove();
 panel=document.createElement('section');panel.id='inspectionTargetPanel';panel.className='panel';
 const mats=Array.isArray(packet.materials)?packet.materials:[];
 panel.innerHTML='<div class="it-head"><div><span class="it-kicker">SCRAP RADAR → BOARD SENSE</span><h2>🎯 Inspection Target Loaded</h2><div class="it-source">Source: '+esc(packet.sourceName||'Scrap Radar field source')+'</div></div></div><div class="it-target"><span>LOOK HERE</span><strong>'+esc(packet.target)+'</strong></div><div class="it-grid"><div><b>WHERE TO AIM</b><p>'+esc(packet.where||'Use the saved Scrap Radar inspection area.')+'</p></div><div><b>WHAT TO LOOK FOR</b><p>'+esc(packet.look||'Use shape, markings and surrounding context.')+'</p></div><div><b>PRESERVE</b><p>'+esc(packet.preserve||'Preserve the target until identity and economics are confirmed.')+'</p></div><div><b>WATCH OUT</b><p>'+esc(packet.watch||'Do not assign material value from appearance alone.')+'</p></div></div>'+(mats.length?'<div class="it-materials">'+mats.map(m=>'<span class="it-chip '+(m.candidate==='strong'?'strong':'')+'">'+esc(m.name)+' • '+esc(m.candidate||'candidate')+'</span>').join('')+'</div>':'')+'<div class="it-rule">'+esc(packet.rule||'Inspection target only. Composition and value remain unproven until supported by evidence.')+'</div><div class="it-actions"><button id="inspectionAimSpike" type="button">🔍 Aim Spike Glass at This Target</button><button id="inspectionBackScrap" type="button">📡 Back to Scrap Radar</button><button id="inspectionClear" class="clear" type="button">Clear Target</button></div>';
 const first=dash.querySelector('header.panel');if(first)first.insertAdjacentElement('afterend',panel);else dash.prepend(panel);
 E('inspectionAimSpike').onclick=()=>aim(packet);E('inspectionBackScrap').onclick=()=>{window.top.location.href='scrap_radar_operating_case.html#critical-materials'};E('inspectionClear').onclick=clear;
 return true;
}
function start(){let tries=0;const go=()=>{tries++;if(render()||tries>80)return;setTimeout(go,100)};go()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
