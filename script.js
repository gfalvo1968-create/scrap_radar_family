let signals = [
    {
        name: "Gerald Falvo",
        message: "Humans and AI building together."
    },
    {
        name: "Maya AI ChatGPT.”
        message: "Signal online. The island is waking up."
    },
    {
        name: "Future Builder",
        message: "Every visitor becomes part of the radar."
    }
];

let approvedRadarSignals = [];

try {
    approvedRadarSignals = JSON.parse(
        localStorage.getItem("approvedSignals")
    ) || [];
} catch (e) {
    approvedRadarSignals = [];
}

approvedRadarSignals.push(
    "Gerald Falvo: Built from imagination.",
    "Maya AI Chat GPH Signal online.",
    "Future Builder: The island is waking up.",
    "Copper Crew: Humans and AI building together.",
    "Anonymous Signal: I found the island."
);

let signalIndex = 0;

function rotateDetectionFeed(){
    signalIndex = (signalIndex + 1) % signals.length;

    document.getElementById("detect-name").textContent =
        signals[signalIndex].name;

    document.getElementById("detect-message").textContent =
        "“" + signals[signalIndex].message + "”";
}

function showRadarSignal(){
    const signal = document.createElement("div");

    signal.textContent = "TEST SIGNAL";

    signal.style.position = "fixed";
    signal.style.left = "20px";
    signal.style.top = "120px";
    signal.style.background = "yellow";
    signal.style.color = "black";
    signal.style.padding = "20px";
    signal.style.fontSize = "30px";
    signal.style.fontWeight = "bold";
    signal.style.zIndex = "999999";
    signal.style.border = "4px solid red";

    document.body.appendChild(signal);
}

function transmitSignal(){
    const name = document.getElementById("signalName").value.trim();
    const message = document.getElementById("signalMessage").value.trim();

    if(!name || !message){
        alert("Signal incomplete.");
        return;
    }

    approvedRadarSignals.push(name + ": " + message);
    signals.push({
    name: name,
    message: message
});
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
showRadarSignal();
showRadarSignal();
showRadarSignal();
