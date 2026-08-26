const sayings = [
  "The only stupid question is the question that was never asked.",
  "How much is your time worth?",
  "Don’t just identify it. Understand why it matters.",
  "There is always something useful hiding in what somebody else threw away.",
  "A good sort starts with knowing what you are looking at.",
  "Save the minutes and the dollars have somewhere to grow.",
  "Knowledge gets more valuable when it gets passed on."
];

const button = document.getElementById("wisdomButton");
const plaque = document.getElementById("rotatingWisdom");
let wisdomIndex = 3;

if (button && plaque) {
  button.addEventListener("click", () => {
    wisdomIndex = (wisdomIndex + 1) % sayings.length;
    plaque.textContent = `“${sayings[wisdomIndex]}”`;
    plaque.animate(
      [{opacity:.35,transform:"scale(.985)"},{opacity:1,transform:"scale(1)"}],
      {duration:320,easing:"ease-out"}
    );
  });
}
