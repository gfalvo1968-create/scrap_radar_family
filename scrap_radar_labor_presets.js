/* Local, opt-in worker/process presets for the existing hourly time-value field.
   An assigned wage is NOT separately deducted as payroll from material net. */
(function(){
'use strict';
const KEY='scrapRadarWorkerPresetsV1';
const STANDARD=[{id:'load',label:'Load + Trip Evaluator'},{id:'board',label:'Board Recovery'},{id:'selective',label:'Selective Harvest station'},{id:'deeper',label:'Deeper Recovery station'}];
const MAX_RATE=100000, MAX_WORKERS=40, MAX_PROCESSES=40;
const E=id=>document.getElementById(id);
const fresh=()=>({version:1,workers:[],processes:[],assignments:{},selectedProcess:'board'});
function read(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!raw||raw.version!==1||!Array.isArray(raw.workers)||!Array.isArray(raw.processes))return fresh();
    const workers=raw.workers.filter(w=>typeof w?.id==='string'&&/^w[0-9]+$/.test(w.id)&&
      typeof w.name==='string'&&w.name.trim().length>0&&w.name.length<=60&&
      typeof w.hourly==='number'&&Number.isFinite(w.hourly)&&w.hourly>=0&&w.hourly<=MAX_RATE).slice(0,MAX_WORKERS);
    const processes=raw.processes.filter(p=>typeof p?.id==='string'&&/^p[0-9]+$/.test(p.id)&&
      typeof p.label==='string'&&p.label.trim().length>0&&p.label.length<=60).slice(0,MAX_PROCESSES);
    const allowed=new Set([...STANDARD,...processes].map(p=>p.id));
    const ids=new Set(workers.map(w=>w.id)),assignments={};
    if(raw.assignments&&typeof raw.assignments==='object'){
      for(const [process,id] of Object.entries(raw.assignments))if(allowed.has(process)&&ids.has(id))assignments[process]=id;
    }
    return {version:1,workers,processes,assignments,
      selectedProcess:allowed.has(raw.selectedProcess)?raw.selectedProcess:'board'};
  }catch(_){return fresh()}
}
let data=read(), manualOverride=false;
function persist(next){
  try{localStorage.setItem(KEY,JSON.stringify(next));data=next;return true}
  catch(_){message('Cannot save on this device. Check browser storage; previous assignments were kept.');return false}
}
function message(s){const node=E('labor-status');if(node)node.textContent=s}
function selectedWorker(){return data.workers.find(w=>w.id===data.assignments[data.selectedProcess])||null}
function option(select,id,label){
  const node=document.createElement('option');node.value=id;node.textContent=label;select.appendChild(node);
}
function renderProcesses(){
  const select=E('labor-process');if(!select)return;
  select.textContent='';
  for(const p of [...STANDARD,...data.processes])option(select,p.id,p.label);
  select.value=data.selectedProcess;
}
function renderWorkers(){
  const select=E('labor-worker');if(!select)return;
  select.textContent='';option(select,'','Add a new worker…');
  for(const w of data.workers)option(select,w.id,w.name+' ($'+w.hourly.toFixed(2)+'/hr)');
  select.value=selectedWorker()?.id||'';
  fillEditor();
}
function fillEditor(){
  const chosen=data.workers.find(w=>w.id===E('labor-worker')?.value);
  if(E('labor-name'))E('labor-name').value=chosen?.name||'';
  if(E('labor-rate'))E('labor-rate').value=chosen?String(chosen.hourly):'';
}
function restoreTarget(){
  const field=E('trip-target');if(!field||!field.dataset.laborPreset)return;
  delete field.dataset.laborPreset;delete field.dataset.profileDefault;
  const saved=window.ScrapRadarOperatingProfile?.get()?.target_hourly_wage;
  field.value=saved==null?'':String(saved);
  if(saved!=null)field.dataset.profileDefault=String(saved);
  field.dispatchEvent(new Event('input',{bubbles:true}));
}
function applyRate(force){
  const worker=selectedWorker(),field=E('trip-target');
  if(!worker){restoreTarget();return}
  if(!field)return;
  if(!force&&(manualOverride||(field.value!==''&&!field.dataset.laborPreset&&field.dataset.profileDefault===undefined))){
    message('Worker saved. The hourly field has a manual override; choose the worker again to apply its saved rate.');
    return;
  }
  const value=String(worker.hourly);
  field.value=value;field.dataset.laborPreset=worker.id;field.dataset.profileDefault=value;
  field.dispatchEvent(new Event('input',{bubbles:true}));
  message(worker.name+' at $'+worker.hourly.toFixed(2)+'/hr fills the time-value target for this process. This is not an additional payroll deduction.');
}
function changeProcess(){
  const process=E('labor-process')?.value;
  if(![...STANDARD,...data.processes].some(p=>p.id===process))return;
  if(!persist({...data,selectedProcess:process}))return;
  manualOverride=false;renderWorkers();applyRate(true);
  if(!selectedWorker())message('No worker assigned to this process. Choose or add one to save a default.');
}
function changeWorker(){
  const id=E('labor-worker')?.value||'';
  if(!id){fillEditor();message('Enter a name and hourly rate, then save to assign a new worker.');return}
  if(!data.workers.some(w=>w.id===id))return;
  const next={...data,assignments:{...data.assignments,[data.selectedProcess]:id}};
  if(!persist(next))return;
  fillEditor();manualOverride=false;applyRate(true);
}
function nextId(items,prefix){
  return prefix+(Math.max(0,...items.map(x=>Number(x.id.slice(1))||0))+1);
}
function saveWorker(){
  const name=E('labor-name')?.value.trim()||'';
  const rateRaw=E('labor-rate')?.value.trim()||'',hourly=Number(rateRaw);
  if(!name||name.length>60||rateRaw===''||!Number.isFinite(hourly)||hourly<0||hourly>MAX_RATE){
    message('Enter a worker name (up to 60 characters) and a nonnegative hourly rate.');return;
  }
  const currentId=E('labor-worker')?.value||'';
  const existing=data.workers.find(w=>w.id===currentId);
  if(!existing&&data.workers.length>=MAX_WORKERS){message('Worker list full (40).');return}
  const id=existing?.id||nextId(data.workers,'w');
  const workers=existing?data.workers.map(w=>w.id===id?{id,name,hourly}:w):[...data.workers,{id,name,hourly}];
  const next={...data,workers,assignments:{...data.assignments,[data.selectedProcess]:id}};
  if(!persist(next))return;
  renderWorkers();E('labor-worker').value=id;fillEditor();
  manualOverride=false;applyRate(true);
}
function addProcess(){
  const name=E('labor-process-name')?.value.trim()||'';
  if(!name||name.length>60){message('Enter a process/station name, up to 60 characters.');return}
  const duplicate=[...STANDARD,...data.processes].find(p=>p.label.toLowerCase()===name.toLowerCase());
  if(duplicate){E('labor-process').value=duplicate.id;changeProcess();return}
  if(data.processes.length>=MAX_PROCESSES){message('Process list full (40).');return}
  const id=nextId(data.processes,'p');
  const next={...data,processes:[...data.processes,{id,label:name}],selectedProcess:id};
  if(!persist(next))return;
  E('labor-process-name').value='';
  manualOverride=false;renderProcesses();renderWorkers();applyRate(true);
  message('New process saved. Assign a worker to remember its hourly rate.');
}
function clearAssignment(){
  const assignments={...data.assignments};delete assignments[data.selectedProcess];
  if(!persist({...data,assignments}))return;
  renderWorkers();restoreTarget();manualOverride=false;
  message('Assignment cleared for this process; saved worker records remain available.');
}
function bind(){
  if(!E('evaluator')||E('labor-presets'))return;
  const box=document.createElement('details');box.id='labor-presets';box.className='sr-profile sr-labor-presets';
  box.innerHTML='<summary>👷 Worker + processing-station auto-fill</summary>'+
    '<p>Save who normally works a process and their hourly rate. Select a different worker or save a raise to update it. Names and assignments stay on this browser.</p>'+
    '<div class="sr-profile-grid"><label>Process / station<select id="labor-process"></select></label>'+
    '<label>Assigned worker<select id="labor-worker"></select></label>'+
    '<label>Worker name<input id="labor-name" type="text" maxlength="60" autocomplete="off" placeholder="Worker name or nickname"></label>'+
    '<label>Hourly rate $<input id="labor-rate" type="number" min="0" max="100000" step="any" inputmode="decimal" placeholder="0.00"></label></div>'+
    '<div class="sr-profile-actions"><button class="mini-btn" type="button" id="labor-save">Save worker / raise + assign</button>'+
    '<button class="mini-btn" type="button" id="labor-unassign">Clear this assignment</button></div>'+
    '<div class="sr-profile-grid"><label>Another process / machine<input id="labor-process-name" type="text" maxlength="60" autocomplete="off" placeholder="e.g. Processor A"></label></div>'+
    '<div class="sr-profile-actions"><button class="mini-btn" type="button" id="labor-add-process">Add process / machine</button></div>'+
    '<p class="sr-labor-note">The assigned hourly rate auto-fills <b>Your Target $ / Hour</b> for time-value comparisons. It is not a separate payroll cost, and there is only one comparison rate at a time. Processing fees are unchanged. Do not also enter the same wage as a processing cost unless intentionally recording a separate expense.</p>'+
    '<p id="labor-status" role="status" aria-live="polite">Choose a worker or save a new one.</p>';
  const style=document.createElement('style');style.textContent=
    '.sr-labor-presets select{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:10px;border:1px solid #39874c;border-radius:8px;background:#010b06;color:#f2fff4;font:inherit}' +
    '.sr-labor-presets .sr-labor-note{font-size:.84rem;color:#b9d5c2}';
  document.head.appendChild(style);
  const profile=E('operating-profile');
  if(profile)profile.insertAdjacentElement('afterend',box);
  else E('evaluator').querySelector('.eval-grid')?.insertAdjacentElement('beforebegin',box);
  renderProcesses();renderWorkers();
  E('labor-process').addEventListener('change',changeProcess);
  E('labor-worker').addEventListener('change',changeWorker);
  E('labor-save').addEventListener('click',saveWorker);
  E('labor-unassign').addEventListener('click',clearAssignment);
  E('labor-add-process').addEventListener('click',addProcess);
  E('trip-target')?.addEventListener('input',e=>{
    if(e.isTrusted){manualOverride=true;delete e.currentTarget.dataset.laborPreset;
      message('Manual hourly rate in use for this case. Select a saved worker to restore auto-fill.')}
  });
  window.addEventListener('scrapRadarProfileUpdated',()=>applyRate(false));
  applyRate(false);
  if(!selectedWorker())message('No worker assigned yet. Add one to remember a rate for this process.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();