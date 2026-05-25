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
    console.log("radar popup fired");
    const left = Math.random() * 50 + 20;
    const top = Math.random() * 40 + 20;

    const signal = document.createElement("div");
    signal.className = "signal-popup";

    signal.textContent =
        approvedRadarSignals[
            Math.floor(Math.random() * approvedRadarSignals.length)
        ];

    signal.style.left = left + "%";
    signal.style.top = top + "%";

    document.body.appendChild(signal);

    const ripple = document.createElement("div");
    ripple.className = "radar-ripple";

    ripple.style.left = left + "%";
    ripple.style.top = top + "%";

    document.body.appendChild(ripple);

    setTimeout(function(){
        ripple.remove();
    }, 2200);

    setTimeout(function(){
    ripple.remove();
}, 2200);

setTimeout(function(){
    signal.remove();
}, 4000);

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

    if(typeof renderSignalWall === "function"){
        renderSignalWall();
    }

    if(typeof rotateDetectionFeed === "function"){
        setInterval(function(){
            rotateDetectionFeed();
        }, 4000);
    }

    setInterval(function(){
        showRadarSignal();
    }, 4000);

};

