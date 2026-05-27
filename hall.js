let activeSignals = [];

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

    const x = Math.random() * 50 + 25;
    const y = Math.random() * 45 + 40;

    blip.style.left = x + "%";
    blip.style.top = y + "%";

    label.style.left = x + "%";
    label.style.top = y + "%";

    radar.appendChild(blip);
    radar.appendChild(label);

    activeSignals.push({ blip, label });

    if(activeSignals.length > 2){
        const oldSignal = activeSignals.shift();

        oldSignal.blip.style.transition = "opacity 1s ease";
        oldSignal.label.style.transition = "opacity 1s ease";

        oldSignal.blip.style.opacity = "0";
        oldSignal.label.style.opacity = "0";

        setTimeout(() => {
            oldSignal.blip.remove();
            oldSignal.label.remove();
        }, 1000);
    }
}

window.onload = function(){
    createHallSignal();
    setInterval(createHallSignal, 2500);
};
