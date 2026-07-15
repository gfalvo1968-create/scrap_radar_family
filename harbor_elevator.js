// Harbor Elevator Navigation

function goTo(page) {
    window.location.href = page;
}

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("button");

    buttons[0].onclick = () => goTo("island_portal.html");

    buttons[1].onclick = () => goTo("index.html");       // Scrap Radar

    buttons[2].onclick = () => goTo("board_sense.html"); // Board Sense

});
