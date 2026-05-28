let activeSignals = [];

const hallSignals = [
    "Gerald Falvo: Founder Signal",
    "Maya AI: Signal Online",
    "Copper Crew: Builder Detected",
    "Future Builder: Island Access Granted",
    "Anonymous Signal: Watching The Journey",
    "Scrap Radar Family: Signal Locked",
    "Board Sense: System Waking Up",
    "Builder Crew: New Contact Detected",
    "Island Watcher: Still Online",
    "Signal Room: Active"
];

const radar = document.getElementById("megaRadar");

function createHallSignal(){
    if(!radar) return;

    const label = document.createElement("div");
    label.className = "hall-label";

    label.textContent =
        hallSignals[Math.floor(Math.random() * hallSignals.length)];

    const x = Math.random() * 70 + 15;
    const y = Math.random() * 65 + 15;

    label.style.left = x + "%";
    label.style.top = y + "%";
    label.style.transition = "all 0.8s ease";
    label.style.zIndex = "20";

    radar.appendChild(label);

    activeSignals.push(label);

    if(activeSignals.length > 3){
        const oldLabel = activeSignals.shift();

        oldLabel.style.opacity = "0";

        setTimeout(() => {
            oldLabel.remove();
        }, 5000);
    }
}

window.onload = function(){
    createHallSignal();
    createHallSignal();
    createHallSignal();

    setInterval(createHallSignal, 2500);
};
