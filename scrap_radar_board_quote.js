(function(){
'use strict';
function el(id){return document.getElementById(id)}
function updateStatus(text){const status=el('br-quote-status');if(status)status.textContent=text}
function calculate(){
  const weightField=el('br-quote-weight'),rateField=el('br-quote-rate'),offer=el('br-whole');
  const weight=Number(weightField?.value),rate=Number(rateField?.value);
  if(!weightField?.value||!rateField?.value||!Number.isFinite(weight)||!Number.isFinite(rate)||weight<=0||rate<0||!Number.isFinite(weight*rate)){
    updateStatus('Enter a measured weight above zero and a valid buyer price per pound.');return;
  }
  const grade=el('br-quote-grade')?.value.trim();
  if(!grade){updateStatus('Enter the grade the buyer will pay for before using this quote.');return}
  offer.value=(Math.round(weight*rate*100)/100).toFixed(2);
  offer.dispatchEvent(new Event('input',{bubbles:true}));
  offer.dispatchEvent(new Event('change',{bubbles:true}));
  updateStatus('Calculated from '+weight+' lb × $'+rate+'/lb ('+grade+'). Confirm the buyer will accept this grade.');
}
function bind(){
  el('br-quote-calculate')?.addEventListener('click',calculate);
  ['br-quote-weight','br-quote-rate','br-quote-grade'].forEach(id=>el(id)?.addEventListener('input',()=>updateStatus('Quote inputs changed. Tap Use weight × price/lb to update the whole-board offer.')));
  el('br-whole')?.addEventListener('input',()=>{
    if(document.activeElement===el('br-whole'))updateStatus('Manual offer entered. Confirm it with the buyer.');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
