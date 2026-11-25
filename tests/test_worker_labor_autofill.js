"use strict";
// Opt-in worker defaults must not silently become payroll deductions.
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const source=fs.readFileSync("scrap_radar_labor_presets.js","utf8");
const KEY="scrapRadarWorkerPresetsV1";
const saved=new Map();
const store={
 getItem(key){return saved.get(key)||null},
 setItem(key,value){saved.set(key,value)}
};
function page(){
  const nodes=new Map(),events=new Map(),windowEvents=new Map();
  class Element{
    constructor(id=""){this.id=id;this.dataset={};this.value="";this._text="";this._handlers=new Map();this.options=[]}
    set innerHTML(html){
      for(const m of html.matchAll(/\bid="([^"]+)"/g))nodes.set(m[1],new Element(m[1]));
    }
    get innerHTML(){return ""}
    set textContent(v){this._text=v;if(this.id==="labor-process"||this.id==="labor-worker")this.options=[]}
    get textContent(){return this._text}
    addEventListener(type,fn){if(!this._handlers.has(type))this._handlers.set(type,[]);this._handlers.get(type).push(fn)}
    dispatchEvent(event){event.currentTarget=this;for(const fn of this._handlers.get(event.type)||[])fn(event)}
    appendChild(e){this.options.push(e)}
    insertAdjacentElement(){}
  }
  const add=id=>{const e=new Element(id);nodes.set(id,e);return e};
  add("evaluator");add("operating-profile");add("trip-target");
  nodes.get("trip-target").value="25";
  nodes.get("trip-target").dataset.profileDefault="25";
  const document={readyState:"complete",getElementById:id=>nodes.get(id)||null,
    createElement:()=>new Element(),head:{appendChild(){}},
    addEventListener(type,fn){if(!events.has(type))events.set(type,[]);events.get(type).push(fn)}};
  const window={ScrapRadarOperatingProfile:{get:()=>({target_hourly_wage:25})},
    addEventListener(type,fn){if(!windowEvents.has(type))windowEvents.set(type,[]);windowEvents.get(type).push(fn)},
    dispatchEvent(event){for(const fn of windowEvents.get(event.type)||[])fn(event)}};
  const context=vm.createContext({document,window,localStorage:store,
    Event:class{constructor(type){this.type=type;this.isTrusted=false}},console});
  vm.runInContext(source,context);
  const val=id=>nodes.get(id).value;
  function edit(id,value,type="change"){
    const node=nodes.get(id);node.value=String(value);
    node.dispatchEvent({type,isTrusted:true});
  }
  return {val,edit,click(id){nodes.get(id).dispatchEvent({type:"click",isTrusted:true})},
    rate:()=>nodes.get("trip-target").value,status:()=>nodes.get("labor-status").textContent,
    window,store:()=>JSON.parse(saved.get(KEY)||"null")};
}
const p=page();
assert.equal(p.rate(),"25","initial operating target unchanged until a worker is saved");
p.edit("labor-name","Alex","input");p.edit("labor-rate","22.50","input");p.click("labor-save");
assert.equal(p.rate(),"22.5");
assert.equal(p.store().workers[0].name,"Alex");
assert.equal(p.store().assignments.board,"w1");
assert.equal(p.store().workers[0].hourly,22.5);
assert.match(p.status(),/not an additional payroll deduction/);
p.edit("labor-process","selective");
assert.equal(p.rate(),"25","unassigned station restores existing profile hourly default");
p.edit("labor-worker","w1");
assert.equal(p.rate(),"22.5","switch worker assigns existing saved record to station");
p.edit("labor-rate","27","input");p.click("labor-save");
assert.equal(p.rate(),"27","raise immediately changes the hourly comparison");
p.edit("labor-process","board");
assert.equal(p.rate(),"27","same worker raise flows across all assigned stations");
p.edit("trip-target","45","input");
assert.equal(p.rate(),"45");
p.window.dispatchEvent({type:"scrapRadarProfileUpdated"});
assert.equal(p.rate(),"45","manual override remains in effect");
p.edit("labor-worker","w1");
assert.equal(p.rate(),"27","explicit worker selection resumes the preset");
p.edit("labor-process-name","Processor A","input");p.click("labor-add-process");
assert.equal(p.store().processes[0].label,"Processor A");
assert.equal(p.rate(),"25","unassigned custom machine does not inherit a different station's worker");
p.edit("labor-worker","w1");assert.equal(p.rate(),"27");
assert.equal(p.store().assignments.p1,"w1");
p.click("labor-unassign");
assert.equal(p.rate(),"25");
assert.equal(p.store().assignments.p1,undefined);
assert.equal(p.store().workers.length,1,"clearing an assignment preserves reusable worker record");
const reload=page();
assert.equal(reload.rate(),"25","unassigned station stays unassigned after reload");
reload.edit("labor-process","board");
assert.equal(reload.rate(),"27","worker+station assignment survives browser reload");
const stored=reload.store();
reload.edit("labor-rate","-1","input");reload.click("labor-save");
assert.equal(reload.store().workers[0].hourly,27,"invalid raise is rejected");
assert.equal(reload.rate(),"27");
assert.equal(reload.store().version,1);
assert.ok(stored.workers.length===1);
console.log("Worker auto-fill: saved stations, worker switches, raises, manual override, custom process, clear, reload, invalid rate PASS");
