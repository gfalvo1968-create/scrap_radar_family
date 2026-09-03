/* Scrap Radar Source Finder v0.1 */
(function(){
'use strict';

const SOURCES=[
 {id:'hard-drive',icon:'💽',name:'Hard drive',summary:'Permanent magnets and precision electronics can justify a closer look.',materials:[['Neodymium','strong'],['Praseodymium','possible'],['Dysprosium','possible']],note:'Magnet family, markings or assay are stronger evidence than appearance.'},
 {id:'speaker',icon:'🔊',name:'Speaker / audio magnet',summary:'Permanent-magnet assemblies may contain rare-earth magnet material.',materials:[['Neodymium','strong'],['Praseodymium','possible'],['Dysprosium','possible'],['Samarium','possible']],note:'Older and lower-cost speakers may use ferrite instead of rare-earth magnets.'},
 {id:'motor',icon:'⚙️',name:'Motor / generator',summary:'High-performance permanent-magnet motors are worth separating from ordinary motor scrap.',materials:[['Neodymium','strong'],['Praseodymium','possible'],['Dysprosium','possible'],['Terbium','possible']],note:'Do not assume every motor contains rare-earth magnets. Motor type and magnet identification matter.'},
 {id:'nimh',icon:'🔋',name:'NiMH battery pack',summary:'Known NiMH streams can carry several rare-earth and battery materials.',materials:[['Lanthanum','strong'],['Nickel','strong'],['Cerium','possible'],['Neodymium','possible'],['Praseodymium','possible'],['Cobalt','possible']],note:'Keep intact packs in a qualified battery-recycling path and confirm chemistry from labeling or documentation.'},
 {id:'li-ion',icon:'🔋',name:'Lithium-ion battery',summary:'The chemistry label matters because cathode composition varies widely.',materials:[['Lithium','strong'],['Graphite','strong'],['Nickel','possible'],['Cobalt','possible']],note:'Do not open, crush or process damaged cells in Scrap Radar. Use a qualified battery recycler.'},
 {id:'display',icon:'🖥️',name:'Display / touchscreen / lamp phosphor',summary:'Thin coatings and phosphors can contain critical materials even when recoverable mass is tiny.',materials:[['Indium','strong'],['Yttrium','possible'],['Europium','possible'],['Terbium','possible'],['Gallium','possible']],note:'Screen area or lamp size is not a measurement of contained material.'},
 {id:'semiconductor',icon:'💻',name:'RF / power / semiconductor electronics',summary:'Specific device families can contain high-value critical materials in very small masses.',materials:[['Gallium','strong'],['Germanium','possible'],['Tantalum','possible'],['Tungsten','possible'],['Indium','possible']],note:'Part numbers, package type and device documentation are better evidence than board appearance.'},
 {id:'capacitors',icon:'🧩',name:'Capacitor-rich electronics',summary:'Some sorted capacitor families may justify component-level separation.',materials:[['Tantalum','strong'],['Nickel','possible']],note:'Tantalum should be supported by component family, markings or testing before value is assigned.'},
 {id:'carbide',icon:'🛠️',name:'Carbide tooling / dense tool scrap',summary:'Tooling streams can be much more valuable when separated from ordinary steel.',materials:[['Tungsten','strong'],['Cobalt','strong']],note:'Tool grade, density, markings or XRF can help distinguish tungsten-carbide streams.'},
 {id:'solar',icon:'☀️',name:'Solar / photovoltaic material',summary:'PV chemistry varies by technology, so panel type matters before any material value is assumed.',materials:[['Tellurium','possible'],['Indium','possible'],['Gallium','possible'],['Germanium','possible']],note:'Use manufacturer or module chemistry information where available. A generic solar panel does not prove these materials.'},
 {id:'optics',icon:'🔬',name:'Fiber optics / lasers / specialty glass',summary:'Specialty optical components may contain rare-earth dopants or semiconductor materials.',materials:[['Erbium','strong'],['Ytterbium','possible'],['Germanium','possible'],['Yttrium','possible'],['Holmium','possible'],['Thulium','possible']],note:'Optical-component identity or documentation is normally needed because concentrations can be very low.'},
 {id:'alloy',icon:'🔩',name:'Specialty alloy / solder stream',summary:'Sorted alloys and solders can contain critical metals that disappear inside a mixed-metal pile.',materials:[['Nickel','strong'],['Antimony','possible'],['Bismuth','possible'],['Cobalt','possible'],['Scandium','possible']],note:'Alloy certification, markings or XRF are the best path to a defensible value.'}
];

function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function selectedSource(){return SOURCES.find(x=>x.id===el('cm-source-select')?.value)||null}
function confidenceLabel(level){return level==='strong'?'STRONG CANDIDATE':'POSSIBLE CANDIDATE'}
function setMaterial(name){const select=el('cm-material');if(!select)return;select.value=name;select.dispatchEvent(new Event('change',{bubbles:true}));el('cm-evidence')?.scrollIntoView({behavior:'smooth',block:'center'})}
function render(){
 const src=selectedSource(),host=el('cm-source-results');if(!host)return;
 if(!src){host.innerHTML='<div class="cm-source-empty"><b>Choose a source item.</b><span>Scrap Radar will show materials worth checking, plus the evidence needed before value is assigned.</span></div>';return}
 host.innerHTML='<div class="cm-source-summary"><span class="cm-source-big-icon" aria-hidden="true">'+src.icon+'</span><div><h4>'+esc(src.name)+'</h4><p>'+esc(src.summary)+'</p></div></div><div class="cm-source-candidates">'+src.materials.map(([name,level])=>'<button type="button" class="cm-source-material '+level+'" data-cm-source-material="'+esc(name)+'"><span><b>'+esc(name)+'</b><small>'+confidenceLabel(level)+'</small></span><span class="cm-source-arrow">Use →</span></button>').join('')+'</div><div class="cm-source-note"><b>Evidence checkpoint</b><span>'+esc(src.note)+'</span></div><p class="cm-source-disclaimer">Source matching is an inspection guide, not proof of composition or recoverable mass. Confirm identity, supported quantity and a real downstream buyer before assigning cash-out value.</p>';
 host.querySelectorAll('[data-cm-source-material]').forEach(b=>b.addEventListener('click',()=>setMaterial(b.getAttribute('data-cm-source-material'))));
}
function install(){
 const section=el('critical-materials');if(!section||el('cm-source-finder'))return false;
 const truth=section.querySelector('.cm-truth-grid');if(!truth)return false;
 const box=document.createElement('div');box.id='cm-source-finder';box.className='cm-source-finder';
 box.innerHTML='<div class="cm-source-head"><div><span class="cm-source-kicker">FIELD SOURCE FINDER</span><h3>🔎 What are you holding?</h3><p>Start with the object or scrap stream, then work backward to the critical materials worth checking.</p></div><label>Source item<select id="cm-source-select"><option value="">Choose a source item…</option>'+SOURCES.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('')+'</select></label></div><div id="cm-source-results"></div>';
 truth.insertAdjacentElement('afterend',box);
 el('cm-source-select').addEventListener('change',render);render();return true;
}
function loadCss(){if(document.querySelector('link[data-sr-source-finder-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='scrap_radar_source_finder.css?v=1';l.setAttribute('data-sr-source-finder-css','1');document.head.appendChild(l)}
function start(){loadCss();let tries=0;const go=()=>{tries++;if(install()||tries>100)return;setTimeout(go,100)};go()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
