let signalIndex = 0;

const signals = [

{
    name:"Gerald Falvo",
    message:"Humans and AI building together."
},

{
    name:"Maya AI",
    message:"Signal online. The island is waking up."
},

{
    name:"Future Builder",
    message:"Every visitor becomes part of the radar."
}

];

const approvedRadarSignals = [

"Gerald Falvo: Built from imagination.",

"Maya AI: Signal online.",

"Future Builder: The island is waking up.",

"Copper Crew: Humans and AI building together.",

"Anonymous Signal: I found the island."

];

const savedSignals = JSON.parse(
    localStorage.getItem("approvedRadarSignals")
);

if(savedSignals){
    approvedRadarSignals.push(...savedSignals);
}

function rotateDetectionFeed(){

    signalIndex = (signalIndex + 1) % signals.length;

    document.getElementById("detect-name").textContent =
        signals[signalIndex].name;

    document.getElementById("detect-message").textContent =
        "“" + signals[signalIndex].message + "”";
}

function showRadarSignal(){

    const signal = document.createElement("div");

    signal.className = "signal-popup";

    signal.textContent =
        approvedRadarSignals[
            Math.floor(Math.random() * approvedRadarSignals.length)
        ];
}

    signal.style.left =
        Math.random() * 70 + 10 + "%";

    signal.style.top =
        Math.random() * 70 + 10 + "%";

    document.body.appendChild(signal);

    setTimeout(() => {

        signal.remove();

    },4000);
}

];

function renderSignalWall(){
    const wall = document.getElementById("signalWall");
    if(!wall) return;

    wall.innerHTML = "";

    approvedRadarSignals.slice(-10).reverse().forEach(function(signal){
        const entry = document.createElement("div");

        entry.className = "signal-entry";

        entry.textContent = "📡 " + signal;

        wall.appendChild(entry);
    });
}

function transmitSignal(){

    const name =
        document.getElementById("signalName").value.trim();

    const message =
        document.getElementById("signalMessage").value.trim();

    if(!name || !message){
        alert("Signal incomplete.");
        return;
    }

    const newSignal = name + ": " + message;

    approvedRadarSignals.push(newSignal);

    localStorage.setItem(
        "approvedRadarSignals",
        JSON.stringify(approvedRadarSignals)
    );

    signals.push({
        name:name,
        message:message
    });

    document.getElementById("signalName").value = "";
    document.getElementById("signalMessage").value = "";

    showRadarSignal();
}

window.onload = function(){

    showRadarSignal();
    renderSignalWall();

    setInterval(rotateDetectionFeed,4000);

    setInterval(showRadarSignal,4000);

};
}
