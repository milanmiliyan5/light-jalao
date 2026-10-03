const N = 1;
const E = 2;
const S = 4;
const W = 8;

const DIRS = [
  { bit: N, dr: -1, dc: 0, opposite: S, cls: "n" },
  { bit: E, dr: 0, dc: 1, opposite: W, cls: "e" },
  { bit: S, dr: 1, dc: 0, opposite: N, cls: "s" },
  { bit: W, dr: 0, dc: -1, opposite: E, cls: "w" }
];

const LEVELS = [
  { size: 3, seed: 101 }, { size: 3, seed: 211 },
  { size: 3, seed: 307 }, { size: 3, seed: 419 },
  { size: 4, seed: 523 }, { size: 4, seed: 631 },
  { size: 4, seed: 743 }, { size: 4, seed: 857 },
  { size: 4, seed: 967 }, { size: 4, seed: 1087 },
  { size: 4, seed: 1201 }, { size: 4, seed: 1327 },
  { size: 5, seed: 1451 }, { size: 5, seed: 1597 },
  { size: 5, seed: 1723 }, { size: 5, seed: 1871 },
  { size: 5, seed: 1999 }, { size: 5, seed: 2131 },
  { size: 5, seed: 2269 }, { size: 5, seed: 2411 }
];

const STORAGE_KEY = "lightJalaoWireProgressV1";
const HELP_KEY = "lightJalaoWireHelpSeen";

const boardEl = document.getElementById("board");
const levelText = document.getElementById("levelText");
const powerText = document.getElementById("powerText");
const movesText = document.getElementById("movesText");
const bestText = document.getElementById("bestText");
const timeText = document.getElementById("timeText");
const statusText = document.getElementById("statusText");
const levelProgressFill = document.getElementById("levelProgressFill");
const missionBulb = document.getElementById("missionBulb");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const helpBtn = document.getElementById("helpBtn");
const levelsBtn = document.getElementById("levelsBtn");
const soundBtn = document.getElementById("soundBtn");
const nextBtn = document.getElementById("nextBtn");
const replayBtn = document.getElementById("replayBtn");
const levelsGrid = document.getElementById("levelsGrid");
const winTitle = document.getElementById("winTitle");
const winCopy = document.getElementById("winCopy");

let currentLevel = 0;
let solvedMasks = [];
let rotations = [];
let startRotations = [];
let powered = new Set();
let bulbs = [];
let moves = 0;
let elapsed = 0;
let timer = null;
let timerStarted = false;
let locked = false;
let soundEnabled = true;
let audioContext = null;

const progress = loadProgress();
currentLevel = Math.min(Number(progress.currentLevel) || 0, LEVELS.length - 1);

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      unlocked: Math.max(1, Number(raw.unlocked) || 1),
      currentLevel: Number(raw.currentLevel) || 0,
      best: raw.best && typeof raw.best === "object" ? raw.best : {}
    };
  } catch {
    return { unlocked: 1, currentLevel: 0, best: {} };
  }
}

function saveProgress() {
  progress.currentLevel = currentLevel;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function rngFromSeed(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function indexOf(row, col, size) {
  return row * size + col;
}

function rowCol(index, size) {
  return [Math.floor(index / size), index % size];
}

function bitCount(mask) {
  let count = 0;
  for (const bit of [N, E, S, W]) {
    if (mask & bit) count += 1;
  }
  return count;
}

function generateTree(size, seed) {
  const random = rngFromSeed(seed);
  const masks = Array(size * size).fill(0);
  const visited = Array(size * size).fill(false);
  const stack = [0];
  visited[0] = true;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const [row, col] = rowCol(current, size);
    const choices = [];

    for (const dir of DIRS) {
      const nr = row + dir.dr;
      const nc = col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      const next = indexOf(nr, nc, size);
      if (!visited[next]) choices.push({ ...dir, next });
    }

    if (!choices.length) {
      stack.pop();
      continue;
    }

    const choice = choices[Math.floor(random() * choices.length)];
    masks[current] |= choice.bit;
    masks[choice.next] |= choice.opposite;
    visited[choice.next] = true;
    stack.push(choice.next);
  }

  return masks;
}

function rotateMask(mask, turns) {
  let value = mask;
  for (let i = 0; i < turns; i += 1) {
    let next = 0;
    if (value & N) next |= E;
    if (value & E) next |= S;
    if (value & S) next |= W;
    if (value & W) next |= N;
    value = next;
  }
  return value;
}

function currentMask(index) {
  return rotateMask(solvedMasks[index], rotations[index]);
}

function masksEquivalent(a, b) {
  return a === b;
}

function makeScramble(size, seed) {
  const random = rngFromSeed(seed * 17 + 73);
  const result = solvedMasks.map((mask, index) => {
    if (index === 0 || mask === 15) return 0;

    let turns = 1 + Math.floor(random() * 3);
    if ((mask === (N | S) || mask === (E | W)) && turns === 2) turns = 1;
    return turns;
  });

  const alreadySolved = result.every((turns, index) =>
    masksEquivalent(rotateMask(solvedMasks[index], turns), solvedMasks[index])
  );

  if (alreadySolved && result.length > 1) result[1] = 1;
  return result;
}

function buildLevel(levelIndex) {
  stopTimer();
  currentLevel = levelIndex;
  moves = 0;
  elapsed = 0;
  locked = false;
  timerStarted = false;

  const level = LEVELS[currentLevel];
  solvedMasks = generateTree(level.size, level.seed);
  bulbs = solvedMasks
    .map((mask, index) => ({ mask, index }))
    .filter(item => item.index !== 0 && bitCount(item.mask) === 1)
    .map(item => item.index);

  rotations = makeScramble(level.size, level.seed);
  startRotations = [...rotations];

  levelText.textContent = `Level ${currentLevel + 1}`;
  movesText.textContent = "0";
  timeText.textContent = "00:00";
  bestText.textContent = progress.best[String(currentLevel)]?.moves ?? "—";
  levelProgressFill.style.width = `${((currentLevel + 1) / LEVELS.length) * 100}%`;
  statusText.textContent = "Tap a tile to rotate the wire. Connect the power source to every bulb.";

  boardEl.style.setProperty("--size", level.size);
  renderBoard();
  updatePower();
  renderLevels();
  saveProgress();
}

function renderBoard() {
  const size = LEVELS[currentLevel].size;
  boardEl.innerHTML = "";

  solvedMasks.forEach((mask, index) => {
    const [row, col] = rowCol(index, size);
    const tile = document.createElement("button");
    const isSource = index === 0;
    const isBulb = bulbs.includes(index);

    tile.type = "button";
    tile.className = [
      "tile",
      isSource ? "source-tile" : "",
      isBulb ? "leaf bulb-tile" : ""
    ].filter(Boolean).join(" ");
    tile.dataset.index = index;
    tile.setAttribute("role", "gridcell");
    tile.setAttribute("aria-label", isSource
      ? "Power source"
      : isBulb
        ? `Bulb wire at row ${row + 1}, column ${col + 1}`
        : `Wire tile at row ${row + 1}, column ${col + 1}`);

    const rotor = document.createElement("div");
    rotor.className = "wire-rotor";
    rotor.style.setProperty("--rot", rotations[index]);

    for (const dir of DIRS) {
      if (mask & dir.bit) {
        const arm = document.createElement("span");
        arm.className = `wire-arm ${dir.cls}`;
        rotor.appendChild(arm);
      }
    }

    const hub = document.createElement("span");
    hub.className = "wire-hub";
    rotor.appendChild(hub);
    tile.appendChild(rotor);

    if (isSource) {
      const battery = document.createElement("span");
      battery.className = "device battery-device";
      battery.textContent = "⚡";
      tile.appendChild(battery);
    } else if (isBulb) {
      const bulb = document.createElement("span");
      bulb.className = "device bulb-device";
      bulb.innerHTML = '<i class="bulb-glass"></i><b class="bulb-base"></b>';
      tile.appendChild(bulb);
    }

    if (!isSource) {
      tile.addEventListener("click", () => rotateTile(index));
    }

    boardEl.appendChild(tile);
  });

  boardEl.setAttribute("aria-rowcount", size);
  boardEl.setAttribute("aria-colcount", size);
}

function rotateTile(index) {
  if (locked || index === 0) return;

  startTimer();
  rotations[index] = (rotations[index] + 1) % 4;
  moves += 1;
  movesText.textContent = moves;

  const tile = getTile(index);
  const rotor = tile?.querySelector(".wire-rotor");
  if (rotor) rotor.style.setProperty("--rot", rotations[index]);

  tile?.classList.remove("hint");
  playClick();
  vibrate(12);

  window.setTimeout(() => updatePower(true), 105);
}

function getTile(index) {
  return boardEl.querySelector(`[data-index="${index}"]`);
}

function connectedNeighbours(index) {
  const size = LEVELS[currentLevel].size;
  const [row, col] = rowCol(index, size);
  const mask = currentMask(index);
  const found = [];

  for (const dir of DIRS) {
    if (!(mask & dir.bit)) continue;

    const nr = row + dir.dr;
    const nc = col + dir.dc;
    if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;

    const next = indexOf(nr, nc, size);
    if (currentMask(next) & dir.opposite) found.push(next);
  }

  return found;
}

function computePowered() {
  const seen = new Set([0]);
  const queue = [0];

  while (queue.length) {
    const current = queue.shift();
    for (const next of connectedNeighbours(current)) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }

  return seen;
}

function updatePower(checkWin = false) {
  powered = computePowered();

  solvedMasks.forEach((_, index) => {
    getTile(index)?.classList.toggle("powered", powered.has(index));
  });

  const litBulbs = bulbs.filter(index => powered.has(index)).length;
  powerText.textContent = `${litBulbs} / ${bulbs.length} bulbs`;
  missionBulb.classList.toggle("lit", litBulbs === bulbs.length);

  if (litBulbs === 0) {
    statusText.textContent = "The circuit is dark. Rotate wires to carry power from the battery.";
  } else if (litBulbs < bulbs.length) {
    statusText.textContent = `${litBulbs} bulb${litBulbs === 1 ? "" : "s"} glowing — keep connecting the circuit.`;
  } else {
    statusText.textContent = "Perfect circuit! Every bulb is glowing. ✨";
  }

  if (checkWin && litBulbs === bulbs.length && bulbs.length > 0) {
    locked = true;
    stopTimer();
    window.setTimeout(completeLevel, 430);
  }
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timer = window.setInterval(() => {
    elapsed += 1;
    timeText.textContent = formatTime(elapsed);
  }, 1000);
}

function stopTimer() {
  if (timer) window.clearInterval(timer);
  timer = null;
}

function formatTime(total) {
  const min = Math.floor(total / 60).toString().padStart(2, "0");
  const sec = (total % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function restartLevel() {
  stopTimer();
  rotations = [...startRotations];
  moves = 0;
  elapsed = 0;
  timerStarted = false;
  locked = false;
  movesText.textContent = "0";
  timeText.textContent = "00:00";
  statusText.textContent = "Puzzle restarted. Reconnect the circuit.";

  solvedMasks.forEach((_, index) => {
    const rotor = getTile(index)?.querySelector(".wire-rotor");
    if (rotor) rotor.style.setProperty("--rot", rotations[index]);
  });

  updatePower();
  playTone(300, .06, .025);
}

function showHint() {
  if (locked) return;

  let target = null;
  const frontier = [];

  for (const index of powered) {
    const size = LEVELS[currentLevel].size;
    const [row, col] = rowCol(index, size);

    for (const dir of DIRS) {
      if (!(solvedMasks[index] & dir.bit)) continue;
      const nr = row + dir.dr;
      const nc = col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;

      const next = indexOf(nr, nc, size);
      if (!powered.has(next) && next !== 0) frontier.push(next);
    }
  }

  target = frontier.find(index => currentMask(index) !== solvedMasks[index]);

  if (target === undefined || target === null) {
    target = solvedMasks.findIndex((mask, index) =>
      index !== 0 && currentMask(index) !== mask
    );
  }

  if (target < 0 || target === null || target === undefined) {
    statusText.textContent = "The wire directions look right — check the last connection.";
    return;
  }

  const tile = getTile(target);
  tile?.classList.remove("hint");
  if (tile) {
    void tile.offsetWidth;
    tile.classList.add("hint");
  }

  const [row, col] = rowCol(target, LEVELS[currentLevel].size);
  statusText.textContent = `Hint: rotate the glowing tile at row ${row + 1}, column ${col + 1}.`;
  playTone(760, .08, .025);
  window.setTimeout(() => tile?.classList.remove("hint"), 1900);
}

function completeLevel() {
  const key = String(currentLevel);
  const oldBest = progress.best[key];
  const newBest = !oldBest || moves < oldBest.moves || (moves === oldBest.moves && elapsed < oldBest.time);

  if (newBest) {
    progress.best[key] = { moves, time: elapsed };
  }

  progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, currentLevel + 2));
  saveProgress();
  renderLevels();

  winTitle.textContent = currentLevel === LEVELS.length - 1
    ? "Circuit Master! ✨"
    : newBest
      ? "New best! ✨"
      : "Lights on! ✨";

  winCopy.textContent = `${bulbs.length} bulbs • ${moves} moves • ${formatTime(elapsed)}`;
  nextBtn.textContent = currentLevel === LEVELS.length - 1 ? "Play from Level 1 ↻" : "Next Level →";

  makeConfetti();
  showModal("winModal");
  playWin();
  vibrate([40, 35, 70]);
}

function renderLevels() {
  levelsGrid.innerHTML = "";

  LEVELS.forEach((level, index) => {
    const number = index + 1;
    const unlocked = number <= progress.unlocked;
    const done = Boolean(progress.best[String(index)]);
    const button = document.createElement("button");

    button.type = "button";
    button.className = [
      "level-card",
      index === currentLevel ? "current" : "",
      !unlocked ? "locked" : "",
      done ? "done" : ""
    ].filter(Boolean).join(" ");

    button.textContent = unlocked ? number : "🔒";
    button.disabled = !unlocked;
    button.setAttribute("aria-label", unlocked
      ? `Level ${number}, ${level.size} by ${level.size}`
      : `Level ${number} locked`);

    if (unlocked) {
      button.addEventListener("click", () => {
        hideModal("levelsModal");
        buildLevel(index);
      });
    }

    levelsGrid.appendChild(button);
  });
}

function showModal(id) {
  const el = document.getElementById(id);
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}

function hideModal(id) {
  const el = document.getElementById(id);
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
}

function makeConfetti() {
  const wrap = document.getElementById("confettiWrap");
  const colors = ["#ffd64c", "#59e8ff", "#ff7e9c", "#92ee9c", "#a78cff"];
  wrap.innerHTML = "";

  for (let i = 0; i < 30; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * .42}s`;
    piece.style.animationDuration = `${1.45 + Math.random() * .8}s`;
    wrap.appendChild(piece);
  }
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(freq, duration = .07, volume = .028, delay = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function playClick() {
  playTone(360, .045, .02);
}

function playWin() {
  playTone(520, .09, .03);
  playTone(660, .09, .03, .1);
  playTone(820, .15, .035, .2);
}

function vibrate(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

restartBtn.addEventListener("click", restartLevel);
hintBtn.addEventListener("click", showHint);
helpBtn.addEventListener("click", () => showModal("helpModal"));
levelsBtn.addEventListener("click", () => showModal("levelsModal"));

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.classList.toggle("sound-on", soundEnabled);
  soundBtn.textContent = soundEnabled ? "♪" : "×";
  soundBtn.setAttribute("aria-label", soundEnabled ? "Sound on" : "Sound off");
  if (soundEnabled) playTone(650, .06, .025);
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => hideModal(button.dataset.close));
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop && backdrop.id !== "winModal") {
      hideModal(backdrop.id);
    }
  });
});

nextBtn.addEventListener("click", () => {
  hideModal("winModal");
  const next = currentLevel === LEVELS.length - 1 ? 0 : currentLevel + 1;
  buildLevel(next);
});

replayBtn.addEventListener("click", () => {
  hideModal("winModal");
  buildLevel(currentLevel);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideModal("helpModal");
    hideModal("levelsModal");
  }
});

buildLevel(currentLevel);

if (!localStorage.getItem(HELP_KEY)) {
  localStorage.setItem(HELP_KEY, "1");
  window.setTimeout(() => showModal("helpModal"), 420);
}
