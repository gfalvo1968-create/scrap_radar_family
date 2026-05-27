const hallSignals = [
    "Gerald Falvo: Founder Signal",
    "Maya AI: Signal Online",
    "Copper Crew: Builder Detected",
    "Future Builder: Island Access Granted",
    "Anonymous Signal: Watching The Journey"
];

const radar = document.getElementById("megaRadar");

function createHallSignal(){
    if(!radar) return;

    const blip = document.createElement("div");
    blip.className = "hall-blip";

    const label = document.createElement("div");
    label.className = "hall-label";

    label.textContent =
        hallSignals[Math.floor(Math.random() * hallSignals.length)];

    const x = Math.random() * 60 + 18;
    const y = Math.random() * 55 + 22;

    blip.style.left = x + "%";
    blip.style.top = y + "%";

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
    createHallSignal();
    setInterval(createHallSignal, 2500);
};
