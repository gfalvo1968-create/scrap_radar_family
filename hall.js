let activeSignals = [];

const hallSignals = [
"Gerald Falvo: Founder Signal",
"Maya AI: Signal Online",
"Jerry: Scrap King",
"Copper Crew: Humans and AI Building Together",
"Board Sense: Online",
"Scrap Radar: Tracking",
"Future Builder: Island Access Granted",
"Legacy Builder: Hall Verified",
"Signal Room: Active",
"Ever Evolving Ever Growing",
"Hall Of Fame Member",
"Radar Family Forever"
];

const radar = document.getElementById("megaRadar");
console.log("RADAR FOUND", radar);

function createHallSignal(){
    if(!radar) return;

    const label = document.createElement("div");
    label.className = "hall-label";

    label.textContent =
        hallSignals[Math.floor(Math.random() * hallSignals.length)];

    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;

    label.style.left = x + "%";
    label.style.top = y + "%";
    label.style.maxWidth = "220px";
    label.style.textAlign = "center";
    label.style.transition = "all 0.8s ease";
    label.style.zIndex = "20";

    radar.appendChild(label);

    activeSignals.push(label);

    if(activeSignals.length > 20){
        const oldLabel = activeSignals.shift();

        oldLabel.style.opacity = "0";

        setTimeout(() => {
            oldLabel.remove();
        }, 15000);
    }
}

window.onload = function(){
    createHallSignal();
    createHallSignal();
    createHallSignal();

    setInterval(createHallSignal, 1000);
};
