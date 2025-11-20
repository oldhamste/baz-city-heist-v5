// Overlay client logic for Baz City Heist

const socket = io(); // same host as overlay (Render or localhost)

// Cache DOM
const phaseText = document.getElementById("phaseText");
const modeText = document.getElementById("modeText");
const lootFill = document.getElementById("lootFill");
const lootValue = document.getElementById("lootValue");
const heatFill = document.getElementById("heatFill");
const heatValue = document.getElementById("heatValue");
const successText = document.getElementById("successText");
const crewList = document.getElementById("crewList");
const giftersList = document.getElementById("giftersList");
const bannerText = document.getElementById("banner-text");
const overlayRoot = document.getElementById("overlay-root");
const bazCaption = document.getElementById("baz-caption");

let lastState = null;
let bazTalkTimeout = null;

// Helpers
function clampPercent(num) {
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function mapHeistMode(mode) {
  switch (mode) {
    case "cyber": return "Cyber Grid";
    case "stealth_ops": return "Stealth Ops";
    case "casino": return "Casino Hit";
    case "firestorm": return "Firestorm";
    default: return "Standard";
  }
}

function mapPhase(phase) {
  switch (phase) {
    case "planning": return "Planning";
    case "action": return "Action";
    case "escape": return "Escape";
    case "idle":
    default:
      return "Idle";
  }
}

// Baz talking helper
function bazTalk(line) {
  if (line) bazCaption.textContent = line;

  overlayRoot.classList.add("baz-talking");

  if (bazTalkTimeout) clearTimeout(bazTalkTimeout);
  bazTalkTimeout = setTimeout(() => {
    overlayRoot.classList.remove("baz-talking");
  }, 800);
}

function updateBannerAndBaz(state) {
  const phase = state.phase;
  const result = state.result;
  const modeLabel = mapHeistMode(state.heistMode);

  // Reset mood classes
  overlayRoot.classList.remove("baz-hype", "baz-angry");

  if (phase === "idle") {
    bannerText.textContent = "Waiting for next heist… Type !join in chat to get in the crew.";
    bazCaption.textContent = "Baz is chilling, loading up the next chaos.";
  } else if (phase === "planning") {
    bannerText.textContent = `Planning: ${modeLabel} · !join to lock in your spot.`;
    bazCaption.textContent = "Baz is plotting. Hackers and smashers, get ready.";
  } else if (phase === "action") {
    bannerText.textContent = `HEIST LIVE: ${modeLabel} · Use !hack !smash !rush !sneak`;
    bazCaption.textContent = "Baz is in the thick of it. Big gifts = big plays.";
    overlayRoot.classList.add("baz-hype");
  } else if (phase === "escape") {
    if (result === "win") {
      bannerText.textContent = `ESCAPE RUN: Trying to get out with £${Math.round(
        state.loot || 0
      )} in the bag…`;
      bazCaption.textContent = "Nearly there… don't bottle it now.";
      overlayRoot.classList.add("baz-hype");
    } else if (result === "fail") {
      bannerText.textContent = "BAZ GOT BAGGED. Next run starting soon…";
      bazCaption.textContent = "You stitched him up. Try harder next time.";
      overlayRoot.classList.add("baz-angry");
    } else {
      bannerText.textContent = "ESCAPE PHASE… hold tight.";
      bazCaption.textContent = "Baz is legging it. Help him.";
    }
  }
}

function renderState(state) {
  const previousPhase = lastState ? lastState.phase : null;
  lastState = state;

  phaseText.textContent = mapPhase(state.phase);
  modeText.textContent = mapHeistMode(state.heistMode);

  const loot = state.loot || 0;
  const maxLoot = state.maxLoot || 100;
  const heat = state.heat || 0;
  const maxHeat = state.maxHeat || 100;

  const lootPct = clampPercent((loot / maxLoot) * 100);
  const heatPct = clampPercent((heat / maxHeat) * 100);

  lootFill.style.width = `${lootPct}%`;
  heatFill.style.width = `${heatPct}%`;

  lootValue.textContent = `${Math.round(loot)} / ${maxLoot}`;
  heatValue.textContent = `${Math.round(heat)} / ${maxHeat}`;

  if (typeof state.successChance === "number") {
    successText.textContent = `${Math.round(state.successChance)}%`;
  } else {
    successText.textContent = "–";
  }

  updateBannerAndBaz(state);

  // If phase changed, make Baz talk briefly
  if (previousPhase && previousPhase !== state.phase) {
    bazTalk();
  }
}

function renderPlayers(players = []) {
  crewList.innerHTML = "";

  players.slice(0, 12).forEach((p) => {
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    const powerSpan = document.createElement("span");

    nameSpan.textContent = p.name || p.uniqueId || "viewer";
    powerSpan.textContent = `P ${p.power || 1}`;

    li.appendChild(nameSpan);
    li.appendChild(powerSpan);
    crewList.appendChild(li);
  });
}

function renderGifters(gifters = []) {
  giftersList.innerHTML = "";

  gifters.slice(0, 8).forEach((g, index) => {
    const li = document.createElement("li");
    const left = document.createElement("span");
    const right = document.createElement("span");

    left.textContent = `${index + 1}. ${g.name || g.uniqueId || "gifter"}`;
    right.textContent = `${g.total || 0}💎`;

    li.appendChild(left);
    li.appendChild(right);
    giftersList.appendChild(li);
  });
}

// Socket listeners
socket.on("city_heist_state", (state) => {
  renderState(state);
  if (state.players) renderPlayers(state.players);
  if (state.topGifters) renderGifters(state.topGifters);
});

// Every update from TikTok (chat/gifts) also makes Baz talk
socket.on("tiktok_update", (data) => {
  if (data.players) renderPlayers(data.players);
  if (data.gifters) renderGifters(data.gifters);

  // Quick little reaction
  bazTalk();
});
