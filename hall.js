const radar = document.getElementById("megaRadar");

function createHallSignal(){
    if(!radar){
        alert("No megaRadar found");
        return;
    }

    const label = document.createElement("div");
    label.textContent = "Maya AI: Signal Online";

    label.style.position = "absolute";
    label.style.left = "50%";
    label.style.top = "50%";
    label.style.color = "white";
    label.style.fontSize = "22px";
    label.style.zIndex = "9999";
    label.style.background = "rgba(0,255,153,0.3)";
    label.style.padding = "10px";
    label.style.borderRadius = "10px";

    radar.appendChild(label);
}

window.onload = function(){
    createHallSignal();
};
