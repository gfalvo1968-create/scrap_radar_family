/* Read-only historical board buyer category comparison. Never writes a price or grade. */
(function(){
'use strict';
var retries=0;
function el(id){return document.getElementById(id)}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function amount(){
 var input=el('spike-board-weight'),unit=el('spike-weight-unit');
 if(!input||!unit||!String(input.value).trim())return null;
 var n=Number(input.value);
 if(!Number.isFinite(n)||n<=0)return null;
 return unit.value==='oz'?n/16:unit.value==='g'?n/453.59237:n;
}
function render(){
 var body=el('spike-buyer-scenarios-body'),ref=window.ScrapRadarBoardPriceReference;
 if(!body||!ref)return;
 var pounds=amount(),ids=['board_low','board_mid','board_high','board_peripheral_high','board_telecom_low','board_telecom_high'];
 var rows=ids.map(function(id){
  var q=ref.get(id);if(!q||!Number.isFinite(Number(q.price)))return '';
  var total=pounds===null?'Enter weight':'$'+(pounds*Number(q.price)).toFixed(2);
  return '<tr><td>'+safe(q.label)+'</td><td>$'+Number(q.price).toFixed(2)+'/lb</td><td>'+total+'</td></tr>';
 }).join('');
 body.innerHTML='<p><b>Historical scenarios only.</b> No category is verified for this board. Reference date: '+safe(ref.asOf)+'. Confirm current buyer prices, grade definitions and preparation requirements before using any rate.</p>'+
 '<div style="overflow-x:auto"><table border="1" cellpadding="6" style="border-collapse:collapse"><thead><tr><th>Example category</th><th>Sample rate</th><th>Gross scenario</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<p>Gross examples exclude fees, shipping and labor. This comparison does not set a grade, update the sale estimate or change the SPIKE case.</p>';
}
function init(){
 var card=el('spike-import-card'),quick=el('spike-quick-estimate');
 if(!card||!quick){if(retries++<70)setTimeout(init,150);return}
 if(el('spike-buyer-scenarios'))return;
 var details=document.createElement('details');
 details.id='spike-buyer-scenarios';
 details.style.cssText='margin-top:12px;padding:10px;border:1px solid #7b8641;border-radius:8px';
 var summary=document.createElement('summary');summary.textContent='Compare historical buyer-grade scenarios (not a quote)';summary.style.cursor='pointer';
 var body=document.createElement('div');body.id='spike-buyer-scenarios-body';
 details.appendChild(summary);details.appendChild(body);quick.appendChild(details);
 ['spike-board-weight','spike-weight-unit'].forEach(function(id){var n=el(id);if(n){n.addEventListener('input',render);n.addEventListener('change',render)}});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
