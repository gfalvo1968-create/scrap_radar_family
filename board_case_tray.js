/* SPIKE Case Tray v1.2 - multi-board frames stop merging but can keep separate material reports alive. */
(function(){
var caseFiles=[];
var TARGET_KEY='scrapRadarInspectionTargetV1';
var HANDOFF_KEY='scrapRadarSpikeRecoveryPacketV1';
function E(id){return document.getElementById(id)}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(id){var e=E(id),v=e&&e.value;if(v==null||v==='')return null;var n=Number(v);return isFinite(n)?n:null}
function addField(fd,n,v){if(v!=null)fd.append(n,String(v))}
function money(v){return v==null?'N/A':'$'+Number(v).toFixed(2)}
function upper(v){return String(v==null?'':v).trim().toUpperCase()}
function stagingBreakdownEnabled(){
  try{return window.parent!==window&&String(document.referrer||'').indexOf('board_sense_stageing.html')>=0}catch(_){return false}
}
function breakdownNote(item){
  var l=String(item&&item.label||'').toLowerCase();
  if(l.indexOf('ic')>=0||l.indexOf('logic')>=0)return 'Logic/control package. Confirm markings and package type before assigning recovery value.';
  if(l.indexOf('connector')>=0||l.indexOf('slot')>=0)return 'Connector/contact area. Useful for identity and recovery inspection.';
  if(l.indexOf('copper')>=0||l.indexOf('magnet')>=0||l.indexOf('transformer')>=0)return 'Copper-bearing or magnetic candidate. Inspect before assigning recoverable value.';
  if(l.indexOf('capacitor')>=0)return 'Power/passive component candidate. Recovery value depends on actual part family and board context.';
  if(l.indexOf('gold')>=0||l.indexOf('plated')>=0)return 'Contact/plating candidate. Confirm actual contact geometry before valuing.';
  return 'Board-defining component or region. Use the numbered blueprint marker to inspect it in context.';
}
function ensureBreakdownPanel(){
  if(!stagingBreakdownEnabled())return null;
  var existing=E('componentBreakdownBox');if(existing)return existing;
  var bp=E('blueprintBox');if(!bp)return null;
  var sec=bp.closest('section');if(!sec||!sec.parentNode)return null;
  var panel=document.createElement('section');
  panel.className='panel';
  panel.id='componentBreakdownPanel';
  panel.innerHTML='<h2>🔧 Close-Up Component Breakdown</h2><p class="muted">Numbered components from the selected safe blueprint view are broken out separately so the buyer can see what is actually present on the board.</p><div id="componentBreakdownBox"><p class="muted">Analyze a board to build the component breakdown.</p></div>';
  if(!E('componentBreakdownStyle')){var st=document.createElement('style');st.id='componentBreakdownStyle';st.textContent='.component-crop{height:150px;position:relative;overflow:hidden;border:1px solid #d6ff00;border-radius:9px;background:#050505;margin-bottom:9px}.component-crop img{position:absolute;max-width:none!important}.component-crop-note{color:#aaa;font-size:.78rem;margin-top:5px}';document.head.appendChild(st)}
  sec.parentNode.insertBefore(panel,sec.nextSibling);
  return E('componentBreakdownBox');
}
function selectBreakdownBlueprint(d,p){
  var combined=d&&d.board_blueprint||{};
  if(combined.available&&Array.isArray(combined.component_index)&&combined.component_index.length){
    return {blueprint:combined,sourceView:combined.case_blueprint_source_view||null};
  }
  var views=p&&Array.isArray(p.views)?p.views:[],best=null;
  views.forEach(function(view,i){
    var bp=view&&view.board_blueprint||{},items=Array.isArray(bp.component_index)?bp.component_index:[];
    if(!bp.available||!items.length)return;
    var quality=view.photo_quality||{},score=items.length*100+(quality.usable===false?0:25)+Number(quality.score||0);
    if(!best||score>best.score)best={blueprint:bp,sourceView:view.view_number||i+1,score:score};
  });
  return best||{blueprint:combined,sourceView:null};
}
function renderComponentBreakdown(d,p){
  var box=ensureBreakdownPanel();if(!box)return;
  var selected=selectBreakdownBlueprint(d,p),bp=selected.blueprint||{},items=Array.isArray(bp.component_index)?bp.component_index:[];
  if(!bp.available||!items.length){
    box.innerHTML='<div class="warning-box">Component breakdown unavailable: none of the verified same-board photos produced detector-supported component regions. Try one clear, straight-on component-side photo.</div>';
    return;
  }
  var src=selected.sourceView?'<p><b>Blueprint source:</b> Photo '+safe(selected.sourceView)+' (best safe component view)</p>':'';
  var imageUrl=bp.image_url?(API+bp.image_url+'?t='+Date.now()):'';
  var h=src+'<div class="blueprint-index">';
  items.forEach(function(item){
    var q=item.box||{},crop=imageUrl?'<div class="component-crop" data-x="'+safe(q.x||0)+'" data-y="'+safe(q.y||0)+'" data-w="'+safe(q.w||1)+'" data-h="'+safe(q.h||1)+'"><img src="'+safe(imageUrl)+'" alt="Component '+safe(item.number||'?')+' close-up"></div>':'';
    h+='<div class="blueprint-item">'+crop+'<span class="blueprint-number">'+safe(item.number||'?')+'</span><span class="blueprint-title">'+safe(item.label||'Detected region')+'</span>'+
      (item.confidence!=null?'<span class="blueprint-confidence">Detector confidence: '+safe(item.confidence)+'%</span>':'')+
      '<span class="blueprint-tip">'+safe(breakdownNote(item))+'</span></div>';
  });
  h+='</div><p class="muted">This is a component-presence breakdown, not an assay. Missing parts and remaining pay dirt are evaluated separately.</p>';
  box.innerHTML=h;
  Array.prototype.forEach.call(box.querySelectorAll('.component-crop'),function(crop){
    var img=crop.querySelector('img');if(!img)return;
    img.onload=function(){
      var nw=img.naturalWidth||1,nh=img.naturalHeight||1,x=Number(crop.getAttribute('data-x'))||0,y=Number(crop.getAttribute('data-y'))||0,rw=Math.max(1,Number(crop.getAttribute('data-w'))||1),rh=Math.max(1,Number(crop.getAttribute('data-h'))||1);
      var pad=Math.max(20,Math.round(Math.max(rw,rh)*.45)),x0=Math.max(0,x-pad),y0=Math.max(0,y-pad),cw=Math.min(nw-x0,rw+pad*2),ch=Math.min(nh-y0,rh+pad*2),scale=Math.max(crop.clientWidth/cw,crop.clientHeight/ch);
      img.style.width=(nw*scale)+'px';img.style.height=(nh*scale)+'px';img.style.left=((crop.clientWidth-cw*scale)/2-x0*scale)+'px';img.style.top=((crop.clientHeight-ch*scale)/2-y0*scale)+'px';
    };
  });
}
function pcbGate(d){
  d=d||{};
  var t=d.three_answers||{},i=t.identity||{},r=t.recovery||{};
  var g=d.object_gate||d.input_gate||d.pcb_gate||(d.case_analysis||{}).object_gate||{};
  var type=upper(d.board_type||i.answer),grade=upper(d.grade||r.grade);
  var signals=[].concat(d.recovery_signals||[],g.reasons||[],d.warnings||[]).map(upper).join(' | ');
  var explicitBlock=g.block===true||g.block_downstream===true||g.confirmed_pcb===false||['REJECTED','BLOCKED','NON_PCB','NOT_A_PCB','UNKNOWN_OBJECT'].indexOf(upper(g.status))>=0;
  var unknownType=!type||type==='UNKNOWN'||type==='UNKNOWN OBJECT'||type.indexOf('NON-PCB')>=0||type.indexOf('NOT A BOARD')>=0;
  var insufficient=signals.indexOf('INSUFFICIENT BOARD EVIDENCE')>=0||signals.indexOf('NOT ENOUGH EVIDENCE')>=0;
  return {confirmed:!(explicitBlock||unknownType||insufficient),type:type,grade:grade};
}
function objectGateStopHTML(d){
  var t=d&&d.three_answers||{},i=t.identity||{},confidence=d&&d.confidence!=null?d.confidence:i.confidence;
  return '<h3>🛑 ANALYSIS STOPPED — PCB NOT CONFIRMED</h3><div class="decision-box"><b>What SPIKE found:</b> '+safe(i.answer||d.board_type||'Unknown object')+(confidence!=null?' • '+safe(confidence)+'% confidence':'')+'<br><br>This item does not have enough circuit-board evidence. Board grading, recovery reasoning, economics, same-board verification, and Scrap Radar handoff were withheld.<br><br><b>Next step:</b> If this is a circuit board, retake clear photos showing the complete component side and board edges.</div>';
}
function tray(){
  var b=E('caseTray');if(!b)return;
  if(!caseFiles.length){b.innerHTML='<span class="muted">Case tray empty. Add 2–6 photos of the same board.</span>';return}
  b.innerHTML='<b>'+caseFiles.length+'/6 photos loaded</b>'+caseFiles.map(function(f,i){return '<div class="blueprint-item"><span class="blueprint-number">'+(i+1)+'</span><span class="blueprint-title">'+safe(f.name)+'</span> <button type="button" data-rm="'+i+'">Remove</button></div>'}).join('');
  Array.prototype.forEach.call(b.querySelectorAll('[data-rm]'),function(x){x.onclick=function(){caseFiles.splice(Number(x.getAttribute('data-rm')),1);tray()}})
}
function addFiles(files){
  var incoming=Array.prototype.slice.call(files||[]),room=6-caseFiles.length;if(!incoming.length)return;
  if(room<=0){E('uploadStatus').textContent='Case tray already has 6 photos.';return}
  var chosen=incoming.slice(0,room);chosen.forEach(function(f){caseFiles.push(f)});
  var skipped=incoming.length-chosen.length;
  E('uploadStatus').textContent=chosen.length+' photo'+(chosen.length===1?'':'s')+' added. '+caseFiles.length+'/6 loaded.'+(skipped?' '+skipped+' extra skipped.':'');tray()
}
function addSingle(){var i=E('casePhoto');if(i&&i.files&&i.files.length){addFiles(i.files);i.value=''}}
function addBatch(){var i=E('casePhotos');if(i&&i.files&&i.files.length){addFiles(i.files);i.value=''}}
function economicsPaths(e){
  var p=e&&e.paths;
  if(Array.isArray(p))return p;
  if(!p||typeof p!=='object')return [];
  return Object.keys(p).map(function(k){return p[k]}).filter(Boolean)
}
function pathByName(e,name){
  var wanted=String(name||'').toUpperCase();
  return economicsPaths(e).find(function(p){return String(p.path||'').toUpperCase()===wanted})||null
}
function economicsWinner(e){return e&&(e.recommended_path||e.winner)||null}
function economicsReady(e){return !!(e&&(e.status==='ready'||economicsWinner(e))) }
function economicsAnswerHTML(d,fallback){
  var re=d.recovery_economics||{};
  if(economicsReady(re)){
    var winner=economicsWinner(re),p=pathByName(re,winner),h='<b>Best Move:</b> '+safe(winner||'Verified path');
    if(p&&p.net_value!=null)h+='<br><b>Net:</b> '+money(p.net_value);
    if(p&&p.gain_over_sell_whole!=null)h+='<br><b>Difference vs whole:</b> '+(p.gain_over_sell_whole>=0?'+':'')+money(p.gain_over_sell_whole);
    if(p&&p.incremental_value_per_minute!=null)h+='<br><b>Incremental value of time:</b> '+money(p.incremental_value_per_minute)+'/min';
    if(p&&p.net_value_per_hour!=null)h+='<br><b>Path value/hour:</b> '+money(p.net_value_per_hour)+'/hr';
    h+='<br><span class="muted">Board Sense compares only the verified values entered here. Scrap Radar adds distance, fuel, buyer terms and target hourly rate.</span>';
    return h
  }
  return safe((fallback&&fallback.message)||(fallback&&fallback.reason)||'Verified dollar/time values are still needed.')
}
function renderEconomics(d){
  var box=E('economicsBox'),e=d.recovery_economics||{};if(!box)return;
  if(!economicsReady(e)){
    box.innerHTML='<b>SPIKE Recovery Economics:</b> More verified dollar/time values are needed. No value was invented from the photos.';
    return
  }
  var h='<b>SPIKE Recovery Economics</b><br><b>Sell value basis:</b> '+safe(e.sell_value_basis||'Not provided')+'<br>';
  economicsPaths(e).forEach(function(p){
    if(!p||p.status==='needs_value')return;
    h+='<div class="lab-card"><b>'+safe(p.path||'RECOVERY PATH')+'</b><br>Net: '+money(p.net_value);
    if(p.net_value_per_minute!=null)h+=' • '+money(p.net_value_per_minute)+'/min';
    if(p.net_value_per_hour!=null)h+=' • '+money(p.net_value_per_hour)+'/hr';
    if(p.gain_over_sell_whole!=null)h+='<br>Difference vs whole: '+(p.gain_over_sell_whole>=0?'+':'')+money(p.gain_over_sell_whole);
    h+='</div>'
  });
  if(economicsWinner(e))h+='<div class="decision-box"><b>BEST MOVE:</b> '+safe(economicsWinner(e))+'</div>';
  box.innerHTML=h
}
function identityBlockKind(g){
  var s=upper(g&&g.status);
  if(['MULTIPLE_BOARDS_SUSPECTED','MULTIPLE_BOARDS_IN_FRAME_SUSPECTED','MULTIPLE_BOARDS_OR_OVERLAP_SUSPECTED'].indexOf(s)>=0)return 'multiple';
  if(['IDENTITY_UNCERTAIN','IDENTITY_CLARIFICATION_NEEDED'].indexOf(s)>=0)return 'clarification';
  return 'blocked';
}
function identityHTML(d){
  var g=d.same_board_verification||(d.case_analysis||{}).identity_gate;if(!g)return '';
  var reasons=(g.reasons||[]).map(function(x){return '<div>• '+safe(x)+'</div>'}).join(''),next=g.identity_next_step?'<div><b>Next step:</b> '+safe(g.identity_next_step)+'</div>':'';
  if(g.block_reconciliation){
    if(identityBlockKind(g)==='multiple'){
      var mr=d.multi_board_material_report||{},ready=mr.status==='SEPARATE_REPORTS_READY';
      return '<div class="decision-box"><h3>⚠️ MULTIPLE BOARDS DETECTED</h3><b>SPIKE stopped the boards from being merged.</b><br>'+(ready?'He kept working and produced separate mini-reports for the cleanly separable PCB bodies below.':'Physical evidence indicates more than one board is present. SPIKE will not combine their identities or values; add spacing if individual bodies cannot be isolated cleanly.')+reasons+next+'</div>';
    }
    return '<div class="decision-box"><h3>🔎 IDENTITY EVIDENCE NEEDED</h3><b>SPIKE stopped the case before combining evidence.</b><br>These photos do not provide enough whole-board geometry to prove that every view shows the same physical board. No multiple-board verdict is being claimed.'+reasons+next+'</div>';
  }
  return '<div class="lab-card"><b>🔎 Same-Board Verification:</b> '+safe(g.status||'checked')+' ('+safe(g.confidence||0)+'%)'+(g.whole_view_count!=null?'<br><b>Whole-board views:</b> '+safe(g.whole_view_count):'')+reasons+next+'</div>'
}
function multiBoardReportHTML(d){
  var m=d&&d.multi_board_material_report||{};
  if(!m.status)return '';
  if(m.status!=='SEPARATE_REPORTS_READY'){
    return '<div class="decision-box"><h3>🧩 MULTI-BOARD SPLIT</h3><b>Multiple boards confirmed, but clean individual crops were not proven.</b><br>'+safe(m.message||'Add a little space between the pieces and retake.')+(m.next_step?'<br><b>Next step:</b> '+safe(m.next_step):'')+'</div>'
  }
  var boards=Array.isArray(m.boards)?m.boards:[];
  var h='<div class="decision-box"><h3>🧩 SPIKE: SEPARATE BOARD REPORTS</h3><b>'+safe(m.board_count||boards.length)+' physical PCB bodies analyzed independently.</b><br>No identity, grade, or value was combined across the boards.';
  boards.forEach(function(b){
    var targets=Array.isArray(b.remaining_recovery_targets)?b.remaining_recovery_targets:[];
    h+='<div class="lab-card"><b>BOARD '+safe(b.board_index||'?')+'</b>'+
      '<br><b>Identity:</b> '+safe(b.identity||'Unresolved')+
      (b.confidence!=null?'<br><b>Confidence:</b> '+safe(b.confidence)+'%':'')+
      '<br><b>Grade:</b> '+safe(b.grade||'UNRESOLVED')+
      (b.recovery_score!=null?'<br><b>Recovery Score:</b> '+safe(b.recovery_score):'')+
      (b.condition?'<br><b>Condition:</b> '+safe(b.condition):'')+
      (b.specimen_completeness?'<br><b>Completeness:</b> '+safe(b.specimen_completeness):'')+
      (b.remaining_value_verdict?'<br><b>Remaining Value:</b> '+safe(b.remaining_value_verdict):'')+
      '<br><b>Pay Dirt Still Present:</b> '+(b.pay_dirt_still_present?'YES':'NO / NOT PROVEN')+
      (targets.length?'<br><b>Visible recovery targets:</b> '+targets.map(safe).join(', '):'')+
      (b.buyer_message?'<br><br>'+safe(b.buyer_message):'')+
      '</div>'
  });
  h+='<div class="muted">'+safe(m.rule||'Stop the merge, not the investigation.')+'</div></div>';
  return h
}
function threeAnswersHTML(d){
  var t=d.three_answers||{},i=t.identity||{},r=t.recovery||{},e=t.economics||{};
  if(!t.identity&&!t.recovery&&!t.economics&&!d.recovery_economics)return '';
  return '<div class="decision-box"><h3>🧠 SPIKE: THREE DIFFERENT ANSWERS</h3>'+
    '<div class="lab-card"><b>1. IDENTITY - What is it?</b><br>'+safe(i.answer||d.board_type||'Unresolved')+(i.subtype?'<br><b>Subtype:</b> '+safe(i.subtype):'')+(i.confidence!=null?'<br><b>Confidence:</b> '+safe(i.confidence)+'%':'')+'</div>'+
    '<div class="lab-card"><b>2. RECOVERY - What value is physically supported?</b><br><b>Grade:</b> '+safe(r.grade||d.grade||'WITHHELD')+(r.score!=null?'<br><b>Recovery Score:</b> '+safe(r.score):(d.score!=null?'<br><b>Recovery Score:</b> '+safe(d.score):''))+(r.condition?'<br><b>Condition:</b> '+safe(r.condition):'')+(r.remaining_opportunity?'<br><b>Remaining Opportunity:</b> '+safe(r.remaining_opportunity):'')+'</div>'+
    '<div class="lab-card"><b>3. ECONOMICS - What should we do with it?</b><br>'+economicsAnswerHTML(d,e)+'</div>'+
    '<div class="muted">'+safe(t.separation_rule||'Identity, recovery, and economics are independent answers.')+'</div></div>'
}
async function run(){
  if(caseFiles.length<2){E('uploadStatus').textContent='Add at least 2 photos of the same board before analysis.';return}
  var btn=E('analyzeCaseBtn');btn.disabled=true;E('uploadStatus').textContent='SPIKE is verifying board identity before reconciling '+caseFiles.length+' views...';
  try{
    var fd=new FormData();caseFiles.forEach(function(f){fd.append('files',f)});
    var sell=num('sellValue'),recovered=num('recoveredValue'),minutes=num('laborMinutes');
    if(sell!=null&&sell>0)addField(fd,'current_sell_whole_value',sell);
    if(recovered!=null&&recovered>0)addField(fd,'full_recovery_value',recovered);
    if(minutes!=null&&minutes>=0)addField(fd,'full_minutes',minutes);
    var r=await fetch(API+'/analyze-case',{method:'POST',body:fd});if(!r.ok)throw new Error('HTTP '+r.status);
    var p=await r.json();if(p.status==='error')throw new Error(p.message||'Case analysis failed.');
    var d=p.combined||{},idg=d.same_board_verification||{},identityBlocked=d.status==='case_identity_failed'||d.status==='case_identity_clarification'||idg.block_reconciliation,objectBlocked=!pcbGate(d).confirmed,blocked=identityBlocked||objectBlocked;
    if(objectBlocked){
      try{localStorage.removeItem(HANDOFF_KEY)}catch(_){}
      if(E('predictionBox'))E('predictionBox').innerHTML=objectGateStopHTML(d);
      if(E('economicsBox'))E('economicsBox').innerHTML='<b>Economics withheld:</b> SPIKE did not confirm a circuit board.';
      E('uploadStatus').textContent='Analysis stopped: this item is not confirmed as a circuit board.';
      try{window.dispatchEvent(new CustomEvent('boardSenseObjectGateBlocked',{detail:{reason:'pcb_not_confirmed'}}))}catch(_){}
    }else{
      if(typeof renderBoardData==='function'&&!blocked)renderBoardData(d);
      if(!blocked)renderComponentBreakdown(d,p);
      if(identityBlocked){
        try{localStorage.removeItem(HANDOFF_KEY)}catch(_){}
        if(E('economicsBox')){
          var mr=d.multi_board_material_report||{};
          E('economicsBox').innerHTML=mr.status==='SEPARATE_REPORTS_READY'
            ?'<b>Combined economics withheld:</b> These are separate physical boards. SPIKE reported each board independently above; enter or compare verified values per board rather than blending the lot.'
            :'<b>Economics withheld:</b> Board identity must be verified before value paths are compared.';
        }
      }else renderEconomics(d);
      if(E('predictionBox'))E('predictionBox').innerHTML=(identityBlocked?identityHTML(d)+multiBoardReportHTML(d):'<h3>📸 SPIKE MULTI-PHOTO BOARD CASE</h3>'+identityHTML(d)+'<div class="type-box"><div class="type-name">'+safe(d.board_type||'Unknown')+'</div><b>Photos compared:</b> '+safe(p.photo_count||caseFiles.length)+'<br><b>Grade:</b> '+safe(d.grade||'N/A')+'<br><b>Confidence:</b> '+safe(d.confidence||0)+'%<br><b>Recovery Score:</b> '+safe(d.score||0)+'<br><b>Recommendation:</b> '+safe(d.recommendation||'Manual review required.')+'<br><b>Engine:</b> '+safe(d.model||'Board Sense')+'</div>')+threeAnswersHTML(d);
      var mr=d.multi_board_material_report||{};
      E('uploadStatus').textContent=identityBlocked?(identityBlockKind(idg)==='multiple'?(mr.status==='SEPARATE_REPORTS_READY'?'Case split: '+safe(mr.board_count)+' separate board reports ready. No identities or values were combined.':'Case stopped from merging: multiple-board evidence detected. Add a little spacing if SPIKE cannot isolate each piece.'):'Case stopped: identity evidence is incomplete. Add the requested full-board photo.'):'Board identity checked. Three-answer board case complete.';
    }
  }catch(e){E('uploadStatus').textContent='Case analysis failed: '+e.message}finally{btn.disabled=false}
}
function clearMissionState(){
  try{localStorage.removeItem(TARGET_KEY);localStorage.removeItem(HANDOFF_KEY)}catch(_){}
  try{window.ScrapRadarInspectionTarget=null}catch(_){}
  var panel=E('inspectionTargetPanel');if(panel)panel.remove();
  ['spikeImage','spikeImageCloseup'].forEach(function(id){var i=E(id);if(i)i.value=''});
  if(E('spikeStatus'))E('spikeStatus').textContent='Recognition mode ready. No inspection mission active.';
  if(E('spikeBox'))E('spikeBox').textContent='Spike Glass recognition candidates will appear here.';
  if(E('blueprintBox'))E('blueprintBox').innerHTML='<p class="muted">Analyze a board to generate its visual map.</p>';
  if(E('labBox'))E('labBox').textContent='Scan an item to route it into the right recovery labs.';
  if(E('reasoningBox'))E('reasoningBox').textContent='Weighted hypotheses will appear here.';
  if(E('recoveryBox'))E('recoveryBox').textContent='Recovery information will appear here.';
  if(E('lessonBox'))E('lessonBox').textContent='Reference-sheet guidance will appear here.';
  if(E('economicsBox'))E('economicsBox').textContent='Add values above to compare selling whole against recovery labor.';
  if(E('spikeScrapBridgeStatus'))E('spikeScrapBridgeStatus').textContent='No active inspection mission. New board/object ready.';
  if(E('sendSpikeToScrap'))E('sendSpikeToScrap').disabled=true;
  try{window.dispatchEvent(new CustomEvent('boardSenseNewObject',{detail:{clearedInspectionTarget:true}}))}catch(_){}
}
function reset(){
  caseFiles=[];['casePhoto','casePhotos'].forEach(function(id){var i=E(id);if(i)i.value=''});tray();
  clearMissionState();
  if(E('sellValue'))E('sellValue').value='0';if(E('recoveredValue'))E('recoveredValue').value='0';if(E('laborMinutes'))E('laborMinutes').value='10';
  E('uploadStatus').textContent='New board/object ready. Prior inspection mission cleared. Add 2–6 photos of one board.';
  if(E('predictionBox'))E('predictionBox').textContent='Waiting for scan...'
  if(E('componentBreakdownBox'))E('componentBreakdownBox').innerHTML='<p class="muted">Analyze a board to build the component breakdown.</p>';
}
function install(){
  var a=E('boardImageA');if(!a)return;var s=a.closest('section');if(!s)return;
  ensureBreakdownPanel();
  s.innerHTML='<h2>📷 SPIKE Multi-Photo Board Case</h2><p><b>One physical board, several views.</b> SPIKE verifies case identity first, then gives three separate answers: identity, recovery, and economics.</p><div class="side-box"><b>Fast batch:</b> Select 2–6 saved photos together.<br><input type="file" id="casePhotos" accept="image/*" multiple><button type="button" id="addCasePhotosBtn">＋ Add Selected Photos</button><br><br><b>Single-photo fallback:</b><br><input type="file" id="casePhoto" accept="image/*"><button type="button" id="addCasePhotoBtn">＋ Add One Photo</button><div id="caseTray" style="margin-top:12px"></div></div><div class="scan-actions"><button type="button" id="analyzeCaseBtn">Verify & Analyze Board Case</button><button type="button" id="resetCaseBtn">Start New Board</button></div><p id="uploadStatus">Ready. Add 2–6 photos of one board.</p>';
  E('addCasePhotosBtn').onclick=addBatch;E('addCasePhotoBtn').onclick=addSingle;E('analyzeCaseBtn').onclick=run;E('resetCaseBtn').onclick=reset;tray();
  var v=document.querySelector('.version-stamp');if(v)v.textContent='Harbor Rich Dashboard • SPIKE Case Tray v1.2 • Stop Merge / Keep Investigating'
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();