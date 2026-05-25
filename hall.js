const hallSignals = [
    "Gerald Falvo: Founder Signal",
    "Maya AI: Signal Online",
    "Copper Crew: Builder Detected",
    "Future Builder: Island Access Granted",
    "Anonymous Signal: Watching The Journey"
];

function hallBlip(){
    const radar = document.getElementById("megaRadar");
    if(!radar) return;

    const blip = document.createElement("div");
    blip.className = "hall-blip";

    const x = Math.random() * 70 + 15;
    const y = Math.random() * 70 + 15;

    blip.style.left = x + "%";
    blip.style.top = y + "%";

    const label = document.createElement("div");
    label.className = "hall-label";
    label.textContent = hallSignals[
        Math.floor(Math.random() * hallSignals.length)
    ];

    label.style.left = x + "%";
    label.style.top = y + "%";

    radar.appendChild(blip);
    radar.appendChild(label);

    setTimeout(function(){
        blip.remove();
        label.remove();
    }, 3500);
}

window.onload = function(){
    hallBlip();
    setInterval(hallBlip, 3000);
};
