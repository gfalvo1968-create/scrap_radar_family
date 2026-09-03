/* SPIKE Case Tray v0.7 - batch workflow + Same-Board Verification + Three Answers UI. */
(function(){
var caseFiles=[];
function E(id){return document.getElementById(id)}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(id){var e=E(id),v=e&&e.value;if(v==null||v==='')return null;var n=Number(v);return isFinite(n)?n:null}
function addField(fd,n,v){if(v!=null)fd.append(n,String(v))}
function money(v){return v==null?'N/A':'$'+Number(v).toFixed(2)}
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
function identityHTML(d){
  var g=d.same_board_verification||(d.case_analysis||{}).identity_gate;if(!g)return '';
  var reasons=(g.reasons||[]).map(function(x){return '<div>• '+safe(x)+'</div>'}).join(''),next=g.identity_next_step?'<div><b>Next step:</b> '+safe(g.identity_next_step)+'</div>':'';
  if(g.block_reconciliation||g.status==='MULTIPLE_BOARDS_SUSPECTED')return '<div class="decision-box"><h3>⚠️ MULTIPLE BOARDS DETECTED</h3><b>SPIKE stopped the case before combining evidence.</b><br>These photos do not appear safe to treat as one physical board. Separate them into individual cases and analyze again.'+reasons+next+'</div>';
  return '<div class="lab-card"><b>🔎 Same-Board Verification:</b> '+safe(g.status||'checked')+' ('+safe(g.confidence||0)+'%)'+(g.whole_view_count!=null?'<br><b>Whole-board views:</b> '+safe(g.whole_view_count):'')+reasons+next+'</div>'
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
    var d=p.combined||{},blocked=d.status==='case_identity_failed'||(d.same_board_verification||{}).block_reconciliation;
    if(typeof renderBoardData==='function'&&!blocked)renderBoardData(d);
    renderEconomics(d);
    if(E('predictionBox'))E('predictionBox').innerHTML=(blocked?identityHTML(d):'<h3>📸 SPIKE MULTI-PHOTO BOARD CASE</h3>'+identityHTML(d)+'<div class="type-box"><div class="type-name">'+safe(d.board_type||'Unknown')+'</div><b>Photos compared:</b> '+safe(p.photo_count||caseFiles.length)+'<br><b>Grade:</b> '+safe(d.grade||'N/A')+'<br><b>Confidence:</b> '+safe(d.confidence||0)+'%<br><b>Recovery Score:</b> '+safe(d.score||0)+'<br><b>Recommendation:</b> '+safe(d.recommendation||'Manual review required.')+'<br><b>Engine:</b> '+safe(d.model||'Board Sense')+'</div>')+threeAnswersHTML(d);
    E('uploadStatus').textContent=blocked?'Case stopped: multiple-board evidence detected. Start separate board cases.':'Board identity checked. Three-answer board case complete.'
  }catch(e){E('uploadStatus').textContent='Case analysis failed: '+e.message}finally{btn.disabled=false}
}
function reset(){
  caseFiles=[];['casePhoto','casePhotos'].forEach(function(id){var i=E(id);if(i)i.value=''});tray();
  E('uploadStatus').textContent='Ready. Add 2–6 photos of one board.';
  if(E('predictionBox'))E('predictionBox').textContent='Waiting for scan...'
}
function install(){
  var a=E('boardImageA');if(!a)return;var s=a.closest('section');if(!s)return;
  s.innerHTML='<h2>📷 SPIKE Multi-Photo Board Case</h2><p><b>One physical board, several views.</b> SPIKE verifies case identity first, then gives three separate answers: identity, recovery, and economics.</p><div class="side-box"><b>Fast batch:</b> Select 2–6 saved photos together.<br><input type="file" id="casePhotos" accept="image/*" multiple><button type="button" id="addCasePhotosBtn">＋ Add Selected Photos</button><br><br><b>Single-photo fallback:</b><br><input type="file" id="casePhoto" accept="image/*"><button type="button" id="addCasePhotoBtn">＋ Add One Photo</button><div id="caseTray" style="margin-top:12px"></div></div><div class="scan-actions"><button type="button" id="analyzeCaseBtn">Verify & Analyze Board Case</button><button type="button" id="resetCaseBtn">Start New Board</button></div><p id="uploadStatus">Ready. Add 2–6 photos of one board.</p>';
  E('addCasePhotosBtn').onclick=addBatch;E('addCasePhotoBtn').onclick=addSingle;E('analyzeCaseBtn').onclick=run;E('resetCaseBtn').onclick=reset;tray();
  var v=document.querySelector('.version-stamp');if(v)v.textContent='Harbor Rich Dashboard • SPIKE Case Tray v0.7'
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();