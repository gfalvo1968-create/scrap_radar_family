// Harbor Elevator Navigation

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("button[data-page]");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            if (page) {
                window.location.href = page;
            }

        });

    });

});
