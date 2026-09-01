const SUPABASE_URL = "https://plcecfxejriiorzwqbfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_VeT36jSz3w8itRpHNnvl5g_Qe1bYiRJ";

let activeSignals = [];
let hallSignals = [];

const radar = document.getElementById("megaRadar");

async function loadApprovedNames(){
  try{
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wall_of_names?select=display_name,remark&status=eq.approved&order=display_order.asc`, {
      headers:{
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if(!response.ok) throw new Error(`Wall request failed: ${response.status}`);
    const rows = await response.json();

    hallSignals = rows.map(row => ({
      name: row.display_name,
      remark: row.remark || "Every Name Lives On."
    }));

    const count = document.getElementById("approvedCount");
    if(count) count.textContent = String(hallSignals.length);

    if(hallSignals.length){
      createHallSignal();
      createHallSignal();
      createHallSignal();
    }
  }catch(error){
    console.error("Wall of Names load error", error);
  }
}

function createHallSignal(){
  if(!radar || !hallSignals.length) return;

  const signal = hallSignals[Math.floor(Math.random() * hallSignals.length)];
  const label = document.createElement("div");
  label.className = "hall-label";
  label.textContent = signal.remark ? `${signal.name}: ${signal.remark}` : signal.name;

  const x = Math.random() * 76 + 12;
  const y = Math.random() * 76 + 12;
  label.style.left = `${x}%`;
  label.style.top = `${y}%`;
  label.style.maxWidth = "250px";
  label.style.textAlign = "center";
  label.style.zIndex = "20";

  radar.appendChild(label);
  activeSignals.push(label);

  if(activeSignals.length > 12){
    const oldLabel = activeSignals.shift();
    oldLabel.remove();
  }
}

window.addEventListener("load", async () => {
  await loadApprovedNames();
  setInterval(createHallSignal, 1800);
  setInterval(loadApprovedNames, 60000);
});
