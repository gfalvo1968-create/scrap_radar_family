/* Phase 7B: local-only photo review for the current SPIKE case. */
(function(){
'use strict';
var key='scrapRadarSpikeRecoveryPacketV1';
function packet(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function caseId(p){return p?String(p.caseId||p.createdAt||''):''}
var retries=0;
function mount(){
 var host=document.getElementById('spike-phase7');
 if(!host){if(retries++<80)setTimeout(mount,250);return}
 if(document.getElementById('spike-phase7b'))return;
 var box=document.createElement('section');box.id='spike-phase7b';box.style.cssText='border:1px solid #68a9a5;border-radius:8px;padding:12px;margin-top:12px';
 var heading=document.createElement('h3');heading.textContent='Phase 7B: Local board photo review';box.appendChild(heading);
 var notice=document.createElement('p');notice.textContent='Select front and back photos for visual review. Images stay in this tab and are not uploaded, saved, analyzed, or verified automatically.';box.appendChild(notice);
 var status=document.createElement('p');box.appendChild(status);
 var current=caseId(packet());var fields=[];
 ['Front','Back'].forEach(function(side){
  var label=document.createElement('label');label.textContent=side+' photo: ';label.style.display='block';
  var input=document.createElement('input');input.type='file';input.accept='image/*';label.appendChild(input);box.appendChild(label);
  var preview=document.createElement('div');box.appendChild(preview);fields.push({input:input,preview:preview});
  input.onchange=function(){
   var old=preview.querySelector('img');if(old)URL.revokeObjectURL(old.src);
   preview.textContent='';if(caseId(packet())!==current){clear();status.textContent='Case changed. Photos cleared.';return}
   var file=input.files&&input.files[0];if(!file)return;
   if(!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)||file.size>12582912){input.value='';status.textContent='Select an image under 12 MB.';return}
   var img=document.createElement('img');img.alt=side+' board photo, not verified';img.style.cssText='max-width:100%;max-height:260px;object-fit:contain';
   img.src=URL.createObjectURL(file);preview.appendChild(img);status.textContent='Selected photos are unverified and are not transferred to Board Sense.';
  };
 });
 function clear(){fields.forEach(function(f){var img=f.preview.querySelector('img');if(img)URL.revokeObjectURL(img.src);f.input.value='';f.preview.textContent=''})}
 var button=document.createElement('button');button.type='button';button.textContent='Clear selected photos';button.onclick=clear;box.appendChild(button);
 host.appendChild(box);
 function sync(){var next=caseId(packet());if(next!==current){clear();current=next;status.textContent='Case changed. Select photos again.'}fields.forEach(function(f){f.input.disabled=!current});if(!current)status.textContent='No SPIKE case loaded.'}
 status.textContent=current?'Case '+current+' loaded. No photos selected.':'No SPIKE case loaded.';
 sync();window.addEventListener('focus',sync);window.addEventListener('storage',function(e){if(e.key===key)sync()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
