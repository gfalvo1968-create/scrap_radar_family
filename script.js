const signals = [
    {
        name: "Gerald Falvo",
        message: "Humans and AI building together."
    },
    {
        name: "Maya AI",
        message: "Signal online. The island is waking up."
    },
    {
        name: "Future Builder",
        message: "Every visitor becomes part of the radar."
    }
];

let approvedRadarSignals = JSON.parse(
    localStorage.getItem("approvedSignals")
) || [
    "Gerald Falvo: Built from imagination.",
    "Maya AI: Signal online.",
    "Future Builder: The island is waking up.",
    "Copper Crew: Humans and AI building together.",
    "Anonymous Signal: I found the island."
];

let signalIndex = 0;

function rotateDetectionFeed(){
    signalIndex = (signalIndex + 1) % signals.length;

    document.getElementById("detect-name").textContent =
        signals[signalIndex].name;

    document.getElementById("detect-message").textContent =
        "“" + signals[signalIndex].message + "”";
}

function showRadarSignal(){
    const field = document.getElementById("radarField");
    if(!field) return;

    const signal = document.createElement("div");
    signal.className = "signal-popup";

    signal.textContent =
        approvedRadarSignals[
            Math.floor(Math.random() * approvedRadarSignals.length)
        ];

    signal.style.left = Math.random() * 70 + 10 + "%";
    signal.style.top = Math.random() * 65 + 10 + "%";

    field.appendChild(signal);

    setTimeout(() => {
        signal.remove();
    }, 4000);
}

function transmitSignal(){
    const name = document.getElementById("signalName").value.trim();
    const message = document.getElementById("signalMessage").value.trim();

    if(!name || !message){
        alert("Signal incomplete.");
        return;
    }

    approvedRadarSignals.push(name + ": " + message);

    localStorage.setItem(
        "approvedSignals",
        JSON.stringify(approvedRadarSignals)
    );

    document.getElementById("signalName").value = "";
    document.getElementById("signalMessage").value = "";

    showRadarSignal();
}
showRadarSignal();
setInterval(rotateDetectionFeed, 4000);
setInterval(showRadarSignal, 4000);
