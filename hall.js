let activeSignals = [];

const hallSignals = [
  "Gerald Falvo: Founder Signal",
  "Scrap Radar Family: Signal Locked",
  "Future Builder: Island Access Granted",
  "Maya AI ChatGTB Signal Online",
  "Copper Crew: Builder Detected",
  "Anonymous Signal: Watching The Journey",
  "Signal Room: Active",
  "Legacy Builder: Hall Verified"
];

const radar = document.getElementById("megaRadar");

function createHallSignal(){
    if(!radar) return;

    const label = document.createElement("div");
    label.className = "hall-label";

    label.textContent =
        hallSignals[Math.floor(Math.random() * hallSignals.length)];

    const x = Math.random() * 50 + 25;
    const y = Math.random() * 30 + 15;

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
