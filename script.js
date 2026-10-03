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
const dailyBtn = document.getElementById("dailyBtn");
const endlessBtn = document.getElementById("endlessBtn");
const dailyStatus = document.getElementById("dailyStatus");
const endlessStatus = document.getElementById("endlessStatus");
const homeStreak = document.getElementById("homeStreak");
const journeyBtn = document.getElementById("journeyBtn");
const achievementsBtn = document.getElementById("achievementsBtn");
const journeySummary = document.getElementById("journeySummary");
const achievementCount = document.getElementById("achievementCount");
const journeyCleared = document.getElementById("journeyCleared");
const journeyStars = document.getElementById("journeyStars");
const journeyStreak = document.getElementById("journeyStreak");
const worldProgressList = document.getElementById("worldProgressList");
const achievementsGrid = document.getElementById("achievementsGrid");
const achievementModalSummary = document.getElementById("achievementModalSummary");
const achievementToast = document.getElementById("achievementToast");
const achievementToastIcon = document.getElementById("achievementToastIcon");
const achievementToastTitle = document.getElementById("achievementToastTitle");
const achievementToastCopy = document.getElementById("achievementToastCopy");
const installAppBtn = document.getElementById("installAppBtn");
const settingsBtn = document.getElementById("settingsBtn");
const profileBtn = document.getElementById("profileBtn");
const homeProfileAvatar = document.getElementById("homeProfileAvatar");
const homeProfileName = document.getElementById("homeProfileName");
const profileAvatarPreview = document.getElementById("profileAvatarPreview");
const profilePreviewName = document.getElementById("profilePreviewName");
const profilePlayerId = document.getElementById("profilePlayerId");
const profileNameInput = document.getElementById("profileNameInput");
const emojiAvatarGrid = document.getElementById("emojiAvatarGrid");
const profileStars = document.getElementById("profileStars");
const profileCleared = document.getElementById("profileCleared");
const profileEndless = document.getElementById("profileEndless");
const profileError = document.getElementById("profileError");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const hapticToggleBtn = document.getElementById("hapticToggleBtn");
const soundSettingState = document.getElementById("soundSettingState");
const hapticSettingState = document.getElementById("hapticSettingState");
const hintEnergyText = document.getElementById("hintEnergyText");
const hintMiniTimer = document.getElementById("hintMiniTimer");
const hintModalCount = document.getElementById("hintModalCount");
const hintTimerText = document.getElementById("hintTimerText");
const hintRechargeFill = document.getElementById("hintRechargeFill");
const rewardAdBtn = document.getElementById("rewardAdBtn");
const rewardAdStatus = document.getElementById("rewardAdStatus");
const performanceDetail = document.getElementById("performanceDetail");
const performanceState = document.getElementById("performanceState");

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
let hapticsEnabled = true;
let audioContext = null;
let lastLitBulbs = 0;
let hintUiTimer = null;
let parMoves = 0;
let gameMode = "campaign";
let activeLevel = null;
let activePuzzleCounted = false;
let activeDailyKey = "";
let endlessRun = 0;
let endlessSeedBase = 0;

const PROFILE_AVATARS = [
  "😎","🤩","😄","😁","🥳","🤠","🕶️","🤖",
  "👾","👽","🧠","⚡","🔥","🌟","🦁","🐯",
  "🐼","🦊","🐸","🐵","🐧","🦄","🐲","🦖"
];

function generateLocalPlayerId() {
  let value = "";
  try {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    value = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  } catch {
    value = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, "0").toUpperCase();
  }
  return `LJ-${value}`;
}

function defaultProfile() {
  const playerId = generateLocalPlayerId();
  return {
    playerId,
    name: `Player ${playerId.slice(-4)}`,
    avatar: "😎"
  };
}

function normalizeProfileName(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

const progress = loadProgress();
soundEnabled = progress.settings?.sound !== false;
hapticsEnabled = progress.settings?.haptics !== false;
currentLevel = Math.min(Number(progress.currentLevel) || 0, LEVELS.length - 1);

const HINT_MAX = 5;
const HINT_RECHARGE_MS = 10 * 60 * 1000;

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      unlocked: Math.max(1, Number(raw.unlocked) || 1),
      currentLevel: Number(raw.currentLevel) || 0,
      best: raw.best && typeof raw.best === "object" ? raw.best : {},
      stars: raw.stars && typeof raw.stars === "object" ? raw.stars : {},
      daily: raw.daily && typeof raw.daily === "object" ? raw.daily : {},
      endlessBest: Math.max(0, Number(raw.endlessBest) || 0),
      achievements: raw.achievements && typeof raw.achievements === "object" ? raw.achievements : {},
      settings: raw.settings && typeof raw.settings === "object"
        ? raw.settings
        : { sound: true, haptics: true },
      hints: raw.hints && typeof raw.hints === "object"
        ? raw.hints
        : { count: 5, lastRefillAt: Date.now() },
      profile: raw.profile && typeof raw.profile === "object"
        ? {
            playerId: String(raw.profile.playerId || generateLocalPlayerId()),
            name: normalizeProfileName(raw.profile.name) || "Player",
            avatar: PROFILE_AVATARS.includes(raw.profile.avatar) ? raw.profile.avatar : "😎"
          }
        : defaultProfile()
    };
  } catch {
    return {
      unlocked: 1,
      currentLevel: 0,
      best: {},
      stars: {},
      daily: {},
      endlessBest: 0,
      achievements: {},
      settings: { sound: true, haptics: true },
      hints: { count: 5, lastRefillAt: Date.now() },
      profile: defaultProfile()
    };
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

function dateKeyOffset(dateKey, offsetDays) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function currentDailyStreak() {
  const completed = new Set(Object.keys(progress.daily || {}));
  if (!completed.size) return 0;

  const today = localDateKey();
  let anchor = completed.has(today) ? today : dateKeyOffset(today, -1);
  let streak = 0;

  while (completed.has(anchor)) {
    streak += 1;
    anchor = dateKeyOffset(anchor, -1);
  }

  return streak;
}

function bestDailyStreak() {
  const dates = Object.keys(progress.daily || {}).sort();
  if (!dates.length) return 0;

  let best = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i += 1) {
    if (dates[i] === dateKeyOffset(dates[i - 1], 1)) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
  }

  return best;
}

function worldStats(world) {
  let cleared = 0;
  let stars = 0;
  const total = world.end - world.start + 1;

  for (let number = world.start; number <= world.end; number += 1) {
    const index = number - 1;
    if (progress.best[String(index)]) cleared += 1;
    stars += Number(progress.stars[String(index)]) || 0;
  }

  return { cleared, stars, total, complete: cleared === total };
}

function completedWorldsCount() {
  return WORLD_DEFS.filter(world => worldStats(world).complete).length;
}

const ACHIEVEMENTS = [
  { id: "first_light", icon: "💡", title: "First Light", copy: "Complete your first campaign level.", test: () => completedLevelsCount() >= 1 },
  { id: "level_10", icon: "⚡", title: "Getting Charged", copy: "Complete 10 campaign levels.", test: () => completedLevelsCount() >= 10 },
  { id: "level_50", icon: "🔌", title: "Circuit Runner", copy: "Complete 50 campaign levels.", test: () => completedLevelsCount() >= 50 },
  { id: "level_100", icon: "💯", title: "Century Power", copy: "Complete 100 campaign levels.", test: () => completedLevelsCount() >= 100 },
  { id: "star_100", icon: "⭐", title: "Star Collector", copy: "Collect 100 campaign stars.", test: () => totalEarnedStars() >= 100 },
  { id: "perfect_25", icon: "🌟", title: "Precision Engineer", copy: "Earn 3 stars on 25 campaign levels.", test: () => Object.values(progress.stars || {}).filter(value => Number(value) === 3).length >= 25 },
  { id: "world_1", icon: "🌍", title: "World Conqueror", copy: "Complete your first full world.", test: () => completedWorldsCount() >= 1 },
  { id: "daily_1", icon: "☀️", title: "Daily Spark", copy: "Complete your first Daily Challenge.", test: () => Object.keys(progress.daily || {}).length >= 1 },
  { id: "streak_3", icon: "🔥", title: "On Fire", copy: "Reach a 3-day Daily Challenge streak.", test: () => bestDailyStreak() >= 3 },
  { id: "streak_7", icon: "🔥", title: "Week of Power", copy: "Reach a 7-day Daily Challenge streak.", test: () => bestDailyStreak() >= 7 },
  { id: "endless_10", icon: "∞", title: "Infinite Current", copy: "Clear 10 puzzles in one Endless run.", test: () => (progress.endlessBest || 0) >= 10 },
  { id: "all_500", icon: "👑", title: "Light Jalao Master", copy: "Complete all 500 campaign levels.", test: () => completedLevelsCount() >= 500 }
];

function unlockedAchievementCount() {
  return ACHIEVEMENTS.filter(achievement => Boolean(progress.achievements[achievement.id])).length;
}

let achievementToastTimer = null;

function showAchievementToast(achievement, extraCount = 0) {
  if (!achievement) return;

  achievementToastIcon.textContent = achievement.icon;
  achievementToastTitle.textContent = extraCount > 0
    ? `${achievement.title} +${extraCount} more`
    : achievement.title;
  achievementToastCopy.textContent = achievement.copy;
  achievementToast.classList.remove("hidden");
  playGameSound("achievement");
  vibrate([18, 28, 45]);

  window.clearTimeout(achievementToastTimer);
  achievementToastTimer = window.setTimeout(() => {
    achievementToast.classList.add("hidden");
  }, 3800);
}

function evaluateAchievements(showToast = false) {
  const unlockedNow = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!progress.achievements[achievement.id] && achievement.test()) {
      progress.achievements[achievement.id] = Date.now();
      unlockedNow.push(achievement);
    }
  });

  if (showToast && unlockedNow.length) {
    showAchievementToast(unlockedNow[0], unlockedNow.length - 1);
  }

  return unlockedNow;
}

function renderAchievements() {
  evaluateAchievements(false);
  const unlocked = unlockedAchievementCount();

  achievementModalSummary.textContent = `${unlocked} of ${ACHIEVEMENTS.length} achievements unlocked.`;
  achievementCount.textContent = `${unlocked} / ${ACHIEVEMENTS.length} unlocked`;
  achievementsGrid.innerHTML = "";

  ACHIEVEMENTS.forEach(achievement => {
    const isUnlocked = Boolean(progress.achievements[achievement.id]);
    const card = document.createElement("div");
    card.className = `achievement-card ${isUnlocked ? "unlocked" : ""}`;
    card.innerHTML = `
      <span class="achievement-icon">${isUnlocked ? achievement.icon : "🔒"}</span>
      <strong>${achievement.title}</strong>
      <p>${achievement.copy}</p>
      <small>${isUnlocked ? "Unlocked" : "Locked"}</small>
    `;
    achievementsGrid.appendChild(card);
  });
}

function renderWorldProgress() {
  const completedWorlds = completedWorldsCount();
  const totalStars = totalEarnedStars();
  const streak = currentDailyStreak();

  journeySummary.textContent = `${completedWorlds} / ${WORLD_DEFS.length} worlds`;
  journeyCleared.textContent = completedLevelsCount();
  journeyStars.textContent = totalStars;
  journeyStreak.textContent = streak;
  worldProgressList.innerHTML = "";

  WORLD_DEFS.forEach((world, index) => {
    const stats = worldStats(world);
    const percent = Math.round((stats.cleared / stats.total) * 100);
    const card = document.createElement("div");
    card.className = `world-progress-card ${stats.complete ? "complete" : ""}`;
    card.dataset.world = world.key;
    card.innerHTML = `
      <div class="world-progress-node">${stats.complete ? "✓" : index + 1}</div>
      <div class="world-progress-copy">
        <strong>${world.name}</strong>
        <small>Levels ${world.start}–${world.end}</small>
        <div class="world-progress-bar"><i style="width:${percent}%"></i></div>
      </div>
      <div class="world-progress-meta">
        <b>${stats.cleared}/${stats.total}</b>
        <span>⭐ ${stats.stars}</span>
      </div>
    `;
    worldProgressList.appendChild(card);
  });
}

let pendingProfileAvatar = "😎";

function ensureProfile() {
  if (!progress.profile || typeof progress.profile !== "object") {
    progress.profile = defaultProfile();
  }

  if (!progress.profile.playerId) progress.profile.playerId = generateLocalPlayerId();
  progress.profile.name = normalizeProfileName(progress.profile.name) || `Player ${progress.profile.playerId.slice(-4)}`;
  if (!PROFILE_AVATARS.includes(progress.profile.avatar)) progress.profile.avatar = "😎";
}

function renderProfileAvatarGrid() {
  if (!emojiAvatarGrid) return;
  emojiAvatarGrid.innerHTML = "";

  PROFILE_AVATARS.forEach(emoji => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "emoji-avatar-option";
    button.textContent = emoji;
    button.setAttribute("role", "option");
    button.setAttribute("aria-label", `Avatar ${emoji}`);
    button.setAttribute("aria-selected", emoji === pendingProfileAvatar ? "true" : "false");
    button.classList.toggle("selected", emoji === pendingProfileAvatar);

    button.addEventListener("click", () => {
      pendingProfileAvatar = emoji;
      profileAvatarPreview.textContent = emoji;
      emojiAvatarGrid.querySelectorAll(".emoji-avatar-option").forEach(option => {
        const selected = option.textContent === emoji;
        option.classList.toggle("selected", selected);
        option.setAttribute("aria-selected", selected ? "true" : "false");
      });
      playClick();
      vibrate(12);
    });

    emojiAvatarGrid.appendChild(button);
  });
}

function updateHomeProfile() {
  ensureProfile();
  if (homeProfileAvatar) homeProfileAvatar.textContent = progress.profile.avatar;
  if (homeProfileName) homeProfileName.textContent = progress.profile.name;
}

function openProfile() {
  ensureProfile();
  pendingProfileAvatar = progress.profile.avatar;

  profileAvatarPreview.textContent = progress.profile.avatar;
  profilePreviewName.textContent = progress.profile.name;
  profilePlayerId.textContent = progress.profile.playerId;
  profileNameInput.value = progress.profile.name;
  profileStars.textContent = totalEarnedStars();
  profileCleared.textContent = completedLevelsCount();
  profileEndless.textContent = progress.endlessBest || 0;

  profileError.textContent = "";
  profileError.classList.add("hidden");
  renderProfileAvatarGrid();
  showModal("profileModal");

  window.setTimeout(() => profileNameInput?.focus(), 180);
}

function savePlayerProfile() {
  ensureProfile();

  const name = normalizeProfileName(profileNameInput.value);
  if (name.length < 3) {
    profileError.textContent = "Player name kam se kam 3 characters ka rakho.";
    profileError.classList.remove("hidden");
    vibrate(18);
    return;
  }

  progress.profile.name = name;
  progress.profile.avatar = PROFILE_AVATARS.includes(pendingProfileAvatar)
    ? pendingProfileAvatar
    : "😎";

  saveProgress();
  updateHomeProfile();
  profilePreviewName.textContent = progress.profile.name;
  profileError.classList.add("hidden");
  hideModal("profileModal");
  playGameSound("reward");
  vibrate([15, 20, 35]);
}

function updateHomeScreen() {
  const level = LEVELS[currentLevel];
  const completed = completedLevelsCount();
  const nextNumber = Math.min(currentLevel + 1, LEVELS.length);
  const today = localDateKey();
  const dailyRecord = progress.daily[today];

  homeWorld.textContent = level.worldName;
  homeLevel.textContent = `Level ${nextNumber} / ${LEVELS.length}`;
  homeStars.textContent = totalEarnedStars();
  homeCompleted.textContent = completed;
  homeStreak.textContent = currentDailyStreak();
  homeProgressFill.style.width = `${Math.max(1, (completed / LEVELS.length) * 100)}%`;
  continueLabel.textContent = completed === 0 ? "Start Level 1" : `Level ${nextNumber} • ${level.worldName}`;
  dailyStatus.textContent = dailyRecord ? `✓ Completed • ${dailyRecord.stars || 1}★` : "New puzzle today";
  endlessStatus.textContent = `Best run: ${progress.endlessBest || 0}`;
  renderWorldProgress();
  renderAchievements();
  updateHintUI();
  syncSettingsUI();
  updateHomeProfile();
}

function showHome() {
  stopTimer();
  timerStarted = false;
  applyWorldTheme(LEVELS[currentLevel]);
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

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeDailyLevel(dateKey = localDateKey()) {
  const seed = hashString(`light-jalao-daily-${dateKey}`);
  return {
    number: 0,
    size: seed % 4 === 0 ? 6 : 5,
    seed,
    mode: "Daily Challenge",
    rule: "One fresh circuit for today",
    minBulbs: 5 + ((seed >>> 7) % 3),
    branchy: true,
    fixed: 2 + (seed % 3),
    blockers: 2 + ((seed >>> 4) % 3),
    world: "daily",
    worldName: "Daily Pulse",
    tagline: "DAILY PULSE • TODAY'S CIRCUIT"
  };
}

function makeEndlessLevel(step, seedBase) {
  const stepNumber = Math.max(1, step);
  const seed = (seedBase + Math.imul(stepNumber, 2654435761)) >>> 0;
  const size = stepNumber <= 2 ? 4 : stepNumber <= 6 ? 5 : 6;
  const ramp = Math.min(10, Math.floor((stepNumber - 1) / 2));
  return {
    number: stepNumber,
    size,
    seed,
    mode: "Endless Mode",
    rule: `Puzzle ${stepNumber} • difficulty rises after every clear`,
    minBulbs: Math.min(10, 3 + ramp),
    branchy: true,
    fixed: Math.min(8, 1 + ramp),
    blockers: Math.min(7, Math.floor(ramp * .8)),
    world: "endless",
    worldName: "Infinity Run",
    tagline: "ENDLESS • KEEP THE CIRCUIT ALIVE"
  };
}

function startDailyChallenge() {
  activeDailyKey = localDateKey();
  activePuzzleCounted = false;
  loadPuzzle(makeDailyLevel(activeDailyKey), "daily");
  hideHome();
}

function startEndlessMode() {
  endlessRun = 0;
  endlessSeedBase = (Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0;
  activePuzzleCounted = false;
  loadPuzzle(makeEndlessLevel(1, endlessSeedBase), "endless");
  hideHome();
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
    infinity: "#160b18",
    daily: "#061b24",
    endless: "#180b22"
  };

  if (metaTheme) metaTheme.setAttribute("content", themeColors[level.world] || "#071018");

  const shell = document.querySelector(".game-shell");
  if (shell) {
    shell.classList.remove("world-enter");
    void shell.offsetWidth;
    shell.classList.add("world-enter");
  }
}

function loadPuzzle(level, mode = "campaign") {
  stopTimer();
  moves = 0;
  elapsed = 0;
  locked = false;
  timerStarted = false;
  lastLitBulbs = 0;
  activeLevel = level;
  gameMode = mode;

  applyWorldTheme(level);
  blockedCells = makeBlockedCells(level.size, level.blockers || 0, level.seed);
  solvedMasks = generateBestTree(level, blockedCells);
  bulbs = solvedMasks
    .map((mask, index) => ({ mask, index }))
    .filter(item => item.index !== 0 && item.mask !== 0 && !blockedCells.has(item.index) && bitCount(item.mask) === 1)
    .map(item => item.index);

  fixedTiles = chooseFixedTiles(level);
  rotations = makeScramble(level.size, level.seed);
  startRotations = [...rotations];
  parMoves = calculatePar();

  movesText.textContent = "0";
  timeText.textContent = "00:00";
  challengeBadge.textContent = `${level.worldName} • ${level.mode}`;
  challengeRule.textContent = level.rule;

  if (mode === "campaign") {
    levelText.textContent = `Level ${currentLevel + 1}`;
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
  } else if (mode === "daily") {
    const record = progress.daily[activeDailyKey];
    levelText.textContent = "Daily Challenge";
    bestText.textContent = record?.moves ?? "—";
    levelProgressFill.style.width = "100%";
    statusText.textContent = "Today's puzzle: complete the circuit and earn up to 3 stars.";
  } else {
    levelText.textContent = `Endless #${endlessRun + 1}`;
    bestText.textContent = progress.endlessBest ? `Run ${progress.endlessBest}` : "—";
    levelProgressFill.style.width = `${Math.min(100, 18 + endlessRun * 7)}%`;
    statusText.textContent = `Endless run: ${endlessRun} cleared. The next circuit gets harder.`;
  }

  boardEl.style.setProperty("--size", level.size);
  renderBoard();
  updatePower();

  if (mode === "campaign") {
    renderLevels();
    saveProgress();
  }
}

function buildLevel(levelIndex) {
  currentLevel = levelIndex;
  activePuzzleCounted = false;
  loadPuzzle(LEVELS[currentLevel], "campaign");
}

function renderBoard() {
  const size = activeLevel.size;
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
  tile?.removeAttribute("data-hint-turns");
  tile?.removeAttribute("data-hint-label");
  playClick();
  vibrate(12);

  window.setTimeout(() => updatePower(true), 105);
}

function getTile(index) {
  return boardEl.querySelector(`[data-index="${index}"]`);
}

function connectedNeighbours(index) {
  const size = activeLevel.size;
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
  if (timerStarted && litBulbs > lastLitBulbs) {
    playGameSound("bulb");
    vibrate([10, 18, 12]);
  }
  lastLitBulbs = litBulbs;
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

function solvedDistanceFromSource() {
  const size = activeLevel.size;
  const distance = Array(solvedMasks.length).fill(Infinity);
  const queue = [0];
  distance[0] = 0;

  while (queue.length) {
    const current = queue.shift();
    const [row, col] = rowCol(current, size);
    const mask = solvedMasks[current];

    for (const dir of DIRS) {
      if (!(mask & dir.bit)) continue;

      const nr = row + dir.dr;
      const nc = col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;

      const next = indexOf(nr, nc, size);
      if (blockedCells.has(next)) continue;
      if (!(solvedMasks[next] & dir.opposite)) continue;

      if (distance[next] === Infinity) {
        distance[next] = distance[current] + 1;
        queue.push(next);
      }
    }
  }

  return distance;
}

function clockwiseTurnsToSolution(index) {
  const solved = solvedMasks[index];
  const currentRotation = rotations[index] || 0;

  for (let taps = 0; taps < 4; taps += 1) {
    const candidate = rotateMask(solved, (currentRotation + taps) % 4);
    if (masksEquivalent(candidate, solved)) return taps;
  }

  return 0;
}

function incorrectRotatableTiles() {
  const distances = solvedDistanceFromSource();

  return solvedMasks
    .map((mask, index) => ({
      index,
      mask,
      distance: distances[index],
      taps: clockwiseTurnsToSolution(index)
    }))
    .filter(item =>
      item.index !== 0 &&
      item.mask !== 0 &&
      !fixedTiles.has(item.index) &&
      !blockedCells.has(item.index) &&
      item.taps > 0
    )
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;

      const aPowered = powered.has(a.index) ? 0 : 1;
      const bPowered = powered.has(b.index) ? 0 : 1;
      if (aPowered !== bPowered) return aPowered - bPowered;

      return a.index - b.index;
    });
}

function clearHintMarkers() {
  boardEl.querySelectorAll(".tile.hint").forEach(tile => {
    tile.classList.remove("hint");
    tile.removeAttribute("data-hint-turns");
    tile.removeAttribute("data-hint-label");
  });
}

function normalizeHints() {
  if (!progress.hints || typeof progress.hints !== "object") {
    progress.hints = { count: HINT_MAX, lastRefillAt: Date.now() };
  }

  progress.hints.count = Math.max(0, Math.min(HINT_MAX, Number(progress.hints.count) || 0));
  if (!Number.isFinite(Number(progress.hints.lastRefillAt))) {
    progress.hints.lastRefillAt = Date.now();
  }
}

function syncHintEnergy(now = Date.now()) {
  normalizeHints();

  if (progress.hints.count >= HINT_MAX) {
    progress.hints.count = HINT_MAX;
    progress.hints.lastRefillAt = now;
    return false;
  }

  const elapsedMs = Math.max(0, now - Number(progress.hints.lastRefillAt));
  const gained = Math.floor(elapsedMs / HINT_RECHARGE_MS);
  if (gained <= 0) return false;

  progress.hints.count = Math.min(HINT_MAX, progress.hints.count + gained);
  progress.hints.lastRefillAt += gained * HINT_RECHARGE_MS;

  if (progress.hints.count >= HINT_MAX) {
    progress.hints.lastRefillAt = now;
  }

  return true;
}

function nextHintRemainingMs(now = Date.now()) {
  syncHintEnergy(now);
  if (progress.hints.count >= HINT_MAX) return 0;
  const elapsedMs = Math.max(0, now - Number(progress.hints.lastRefillAt));
  return Math.max(0, HINT_RECHARGE_MS - elapsedMs);
}

function formatHintCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function nativeRewardedReady() {
  try {
    return Boolean(window.LightJalaoAds?.isRewardedReady?.());
  } catch {
    return false;
  }
}

function updateHintUI() {
  const changed = syncHintEnergy();
  const count = progress.hints.count;
  const remaining = nextHintRemainingMs();

  if (changed) saveProgress();

  if (hintEnergyText) hintEnergyText.textContent = count;
  hintBtn?.classList.toggle("empty", count <= 0);

  if (hintMiniTimer) {
    hintMiniTimer.textContent = count >= HINT_MAX
      ? "FULL ENERGY"
      : `+1 in ${formatHintCountdown(remaining)}`;
  }

  if (hintModalCount) hintModalCount.textContent = `${count} / ${HINT_MAX}`;
  if (hintTimerText) hintTimerText.textContent = count >= HINT_MAX ? "READY" : formatHintCountdown(remaining);

  if (hintRechargeFill) {
    const fill = count >= HINT_MAX
      ? 100
      : Math.max(0, Math.min(100, ((HINT_RECHARGE_MS - remaining) / HINT_RECHARGE_MS) * 100));
    hintRechargeFill.style.width = `${fill}%`;
  }

  if (rewardAdBtn) {
    const nativeApp = Boolean(window.LightJalaoAds);
    const online = navigator.onLine !== false;
    rewardAdBtn.disabled = !nativeApp || !online;
    if (!online) {
      rewardAdStatus.textContent = "Offline ho — free recharge timer chalta rahega.";
    } else if (!nativeApp) {
      rewardAdStatus.textContent = "Reward ads Android APK me available hain.";
    } else if (nativeRewardedReady()) {
      rewardAdStatus.textContent = "Ad ready • complete karke +1 Hint lo.";
    } else {
      rewardAdStatus.textContent = "Ad load ho raha hai… thoda sa wait karo.";
    }
  }
}

function requestSmartHint() {
  if (locked) return;

  const wrongTiles = incorrectRotatableTiles();
  if (!wrongTiles.length) {
    performSmartHint();
    return;
  }

  syncHintEnergy();

  if (progress.hints.count <= 0) {
    updateHintUI();
    showModal("hintRechargeModal");
    playGameSound("empty");
    vibrate(20);
    return;
  }

  const wasFull = progress.hints.count >= HINT_MAX;
  progress.hints.count -= 1;
  if (wasFull) progress.hints.lastRefillAt = Date.now();

  saveProgress();
  updateHintUI();
  performSmartHint();
  playGameSound("hint");
}

function grantRewardedHint() {
  syncHintEnergy();
  progress.hints.count = Math.min(HINT_MAX, progress.hints.count + 1);
  if (progress.hints.count >= HINT_MAX) {
    progress.hints.lastRefillAt = Date.now();
  }
  saveProgress();
  updateHintUI();
  hideModal("hintRechargeModal");
  statusText.textContent = "Reward unlocked: +1 Smart Hint ready. ✦";
  playGameSound("reward");
  vibrate([25, 35, 55]);
}

window.onNativeHintReward = grantRewardedHint;
window.onNativeAdReady = () => updateHintUI();
window.onNativeAdUnavailable = () => {
  if (rewardAdBtn) rewardAdBtn.disabled = false;
  if (rewardAdStatus) rewardAdStatus.textContent = "Ad abhi available nahi hai. Free timer se hint recharge hota rahega.";
};

function requestRewardedHint() {
  if (navigator.onLine === false) {
    rewardAdStatus.textContent = "Offline ho — ad nahi chalega. Timer se free hint milega.";
    return;
  }

  if (!window.LightJalaoAds?.showRewardedHint) {
    rewardAdStatus.textContent = "Reward ad Android APK me available hai.";
    return;
  }

  rewardAdBtn.disabled = true;
  rewardAdStatus.textContent = "Ad open ho raha hai… reward complete karo.";
  try {
    window.LightJalaoAds.showRewardedHint();
  } catch {
    rewardAdBtn.disabled = false;
    rewardAdStatus.textContent = "Ad open nahi hua. Thodi der baad try karo.";
  }
}

function performSmartHint() {
  if (locked) return;

  clearHintMarkers();
  const wrongTiles = incorrectRotatableTiles();

  if (!wrongTiles.length) {
    statusText.textContent = "Smart Hint: all wire directions are correct. Checking the final circuit…";
    updatePower(true);
    playTone(880, .09, .025);
    return;
  }

  const targetInfo = wrongTiles[0];
  const target = targetInfo.index;
  const taps = targetInfo.taps;
  const tile = getTile(target);
  const [row, col] = rowCol(target, activeLevel.size);
  const remaining = wrongTiles.length;

  if (tile) {
    tile.setAttribute("data-hint-turns", `↻${taps}`);
    tile.setAttribute(
      "data-hint-label",
      `Row ${row + 1}, column ${col + 1}: rotate clockwise ${taps} time${taps === 1 ? "" : "s"}`
    );
    void tile.offsetWidth;
    tile.classList.add("hint");
  }

  const turnText = taps === 1 ? "1 baar" : `${taps} baar`;
  const mistakeText = remaining === 1 ? "last wrong wire" : `${remaining} wrong wires remaining`;

  statusText.textContent =
    `Smart Hint: Row ${row + 1}, Column ${col + 1} wali glowing tile ko clockwise ${turnText} tap karo • ${mistakeText}.`;

  playTone(760, .1, .03);
  vibrate([18, 24, 18]);

  window.setTimeout(() => {
    tile?.classList.remove("hint");
    tile?.removeAttribute("data-hint-turns");
    tile?.removeAttribute("data-hint-label");
  }, 4200);
}

function completeLevel() {
  const earnedStars = ratingForMoves(moves);
  let newBest = false;

  if (gameMode === "campaign") {
    const key = String(currentLevel);
    const oldBest = progress.best[key];
    newBest = !oldBest || moves < oldBest.moves || (moves === oldBest.moves && elapsed < oldBest.time);

    if (newBest) {
      progress.best[key] = { moves, time: elapsed };
    }

    progress.stars[key] = Math.max(Number(progress.stars[key]) || 0, earnedStars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length, currentLevel + 2));

    const completedNumber = currentLevel + 1;
    const world = worldForLevel(completedNumber);
    const worldFinished = completedNumber === world.end;

    winTitle.textContent = currentLevel === LEVELS.length - 1
      ? "Circuit Master! ✨"
      : worldFinished
        ? `${activeLevel.worldName} complete! ✨`
        : newBest
          ? "New best! ✨"
          : "Lights on! ✨";

    winCopy.textContent = `${activeLevel.worldName} • ${bulbs.length} bulbs • ${moves} moves • Par ${parMoves} • ${formatTime(elapsed)}`;
    nextBtn.textContent = currentLevel === LEVELS.length - 1 ? "Play from Level 1 ↻" : "Next Level →";
    renderLevels();
  } else if (gameMode === "daily") {
    const previous = progress.daily[activeDailyKey];
    newBest = !previous || moves < previous.moves || (moves === previous.moves && elapsed < previous.time);

    if (newBest) {
      progress.daily[activeDailyKey] = { moves, time: elapsed, stars: earnedStars };
    } else {
      progress.daily[activeDailyKey] = {
        ...previous,
        stars: Math.max(Number(previous.stars) || 0, earnedStars)
      };
    }

    winTitle.textContent = previous ? "Daily improved! ☀" : "Daily complete! ☀";
    winCopy.textContent = `Today's circuit • ${moves} moves • Par ${parMoves} • ${formatTime(elapsed)}`;
    nextBtn.textContent = "Back to Home →";
  } else {
    if (!activePuzzleCounted) {
      endlessRun += 1;
      activePuzzleCounted = true;
      progress.endlessBest = Math.max(progress.endlessBest || 0, endlessRun);
    }

    winTitle.textContent = `Endless streak: ${endlessRun} ∞`;
    winCopy.textContent = `Puzzle ${endlessRun} cleared • ${moves} moves • Par ${parMoves} • ${formatTime(elapsed)}`;
    nextBtn.textContent = "Next Endless →";
  }

  evaluateAchievements(true);
  saveProgress();
  renderWinStars(earnedStars);
  updateHomeScreen();
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
  if (!el) return;
  if (id === "hintRechargeModal") updateHintUI();
  if (id === "profileModal") updateHomeProfile();
  if (id === "settingsModal") {
    syncSettingsUI();
    window.setTimeout(measureRenderFps, 650);
  }
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
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
  if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function playTone(freq, duration = .07, volume = .028, delay = 0, type = "sine") {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .03);
}

function playGameSound(kind) {
  if (!soundEnabled) return;

  if (kind === "tap") {
    playTone(290, .04, .016, 0, "triangle");
    playTone(520, .035, .011, .012, "sine");
  } else if (kind === "bulb") {
    playTone(540, .055, .018, 0, "sine");
    playTone(820, .09, .02, .035, "triangle");
  } else if (kind === "hint") {
    playTone(610, .06, .018, 0, "triangle");
    playTone(880, .10, .023, .055, "sine");
  } else if (kind === "reward") {
    playTone(520, .07, .02, 0, "triangle");
    playTone(720, .08, .023, .07, "sine");
    playTone(980, .12, .024, .15, "sine");
  } else if (kind === "achievement") {
    playTone(590, .07, .02, 0, "triangle");
    playTone(790, .07, .023, .08, "triangle");
    playTone(1050, .16, .025, .16, "sine");
  } else if (kind === "empty") {
    playTone(230, .08, .014, 0, "triangle");
    playTone(185, .11, .012, .07, "triangle");
  }
}

function playClick() {
  playGameSound("tap");
}

function playWin() {
  playTone(520, .08, .024, 0, "triangle");
  playTone(660, .09, .026, .09, "triangle");
  playTone(820, .10, .028, .18, "sine");
  playTone(1040, .18, .03, .29, "sine");
}

let fpsMeasureToken = 0;

function nativeTargetRefreshRate() {
  try {
    const value = Number(window.LightJalaoNative?.getTargetRefreshRate?.());
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function nativeCurrentRefreshRate() {
  try {
    const value = Number(window.LightJalaoNative?.getCurrentRefreshRate?.());
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function hzLabel(value) {
  return value > 0 ? `${Math.round(value)}Hz` : "AUTO";
}

function measureRenderFps() {
  if (!performanceDetail || !performanceState) return;

  const token = ++fpsMeasureToken;
  const targetHz = nativeTargetRefreshRate();
  const intervals = [];
  let last = performance.now();
  const started = last;
  const durationMs = 3500;

  const initialCurrentHz = nativeCurrentRefreshRate();
  performanceState.textContent = hzLabel(initialCurrentHz || targetHz);
  performanceDetail.textContent = targetHz > 0
    ? `Current ${hzLabel(initialCurrentHz)} • requested ${hzLabel(targetHz)} • measuring…`
    : "Measuring stable render FPS…";

  function frame(now) {
    if (token !== fpsMeasureToken) return;

    const delta = now - last;
    last = now;

    // Keep normal frame intervals. Huge pauses are app/system interruptions,
    // not the sustained game frame rate we want to report.
    if (delta >= 3 && delta <= 50) intervals.push(delta);

    if (now - started < durationMs) {
      requestAnimationFrame(frame);
      return;
    }

    if (!intervals.length) {
      performanceDetail.textContent = "FPS sample unavailable • try again.";
      return;
    }

    const sorted = [...intervals].sort((a, b) => a - b);
    const trim = Math.floor(sorted.length * 0.12);
    const stable = sorted.slice(trim, Math.max(trim + 1, sorted.length - trim));
    const avgDelta = stable.reduce((sum, value) => sum + value, 0) / stable.length;
    const renderFps = Math.max(1, Math.round(1000 / avgDelta));
    const currentHz = nativeCurrentRefreshRate() || initialCurrentHz;

    performanceState.textContent = hzLabel(currentHz || targetHz);

    if (currentHz > 0 && targetHz > 0) {
      performanceDetail.textContent =
        `Current ${hzLabel(currentHz)} • requested ${hzLabel(targetHz)} • render ~${renderFps} FPS`;
    } else if (currentHz > 0) {
      performanceDetail.textContent =
        `Current ${hzLabel(currentHz)} • render ~${renderFps} FPS`;
    } else {
      performanceDetail.textContent =
        `Render ~${renderFps} FPS • Android controls refresh rate`;
    }
  }

  requestAnimationFrame(frame);
}

function syncSettingsUI() {
  if (soundBtn) {
    soundBtn.classList.toggle("sound-on", soundEnabled);
    soundBtn.textContent = soundEnabled ? "♪" : "×";
    soundBtn.setAttribute("aria-label", soundEnabled ? "Sound on" : "Sound off");
  }

  if (soundSettingState) soundSettingState.textContent = soundEnabled ? "ON" : "OFF";
  soundToggleBtn?.classList.toggle("off", !soundEnabled);

  if (hapticSettingState) hapticSettingState.textContent = hapticsEnabled ? "ON" : "OFF";
  hapticToggleBtn?.classList.toggle("off", !hapticsEnabled);
}

function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  progress.settings.sound = soundEnabled;
  saveProgress();
  syncSettingsUI();
  if (soundEnabled) playGameSound("reward");
}

function setHapticsEnabled(enabled) {
  hapticsEnabled = Boolean(enabled);
  progress.settings.haptics = hapticsEnabled;
  saveProgress();
  syncSettingsUI();
  if (hapticsEnabled) vibrate(24);
}

function vibrate(pattern) {
  if (!hapticsEnabled) return;

  try {
    if (window.LightJalaoNative?.vibrate) {
      const value = Array.isArray(pattern) ? pattern.join(",") : String(pattern);
      window.LightJalaoNative.vibrate(value);
      return;
    }
  } catch {}

  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

function closeTopGameModal() {
  const priority = [
    "hintRechargeModal",
    "profileModal",
    "settingsModal",
    "achievementsModal",
    "journeyModal",
    "levelsModal",
    "helpModal"
  ];

  for (const id of priority) {
    const modal = document.getElementById(id);
    if (modal && !modal.classList.contains("hidden")) {
      hideModal(id);
      return true;
    }
  }

  return false;
}

window.handleNativeBack = function handleNativeBack() {
  // Level-complete modal should not accidentally exit the app.
  const winModal = document.getElementById("winModal");
  if (winModal && !winModal.classList.contains("hidden")) {
    hideModal("winModal");
    showHome();
    return true;
  }

  if (closeTopGameModal()) {
    return true;
  }

  // Any active puzzle/mode returns to the main game menu first.
  if (homeScreen && homeScreen.classList.contains("hidden")) {
    showHome();
    return true;
  }

  // Already on Home: let Android perform the normal app exit.
  return false;
};

let deferredInstallPrompt = null;

function isNativeAndroidWrapper() {
  const params = new URLSearchParams(window.location.search);
  return params.get("android") === "1" ||
    params.get("native") === "1" ||
    navigator.userAgent.includes("LightJalaoAndroid");
}

function isStandaloneApp() {
  return location.protocol === "file:" ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

function updateInstallButton() {
  const nativeAndroid = isNativeAndroidWrapper();
  const installed = isStandaloneApp() || nativeAndroid;
  document.body.classList.toggle("app-installed", installed);
  document.body.classList.toggle("native-android", nativeAndroid);

  if (!installAppBtn) return;

  if (installed) {
    installAppBtn.classList.add("hidden");
    return;
  }

  installAppBtn.classList.remove("hidden");
}

window.addEventListener("online", updateHintUI);
window.addEventListener("offline", updateHintUI);

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  document.body.classList.add("app-installed");
  installAppBtn?.classList.add("hidden");
});

installAppBtn?.addEventListener("click", async () => {
  if (isStandaloneApp()) {
    installAppBtn.classList.add("hidden");
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButton();
    return;
  }

  statusText.textContent = "Install: Chrome menu ⋮ → Add to Home screen / Install app.";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Game stays fully usable online even if service worker registration fails.
    });
  });
}

updateInstallButton();

restartBtn.addEventListener("click", restartLevel);
hintBtn.addEventListener("click", requestSmartHint);
helpBtn.addEventListener("click", () => showModal("helpModal"));
homeBtn.addEventListener("click", showHome);
continueBtn.addEventListener("click", () => {
  if (gameMode !== "campaign") buildLevel(currentLevel);
  hideHome();
});
homeLevelsBtn.addEventListener("click", () => showModal("levelsModal"));
homeHelpBtn.addEventListener("click", () => showModal("helpModal"));
settingsBtn?.addEventListener("click", () => showModal("settingsModal"));
profileBtn?.addEventListener("click", openProfile);
saveProfileBtn?.addEventListener("click", savePlayerProfile);
profileNameInput?.addEventListener("input", () => {
  const cleaned = normalizeProfileName(profileNameInput.value);
  profilePreviewName.textContent = cleaned || "Player";
  profileError?.classList.add("hidden");
});
profileNameInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    savePlayerProfile();
  }
});
soundToggleBtn?.addEventListener("click", () => setSoundEnabled(!soundEnabled));
hapticToggleBtn?.addEventListener("click", () => setHapticsEnabled(!hapticsEnabled));
rewardAdBtn?.addEventListener("click", requestRewardedHint);
dailyBtn.addEventListener("click", startDailyChallenge);
endlessBtn.addEventListener("click", startEndlessMode);
journeyBtn.addEventListener("click", () => {
  renderWorldProgress();
  showModal("journeyModal");
});
achievementsBtn.addEventListener("click", () => {
  renderAchievements();
  saveProgress();
  showModal("achievementsModal");
});
levelsBtn.addEventListener("click", () => showModal("levelsModal"));

soundBtn.addEventListener("click", () => setSoundEnabled(!soundEnabled));

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

  if (gameMode === "daily") {
    showHome();
    return;
  }

  if (gameMode === "endless") {
    activePuzzleCounted = false;
    loadPuzzle(makeEndlessLevel(endlessRun + 1, endlessSeedBase), "endless");
    hideHome();
    return;
  }

  const next = currentLevel === LEVELS.length - 1 ? 0 : currentLevel + 1;
  buildLevel(next);
  hideHome();
});

replayBtn.addEventListener("click", () => {
  hideModal("winModal");

  if (gameMode === "campaign") {
    buildLevel(currentLevel);
  } else {
    const wasCounted = activePuzzleCounted;
    const sameLevel = activeLevel;
    loadPuzzle(sameLevel, gameMode);
    activePuzzleCounted = wasCounted;
  }

  hideHome();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideModal("helpModal");
    hideModal("levelsModal");
    hideModal("journeyModal");
    hideModal("achievementsModal");
    hideModal("settingsModal");
    hideModal("profileModal");
    hideModal("hintRechargeModal");
  }
});

ensureProfile();
normalizeHints();
syncHintEnergy();
syncSettingsUI();
updateHintUI();
window.clearInterval(hintUiTimer);
hintUiTimer = window.setInterval(updateHintUI, 1000);

buildLevel(currentLevel);
evaluateAchievements(false);
saveProgress();
updateHomeScreen();
showHome();
