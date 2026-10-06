/* Scrap Radar SPIKE case importer and return v1.2
   Reads only the device-local handoff packet created by Board Sense.
   Evidence stays evidence. Only entered/configured values are copied into fields.
   Clear source clues may cue Critical Materials inspection, but never create composition or value. */
(function(){
'use strict';
const KEY='scrapRadarSpikeRecoveryPacketV1';
const RETURN_FIELDS=['br-whole','br-partial-value','br-residual','br-partial-minutes','br-partial-costs','br-full-value','br-full-residual','br-full-minutes','br-full-costs','br-whole-miles','br-whole-travel','br-whole-fees','br-partial-miles','br-partial-travel','br-partial-fees','br-full-miles','br-full-travel','br-full-fees','br-shared-mpg','br-shared-gas','trip-target','trip-cost-method','trip-fuel-rate'];
let loadedCaseId=caseId(read());
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
function caseId(p){return p?String(p.caseId||p.createdAt||''):''}
function currentPacket(){const p=read();return p&&loadedCaseId&&caseId(p)===loadedCaseId?p:null}
function numeric(id){const raw=E(id)?.value,n=Number(raw);return raw!=null&&String(raw).trim()!==''&&Number.isFinite(n)&&n>=0?n:null}
function caseChanged(){const out=E('spike-estimate-result');if(out)out.textContent='The saved board case changed. Reload Scrap Radar before entering or returning values.';return false}
function savePacket(packet){
  if(!currentPacket()||caseId(packet)!==loadedCaseId)return caseChanged();
  try{localStorage.setItem(KEY,JSON.stringify(packet));return true}
  catch(_){const out=E('spike-estimate-result');if(out)out.textContent='Could not save this case. Check browser storage before returning to Board Sense.';return false}
}
function savedReview(packet){const r=packet&&packet.scrapRadarReturn;return r&&r.version===1&&r.caseId===caseId(packet)?r:null}
function clearSavedEstimate(){
  const packet=currentPacket();if(!packet)return read()?caseChanged():undefined;
  packet.planning=Object.assign({},packet.planning,{weightGrams:null});
  delete packet.planning.weightEntry;delete packet.planning.wholeBoardEstimate;
  const review=savedReview(packet);if(review&&review.wholeBasis!=='entered_offer'&&review.inputs)review.inputs['br-whole']=null;
  return savePacket(packet);
}
function saveReturn(){
  if(!currentPacket())return caseChanged();
  if(window.ScrapRadarGoldScenario?.save()===false){const out=E('spike-estimate-result');if(out)out.textContent='Could not save the metal recovery scenario. Check its message before returning to Board Sense.';return false}
  const packet=currentPacket();if(!packet)return caseChanged();
  const inputs={};RETURN_FIELDS.forEach(function(id){inputs[id]=id==='trip-cost-method'?(['mpg','rate'].includes(E(id)?.value)?E(id).value:null):numeric(id)});
  packet.scrapRadarReturn={version:1,caseId:caseId(packet),returnedAt:new Date().toISOString(),wholeBasis:E('br-whole')?.dataset.basis||'entered_offer',inputs:inputs};
  return savePacket(packet);
}
function fire(node,type){if(node)node.dispatchEvent(new Event(type,{bubbles:true}))}
function setValue(id,value){if(value==null)return;const n=E(id);if(!n)return;n.value=String(value);delete n.dataset.profileDefault;fire(n,'input');fire(n,'change')}
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
  card.innerHTML='<h3 style="margin-top:0">🧠📡 SPIKE CASE HANDOFF</h3><div id="spike-import-detail">No SPIKE case loaded.</div><div id="spike-quick-estimate" style="margin-top:14px;padding:12px;border:1px solid #39ff14;border-radius:10px"><b>⚡ QUICK ESTIMATE</b><div class="muted" style="margin:5px 0 9px">Board identity and grade arrived. A scale weight is the one measurement needed for a whole-board dollar estimate.</div><label for="spike-board-weight">Board weight <input id="spike-board-weight" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter weight" style="max-width:130px"></label> <select id="spike-weight-unit" aria-label="Weight unit"><option value="lb">lb</option><option value="g">grams</option></select><div style="margin:10px 0"><label for="spike-buyer-category">Buyer category (confirm with buyer) <select id="spike-buyer-category"><option value="">Use SPIKE broad grade</option></select></label><div class="muted" style="margin-top:5px">Choose a specific category only after checking the board and buyer requirements. This selection does not change SPIKE’s identity or recovery grade.</div></div><button id="spike-estimate" class="mini-btn" type="button" style="margin-left:8px">Estimate Whole Board</button><div id="spike-estimate-result" class="muted" role="status" aria-live="polite" style="margin-top:8px">Estimated value — not an exact buyer price.</div></div><div class="eval-actions" style="margin-top:10px"><button id="spike-reapply" class="mini-btn" type="button">Reapply SPIKE Values</button><button id="spike-critical" class="mini-btn" type="button">Check Critical Materials</button><button id="spike-clear" class="mini-btn" type="button">Clear SPIKE Case</button><button id="spike-back" class="mini-btn" type="button">Back to Board Sense</button></div>';
  grid.parentNode.insertBefore(card,grid);
  E('spike-reapply').onclick=apply;
  E('spike-estimate').onclick=estimateWhole;
  E('spike-board-weight').addEventListener('input',function(){
    if(Number(this.value)>0&&this.value!=='')estimateWhole();
    else{clearEstimatedFields();if(clearSavedEstimate()===false)return;const out=E('spike-estimate-result');if(out)out.innerHTML='<b style="color:#ffdf73">Enter this board\'s scale weight to see a dollar total.</b> '+priceText(boardQuote(currentPacket()))}
  });
  E('spike-weight-unit').addEventListener('change',function(){if(Number(E('spike-board-weight')?.value)>0)estimateWhole()});
  const categories=E('spike-buyer-category');
  if(categories){
    categories.innerHTML='<option value="">Use SPIKE broad grade</option>'+(window.ScrapRadarBoardPriceReference?.listCategories?.()||[]).map(function(q){return '<option value="'+safe(q.id)+'">'+safe(q.label)+'</option>'}).join('');
    categories.addEventListener('change',function(){
      const packet=currentPacket();if(!packet)return caseChanged();
      const id=categories.value,quote=window.ScrapRadarBoardPriceReference?.get(id);
      packet.planning=Object.assign({},packet.planning,{buyerCategoryId:quote?id:null,buyerCategoryBasis:quote?'user_selected_unconfirmed':null});
      if(savePacket(packet)){if(Number(E('spike-board-weight')?.value)>0)estimateWhole();else render(packet)}
    });
  }

  E('spike-critical').onclick=openCritical;
  E('spike-clear').onclick=function(){if(read()&&!currentPacket())return caseChanged();localStorage.removeItem(KEY);loadedCaseId='';clearEstimatedFields();render(null)};
  E('spike-back').onclick=function(){if(read()&&!saveReturn())return;window.top.location.href='board_sense_case.html?from=scrap-radar&build='+Date.now()};
  E('br-whole')?.addEventListener('input',function(e){if(e.isTrusted){delete this.dataset.spikeEstimated;this.dataset.basis='entered_offer'}});
  return card;
}
function gradeId(packet){
  const p=packet||{},id=p.planning&&p.planning.gradeId;
  if(['board_high','board_mid','board_low','cell_phone_boards'].includes(id))return id;
  const type=String((p.identity||{}).boardType||'').toLowerCase();
  if(/cell phone|smartphone/.test(type))return 'cell_phone_boards';
  const grade=String((p.recovery||{}).grade||'').toUpperCase();
  return grade==='HIGH'?'board_high':grade==='MEDIUM'?'board_mid':grade==='LOW'?'board_low':null;
}
function boardQuote(packet){
  const category=packet?.planning?.buyerCategoryId,selected=category&&window.ScrapRadarBoardPriceReference?.get(category);
  if(selected)return {...selected,type:'estimate',labelSource:'User-selected buyer category; acceptance unconfirmed'};
  const id=gradeId(packet);if(!id)return null;
  const q=window.getScrapRadarMaterialQuote&&window.getScrapRadarMaterialQuote(id);
  if(q&&q.price!=null&&Number.isFinite(Number(q.price))&&Number(q.price)>=0)return q;
  const reference=window.ScrapRadarBoardPriceReference?.get(id);
  return reference?{...reference,type:'estimate',labelSource:'Dated U.S. buyer-sample planning estimate'}:null;
}
function packetCategory(q){return !!q?.requiresBuyerConfirmation}
function sampleSource(q){
  const sample=q?.samples?.[0];if(!sample)return '';
  const url=String(sample.url||'');
  if(!['https://boardsort.com/payout.php','https://jrsadvancedrecyclers.com/scrap-metal-prices/'].includes(url))return '';
  return ' <a href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">'+safe(sample.buyer)+' category and terms</a>.';
}
function priceText(q){
  if(!q)return 'A board-grade planning price is unavailable for this case.';
  return safe(q.label)+' • $'+Number(q.price).toFixed(2)+'/lb • '+(q.type==='local'?'saved local quote (confirm date)':'U.S. buyer-sample planning estimate dated '+safe(q.date||'unknown'))+(q.stale?' • dated sample needs refreshing':'')+(packetCategory(q)?' • user-selected category; buyer acceptance unconfirmed':'')+'. Estimated value is not an exact buyer price.'+sampleSource(q);
}
function selectMaterialWhenReady(id,tries){
  const sel=E('calc-material');if(!sel||!id)return;
  if(Array.from(sel.options).some(function(o){return o.value===id})){
    if(!sel.value)setValue('calc-material',id);
  }else if(tries<40)setTimeout(function(){selectMaterialWhenReady(id,tries+1)},150);
}
function clearEstimatedFields(){
  ['br-whole','calc-weight','yard-weight'].forEach(function(id){const n=E(id);if(n&&n.dataset.spikeEstimated===n.value){n.value='';delete n.dataset.spikeEstimated;fire(n,'input');fire(n,'change')}});
}
function setEstimatedValue(id,value){const n=E(id);if(!n)return;setValue(id,value);n.dataset.spikeEstimated=String(value)}
function estimateWhole(){
  const packet=currentPacket(),input=E('spike-board-weight'),raw=input?.value,entered=Number(raw),unit=E('spike-weight-unit')?.value||'lb',w=unit==='g'?entered/453.59237:entered,out=E('spike-estimate-result'),q=boardQuote(packet);
  if(read()&&!packet)return caseChanged();
  if(!packet||!q){if(out)out.textContent='A verified board grade is needed before an estimate can be calculated.';return}
  if(raw===''||!Number.isFinite(w)||w<=0){if(out)out.innerHTML='<b style="color:#ffdf73">Tap the white weight box and enter a number greater than zero.</b><br>'+priceText(q);if(input){input.style.outline='3px solid #ffdf73';input.focus()}return}
  if(input)input.style.outline='';
  const total=Math.round((w*Number(q.price)+Number.EPSILON)*100)/100,basis=q.type==='local'?'saved_quote':'planning_estimate';
  packet.planning=Object.assign({},packet.planning,{gradeId:gradeId(packet),weightGrams:unit==='g'?entered:entered*453.59237,weightEntry:{value:entered,unit:unit},wholeBoardEstimate:{value:total,basis:basis,pricePerLb:Number(q.price),priceDate:q.date||null,label:q.label||null,source:'Scrap Radar',buyerCategoryId:packet.planning?.buyerCategoryId||null,buyerCategoryBasis:packet.planning?.buyerCategoryBasis||null,calculatedAt:new Date().toISOString()}});
  if(!savePacket(packet))return false;
  ['calc-price','yard-price-1'].forEach(function(id){const n=E(id);if(n)n.dataset.basis=basis});
  const whole=E('br-whole');
  if(whole&&((packet.economics||{}).sellWholeValue==null)&&(whole.value===''||whole.dataset.spikeEstimated===whole.value)){whole.dataset.basis=basis;setEstimatedValue('br-whole',total.toFixed(2))}
  selectMaterialWhenReady(q.id,0);setEstimatedValue('calc-weight',w);setValue('calc-price',Number(q.price).toFixed(2));
  setEstimatedValue('yard-weight',w);setValue('yard-price-1',Number(q.price).toFixed(2));
  if(out)out.innerHTML='<b>Estimated whole-board value: $'+total.toFixed(2)+'</b> ('+entered+' '+(unit==='g'?'grams ≈ ':'lb = ')+w.toFixed(3)+' lb × $'+Number(q.price).toFixed(2)+'/lb). '+priceText(q);
  [['calc-price','spike-calc-basis'],['yard-price-1','spike-yard-basis']].forEach(function(pair){const input=E(pair[0]);if(!input)return;let note=E(pair[1]);if(!note){note=document.createElement('small');note.id=pair[1];input.insertAdjacentElement('afterend',note)}note.textContent=q.type==='local'?'Saved local quote; confirm it is current.':'Planning estimate from dated U.S. buyer samples; replace with an actual quote when available.'});
}
function render(packet){
  ensureCard();const d=E('spike-import-detail'),b=E('spike-critical');if(!d)return;
  window.ScrapRadarGoldScenario?.refresh();
  const estimate=E('spike-estimate'),out=E('spike-estimate-result');
  if(estimate)estimate.disabled=!packet;
  if(!packet){d.innerHTML='<b>No SPIKE case loaded.</b> Analyze a board in Board Sense, then use Send Case to Scrap Radar.';if(out)out.textContent='Send a verified board case to see its grade and planning price.';if(b){b.disabled=true;b.textContent='Check Critical Materials'}return}
  const i=packet.identity||{},r=packet.recovery||{},e=packet.economics||{},same=packet.sameBoard||{};
  const signals=(r.signals||[]).slice(0,6),cue=sourceCue(packet),cueLabel=cue?SOURCE_LABELS[cue]:null;
  d.innerHTML='<b>'+safe(i.boardType||'Unknown Board')+'</b>'+(i.subtype?'<br>Subtype: '+safe(i.subtype):'')+(i.confidence!=null?'<br>Identity confidence: '+safe(i.confidence)+'%':'')+'<br><b>Recovery:</b> Grade '+safe(r.grade||'WITHHELD')+(r.score!=null?' • Score '+safe(r.score):'')+(r.condition?' • '+safe(r.condition):'')+(same.status?'<br><b>Same-board verification:</b> '+safe(same.status)+(same.confidence!=null?' '+safe(same.confidence)+'%':''):'')+(signals.length?'<br><b>SPIKE recovery signals:</b> '+signals.map(safe).join(' • '):'')+'<br><b>Transferred values:</b> '+(e.sellWholeValue!=null?'Whole offer $'+safe(e.sellWholeValue):'No whole offer')+' • '+(e.fullRecoveryValue!=null?'Deeper recovery $'+safe(e.fullRecoveryValue):'No recovery dollars')+' • '+(e.fullMinutes!=null?safe(e.fullMinutes)+' min':'No recovery time')+(cueLabel?'<br><b>Critical-material inspection cue:</b> '+safe(cueLabel)+' <span class="muted">(source clue only, not composition proof)</span>':'')+'<br><span class="muted">SPIKE supplied evidence and previously entered values only. Confirm buyer terms, distance, fuel, processing costs and hourly target here before acting.</span>';
  if(b){b.disabled=false;b.textContent=cueLabel?'Check Critical Materials: '+cueLabel:'Check Critical Materials'}
  const q=boardQuote(packet),weight=E('spike-board-weight'),planning=packet.planning||{},grams=Number(planning.weightGrams),entry=planning.weightEntry;
  if(E('spike-buyer-category'))E('spike-buyer-category').value=planning.buyerCategoryId||'';
  if(weight&&!weight.value&&grams>0){weight.value=String(entry&&entry.value>0?entry.value:grams);E('spike-weight-unit').value=entry&&['g','lb'].includes(entry.unit)?entry.unit:'g'}
  if(out)out.innerHTML=weight&&weight.value?'<b>Saved board weight received.</b> '+priceText(q):'<b style="color:#ffdf73">Case received. Enter this board\'s scale weight above to see the dollar total.</b><br>'+priceText(q);
}
function apply(){
  const packet=currentPacket();if(read()&&!packet)return caseChanged();render(packet);if(!packet)return;
  const e=packet.economics||{};
  const review=savedReview(packet);
  if(review){
    RETURN_FIELDS.forEach(function(id){const value=(review.inputs||{})[id];setValue(id,value==null?'':value)});
    const whole=E('br-whole');if(whole){whole.dataset.basis=review.wholeBasis||'entered_offer';if(['planning_estimate','saved_quote'].includes(whole.dataset.basis))whole.dataset.spikeEstimated=whole.value;else delete whole.dataset.spikeEstimated}
  }else{
    if(e.sellWholeValue!=null){const whole=E('br-whole');if(whole)whole.dataset.basis='entered_offer';setValue('br-whole',e.sellWholeValue)}
    if(e.fullRecoveryValue!=null)setValue('br-full-value',e.fullRecoveryValue);
    if(e.fullMinutes!=null)setValue('br-full-minutes',e.fullMinutes);
  }
  if(E('spike-board-weight')?.value)estimateWhole();
  window.ScrapRadarOperatingProfile?.applyDefaults();
  setTimeout(function(){E('board-recovery')&&E('board-recovery').scrollIntoView({behavior:'smooth',block:'start'})},120);
}
function fixPageLinks(){
  document.querySelectorAll('a[href]').forEach(function(a){const h=a.getAttribute('href')||'';if(h&&h.charAt(0)!=='#')a.setAttribute('target','_top')});
}
function init(){ensureCard();fixPageLinks();const packet=read();render(packet);const qs=new URLSearchParams(location.search);if(packet&&(qs.get('source')==='spike'||window.top!==window))setTimeout(apply,120)}
window.addEventListener('storage',function(e){if((e.key===KEY||e.key===null)&&caseId(read())!==loadedCaseId){caseChanged();if(E('spike-estimate'))E('spike-estimate').disabled=true}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
