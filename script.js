const levels = [
  { size: 3, scramble: [[0,0],[1,1]] },
  { size: 3, scramble: [[0,1],[2,1],[1,2]] },
  { size: 3, scramble: [[0,0],[0,2],[2,0],[2,2]] },
  { size: 3, scramble: [[0,0],[1,0],[2,2],[1,2]] },
  { size: 4, scramble: [[0,0],[1,2],[3,1]] },
  { size: 4, scramble: [[0,1],[1,3],[2,0],[3,2]] },
  { size: 4, scramble: [[0,0],[0,3],[2,1],[3,3]] },
  { size: 4, scramble: [[0,2],[1,0],[2,3],[3,1],[2,1]] },
  { size: 4, scramble: [[0,0],[0,2],[1,3],[2,0],[3,2]] },
  { size: 4, scramble: [[0,1],[1,1],[1,3],[2,0],[3,2],[3,3]] },
  { size: 5, scramble: [[0,0],[1,3],[2,2],[4,1]] },
  { size: 5, scramble: [[0,2],[1,0],[1,4],[3,1],[4,3]] },
  { size: 5, scramble: [[0,0],[0,4],[2,1],[2,3],[4,0],[4,4]] },
  { size: 5, scramble: [[0,1],[1,3],[2,0],[2,4],[3,2],[4,1]] },
  { size: 5, scramble: [[0,0],[0,3],[1,2],[2,4],[3,0],[3,3],[4,1]] },
  { size: 5, scramble: [[0,1],[0,4],[1,0],[1,3],[2,2],[3,1],[4,0],[4,4]] },
  { size: 5, scramble: [[0,0],[1,2],[1,4],[2,1],[3,3],[4,0],[4,2]] },
  { size: 5, scramble: [[0,2],[1,0],[1,3],[2,2],[2,4],[3,1],[4,3],[4,4]] },
  { size: 5, scramble: [[0,0],[0,4],[1,1],[1,3],[2,2],[3,0],[3,4],[4,1],[4,3]] },
  { size: 5, scramble: [[0,1],[0,3],[1,0],[1,4],[2,1],[2,3],[3,0],[3,4],[4,2]] }
];

const boardEl = document.getElementById("board");
const movesValue = document.getElementById("movesValue");
const bestValue = document.getElementById("bestValue");
const timeValue = document.getElementById("timeValue");
const levelLabel = document.getElementById("levelLabel");
const progressFill = document.getElementById("progressFill");
const restartButton = document.getElementById("restartButton");
const hintButton = document.getElementById("hintButton");
const helpButton = document.getElementById("helpButton");
const soundButton = document.getElementById("soundButton");
const levelPickerButton = document.getElementById("levelPickerButton");
const nextLevelButton = document.getElementById("nextLevelButton");
const replayButton = document.getElementById("replayButton");
const winStats = document.getElementById("winStats");
const winTitle = document.getElementById("winTitle");
const levelsGrid = document.getElementById("levelsGrid");

const STORAGE_KEY = "lightJalaoProgressV1";
const FIRST_VISIT_KEY = "lightJalaoSeenHelp";

let board = [];
let initialBoard = [];
let currentLevel = 0;
let moves = 0;
let elapsed = 0;
let timer = null;
let timerStarted = false;
let locked = false;
let soundEnabled = true;
let audioContext = null;

const saved = loadProgress();
currentLevel = Math.min(saved.currentLevel || 0, levels.length - 1);

function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      unlocked: Math.max(1, Number(data.unlocked) || 1),
      currentLevel: Number(data.currentLevel) || 0,
      best: data.best && typeof data.best === "object" ? data.best : {}
    };
  } catch {
    return { unlocked: 1, currentLevel: 0, best: {} };
  }
}

function saveProgress() {
  saved.currentLevel = currentLevel;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function makeSolved(size) {
  return Array.from({ length: size }, () => Array(size).fill(true));
}

function cloneBoard(source) {
  return source.map(row => [...row]);
}

function toggleCell(target, row, col) {
  const size = target.length;
  if (row < 0 || col < 0 || row >= size || col >= size) return;
  target[row][col] = !target[row][col];
}

function applyPress(target, row, col) {
  toggleCell(target, row, col);
  toggleCell(target, row - 1, col);
  toggleCell(target, row + 1, col);
  toggleCell(target, row, col - 1);
  toggleCell(target, row, col + 1);
}

function makeLevelBoard(level) {
  const result = makeSolved(level.size);
  level.scramble.forEach(([row, col]) => applyPress(result, row, col));
  return result;
}

function loadLevel(index) {
  clearInterval(timer);
  timer = null;
  timerStarted = false;
  elapsed = 0;
  moves = 0;
  locked = false;
  currentLevel = index;

  const level = levels[currentLevel];
  initialBoard = makeLevelBoard(level);
  board = cloneBoard(initialBoard);

  levelLabel.textContent = `Level ${currentLevel + 1}`;
  movesValue.textContent = "0";
  timeValue.textContent = "00:00";
  progressFill.style.width = `${((currentLevel + 1) / levels.length) * 100}%`;

  const best = saved.best[String(currentLevel)];
  bestValue.textContent = best ? best.moves : "—";
  boardEl.style.setProperty("--grid-size", level.size);

  renderBoard();
  renderLevels();
  saveProgress();
}

function renderBoard(lastChanged = []) {
  const size = board.length;
  const changedSet = new Set(lastChanged.map(([r, c]) => `${r}-${c}`));
  boardEl.innerHTML = "";

  board.forEach((row, r) => {
    row.forEach((isOn, c) => {
      const cell = document.createElement("button");
      cell.className = `light${isOn ? " on" : ""}${changedSet.has(`${r}-${c}`) ? " just-toggled" : ""}`;
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, ${isOn ? "on" : "off"}`);
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => press(r, c));
      boardEl.appendChild(cell);
    });
  });

  boardEl.setAttribute("aria-rowcount", size);
  boardEl.setAttribute("aria-colcount", size);
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timer = setInterval(() => {
    elapsed += 1;
    timeValue.textContent = formatTime(elapsed);
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function press(row, col) {
  if (locked) return;
  startTimer();

  const changed = [
    [row, col],
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1]
  ].filter(([r, c]) => r >= 0 && c >= 0 && r < board.length && c < board.length);

  applyPress(board, row, col);
  moves += 1;
  movesValue.textContent = moves;
  playTone(board[row][col]);
  vibrate(14);
  renderBoard(changed);

  if (isSolved()) {
    locked = true;
    clearInterval(timer);
    setTimeout(completeLevel, 420);
  }
}

function isSolved() {
  return board.every(row => row.every(Boolean));
}

function completeLevel() {
  const key = String(currentLevel);
  const previous = saved.best[key];
  const isBest = !previous || moves < previous.moves || (moves === previous.moves && elapsed < previous.time);

  if (isBest) {
    saved.best[key] = { moves, time: elapsed };
  }

  saved.unlocked = Math.max(saved.unlocked, Math.min(levels.length, currentLevel + 2));
  saveProgress();

  winTitle.textContent = currentLevel === levels.length - 1 ? "Puzzle Master! ✨" : isBest ? "New best! ✨" : "Brilliant! ✨";
  winStats.textContent = `${moves} moves • ${formatTime(elapsed)}`;
  nextLevelButton.textContent = currentLevel === levels.length - 1 ? "Play from Level 1 ↻" : "Next Level →";

  createConfetti();
  showModal("winModal");
  playWinSound();
  vibrate([45, 45, 80]);
  renderLevels();
}

function restartLevel() {
  clearInterval(timer);
  timer = null;
  timerStarted = false;
  elapsed = 0;
  moves = 0;
  locked = false;
  board = cloneBoard(initialBoard);
  movesValue.textContent = "0";
  timeValue.textContent = "00:00";
  renderBoard();
  playTone(false, 0.05);
}

function solveCurrentBoard() {
  const size = board.length;
  let bestSolution = null;

  for (let mask = 0; mask < (1 << size); mask += 1) {
    const work = cloneBoard(board);
    const presses = [];

    for (let col = 0; col < size; col += 1) {
      if (mask & (1 << col)) {
        applyPress(work, 0, col);
        presses.push([0, col]);
      }
    }

    for (let row = 1; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (!work[row - 1][col]) {
          applyPress(work, row, col);
          presses.push([row, col]);
        }
      }
    }

    if (work[size - 1].every(Boolean)) {
      if (!bestSolution || presses.length < bestSolution.length) {
        bestSolution = presses;
      }
    }
  }

  return bestSolution;
}

function showHint() {
  if (locked) return;
  const solution = solveCurrentBoard();

  if (!solution || solution.length === 0) {
    document.getElementById("tipText").textContent = "You're already glowing! Finish the level ✨";
    return;
  }

  const [row, col] = solution[0];
  const target = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!target) return;

  target.classList.remove("pulse");
  void target.offsetWidth;
  target.classList.add("pulse");
  document.getElementById("tipText").textContent = `Hint: try the glowing square at row ${row + 1}, column ${col + 1}.`;
  playHintSound();
}

function renderLevels() {
  levelsGrid.innerHTML = "";

  levels.forEach((_, index) => {
    const number = index + 1;
    const button = document.createElement("button");
    const unlocked = number <= saved.unlocked;
    const done = Boolean(saved.best[String(index)]);

    button.className = [
      "level-button",
      index === currentLevel ? "current" : "",
      !unlocked ? "locked" : "",
      done ? "done" : ""
    ].filter(Boolean).join(" ");

    button.type = "button";
    button.textContent = unlocked ? number : "🔒";
    button.disabled = !unlocked;
    button.setAttribute("aria-label", unlocked ? `Play level ${number}` : `Level ${number} locked`);

    if (unlocked) {
      button.addEventListener("click", () => {
        hideModal("levelsModal");
        loadLevel(index);
      });
    }

    levelsGrid.appendChild(button);
  });
}

function showModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function hideModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function createConfetti() {
  const wrap = document.getElementById("celebration");
  wrap.innerHTML = "";
  const colors = ["#ffd84d", "#56e6ff", "#ff7ca6", "#9b8cff", "#8cf08f"];

  for (let i = 0; i < 28; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${1.4 + Math.random() * 0.9}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
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

function beep(frequency, duration = 0.08, volume = 0.035, delay = 0) {
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playTone(nowOn, volume = 0.035) {
  beep(nowOn ? 520 : 270, 0.08, volume);
}

function playHintSound() {
  beep(620, 0.07, 0.025);
  beep(810, 0.09, 0.025, 0.09);
}

function playWinSound() {
  beep(520, 0.1, 0.03);
  beep(660, 0.1, 0.03, 0.1);
  beep(820, 0.16, 0.035, 0.2);
}

function vibrate(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

restartButton.addEventListener("click", restartLevel);
hintButton.addEventListener("click", showHint);
helpButton.addEventListener("click", () => showModal("helpModal"));
levelPickerButton.addEventListener("click", () => showModal("levelsModal"));

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.classList.toggle("sound-on", soundEnabled);
  soundButton.textContent = soundEnabled ? "♪" : "×";
  soundButton.setAttribute("aria-label", soundEnabled ? "Sound on" : "Sound off");
  if (soundEnabled) beep(620, 0.06, 0.025);
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => hideModal(button.dataset.closeModal));
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop && backdrop.id !== "winModal") {
      hideModal(backdrop.id);
    }
  });
});

nextLevelButton.addEventListener("click", () => {
  hideModal("winModal");
  const next = currentLevel === levels.length - 1 ? 0 : currentLevel + 1;
  loadLevel(next);
});

replayButton.addEventListener("click", () => {
  hideModal("winModal");
  loadLevel(currentLevel);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    ["helpModal", "levelsModal"].forEach(id => hideModal(id));
  }
});

loadLevel(currentLevel);

if (!localStorage.getItem(FIRST_VISIT_KEY)) {
  localStorage.setItem(FIRST_VISIT_KEY, "1");
  setTimeout(() => showModal("helpModal"), 450);
}
