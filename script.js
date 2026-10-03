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

const WORLD_DEFS = [
  { key: "spark",    name: "Spark Lab",      start: 1,   end: 20,  tagline: "SPARK LAB • CONNECT • POWER • GLOW" },
  { key: "neon",     name: "Neon Grid",      start: 21,  end: 40,  tagline: "NEON GRID • ROUTE THE ENERGY" },
  { key: "bio",      name: "Bio Circuit",     start: 41,  end: 60,  tagline: "BIO CIRCUIT • GROW THE NETWORK" },
  { key: "quantum",  name: "Quantum Zone",   start: 61,  end: 80,  tagline: "QUANTUM ZONE • MASTER THE FLOW" },
  { key: "master",   name: "Master Core",    start: 81,  end: 100, tagline: "MASTER CORE • FINAL POWER RUN" },

  { key: "arctic",   name: "Arctic Pulse",   start: 101, end: 150, tagline: "ARCTIC PULSE • FREEZE THE GRID" },
  { key: "solar",    name: "Solar Forge",    start: 151, end: 200, tagline: "SOLAR FORGE • HARNESS THE HEAT" },
  { key: "cyber",    name: "Cyber City",     start: 201, end: 250, tagline: "CYBER CITY • LINK THE NETWORK" },
  { key: "ocean",    name: "Ocean Circuit",  start: 251, end: 300, tagline: "OCEAN CIRCUIT • DIVE INTO POWER" },
  { key: "plasma",   name: "Plasma Storm",   start: 301, end: 350, tagline: "PLASMA STORM • CONTROL THE SURGE" },
  { key: "retro",    name: "Retro Grid",     start: 351, end: 400, tagline: "RETRO GRID • RELAY THE SIGNAL" },
  { key: "void",     name: "Void Matrix",    start: 401, end: 450, tagline: "VOID MATRIX • FIND THE PATH" },
  { key: "infinity", name: "Infinity Core",  start: 451, end: 500, tagline: "INFINITY CORE • COMPLETE THE FINAL CIRCUIT" }
];

const MODE_DEFS = [
  { start: 1,   end: 10,  mode: "Starter Circuit",  rule: "Learn corners, lines and simple routes" },
  { start: 11,  end: 20,  mode: "Branch Circuit",   rule: "T-junctions split power to more bulbs" },
  { start: 21,  end: 30,  mode: "Locked Wires",     rule: "Blue locked wires cannot rotate" },
  { start: 31,  end: 40,  mode: "Obstacle Grid",    rule: "Route around blocked circuit cells" },
  { start: 41,  end: 50,  mode: "Dense Network",    rule: "More bulbs and tighter branches" },
  { start: 51,  end: 60,  mode: "Locked Maze",      rule: "Use fixed clues through blocked paths" },
  { start: 61,  end: 70,  mode: "High Voltage",     rule: "Long 6×6 routes with heavy branching" },
  { start: 71,  end: 80,  mode: "Expert Grid",      rule: "Locks, walls and dense routes combine" },
  { start: 81,  end: 90,  mode: "Master Circuit",   rule: "Plan the full network before rotating" },
  { start: 91,  end: 100, mode: "Final Reactor",    rule: "Maximum first-chapter circuit challenge" },

  { start: 101, end: 125, mode: "Frozen Lines",     rule: "Cold paths hide behind fixed junctions" },
  { start: 126, end: 150, mode: "Ice Locks",        rule: "More frozen wires restrict your route" },
  { start: 151, end: 175, mode: "Solar Branches",   rule: "Split intense power across long branches" },
  { start: 176, end: 200, mode: "Heat Maze",        rule: "Navigate hot zones and fixed connections" },
  { start: 201, end: 225, mode: "Cyber Links",      rule: "Dense digital networks demand precision" },
  { start: 226, end: 250, mode: "Firewall Grid",    rule: "Blocked nodes create tight cyber routes" },
  { start: 251, end: 275, mode: "Deep Current",     rule: "Long underwater circuits branch heavily" },
  { start: 276, end: 300, mode: "Pressure Grid",    rule: "Locks and walls squeeze the available path" },
  { start: 301, end: 325, mode: "Plasma Links",     rule: "Control unstable multi-branch circuits" },
  { start: 326, end: 350, mode: "Overload Maze",    rule: "Heavy obstacles leave fewer safe routes" },
  { start: 351, end: 375, mode: "Retro Relay",      rule: "Relay power through dense classic grids" },
  { start: 376, end: 400, mode: "Arcade Grid",      rule: "Fast-looking circuits hide hard solutions" },
  { start: 401, end: 425, mode: "Void Paths",       rule: "Sparse space creates deceptive connections" },
  { start: 426, end: 450, mode: "Gravity Locks",    rule: "Locked routes dominate the dark matrix" },
  { start: 451, end: 475, mode: "Infinity Network", rule: "Master every mechanic in one network" },
  { start: 476, end: 500, mode: "Final Infinity",   rule: "The hardest circuits in Light Jalao" }
];

function worldForLevel(number) {
  return WORLD_DEFS.find(world => number >= world.start && number <= world.end) || WORLD_DEFS[0];
}

function modeForLevel(number) {
  return MODE_DEFS.find(mode => number >= mode.start && number <= mode.end) || MODE_DEFS[MODE_DEFS.length - 1];
}

function buildLevelConfig(number) {
  const world = worldForLevel(number);
  const mode = modeForLevel(number);
  const withinTen = (number - 1) % 10;
  const ramp = Math.floor(withinTen / 3);

  let size = 3;
  let branchy = false;
  let fixed = 0;
  let blockers = 0;
  let minBulbs = 2;

  if (number >= 5) size = 4;
  if (number >= 21) size = 5;
  if (number >= 51) size = 6;

  if (number >= 11) {
    branchy = true;
    minBulbs = 3 + Math.min(2, ramp);
  }

  if (number >= 21) {
    fixed = 1 + Math.min(2, ramp);
    minBulbs = 4 + Math.min(1, ramp);
  }

  if (number >= 31) {
    blockers = 1 + Math.min(2, ramp);
  }

  if (number >= 41) {
    fixed = 1 + Math.min(2, ramp);
    blockers = Math.max(blockers, Math.min(2, ramp));
    minBulbs = 5 + Math.min(1, ramp);
  }

  if (number >= 51) {
    fixed = 2 + Math.min(2, ramp);
    blockers = 2 + Math.min(1, ramp);
    minBulbs = 5 + Math.min(2, ramp);
  }

  if (number >= 61) {
    fixed = 2 + Math.min(2, ramp);
    blockers = 2 + Math.min(2, ramp);
    minBulbs = 6 + Math.min(1, ramp);
  }

  if (number >= 71) {
    fixed = 3 + Math.min(2, ramp);
    blockers = 3 + Math.min(1, ramp);
    minBulbs = 6 + Math.min(2, ramp);
  }

  if (number >= 81) {
    fixed = 4 + Math.min(1, ramp);
    blockers = 4 + Math.min(1, ramp);
    minBulbs = 7 + Math.min(1, ramp);
  }

  if (number >= 91) {
    fixed = 5;
    blockers = 5;
    minBulbs = 8;
  }

  if (number >= 101) {
    fixed = 4 + Math.min(2, ramp);
    blockers = 4 + Math.min(1, ramp);
    minBulbs = 7 + Math.min(2, ramp);
  }

  if (number >= 151) {
    fixed = 5 + Math.min(1, ramp);
    blockers = 4 + Math.min(2, ramp);
    minBulbs = 8;
  }

  if (number >= 201) {
    fixed = 5 + Math.min(2, ramp);
    blockers = 5 + Math.min(1, ramp);
    minBulbs = 8 + Math.min(1, ramp);
  }

  if (number >= 251) {
    fixed = 6;
    blockers = 5 + Math.min(2, ramp);
    minBulbs = 8 + Math.min(1, ramp);
  }

  if (number >= 301) {
    fixed = 6 + Math.min(1, ramp);
    blockers = 6;
    minBulbs = 9;
  }

  if (number >= 351) {
    fixed = 7;
    blockers = 6 + Math.min(1, ramp);
    minBulbs = 9;
  }

  if (number >= 401) {
    fixed = 7 + Math.min(1, ramp);
    blockers = 7;
    minBulbs = 9 + Math.min(1, ramp);
  }

  if (number >= 451) {
    fixed = 8;
    blockers = 7 + Math.min(1, ramp);
    minBulbs = 10;
  }

  return {
    number,
    size,
    seed: 101 + number * 137 + Math.floor(number / 10) * 1009,
    mode: mode.mode,
    rule: mode.rule,
    minBulbs,
    branchy,
    fixed,
    blockers,
    world: world.key,
    worldName: world.name,
    tagline: world.tagline
  };
}

const LEVELS = Array.from({ length: 500 }, (_, index) => buildLevelConfig(index + 1));

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
const challengeBadge = document.getElementById("challengeBadge");
const challengeRule = document.getElementById("challengeRule");
const brandTagline = document.getElementById("brandTagline");
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
const winStars = document.getElementById("winStars");
const winRating = document.getElementById("winRating");
const homeScreen = document.getElementById("homeScreen");
const homeBtn = document.getElementById("homeBtn");
const continueBtn = document.getElementById("continueBtn");
const continueLabel = document.getElementById("continueLabel");
const homeLevelsBtn = document.getElementById("homeLevelsBtn");
const homeHelpBtn = document.getElementById("homeHelpBtn");
const homeWorld = document.getElementById("homeWorld");
const homeLevel = document.getElementById("homeLevel");
const homeStars = document.getElementById("homeStars");
const homeCompleted = document.getElementById("homeCompleted");
const homeProgressFill = document.getElementById("homeProgressFill");

let currentLevel = 0;
let solvedMasks = [];
let rotations = [];
let startRotations = [];
let powered = new Set();
let bulbs = [];
let fixedTiles = new Set();
let blockedCells = new Set();
let moves = 0;
let elapsed = 0;
let timer = null;
let timerStarted = false;
let locked = false;
let soundEnabled = true;
let audioContext = null;
let parMoves = 0;

const progress = loadProgress();
currentLevel = Math.min(Number(progress.currentLevel) || 0, LEVELS.length - 1);

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      unlocked: Math.max(1, Number(raw.unlocked) || 1),
      currentLevel: Number(raw.currentLevel) || 0,
      best: raw.best && typeof raw.best === "object" ? raw.best : {},
      stars: raw.stars && typeof raw.stars === "object" ? raw.stars : {}
    };
  } catch {
    return { unlocked: 1, currentLevel: 0, best: {}, stars: {} };
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

function isGridConnected(size, blocked) {
  if (blocked.has(0)) return false;

  const activeCount = size * size - blocked.size;
  const seen = new Set([0]);
  const queue = [0];

  while (queue.length) {
    const current = queue.shift();
    const [row, col] = rowCol(current, size);

    for (const dir of DIRS) {
      const nr = row + dir.dr;
      const nc = col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;

      const next = indexOf(nr, nc, size);
      if (blocked.has(next) || seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }

  return seen.size === activeCount;
}

function makeBlockedCells(size, count, seed) {
  const blocked = new Set();
  if (!count) return blocked;

  const random = rngFromSeed(seed * 29 + 17);
  const candidates = [];

  for (let index = 1; index < size * size; index += 1) {
    const [row, col] = rowCol(index, size);
    if (row === 0 && col === 1) continue;
    if (row === 1 && col === 0) continue;
    candidates.push(index);
  }

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const candidate of candidates) {
    if (blocked.size >= count) break;
    blocked.add(candidate);
    if (!isGridConnected(size, blocked)) blocked.delete(candidate);
  }

  return blocked;
}

function generateTree(size, seed, blocked = new Set(), branchy = false) {
  const random = rngFromSeed(seed);
  const masks = Array(size * size).fill(0);
  const visited = new Set([0]);

  if (!branchy) {
    const stack = [0];

    while (stack.length) {
      const current = stack[stack.length - 1];
      const [row, col] = rowCol(current, size);
      const choices = [];

      for (const dir of DIRS) {
        const nr = row + dir.dr;
        const nc = col + dir.dc;
        if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
        const next = indexOf(nr, nc, size);
        if (blocked.has(next) || visited.has(next)) continue;
        choices.push({ ...dir, next });
      }

      if (!choices.length) {
        stack.pop();
        continue;
      }

      const choice = choices[Math.floor(random() * choices.length)];
      masks[current] |= choice.bit;
      masks[choice.next] |= choice.opposite;
      visited.add(choice.next);
      stack.push(choice.next);
    }

    return masks;
  }

  const frontier = [];

  function addFrontier(from) {
    const [row, col] = rowCol(from, size);
    for (const dir of DIRS) {
      const nr = row + dir.dr;
      const nc = col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      const next = indexOf(nr, nc, size);
      if (blocked.has(next) || visited.has(next)) continue;
      frontier.push({ from, ...dir, next });
    }
  }

  addFrontier(0);

  while (frontier.length) {
    const pick = Math.floor(random() * frontier.length);
    const edge = frontier.splice(pick, 1)[0];
    if (visited.has(edge.next)) continue;

    masks[edge.from] |= edge.bit;
    masks[edge.next] |= edge.opposite;
    visited.add(edge.next);
    addFrontier(edge.next);
  }

  return masks;
}

function treeScore(masks) {
  let leaves = 0;
  let junctions = 0;

  masks.forEach((mask, index) => {
    if (index === 0 || mask === 0) return;
    const degree = bitCount(mask);
    if (degree === 1) leaves += 1;
    if (degree >= 3) junctions += 1;
  });

  return { leaves, junctions, score: leaves * 10 + junctions * 3 };
}

function generateBestTree(level, blocked) {
  let best = null;
  const attempts = level.branchy ? 36 : 18;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const masks = generateTree(
      level.size,
      level.seed + attempt * 97,
      blocked,
      level.branchy
    );
    const score = treeScore(masks);

    if (!best || score.score > best.score.score) {
      best = { masks, score };
    }

    if (score.leaves >= level.minBulbs && (!level.branchy || score.junctions >= 1)) {
      return masks;
    }
  }

  return best.masks;
}

function chooseFixedTiles(level) {
  const random = rngFromSeed(level.seed * 41 + 19);
  const candidates = solvedMasks
    .map((mask, index) => ({ mask, index }))
    .filter(({ mask, index }) =>
      index !== 0 &&
      mask !== 0 &&
      !bulbs.includes(index) &&
      bitCount(mask) >= 2
    )
    .map(item => item.index);

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return new Set(candidates.slice(0, level.fixed || 0));
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
    if (
      index === 0 ||
      mask === 0 ||
      mask === 15 ||
      fixedTiles.has(index) ||
      blockedCells.has(index)
    ) return 0;

    let turns = 1 + Math.floor(random() * 3);
    if ((mask === (N | S) || mask === (E | W)) && turns === 2) turns = 1;
    return turns;
  });

  const alreadySolved = result.every((turns, index) =>
    blockedCells.has(index) ||
    masksEquivalent(rotateMask(solvedMasks[index], turns), solvedMasks[index])
  );

  if (alreadySolved) {
    const fallback = solvedMasks.findIndex((mask, index) =>
      index !== 0 &&
      mask !== 0 &&
      !fixedTiles.has(index) &&
      !blockedCells.has(index)
    );
    if (fallback >= 0) result[fallback] = 1;
  }

  return result;
}

function turnsToSolved(mask, startRotation) {
  for (let turns = 0; turns < 4; turns += 1) {
    if (rotateMask(mask, (startRotation + turns) % 4) === mask) return turns;
  }
  return 3;
}

function calculatePar() {
  return solvedMasks.reduce((total, mask, index) => {
    if (
      index === 0 ||
      mask === 0 ||
      fixedTiles.has(index) ||
      blockedCells.has(index)
    ) return total;

    return total + turnsToSolved(mask, startRotations[index]);
  }, 0);
}

function ratingForMoves(moveCount) {
  const par = Math.max(1, parMoves);
  if (moveCount <= par + Math.max(1, Math.floor(par * .08))) return 3;
  if (moveCount <= Math.ceil(par * 1.35) + 2) return 2;
  return 1;
}

function totalEarnedStars() {
  return Object.values(progress.stars || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function completedLevelsCount() {
  return Object.keys(progress.best || {}).length;
}

function updateHomeScreen() {
  const level = LEVELS[currentLevel];
  const completed = completedLevelsCount();
  const nextNumber = Math.min(currentLevel + 1, LEVELS.length);

  homeWorld.textContent = level.worldName;
  homeLevel.textContent = `Level ${nextNumber} / ${LEVELS.length}`;
  homeStars.textContent = totalEarnedStars();
  homeCompleted.textContent = completed;
  homeProgressFill.style.width = `${Math.max(1, (completed / LEVELS.length) * 100)}%`;
  continueLabel.textContent = completed === 0 ? "Start Level 1" : `Level ${nextNumber} • ${level.worldName}`;
}

function showHome() {
  stopTimer();
  timerStarted = false;
  updateHomeScreen();
  homeScreen.classList.remove("hidden");
}

function hideHome() {
  homeScreen.classList.add("hidden");
}

function renderWinStars(stars) {
  [...winStars.children].forEach((star, index) => {
    star.textContent = index < stars ? "★" : "☆";
    star.classList.toggle("earned", index < stars);
  });

  winRating.textContent = stars === 3
    ? "Perfect circuit! 3 stars"
    : stars === 2
      ? "Great connection! 2 stars"
      : "Circuit cleared! 1 star";
}

function applyWorldTheme(level) {
  document.body.dataset.world = level.world;
  brandTagline.textContent = level.tagline;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const themeColors = {
    spark: "#071018",
    neon: "#06121d",
    bio: "#07150f",
    quantum: "#100a1c",
    master: "#171205",
    arctic: "#071723",
    solar: "#211006",
    cyber: "#071522",
    ocean: "#061923",
    plasma: "#1c0818",
    retro: "#16100a",
    void: "#090914",
    infinity: "#160b18"
  };

  if (metaTheme) metaTheme.setAttribute("content", themeColors[level.world] || "#071018");

  const shell = document.querySelector(".game-shell");
  if (shell) {
    shell.classList.remove("world-enter");
    void shell.offsetWidth;
    shell.classList.add("world-enter");
  }
}

function buildLevel(levelIndex) {
  stopTimer();
  currentLevel = levelIndex;
  moves = 0;
  elapsed = 0;
  locked = false;
  timerStarted = false;

  const level = LEVELS[currentLevel];
  applyWorldTheme(level);
  blockedCells = makeBlockedCells(level.size, level.blockers || 0, level.seed);
  solvedMasks = generateBestTree(level, blockedCells);
  bulbs = solvedMasks
    .map((mask, index) => ({ mask, index }))
    .filter(item =>
      item.index !== 0 &&
      item.mask !== 0 &&
      !blockedCells.has(item.index) &&
      bitCount(item.mask) === 1
    )
    .map(item => item.index);

  fixedTiles = chooseFixedTiles(level);
  rotations = makeScramble(level.size, level.seed);
  startRotations = [...rotations];
  parMoves = calculatePar();

  levelText.textContent = `Level ${currentLevel + 1}`;
  challengeBadge.textContent = `${level.worldName} • ${level.mode}`;
  challengeRule.textContent = level.rule;
  movesText.textContent = "0";
  timeText.textContent = "00:00";
  bestText.textContent = progress.best[String(currentLevel)]?.moves ?? "—";
  levelProgressFill.style.width = `${((currentLevel + 1) / LEVELS.length) * 100}%`;

  if (currentLevel >= 475) {
    statusText.textContent = "Final Infinity: every clue matters. Read the full network before touching a wire.";
  } else if (currentLevel >= 90 && currentLevel < 100) {
    statusText.textContent = "Final Reactor: read the whole network first. Locks and walls leave little room for mistakes.";
  } else if (level.blockers && level.fixed) {
    statusText.textContent = "Locked clues and blocked cells combine — plan the route before rotating.";
  } else if (level.blockers) {
    statusText.textContent = "Blocked cells cannot carry wires. Route the circuit around them.";
  } else if (level.fixed) {
    statusText.textContent = "Blue locked wires are fixed in place — use them as clues.";
  } else if (level.branchy) {
    statusText.textContent = "Power splits at junctions. Make every branch reach a bulb.";
  } else {
    statusText.textContent = "Tap a tile to rotate the wire. Connect the power source to every bulb.";
  }

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
    const isBlocked = blockedCells.has(index);
    const isSource = index === 0;
    const isBulb = bulbs.includes(index);
    const isFixed = fixedTiles.has(index);

    tile.type = "button";
    tile.dataset.index = index;
    tile.setAttribute("role", "gridcell");

    if (isBlocked) {
      tile.className = "tile obstacle-tile";
      tile.disabled = true;
      tile.setAttribute("aria-label", `Blocked cell at row ${row + 1}, column ${col + 1}`);
      const mark = document.createElement("span");
      mark.className = "obstacle-mark";
      mark.textContent = "×";
      tile.appendChild(mark);
      boardEl.appendChild(tile);
      return;
    }

    tile.className = [
      "tile",
      isSource ? "source-tile" : "",
      isBulb ? "leaf bulb-tile" : "",
      isFixed ? "fixed-tile" : ""
    ].filter(Boolean).join(" ");

    tile.setAttribute("aria-label", isSource
      ? "Power source"
      : isBulb
        ? `Bulb wire at row ${row + 1}, column ${col + 1}`
        : isFixed
          ? `Locked wire at row ${row + 1}, column ${col + 1}`
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

    if (isFixed) {
      const lock = document.createElement("span");
      lock.className = "lock-device";
      lock.setAttribute("aria-hidden", "true");
      tile.appendChild(lock);
      tile.disabled = true;
    } else if (!isSource) {
      tile.addEventListener("click", () => rotateTile(index));
    }

    boardEl.appendChild(tile);
  });

  boardEl.setAttribute("aria-rowcount", size);
  boardEl.setAttribute("aria-colcount", size);
}

function rotateTile(index) {
  if (locked || index === 0 || fixedTiles.has(index) || blockedCells.has(index)) return;

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

  target = frontier.find(index =>
    !fixedTiles.has(index) &&
    !blockedCells.has(index) &&
    currentMask(index) !== solvedMasks[index]
  );

  if (target === undefined || target === null) {
    target = solvedMasks.findIndex((mask, index) =>
      index !== 0 &&
      mask !== 0 &&
      !fixedTiles.has(index) &&
      !blockedCells.has(index) &&
      currentMask(index) !== mask
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

  const earnedStars = ratingForMoves(moves);
  progress.stars[key] = Math.max(Number(progress.stars[key]) || 0, earnedStars);

  progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, currentLevel + 2));
  saveProgress();
  renderLevels();

  winTitle.textContent = currentLevel === LEVELS.length - 1
    ? "Circuit Master! ✨"
    : newBest
      ? "New best! ✨"
      : "Lights on! ✨";

  const level = LEVELS[currentLevel];
  const completedNumber = currentLevel + 1;
  const worldFinished = completedNumber % 20 === 0;

  if (worldFinished && completedNumber < LEVELS.length) {
    winTitle.textContent = `${level.worldName} complete! ✨`;
  }

  renderWinStars(earnedStars);
  winCopy.textContent = `${level.worldName} • ${bulbs.length} bulbs • ${moves} moves • Par ${parMoves} • ${formatTime(elapsed)}`;
  updateHomeScreen();
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

    const previousWorld = index > 0 ? LEVELS[index - 1].world : null;
    if (index === 0 || previousWorld !== level.world) {
      const world = worldForLevel(number);
      const heading = document.createElement("div");
      heading.className = "level-world-heading";
      heading.dataset.world = level.world;
      heading.innerHTML = `<span></span><strong>${level.worldName}</strong><small>Levels ${world.start}–${world.end}</small>`;
      levelsGrid.appendChild(heading);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.world = level.world;
    button.className = [
      "level-card",
      index === currentLevel ? "current" : "",
      !unlocked ? "locked" : "",
      done ? "done" : ""
    ].filter(Boolean).join(" ");

    const stars = Number(progress.stars[String(index)]) || 0;
    if (unlocked) {
      button.innerHTML = `<span class="level-number">${number}</span><span class="level-mini-stars">${stars ? "★".repeat(stars) : ""}</span>`;
    } else {
      button.textContent = "🔒";
    }
    button.disabled = !unlocked;
    button.setAttribute("aria-label", unlocked
      ? `Level ${number}, ${level.size} by ${level.size}, ${level.worldName}, ${level.mode}`
      : `Level ${number} locked`);

    if (unlocked) {
      button.addEventListener("click", () => {
        hideModal("levelsModal");
        buildLevel(index);
        hideHome();
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
homeBtn.addEventListener("click", showHome);
continueBtn.addEventListener("click", hideHome);
homeLevelsBtn.addEventListener("click", () => showModal("levelsModal"));
homeHelpBtn.addEventListener("click", () => showModal("helpModal"));
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
  hideHome();
});

replayBtn.addEventListener("click", () => {
  hideModal("winModal");
  buildLevel(currentLevel);
  hideHome();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideModal("helpModal");
    hideModal("levelsModal");
  }
});

buildLevel(currentLevel);
updateHomeScreen();
showHome();
