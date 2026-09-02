(function(){
'use strict';

const BRIDGE='https://boardsense.scrapradarfamily.com/market-intelligence';
const QUOTE_KEY='scrapRadarYardQuotesV1';
const LB_PER_METRIC_TON=2204.62262185;
const LABELS={
  precious_metals:'Precious Metals',copper:'Copper',brass:'Brass',aluminum:'Aluminum',
  stainless:'Stainless Steel',lead_zinc_nickel:'Lead / Zinc / Nickel / Tin',
  ferrous:'Ferrous Steel & Iron',motors_transformers:'Motors & Transformers',
  batteries:'Batteries',electronics:'Electronics / E-Scrap',catalytic:'Catalytic Converters'
};

const FALLBACK={
  precious_metals:[
    ['gold','Gold','troy_oz','market_reference','gold'],['silver','Silver','troy_oz','market_reference','silver'],
    ['platinum','Platinum','troy_oz','market_reference','platinum'],['palladium','Palladium','troy_oz','market_reference','palladium'],
    ['rhodium','Rhodium','troy_oz','local_quote']
  ],
  copper:[
    ['bare_bright','Bare Bright Copper','lb','derived_estimate','copper',.96],['copper_1','#1 Copper','lb','derived_estimate','copper',.92],
    ['copper_2','#2 Copper','lb','derived_estimate','copper',.86],['copper_3','#3 / Light Copper','lb','derived_estimate','copper',.74],
    ['insulated_1','#1 Insulated Copper Wire','lb','derived_estimate','copper',.68],['insulated_2','#2 Insulated Copper Wire','lb','derived_estimate','copper',.52],
    ['insulated_3','#3 Insulated Copper Wire','lb','derived_estimate','copper',.34],['romex','Romex / House Wire','lb','local_quote'],
    ['thhn','THHN / High Recovery Wire','lb','local_quote'],['copper_tubing','Copper Tubing','lb','local_quote']
  ],
  brass:[
    ['yellow_brass','Yellow Brass','lb','local_quote'],['red_brass','Red Brass','lb','local_quote'],['semi_red_brass','Semi-Red Brass','lb','local_quote'],
    ['brass_shells','Clean Brass Shells','lb','local_quote'],['dirty_brass','Dirty / Mixed Brass','lb','local_quote']
  ],
  aluminum:[
    ['aluminum_clean_extrusion','Clean Aluminum Extrusion','lb','local_quote','aluminum'],['aluminum_painted_extrusion','Painted / Coated Extrusion','lb','local_quote','aluminum'],
    ['aluminum_sheet','Clean Sheet Aluminum','lb','local_quote','aluminum'],['aluminum_cast','Cast Aluminum','lb','local_quote','aluminum'],
    ['aluminum_siding','Aluminum Siding','lb','local_quote','aluminum'],['aluminum_coated','Coated / Painted Aluminum','lb','local_quote','aluminum'],
    ['aluminum_wire','Clean Aluminum Wire','lb','local_quote','aluminum'],['aluminum_rims','Clean Aluminum Rims','lb','local_quote','aluminum'],
    ['aluminum_radiator','Aluminum Radiator','lb','local_quote','aluminum'],['copper_aluminum_radiator','Copper/Aluminum Radiator','lb','local_quote']
  ],
  stainless:[['stainless_304','304 Stainless','lb','local_quote'],['stainless_316','316 Stainless','lb','local_quote'],['stainless_mixed','Mixed / Unknown Stainless','lb','local_quote']],
  lead_zinc_nickel:[['clean_lead','Clean Lead','lb','local_quote'],['lead_wheel_weights','Lead Wheel Weights','lb','local_quote'],['zinc_die_cast','Zinc / Die Cast','lb','local_quote'],['nickel_alloy','Nickel Alloy','lb','local_quote'],['tin','Tin','lb','local_quote']],
  ferrous:[['prepared_steel','Prepared Steel','ton','local_quote'],['unprepared_steel','Unprepared Steel','ton','local_quote'],['light_iron','Light Iron / Shred','ton','local_quote'],['cast_iron','Cast Iron','ton','local_quote'],['hms_1','HMS #1','ton','local_quote'],['hms_2','HMS #2','ton','local_quote'],['rebar','Rebar','ton','local_quote'],['white_goods','White Goods / Appliances','ton','local_quote']],
  motors_transformers:[['electric_motors','Electric Motors','lb','local_quote'],['transformers','Transformers','lb','local_quote'],['sealed_units','Sealed Units / Compressors','lb','local_quote'],['ballasts','Ballasts','lb','local_quote']],
  batteries:[['lead_acid_battery','Lead-Acid Battery','lb','local_quote'],['lithium_battery','Lithium-Ion Battery','lb','local_quote'],['nimh_battery','NiMH Battery','lb','local_quote']],
  electronics:[['board_high','High Grade Circuit Boards','lb','local_quote'],['board_mid','Mid Grade Circuit Boards','lb','local_quote'],['board_low','Low Grade Circuit Boards','lb','local_quote'],['ram','RAM','lb','local_quote'],['cpu','CPUs / Processors','lb','local_quote'],['hard_drives','Hard Drives','lb','local_quote'],['power_supplies','Power Supplies','lb','local_quote']],
  catalytic:[['catalytic_converter','Catalytic Converter','each','local_quote']]
};

let state={metals:{},categories:[],materials:[],source:'',updatedAt:null};
let quotes=loadQuotes();

function el(id){return document.getElementById(id)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadQuotes(){try{return JSON.parse(localStorage.getItem(QUOTE_KEY)||'{}')||{}}catch(_){return {}}}
function saveQuotes(){try{localStorage.setItem(QUOTE_KEY,JSON.stringify(quotes))}catch(_){}}
function unitLabel(u){return u==='troy_oz'?'troy oz':u==='metric_ton'?'metric ton':u||''}
function money(v){return Number.isFinite(Number(v))?'$'+Number(v).toLocaleString(undefined,{minimumFractionDigits:Number(v)<10?2:0,maximumFractionDigits:Number(v)<10?2:2}):'—'}
function hasNumericValue(v){return v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))}

function fallbackCategories(data){
  const metals=(data&&data.metals)||{};
  const copperGrades=(data&&data.scrap_grades&&data.scrap_grades.copper)||{};
  return Object.entries(FALLBACK).map(([id,rows])=>({id,label:LABELS[id]||id,materials:rows.map(r=>{
    const m={id:r[0],label:r[1],unit:r[2],pricing_mode:r[3],reference:r[4]||null,factor:r[5]};
    if(m.pricing_mode==='market_reference'){
      const ref=metals[m.reference]||{};m.price=ref.available&&hasNumericValue(ref.price)?Number(ref.price):null;m.price_unit=ref.unit||m.unit;m.price_type='market_reference';
    }else if(m.pricing_mode==='derived_estimate'){
      const cg=copperGrades[m.id];
      if(cg&&hasNumericValue(cg.estimated_price_per_lb)){m.price=Number(cg.estimated_price_per_lb)}
      else if(metals.copper&&hasNumericValue(metals.copper.price)){m.price=Number(metals.copper.price)*Number(m.factor||0)}
      else m.price=null;
      m.price_unit='lb';m.price_type='estimated_scrap_grade';
    }else{m.price=null;m.price_unit=m.unit;m.price_type='local_quote_required'}
    if(m.reference&&metals[m.reference]){m.benchmark_price=metals[m.reference].price;m.benchmark_unit=metals[m.reference].unit}
    return m;
  })}));
}

function flatten(){state.materials=[];state.categories.forEach(c=>(c.materials||[]).forEach(m=>state.materials.push({...m,category_id:c.id,category_label:c.label}))) }

async function loadData(){
  setStatus('Connecting to market bridge…','warn');
  let data=null;
  try{
    const r=await fetch(BRIDGE+'?t='+Date.now(),{cache:'no-store'});
    data=await r.json();
    if(!r.ok)throw new Error('HTTP '+r.status);
  }catch(err){
    data={status:'unavailable',metals:{},scrap_grades:{},materials:[],message:'Live market bridge unavailable.'};
  }
  state.metals=data.metals||{};
  state.source=data.source||'Scrap Radar';
  state.updatedAt=data.updated_at||null;
  state.categories=Array.isArray(data.materials)&&data.materials.length?data.materials:fallbackCategories(data);
  flatten();
  renderBenchmarks();renderMaterials();renderCalculator();
  if(data.status==='live')setStatus('Market feed live','live');
  else if(data.status==='unconfigured')setStatus('Market bridge needs Scrap Radar API URL','warn');
  else setStatus('Catalog ready • live prices unavailable','warn');
  el('sr-updated').textContent=state.updatedAt?'Updated '+new Date(state.updatedAt).toLocaleString():'Catalog loaded';
}

function setStatus(text,kind){const s=el('sr-feed-status');if(!s)return;s.textContent=text;s.className='status-chip '+(kind||'')}

function renderBenchmarks(){
  const box=el('benchmark-grid');if(!box)return;
  const order=[['gold','🥇 Gold'],['silver','🥈 Silver'],['copper','🥉 Copper'],['aluminum','⚪ Aluminum'],['platinum','⚪ Platinum'],['palladium','⚫ Palladium']];
  box.innerHTML=order.map(([id,label])=>{
    const m=state.metals[id]||{};const ok=m.available&&hasNumericValue(m.price);
    let val='Waiting…',unit=unitLabel(m.unit),yardContext='';
    if(ok){
      val=money(m.price);
      if(id==='aluminum'&&m.unit==='metric_ton'){
        const perLb=Number(m.price)/LB_PER_METRIC_TON;
        yardContext=`<div class="yard-context">≈ ${money(perLb)} / lb benchmark</div>`;
      }
    }
    const intel=m.intelligence||{};
    return `<div class="market-card ${ok?'':'unavailable'}"><div class="name">${label}</div><div class="value">${val}</div><div class="unit">${ok?'USD / '+esc(unit):'benchmark unavailable'}</div>${yardContext}<div class="trend">${esc(intel.trend||'')}</div></div>`;
  }).join('');
}

function effectivePrice(m){
  const rawQuote=quotes[m.id];
  if(hasNumericValue(rawQuote)){
    const q=Number(rawQuote);
    if(q>=0)return {price:q,type:'local',unit:m.unit,label:'Your yard quote'};
  }
  if(hasNumericValue(m.price)){
    const p=Number(m.price);
    if(p>=0)return {price:p,type:m.price_type==='market_reference'?'benchmark':'estimate',unit:m.price_unit||m.unit,label:m.price_type==='market_reference'?'Market reference':'Benchmark-derived estimate'};
  }
  return {price:null,type:'local',unit:m.unit,label:'Local quote required'};
}

function priceBlock(m){
  const e=effectivePrice(m);
  if(e.price!==null){return `<div class="material-price price-${e.type}"><strong>${money(e.price)} / ${esc(unitLabel(e.unit))}</strong><small>${esc(e.label)}</small></div>`}
  return `<div class="material-price price-local"><input class="quote-input" inputmode="decimal" data-quote-id="${esc(m.id)}" placeholder="yard $" aria-label="Yard quote for ${esc(m.label)}"><small>local yard/refiner quote</small></div>`;
}

function benchmarkNote(m){
  if(m.pricing_mode==='derived_estimate')return `Estimated from copper benchmark${m.factor?' × '+m.factor:''}.`;
  if(m.pricing_mode==='market_reference')return 'Commodity benchmark, not a scrap-yard payout.';
  if(m.reference&&hasNumericValue(m.benchmark_price)){
    if(m.reference==='aluminum'&&m.benchmark_unit==='metric_ton'){
      return `Aluminum benchmark ≈ ${money(Number(m.benchmark_price)/LB_PER_METRIC_TON)}/lb; yard price still required.`;
    }
    return `${m.reference} benchmark context available; yard price still required.`;
  }
  if(m.id==='catalytic_converter')return 'Price by serial number, buyer quote or assay.';
  return 'Buyer/yard quote required for real cash-out value.';
}

function renderMaterials(){
  const root=el('material-categories');if(!root)return;
  const query=(el('material-search')?.value||'').trim().toLowerCase();
  let visible=0;
  const html=state.categories.map((c,idx)=>{
    const mats=(c.materials||[]).filter(m=>!query||`${m.label} ${c.label}`.toLowerCase().includes(query));
    if(!mats.length)return '';
    visible+=mats.length;
    return `<details class="category" ${query||idx<3?'open':''}><summary><span>${esc(c.label)}</span><span class="count">${mats.length} grades</span></summary><div class="material-list">${mats.map(m=>`<div class="material-row"><div><div class="material-name">${esc(m.label)}</div><div class="material-meta">${esc(benchmarkNote(m))}</div></div>${priceBlock(m)}</div>`).join('')}</div></details>`;
  }).join('');
  root.innerHTML=html||'<div class="empty">No materials match that search.</div>';
  el('material-count').textContent=visible+' material grades';
  root.querySelectorAll('[data-quote-id]').forEach(input=>{
    const id=input.dataset.quoteId;if(quotes[id]!=null)input.value=quotes[id];
    input.addEventListener('change',()=>{
      const n=Number(input.value);
      if(input.value!==''&&Number.isFinite(n)&&n>=0)quotes[id]=n;else delete quotes[id];
      saveQuotes();renderMaterials();renderCalculator();
    });
  });
}

function renderCalculator(){
  const sel=el('calc-material');if(!sel)return;
  const previous=sel.value;
  sel.innerHTML='<option value="">Choose a material…</option>'+state.categories.map(c=>`<optgroup label="${esc(c.label)}">${(c.materials||[]).map(m=>`<option value="${esc(m.id)}">${esc(m.label)}</option>`).join('')}</optgroup>`).join('');
  if(previous&&state.materials.some(m=>m.id===previous))sel.value=previous;
  updateCalcPrice();calculate();
}

function updateCalcPrice(){
  const id=el('calc-material')?.value;const m=state.materials.find(x=>x.id===id);if(!m)return;
  const e=effectivePrice(m);const p=el('calc-price');
  if(e.price!==null)p.value=Number(e.price).toFixed(2);else p.value='';
  el('calc-unit').textContent='per '+unitLabel(m.unit);
}

function calculate(){
  const id=el('calc-material')?.value;const m=state.materials.find(x=>x.id===id);
  const weight=Number(el('calc-weight')?.value);const rawPrice=el('calc-price')?.value;const price=Number(rawPrice);
  const value=m&&Number.isFinite(weight)&&weight>=0&&rawPrice!==''&&Number.isFinite(price)&&price>=0?weight*price:0;
  el('calc-value').textContent=money(value);
  el('calc-detail').textContent=m&&rawPrice!==''&&price>=0?`${weight||0} ${unitLabel(m.unit)} × ${money(price)} per ${unitLabel(m.unit)}`:'Choose a material and enter weight.';
}

function bind(){
  el('material-search')?.addEventListener('input',renderMaterials);
  el('refresh-prices')?.addEventListener('click',loadData);
  el('calc-material')?.addEventListener('change',()=>{updateCalcPrice();calculate()});
  el('calc-weight')?.addEventListener('input',calculate);
  el('calc-price')?.addEventListener('input',calculate);
}

document.addEventListener('DOMContentLoaded',()=>{bind();loadData()});
})();
