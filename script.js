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
        signal.remove();
    }, 4000);
.radar-blip{
    position:absolute;
    width:14px;
    height:14px;
    border-radius:50%;
    background:#00ff99;
    box-shadow:0 0 15px #00ff99, 0 0 35px #00ff99;
    pointer-events:none;
    z-index:10;
    animation:blipFlash 1.2s ease-out forwards;
}

@keyframes blipFlash{
    0%{
        opacity:0;
        transform:scale(0.3);
    }

    20%{
        opacity:1;
        transform:scale(1.3);
    }

    100%{
        opacity:0;
        transform:scale(0.2);
    }
}
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

