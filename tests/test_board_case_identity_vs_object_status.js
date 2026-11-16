const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','board_case_tray.js'),'utf8');
const start=source.indexOf('function pcbGate(d){');
const end=source.indexOf('function objectGateStopHTML(d,p){',start);
assert.ok(start>=0&&end>start,'Case stop classifiers must be available');
const sandbox={upper:value=>String(value||'').toUpperCase()};
vm.runInNewContext(source.slice(start,end),sandbox);
const decide=(combined,views,identityBlocked)=>sandbox.caseObjectBlock(combined,{views},identityBlocked);
const blockedIdentity={
  status:'case_identity_failed',board_type:'Same-Board Identity Uncertain',
  grade:'UNRESOLVED',
  same_board_verification:{status:'IDENTITY_UNCERTAIN',block_reconciliation:true}
};
assert.equal(decide(blockedIdentity,[
  {object_gate:{mode:'board'}},{object_gate:{mode:'board'}}
],true),false,'Unverified same-board identity must not be mislabeled as non-PCB');
assert.equal(decide(blockedIdentity,[
  {object_gate:{mode:'board'}},{object_gate:{mode:'pcb_review'}}
],true),false,'Uncertain PCB-like back face should receive identity review, not non-PCB verdict');
assert.equal(decide({
  ...blockedIdentity,
  same_board_verification:{status:'NON_BOARD_VIEW_REQUIRES_RETAKE',block_reconciliation:true}
},[
  {object_gate:{mode:'board'}},{object_gate:{mode:'unknown'}}
],true),true,'Rejected non-board view still needs a real object-gate warning');
assert.equal(decide(blockedIdentity,[
  {object_gate:{mode:'board'}},{object_gate:{mode:'component'}}
],true),true,'Component image cannot be presented as verified board');
assert.equal(decide({board_type:'Unknown object',grade:'N/A'},[],false),true,
  'Non-PCB single-case report remains blocked');
console.log('Case object versus identity stop classification tests passed');
