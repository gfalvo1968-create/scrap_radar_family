'use strict';

/* Homepage preview signals are local to the browser.
 * Public Wall of Names submissions are a separate, moderated flow in hall.js.
 */
const LOCAL_SIGNALS_KEY = 'approvedRadarSignals';
const signalSeeds = [
  {name:'Jerry Falvo', message:'Humans and AI building together.'},
  {name:'Maya AI', message:'Signal online. The island is waking up.'},
  {name:'Future Builder', message:'Every visitor becomes part of the radar.'}
];
const publicSignalExamples = [
  'Jerry Falvo: Built from imagination.',
  'Maya AI: Signal online.',
  'Future Builder: The island is waking up.',
  'Copper Crew: Humans and AI building together.',
  'Anonymous Signal: I found the island.'
];

function loadLocalSignals() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_SIGNALS_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    // Legacy entries included example text too. Keep only unique, short values.
    return [...new Set(saved.filter(value => typeof value === 'string' &&
      value.length > 0 && value.length <= 260 &&
      !publicSignalExamples.includes(value)))].slice(-30);
  } catch (_) {
    // Disabled or malformed localStorage should never break the homepage.
    return [];
  }
}

let signalIndex = 0;
let localSignals = loadLocalSignals();

function setSignalStatus(message) {
  const status = document.getElementById('signalStatus');
  if (status) status.textContent = message;
}

function rotateDetectionFeed() {
  signalIndex = (signalIndex + 1) % signalSeeds.length;
  const name = document.getElementById('detect-name');
  const message = document.getElementById('detect-message');
  if (name) name.textContent = signalSeeds[signalIndex].name;
  if (message) message.textContent = '“' + signalSeeds[signalIndex].message + '”';
}

function showRadarSignal() {
  const items = publicSignalExamples.concat(localSignals);
  const signal = document.createElement('div');
  signal.className = 'signal-popup';
  signal.textContent = items[Math.floor(Math.random() * items.length)];
  signal.style.left = (Math.random() * 60 + 25) + '%';
  signal.style.top = (Math.random() * 30 + 28) + '%';
  document.body.appendChild(signal);

  const ripple = document.createElement('div');
  ripple.className = 'radar-ripple';
  ripple.style.left = signal.style.left;
  ripple.style.top = signal.style.top;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.remove(), 2200);
  setTimeout(() => signal.remove(), 4000);
}

function renderSignalWall() {
  const wall = document.getElementById('signalWall');
  if (!wall) return;
  wall.replaceChildren();
  if (!localSignals.length) {
    const placeholder = document.createElement('p');
    placeholder.textContent = 'No personal signals saved on this device yet.';
    wall.appendChild(placeholder);
    return;
  }
  localSignals.slice(-12).reverse().forEach(value => {
    const entry = document.createElement('div');
    entry.className = 'signal-entry';
    // textContent prevents visitors from injecting HTML into the local log.
    entry.textContent = value;
    wall.appendChild(entry);
  });
}

function transmitSignal() {
  const nameInput = document.getElementById('signalName');
  const messageInput = document.getElementById('signalMessage');
  if (!nameInput || !messageInput) return;
  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message || name.length > 60 || message.length > 200) {
    setSignalStatus('Please enter a name (up to 60 characters) and a message (up to 200 characters).');
    return;
  }

  const saved = localSignals.concat(name + ': ' + message).slice(-30);
  try {
    localStorage.setItem(LOCAL_SIGNALS_KEY, JSON.stringify(saved));
  } catch (_) {
    setSignalStatus('This browser could not save the signal. Check your storage settings.');
    return;
  }
  localSignals = saved;
  nameInput.value = '';
  messageInput.value = '';
  renderSignalWall();
  setSignalStatus('Saved on this device only. To appear on the public Wall of Names, submit there for review.');
  showRadarSignal();
}

window.addEventListener('load', function () {
  renderSignalWall();
  showRadarSignal();
  setInterval(rotateDetectionFeed, 4000);
  setInterval(showRadarSignal, 4000);
});
