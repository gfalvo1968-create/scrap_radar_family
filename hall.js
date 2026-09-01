const SUPABASE_URL = "https://plcecfxejriiorzwqbfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_VeT36jSz3w8itRpHNnvl5g_Qe1bYiRJ";

let activeSignals = [];
let hallSignals = [];
const radar = document.getElementById("megaRadar");

async function loadApprovedNames(){
  try{
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wall_of_names?select=display_name,remark&status=eq.approved&order=display_order.asc`, {
      headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}
    });
    if(!response.ok) throw new Error(`Wall request failed: ${response.status}`);
    const rows = await response.json();
    hallSignals = rows.map(row => ({name:row.display_name,remark:row.remark || "Every Name Lives On."}));
    const count = document.getElementById("approvedCount");
    if(count) count.textContent = String(hallSignals.length);
    if(hallSignals.length){createHallSignal();createHallSignal();createHallSignal();}
  }catch(error){console.error("Wall of Names load error", error);}
}

function createHallSignal(){
  if(!radar || !hallSignals.length) return;
  const signal = hallSignals[Math.floor(Math.random()*hallSignals.length)];
  const label = document.createElement("div");
  label.className = "hall-label";
  label.textContent = signal.remark ? `${signal.name}: ${signal.remark}` : signal.name;
  label.style.left = `${Math.random()*76+12}%`;
  label.style.top = `${Math.random()*76+12}%`;
  label.style.maxWidth = "250px";
  label.style.textAlign = "center";
  label.style.zIndex = "20";
  radar.appendChild(label);
  activeSignals.push(label);
  if(activeSignals.length>12){activeSignals.shift().remove();}
}

async function submitWallEntry(){
  const nameRaw = window.prompt("What name would you like on the Wall of Names?");
  if(nameRaw === null) return;
  const displayName = nameRaw.trim();
  if(!displayName || displayName.length>80){window.alert("Please use a name between 1 and 80 characters.");return;}

  const remarkRaw = window.prompt("Optional: leave a short remark for the Island. Tap Cancel to leave only your name.");
  const remark = remarkRaw === null ? null : remarkRaw.trim().slice(0,500);

  try{
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wall_of_names`,{
      method:"POST",
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:`Bearer ${SUPABASE_KEY}`,
        "Content-Type":"application/json",
        Prefer:"return=minimal"
      },
      body:JSON.stringify({display_name:displayName,remark:remark || null})
    });
    if(!response.ok) throw new Error(`Wall submission failed: ${response.status}`);
    window.alert("Your name has been saved. It will join the Wall after review.");
  }catch(error){
    console.error("Wall submission error",error);
    window.alert("The Wall could not save that entry yet. Please try again later.");
  }
}

function installSignButton(){
  const terminal = document.querySelector(".hall-terminal");
  if(!terminal || document.getElementById("signWallButton")) return;
  const button = document.createElement("button");
  button.id = "signWallButton";
  button.type = "button";
  button.textContent = "✍️ SIGN THE WALL";
  button.className = "sign-wall-button";
  button.addEventListener("click",submitWallEntry);
  terminal.insertAdjacentElement("afterend",button);
}

window.addEventListener("load",async()=>{
  installSignButton();
  await loadApprovedNames();
  setInterval(createHallSignal,1800);
  setInterval(loadApprovedNames,60000);
});
