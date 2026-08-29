/* SPIKE Multi-Photo Board Case dashboard upgrade v0.1
   Non-destructive overlay for the Harbor Rich Dashboard.
   Keeps existing panels/renderers while replacing the old Side A/Side B scan controls at runtime.
*/
(function(){
  function byId(id){return document.getElementById(id)}
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function selectedFiles(){
    var input=byId('boardCaseImages');
    return input ? Array.prototype.slice.call(input.files||[]) : [];
  }

  function updateSelection(){
    var files=selectedFiles(), box=byId('caseSelection');
    if(!box)return;
    if(!files.length){box.innerHTML='<span class="muted">No photos selected yet.</span>';return;}
    if(files.length>6){box.innerHTML='<div class="warning-box">Choose no more than 6 photos of the same board. You selected '+files.length+'.</div>';return;}
    box.innerHTML='<b>'+files.length+' photo'+(files.length===1?'':'s')+' selected</b><br>'+files.map(function(f,i){return (i+1)+'. '+escapeHtml(f.name)}).join('<br>');
  }

  async function analyzeCase(){
    var files=selectedFiles(), status=byId('uploadStatus'), btn=byId('analyzeCaseBtn');
    if(!files.length){status.textContent='Choose at least one board photo first.';return;}
    if(files.length>6){status.textContent='Maximum is 6 photos of the same board.';return;}
    btn.disabled=true;
    try{
      var data;
      if(files.length===1){
        status.textContent='SPIKE is analyzing the board photo...';
        if(typeof fetchAnalysis!=='function')throw new Error('Single-photo analyzer is unavailable.');
        data=await fetchAnalysis(files[0]);
      }else{
        status.textContent='SPIKE is comparing '+files.length+' views of the same board...';
        var fd=new FormData(); files.forEach(function(f){fd.append('files',f)});
        var r=await fetch(API+'/analyze-case',{method:'POST',body:fd});
        if(!r.ok)throw new Error('Server returned '+r.status);
        var payload=await r.json();
        if(payload.status==='error')throw new Error(payload.message||'Board Case analysis failed.');
        data=payload.combined;
        renderCaseSummary(payload);
      }
      if(typeof renderAnalysis==='function')renderAnalysis(data);
      else {
        if(byId('predictionBox'))byId('predictionBox').textContent='Analysis complete.';
      }
      status.textContent=files.length===1?'Single-photo scan complete.':'Multi-photo Board Case complete. SPIKE reconciled '+files.length+' views.';
    }catch(err){
      status.textContent='Board Case error: '+err.message;
    }finally{btn.disabled=false;}
  }

  function renderCaseSummary(payload){
    var box=byId('caseReportBox'); if(!box)return;
    var combined=payload.combined||{}, ca=combined.case_analysis||{}, views=ca.view_summaries||[];
    var h='<div class="output-box"><b>SPIKE Board Case</b><br>'+escapeHtml(payload.photo_count||views.length)+' views treated as one physical board.';
    if(combined.board_type)h+='<br><b>Combined identity:</b> '+escapeHtml(combined.board_type);
    if(combined.confidence!=null)h+=' • '+escapeHtml(combined.confidence)+'%';
    if(ca.message)h+='<p>'+escapeHtml(ca.message)+'</p>';
    h+='</div>';
    if(views.length){h+='<div class="blueprint-index">'+views.map(function(v,i){return '<div class="blueprint-item"><span class="blueprint-number">'+(i+1)+'</span><span class="blueprint-title">'+escapeHtml(v.board_type||v.type||v.board||('View '+(i+1)))+'</span><span class="blueprint-confidence">'+(v.confidence!=null?'View confidence: '+escapeHtml(v.confidence)+'%':'Supporting view')+'</span></div>'}).join('')+'</div>';}
    box.innerHTML=h;
  }

  function resetCase(){
    var input=byId('boardCaseImages'); if(input)input.value='';
    updateSelection();
    if(byId('uploadStatus'))byId('uploadStatus').textContent='Ready for a new board case.';
    if(byId('caseReportBox'))byId('caseReportBox').innerHTML='<span class="muted">Case summary will appear after analysis.</span>';
  }

  function install(){
    var oldInput=byId('boardImageA'); if(!oldInput)return;
    var section=oldInput.closest('section'); if(!section)return;
    section.innerHTML='\
      <h2>📷 SPIKE Multi-Photo Board Case</h2>\
      <p><b>One board, several views.</b> Choose up to 6 photos of the SAME board. One photo still works; 2–6 photos let SPIKE compare the evidence as one case.</p>\
      <div class="side-box">\
        <b>Good case photos:</b> component side, solder side, edge or cut/harvested area, major chips/connectors, and a useful close-up or angled view.\
        <br><input type="file" id="boardCaseImages" accept="image/*" multiple>\
        <div id="caseSelection" class="muted">No photos selected yet.</div>\
      </div>\
      <div class="scan-actions"><button id="analyzeCaseBtn" type="button">Analyze Board Case</button><button id="resetCaseBtn" type="button">Start New Board</button></div>\
      <p id="uploadStatus">Ready. Choose 1–6 photos of one board.</p>\
      <div id="caseReportBox"><span class="muted">Case summary will appear after analysis.</span></div>';
    byId('boardCaseImages').addEventListener('change',updateSelection);
    byId('analyzeCaseBtn').addEventListener('click',analyzeCase);
    byId('resetCaseBtn').addEventListener('click',resetCase);
    var stamp=document.querySelector('.version-stamp'); if(stamp)stamp.textContent='Harbor Rich Dashboard • SPIKE Multi-Photo Case v0.1';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install); else install();
})();