/* Phase 7C: case-scoped temporary on-device previews, for ordinary tab navigation. No uploads or assays. */
(function(){
'use strict';
var PACKET='scrapRadarSpikeRecoveryPacketV1',PREVIEWS='scrapRadarSpikePhotoPreviewsV1',CACHE='scrapRadarSpikePhotoPreviewCacheV2',TTL=60*60*1000,generation=0;
function read(){try{return JSON.parse(localStorage.getItem(PACKET)||'null')}catch(_){return null}}
function discard(){try{sessionStorage.removeItem(PREVIEWS)}catch(_){}try{localStorage.removeItem(CACHE)}catch(_){}}
function clear(){generation++;discard();}
function shrink(file){
 return new Promise(function(resolve,reject){
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){
   try{
    var scale=Math.min(1,900/Math.max(img.naturalWidth,img.naturalHeight));
    var canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    var data=canvas.toDataURL('image/jpeg',0.65);URL.revokeObjectURL(url);resolve(data);
   }catch(e){URL.revokeObjectURL(url);reject(e)}
  };
  img.onerror=function(){URL.revokeObjectURL(url);reject(new Error('Preview unavailable'))};
  img.src=url;
 });
}
window.addEventListener('boardSenseCaseReportReset',clear);
window.addEventListener('boardSenseNewObject',clear);
window.addEventListener('boardSenseObjectGateBlocked',clear);
window.addEventListener('boardSenseCasePhotosReady',async function(event){
 var files=event.detail&&event.detail.files;
 if(!Array.isArray(files)||files.length<2||files.length>6)return;
 var token=++generation;discard();
 var packet=null;
 for(var i=0;i<30;i++){
  packet=read();
  if(packet&&packet.caseId&&packet.createdAt&&Date.now()-Date.parse(packet.createdAt)<120000)break;
  await new Promise(function(resolve){setTimeout(resolve,100)});
 }
 if(token!==generation||!packet||!packet.caseId)return;
 var id=String(packet.caseId),previews=[],total=0;
 try{
  for(var n=0;n<files.length;n++){
   if(token!==generation)return;
   var f=files[n];if(!f||!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)||f.size>12582912)throw Error('Unsupported photo');
   var data=await shrink(f);total+=data.length;if(total>2300000)throw Error('Preview limit');
   previews.push({view:n+1,image:data});
  }
  if(token!==generation||!read()||String(read().caseId)!==id)return;
  var savedAt=Date.now();
  var manifest={version:2,caseId:id,caseCreatedAt:packet.createdAt,savedAt:savedAt,expiresAt:savedAt+TTL,photos:previews,source:'Board Sense case tray; reduced unverified previews'};
  // A privacy-limited cache: only for the current case, for up to one hour.
  // The browser may reject storage; never break the actual board handoff.
  try{localStorage.setItem(CACHE,JSON.stringify(manifest))}catch(_){}
  try{sessionStorage.setItem(PREVIEWS,JSON.stringify(manifest))}catch(_){}
 }catch(_){discard();}
});
})();
