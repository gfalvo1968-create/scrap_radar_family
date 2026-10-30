/* SPIKE Phase 6: evidence provenance checklist. Manual entries are local to this page only.
   This does not inspect photos, verify a buyer grade, or change prices. */
(function(){
'use strict';
var attempts=0;
var checks=[
 ['Board front and back','Both sides show the same physical board.'],
 ['Manufacturer / model','Readable manufacturer or equipment-origin markings.'],
 ['Connectors and plating','Connector type and visible plating recorded.'],
 ['Attachments','Heatsinks, metal and daughterboards accounted for.'],
 ['Buyer grading rules','Named buyer and current written category criteria checked.']
];
function mount(){
 var parent=document.getElementById('spike-evidence-coach-body');
 if(!parent){if(attempts++<100)setTimeout(mount,150);return}
 if(document.getElementById('spike-phase6'))return;
 var panel=document.createElement('section');panel.id='spike-phase6';
 panel.style.cssText='margin-top:14px;padding:12px;border:1px solid #73a8b7;border-radius:8px';
 var heading=document.createElement('h3');heading.textContent='🔬 Phase 6: Evidence verification';heading.style.cssText='font-size:1.1em;margin:0 0 8px';
 panel.appendChild(heading);
 var intro=document.createElement('p');intro.textContent='Track each claim as missing, reported/observed, inferred, or manually verified. A verified entry requires a source note. This checklist is not automatic photo analysis and does not alter grading or pricing.';panel.appendChild(intro);
 var rows=[];
 checks.forEach(function(item,n){
  var row=document.createElement('div');row.style.cssText='padding:9px 0;border-top:1px solid #345';
  var label=document.createElement('label');label.textContent=item[0]+' • '+item[1];label.style.display='block';
  var select=document.createElement('select');select.setAttribute('aria-label',item[0]+' evidence status');select.style.cssText='margin:6px 6px 4px 0;max-width:100%;padding:5px';
  [['missing','Missing / not checked'],['reported','Reported or observed (unverified)'],['inferred','Inferred (needs confirmation)'],['verified','Manually verified (source required)']].forEach(function(v){var opt=document.createElement('option');opt.value=v[0];opt.textContent=v[1];select.appendChild(opt)});
  var source=document.createElement('input');source.type='text';source.placeholder='Source / verification note';source.setAttribute('aria-label',item[0]+' verification source');source.style.cssText='padding:5px;max-width:95%;width:260px';
  row.appendChild(label);row.appendChild(select);row.appendChild(source);panel.appendChild(row);rows.push({select:select,source:source});
  select.addEventListener('change',update);source.addEventListener('input',update);
 });
 var result=document.createElement('p');result.style.cssText='font-weight:bold;color:#ffe48d';panel.appendChild(result);
 var disclaimer=document.createElement('p');disclaimer.textContent='No results are stored or sent. Reopening the page resets this checklist. Only a qualified buyer or documented grading rules can confirm buyer category.';panel.appendChild(disclaimer);
 parent.appendChild(panel);
 function update(){
  var verified=0,unverified=0;
  rows.forEach(function(row){
   if(row.select.value==='verified'){
    if(row.source.value.trim().length>=5){verified++;row.select.style.borderColor='#6d9'}
    else{unverified++;row.select.style.borderColor='#f98'}
   }else{row.select.style.borderColor='';if(row.select.value!=='missing')unverified++}
  });
  result.textContent=verified+' of '+rows.length+' checks manually verified with source notes. '+(unverified?'Some entries remain unverified. ':'')+'Buyer grade: NOT VERIFIED by this checklist.';
 }
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();