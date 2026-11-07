/* Public landing page: no server-side guestbook or privileged actions. */
'use strict';
const SIGNAL_KEY='approvedRadarSignals';
const rotating=[
  {name:'Scrap Radar Family',message:'Humans and AI building together.'},
  {name:'Maya AI',message:'Signal online. The Island is waking up.'},
  {name:'Future Builder',message:'Every visitor can discover something worth learning.'}
];
const canned=['Scrap Radar Family: Built from imagination.','Maya AI: Signal online.','Future Builder: The Island is waking up.','Copper Crew: Humans and AI building together.'];
let signalIndex=0;
function savedSignals(){
 try{const x=JSON.parse(localStorage.getItem(SIGNAL_KEY)||'[]');
  return Array.isArray(x)?x.filter(v=>typeof v==='string'&&v.length<=230).slice(-20):[];
 }catch(_){return []}
}
function renderSignalWall(){
 const root=document.getElementById('signalWall');if(!root)return;
 root.replaceChildren();
 const data=savedSignals();
 if(!data.length){const p=document.createElement('p');p.textContent='No notes saved on this device yet. This is not a public shared message wall.';root.appendChild(p);return}
 data.slice().reverse().forEach(v=>{const p=document.createElement('div');p.className='signal-entry';p.textContent=v;root.appendChild(p)});
}
function transmitSignal(){
 const name=document.getElementById('signalName'),msg=document.getElementById('signalMessage');
 if(!name||!msg)return;
 const n=name.value.trim().slice(0,50),m=msg.value.trim().slice(0,160);
 if(!n||!m){alert('Please enter a name and a message.');return}
 try{
  const data=savedSignals();data.push(n+': '+m);
  localStorage.setItem(SIGNAL_KEY,JSON.stringify(data.slice(-20)));
  name.value='';msg.value='';renderSignalWall();
  alert('Saved on this device only. Your note was not submitted to a public message wall.');
 }catch(_){alert('Could not save on this device. No note was shared.')}
}
function rotateDetectionFeed(){
 const name=document.getElementById('detect-name'),msg=document.getElementById('detect-message');
 if(!name||!msg)return;
 signalIndex=(signalIndex+1)%rotating.length;
 name.textContent=rotating[signalIndex].name;
 msg.textContent='“'+rotating[signalIndex].message+'”';
}
function showRadarSignal(){
 const signal=document.createElement('div');signal.className='signal-popup';
 const options=canned.concat(savedSignals());
 signal.textContent=options[Math.floor(Math.random()*options.length)];
 signal.style.left=(20+Math.random()*60)+'%';signal.style.top=(25+Math.random()*35)+'%';
 document.body.appendChild(signal);
 const ripple=document.createElement('div');ripple.className='radar-ripple';
 ripple.style.left=signal.style.left;ripple.style.top=signal.style.top;
 document.body.appendChild(ripple);
 setTimeout(()=>{signal.remove();ripple.remove()},4000);
}
window.addEventListener('DOMContentLoaded',()=>{
 renderSignalWall();showRadarSignal();
 setInterval(rotateDetectionFeed,4000);
 setInterval(showRadarSignal,12000);
});
