/* Scrap Radar Critical Materials Help v0.2 */
(function(){
'use strict';
function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function examples(text){return String(text||'').replace(/\band\b/gi,',').replace(/\//g,',').split(',').map(x=>x.trim()).filter(Boolean).slice(0,5)}
function snapshot(name,source){
 const select=el('cm-material'),box=el('cm-evidence');if(!select||!box)return {name,source,group:'Critical material',where:source,evidence:'Confirm material identity and supported quantity.',route:'Use an appropriate buyer, recycler or refiner.'};
 const prior=select.value;select.value=name;select.dispatchEvent(new Event('change',{bubbles:true}));
 const cards=[...box.querySelectorAll(':scope > div')].map(d=>({title:d.querySelector('b')?.textContent||'',text:d.querySelector('span')?.textContent||''}));
 select.value=prior;select.dispatchEvent(new Event('change',{bubbles:true}));
 return {name,source,group:cards[0]?.text||'Critical material',where:cards[1]?.text||source,evidence:cards[2]?.text||'Confirm identity and supported quantity.',route:cards[3]?.text||'Use an appropriate buyer, recycler or refiner.'};
}
function intro(info){const kind=info.group==='Rare Earth Elements'?'rare-earth element':/Battery|Energy/.test(info.group)?'critical battery / energy material':'critical electronics material';return `${info.name} is a ${kind} that can appear in valuable products or process streams. Scrap Radar keeps three questions separate: presence, recoverable quantity, and real cash-out value.`}
function reality(info){const s=(info.source+' '+info.route).toLowerCase();if(info.name==='Promethium')return 'Not an ordinary scrap target. A credible identification belongs in a regulated-material pathway, not normal scrap processing.';if(/battery|cathode/.test(s))return 'The practical unit is usually a documented battery or material stream. Do not assign loose-material value from appearance alone.';if(/magnet/.test(s))return 'The useful stream is often the intact magnet or a sorted magnet-bearing lot. Reuse may beat raw-material recovery for small quantities.';if(/display|touchscreen|phosphor|coating/.test(s))return 'These materials can exist in very thin layers. A large display or lamp does not automatically mean a useful recoverable mass.';if(/semiconductor|capacitor|electronics|rf/.test(s))return 'Value may be concentrated in particular components. The whole board does not inherit that material value without supporting evidence.';return 'Recovery depends on form, concentration, lot size, handling cost and downstream acceptance.'}
function iconCandidates(text){
 const s=String(text||'').toLowerCase(),out=[],add=(icon,label)=>{if(!out.some(x=>x.icon===icon)&&out.length<2)out.push({icon,label})};
 if(/hard drive/.test(s))add('💽','Hard-drive source example');
 if(/magnet/.test(s))add('🧲','Magnet source example');
 if(/speaker/.test(s))add('🔊','Speaker source example');
 if(/motor|generator/.test(s))add('⚙️','Motor / generator example');
 if(/battery|cathode/.test(s))add('🔋','Battery-material example');
 if(/semiconductor|rf|electronics|capacitor/.test(s))add('💻','Electronic component example');
 if(/display|touchscreen|led|phosphor|lamp/.test(s))add('🖥️','Display / phosphor example');
 if(/optic|laser|glass/.test(s))add('🔬','Optical / laser example');
 if(/carbide|tool|weight/.test(s))add('🛠️','Tooling / dense-metal example');
 if(/solar/.test(s))add('☀️','Solar-material example');
 if(/alloy|stainless|lead|solder/.test(s))add('🔩','Alloy / solder example');
 if(/catalyst/.test(s))add('⚗️','Catalyst example');
 if(out.length<2)add('🧪','Sorted material-stream example');
 if(out.length<2)add('♻️','Downstream recovery example');
 return out;
}
function closeHelp(){const m=el('cm-help-modal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}document.body.classList.remove('cm-help-open')}
function useMaterial(name){const select=el('cm-material');if(select){select.value=name;select.dispatchEvent(new Event('change',{bubbles:true}));el('critical-materials')?.scrollIntoView({behavior:'smooth',block:'start'})}closeHelp()}
function showHelp(name,source){
 const modal=el('cm-help-modal'),title=el('cm-help-title'),body=el('cm-help-body');if(!modal||!title||!body)return;
 if(name==='__overview__'){
  title.textContent='Rare Earth + Critical Materials';
  body.innerHTML='<p class="cm-help-lead">This section is a field guide and value check, not a promise that every rare material is worth recovering.</p><div class="cm-help-grid"><div><h4>1. Presence</h4><p>Where could the material occur?</p></div><div><h4>2. Recoverability</h4><p>Is a measurable or documented quantity actually supported?</p></div><div><h4>3. Cash-out</h4><p>Will a real buyer or refiner accept this form and lot?</p></div><div><h4>The rule</h4><p>Rare does not automatically mean profitable. Every dollar still needs a receipt.</p></div></div><div class="cm-help-note">Pictures and product families can guide inspection, but they do not prove contained mass.</div>';
 }else{
  const info=snapshot(name,source),pics=iconCandidates(info.source),uses=examples(info.source);
  title.textContent=name;
  body.innerHTML=`<span class="cm-help-chip">${esc(info.group)}</span><p class="cm-help-lead">${esc(intro(info))}</p><div class="cm-help-pictures">${pics.map(p=>`<div class="cm-help-picture"><span aria-hidden="true">${p.icon}</span><b>${esc(p.label)}</b></div>`).join('')}</div><small class="cm-picture-note">Example illustrations show common source categories, not proof that the pictured item contains a recoverable amount.</small><div class="cm-help-grid"><div><h4>Common uses / examples</h4><ul>${uses.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Where it may occur</h4><p>${esc(info.where)}</p></div><div><h4>Evidence needed</h4><p>${esc(info.evidence)}</p></div><div><h4>Likely downstream path</h4><p>${esc(info.route)}</p></div><div><h4>Recovery reality</h4><p>${esc(reality(info))}</p></div><div><h4>Cash-out reality</h4><p>Confirm exact form, lot size, minimums, fees and settlement basis. Benchmark value is not a buyer payout.</p></div></div><div class="cm-help-actions"><button type="button" class="mini-btn" data-help-use>Use in Value Check</button><button type="button" class="mini-btn" data-help-close>Close</button></div>`;
  body.querySelector('[data-help-use]')?.addEventListener('click',()=>useMaterial(name));body.querySelector('[data-help-close]')?.addEventListener('click',closeHelp);
 }
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('cm-help-open');
}
function installModal(){if(el('cm-help-modal'))return;const m=document.createElement('div');m.id='cm-help-modal';m.className='cm-help-modal';m.setAttribute('aria-hidden','true');m.innerHTML='<div class="cm-help-dialog" role="dialog" aria-modal="true" aria-labelledby="cm-help-title"><button type="button" class="cm-help-close" aria-label="Close">×</button><h2 id="cm-help-title">Material Help</h2><div id="cm-help-body"></div></div>';document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)closeHelp()});m.querySelector('.cm-help-close').addEventListener('click',closeHelp);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp()})}
function decorate(){
 const section=el('critical-materials');if(!section)return false;installModal();section.querySelector('.cm-badge').textContent='FRAMEWORK v0.2';
 const h2=section.querySelector('.cm-head h2');if(h2&&!el('cm-overview-help')){const q=document.createElement('button');q.id='cm-overview-help';q.type='button';q.className='cm-title-help';q.textContent='?';q.setAttribute('aria-label','Open Rare Earth and Critical Materials guide');q.addEventListener('click',()=>showHelp('__overview__',''));h2.appendChild(q)}
 section.querySelectorAll('.cm-row[data-cm]').forEach(row=>{if(row.querySelector('.cm-help-dot'))return;const q=document.createElement('span');q.className='cm-help-dot';q.textContent='?';q.setAttribute('role','button');q.setAttribute('tabindex','0');q.setAttribute('aria-label','Open '+row.dataset.cm+' description');const source=row.children[1]?.textContent||'';const go=e=>{e.preventDefault();e.stopPropagation();showHelp(row.dataset.cm,source)};q.addEventListener('click',go);q.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){go(e)}});row.appendChild(q)});
 return true;
}
function loadCss(){if(document.querySelector('link[data-sr-critical-help-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='scrap_radar_critical_help.css?v=1';l.setAttribute('data-sr-critical-help-css','1');document.head.appendChild(l)}
function start(){loadCss();let tries=0;const run=()=>{tries++;if(decorate()||tries>80)return;setTimeout(run,100)};run();const host=el('cm-catalog');if(host)new MutationObserver(decorate).observe(host,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
