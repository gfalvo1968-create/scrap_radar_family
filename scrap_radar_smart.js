(function(){
'use strict';
const INVENTORY_KEY='scrapRadarInventoryV1';
const QUOTE_KEY='scrapRadarYardQuotesV1';
const TON_IDS=new Set(['prepared_steel','unprepared_steel','light_iron','cast_iron','hms_1','hms_2','rebar','white_goods']);
const TROY_IDS=new Set(['gold','silver','platinum','palladium','rhodium']);
const EACH_IDS=new Set(['catalytic_converter']);
function el(id){return document.getElementById(id)}
function numValue(v){const n=Number(v);return v!==''&&Number.isFinite(n)?n:null}
function cash(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function json(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
function fire(node,type='input'){if(node)node.dispatchEvent(new Event(type,{bubbles:true}))}
function unitFor(id){if(TON_IDS.has(id))return 'ton';if(TROY_IDS.has(id))return 'troy oz';if(EACH_IDS.has(id))return 'each';return 'lb'}
function optionLabel(id){const s=el('calc-material');if(!s)return id;const o=[...s.options].find(x=>x.value===id);return o?o.text:id}
function parseRenderedPrice(id){
 const label=optionLabel(id);if(!label)return null;
 const rows=[...document.querySelectorAll('.material-row')];
 const row=rows.find(r=>(r.querySelector('.material-name')?.textContent||'').trim()===label.trim());
 const strong=row?.querySelector('.material-price strong');if(!strong)return null;
 const match=(strong.textContent||'').replace(/,/g,'').match(/\$\s*([0-9]+(?:\.[0-9]+)?)/);if(!match)return null;
 const p=Number(match[1]);if(!Number.isFinite(p))return null;
 return {price:p,unit:unitFor(id),basis:(row.querySelector('.material-price small')?.textContent||'displayed price').trim()};
}
function smartPrice(id){
 if(!id)return null;
 const q=json(QUOTE_KEY,{})[id];if(q!==undefined&&q!==null&&q!==''&&Number.isFinite(Number(q)))return {price:Number(q),unit:unitFor(id),basis:'saved yard/refiner quote'};
 const rendered=parseRenderedPrice(id);if(rendered)return rendered;
 if(el('calc-material')?.value===id){const p=numValue(el('calc-price')?.value||'');if(p!==null)return {price:p,unit:unitFor(id),basis:'current evaluator price'}}
 return null;
}
function setPriceIfBlank(select,priceInput){
 if(!select||!priceInput||!select.value)return;
 priceInput.placeholder='$ / '+unitFor(select.value);
 if(priceInput.value!=='')return;
 const p=smartPrice(select.value);if(!p)return;
 priceInput.value=Number(p.price).toFixed(2);priceInput.dataset.smartBasis=p.basis;fire(priceInput,'input');
}
function mixedRows(){return [...document.querySelectorAll('.load-line')]}
function syncMixedUnits(){
 const groups={};let active=0;
 mixedRows().forEach(row=>{const s=row.querySelector('.load-material'),qv=row.querySelector('.load-qty')?.value||'';if(!s||!s.value||qv==='')return;const q=Number(qv);if(!Number.isFinite(q))return;active++;const u=unitFor(s.value);groups[u]=(groups[u]||0)+q});
 const out=el('mixed-weight');if(out){const keys=Object.keys(groups);if(!active)out.textContent='0.00';else if(keys.length===1)out.textContent=groups[keys[0]].toFixed(2)+' '+keys[0];else out.textContent='MIXED UNITS'}
 let note=el('smart-unit-breakdown');const summary=document.querySelector('.mixed-summary');if(summary&&!note){note=document.createElement('div');note.id='smart-unit-breakdown';note.className='saved-yard-note';summary.insertAdjacentElement('afterend',note)}
 if(note){const parts=Object.entries(groups).map(([u,q])=>Number(q).toFixed(2)+' '+u);note.textContent=parts.length?'Quantity breakdown: '+parts.join(' • '):'Quantity units will be checked automatically as lines are added.'}
}
function onMixedChange(e){
 const row=e.target.closest?.('.load-line');if(!row)return;
 if(e.target.matches('.load-material'))setTimeout(()=>setPriceIfBlank(e.target,row.querySelector('.load-price')),0);
 setTimeout(syncMixedUnits,0);
}
function injectMixedAutomation(){
 const panel=el('mixed-load');if(!panel||el('build-from-inventory'))return;
 const actions=panel.querySelector('.eval-actions');if(!actions)return;
 const b=document.createElement('button');b.id='build-from-inventory';b.className='mini-btn';b.type='button';b.textContent='Build Load From Inventory';b.addEventListener('click',buildFromInventory);actions.appendChild(b);
 panel.addEventListener('change',onMixedChange);panel.addEventListener('input',()=>setTimeout(syncMixedUnits,0));syncMixedUnits();
}
function buildFromInventory(){
 const items=json(INVENTORY_KEY,[]).filter(x=>x.status!=='sold');if(!items.length){const note=el('smart-unit-breakdown');if(note)note.textContent='No in-stock inventory is available to build a load.';return}
 el('clear-load')?.click();
 items.forEach((item,i)=>{if(i>0)el('add-load-line')?.click();const rows=mixedRows(),row=rows[rows.length-1],s=row?.querySelector('.load-material'),q=row?.querySelector('.load-qty'),p=row?.querySelector('.load-price');if(!row||!s||!q||!p)return;if([...s.options].some(o=>o.value===item.materialId)){s.value=item.materialId;fire(s,'change')}q.value=item.qty;fire(q,'input');const chosen=item.expectedPrice!==null&&item.expectedPrice!==undefined?Number(item.expectedPrice):smartPrice(item.materialId)?.price;if(chosen!==undefined&&chosen!==null&&Number.isFinite(Number(chosen))){p.value=Number(chosen).toFixed(2);fire(p,'input')}});
 syncMixedUnits();el('mixed-load')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function injectEvaluatorInventoryButton(){
 const actions=el('evaluator')?.querySelector('.eval-actions');if(!actions||el('save-load-inventory'))return;
 const b=document.createElement('button');b.id='save-load-inventory';b.className='mini-btn';b.type='button';b.textContent='Save Load to Inventory';b.addEventListener('click',()=>{const mid=el('calc-material')?.value,qty=el('calc-weight')?.value,price=el('calc-price')?.value;if(!mid||!qty){if(el('op-detail'))el('op-detail').textContent='Choose a material and enter a quantity before saving inventory.';return}const inv=el('inv-material');if(!inv){if(el('op-detail'))el('op-detail').textContent='Inventory panel is still loading. Try again in a moment.';return}inv.value=mid;fire(inv,'change');if(el('inv-qty'))el('inv-qty').value=qty;if(el('inv-price'))el('inv-price').value=price;el('inv-add')?.click()});actions.insertBefore(b,actions.children[1]||null);
}
function enhanceInventory(){
 const panel=el('inventory');if(!panel||panel.dataset.smart==='1')return;panel.dataset.smart='1';const s=el('inv-material'),p=el('inv-price');if(s&&p)s.addEventListener('change',()=>setTimeout(()=>setPriceIfBlank(s,p),0));const h=el('roi')?.querySelector('h2');if(h)h.textContent='📊 ROI Ledger';injectEvaluatorInventoryButton();
}
function injectBestYardButton(){
 const panel=el('yard-comparison');if(!panel||el('use-best-yard'))return;const decision=panel.querySelector('.eval-decision');if(!decision)return;const wrap=document.createElement('div');wrap.className='eval-actions';const b=document.createElement('button');b.id='use-best-yard';b.className='mini-btn';b.type='button';b.textContent='Use Best Buyer in Evaluator';b.addEventListener('click',useBestYard);wrap.appendChild(b);decision.insertAdjacentElement('afterend',wrap);
}
function useBestYard(){
 const best=document.querySelector('.yard-card.best');if(!best){if(el('yard-detail'))el('yard-detail').textContent='Enter enough buyer information to identify a best current net first.';return}
 const i=best.dataset.yard;const moves=[['yard-weight','calc-weight'],['yard-price-'+i,'calc-price'],['yard-miles-'+i,'trip-miles'],['yard-mpg','trip-mpg'],['yard-gas','trip-gas'],['yard-fees-'+i,'trip-other']];moves.forEach(([from,to])=>{const a=el(from),b=el(to);if(a&&b&&a.value!==''){b.value=a.value;fire(b,'input')}});const name=el('yard-name-'+i)?.value||('Buyer '+i);if(el('op-detail'))el('op-detail').textContent='Evaluator loaded with the current entered terms for '+name+'. Refresh the buyer quote before an actual sale.';el('evaluator')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function refreshSmartPrices(){mixedRows().forEach(r=>setPriceIfBlank(r.querySelector('.load-material'),r.querySelector('.load-price')));const s=el('inv-material'),p=el('inv-price');if(s&&p)setPriceIfBlank(s,p);syncMixedUnits()}
function init(){injectMixedAutomation();injectBestYardButton();enhanceInventory();injectEvaluatorInventoryButton();const root=document.body;new MutationObserver(()=>{injectMixedAutomation();injectBestYardButton();enhanceInventory();injectEvaluatorInventoryButton()}).observe(root,{childList:true,subtree:true});const priceRoot=el('material-categories');if(priceRoot)new MutationObserver(()=>setTimeout(refreshSmartPrices,0)).observe(priceRoot,{childList:true,subtree:true});setTimeout(refreshSmartPrices,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
