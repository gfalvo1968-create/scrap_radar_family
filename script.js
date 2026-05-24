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
    signal.textContent = approvedRadarSignals[
        Math.floor(Math.random() * approvedRadarSignals.length)
    ];

    signal.style.left = Math.random() * 50 + 20 + "%";
    signal.style.top = Math.random() * 40 + 20 + "%";

    document.body.appendChild(signal);

    setTimeout(function(){
        signal.remove();
    }, 4000);
}

const ripple = document.createElement("div");

ripple.className = "radar-ripple";

ripple.style.left = signal.style.left;
ripple.style.top = signal.style.top;

document.body.appendChild(ripple);

setTimeout(function(){
    ripple.remove();
}, 2200);

function renderSignalWall(){
    const wall = document.getElementById("signalWall");

    if(!wall){
        return;
    }

    wall.innerHTML = "";

    approvedRadarSignals.slice(-10).reverse().forEach(function(item){
        const entry = document.createElement("div");

        entry.className = "signal-entry";
        entry.textContent = "📡 " + item;

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
    renderSignalWall();
}
window.onload = function(){
    showRadarSignal();
    renderSignalWall();

    setInterval(rotateDetectionFeed, 4000);
    setInterval(showRadarSignal, 4000);
};

