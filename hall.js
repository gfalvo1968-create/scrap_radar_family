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

    const label = document.createElement("div");
    label.className = "hall-label";

    label.textContent =
        hallSignals[Math.floor(Math.random() * hallSignals.length)];

    const x = Math.random() * 65 + 17;
    const y = Math.random() * 60 + 18;

    label.style.left = x + "%";
    label.style.top = y + "%";

    radar.appendChild(label);

    activeSignals.push(label);

    if(activeSignals.length > 3){
        const oldLabel = activeSignals.shift();

        oldLabel.style.opacity = "0";

        setTimeout(() => {
            oldLabel.remove();
        }, 800);
    }
}

window.onload = function(){
    createHallSignal();
    createHallSignal();
    createHallSignal();

    setInterval(createHallSignal, 2500);
};
