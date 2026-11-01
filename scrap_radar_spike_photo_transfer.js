/* Phase 7C: read only case-matched session previews. */
(function(){
'use strict';
var KEY='scrapRadarSpikeRecoveryPacketV1',PHOTOS='scrapRadarSpikePhotoPreviewsV1',tries=0;
function read(storage,key){try{return JSON.parse(storage.getItem(key)||'null')}catch(_){return null}}
function mount(){
 var host=document.getElementById('spike-phase7b');
 if(!host){if(tries++<100)setTimeout(mount,200);return}
 if(document.getElementById('spike-phase7c'))return;
 var section=document.createElement('section');section.id='spike-phase7c';section.style.cssText='margin-top:12px;padding:12px;border:1px solid #68a9a5;border-radius:8px';
 var heading=document.createElement('h3');heading.textContent='Phase 7C: Original case photo previews';section.appendChild(heading);
 var status=document.createElement('p');section.appendChild(status);
 var gallery=document.createElement('div');gallery.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px';section.appendChild(gallery);
 host.insertAdjacentElement('afterend',section);
 function render(){
  gallery.replaceChildren();
  var packet=read(localStorage,KEY),manifest=read(sessionStorage,PHOTOS);
  if(!packet||!packet.caseId){status.textContent='No transferred case. Original photos unavailable.';return}
  if(!manifest||manifest.version!==1||manifest.caseId!==String(packet.caseId)||!Array.isArray(manifest.photos)||manifest.photos.length<2||manifest.photos.length>6){status.textContent='Original photos not available in this tab. Use Phase 7B to select photos manually.';return}
  status.textContent=manifest.photos.length+' original case view previews matched to case '+packet.caseId+'. These are reduced-size, unverified previews, not visual analysis or buyer grading.';
  manifest.photos.forEach(function(photo,i){
   if(!photo||photo.view!==i+1||typeof photo.image!=='string'||!/^data:image\/jpeg;base64,/.test(photo.image))return;
   var fig=document.createElement('figure');fig.style.margin='0';
   var img=document.createElement('img');img.src=photo.image;img.alt='Unverified board case view '+photo.view;img.style.cssText='max-width:100%;max-height:260px;object-fit:contain';
   var caption=document.createElement('figcaption');caption.textContent='View '+photo.view+' • unverified';fig.append(img,caption);gallery.appendChild(fig);
  });
 }
 render();var count=0;var poll=setInterval(function(){render();if(++count>=25)clearInterval(poll)},250);
 window.addEventListener('focus',render);window.addEventListener('storage',render);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
