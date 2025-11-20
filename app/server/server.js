// app/server/server.js
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Static + routes
// ─────────────────────────────────────────────

const publicDir = path.join(__dirname, "..", "public");

app.use(express.static(publicDir));

// Root -> overlay.html (for Render + local)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "overlay.html"));
});

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ─────────────────────────────────────────────
// Heist game state
// ─────────────────────────────────────────────

function createInitialState() {
  return {
    phase: "IDLE", // IDLE, PLANNING, ACTION, ESCAPE, RESULT
    mode: "CASINO", // you can change later: CYBER, BANK, etc.
    crew: [], // list of usernames
    loot: 0,
    heat: 0, // 0–100
    successChance: 0, // %
    escapeTimer: 10, // seconds
    lastResult: null, // "SUCCESS" | "FAIL" | null
  };
}

let state = createInitialState();
let phaseTimer = null;

// top gifters: Map<username, score>
const topGifters = new Map();

function broadcastState(reason = "") {
  io.emit("heist:state", {
    ...state,
    reason,
  });
}

function broadcastTopGifters() {
  const list = Array.from(topGifters.entries())
    .map(([username, score]) => ({ username, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  io.emit("heist:top-gifters", list);
}

function clearPhaseTimer() {
  if (phaseTimer) {
    clearTimeout(phaseTimer);
    phaseTimer = null;
  }
}

function scheduleNextPhase(ms, label) {
  clearPhaseTimer();
  phaseTimer = setTimeout(() => nextPhase(label), ms);
}

function startHeist(triggeredBy = "system") {
  if (state.phase !== "IDLE") {
    console.log("Heist already running, ignoring start request");
    return;
  }

  console.log(`Heist started by ${triggeredBy}`);

  state = {
    ...state,
    phase: "PLANNING",
    loot: 0,
    heat: 10,
    successChance: 25,
    escapeTimer: 10,
    lastResult: null,
  };

  broadcastState(`Heist started by ${triggeredBy}`);
  scheduleNextPhase(10000, "PLANNING->ACTION");
}

function nextPhase(label) {
  console.log("Advancing phase:", label, "current:", state.phase);

  switch (state.phase) {
    case "PLANNING":
      state.phase = "ACTION";
      state.heat = Math.min(100, state.heat + 15);
      state.successChance = Math.min(100, state.successChance + 10);
      broadcastState("ACTION phase");
      scheduleNextPhase(10000, "ACTION->ESCAPE");
      break;

    case "ACTION":
      state.phase = "ESCAPE";
      state.heat = Math.min(100, state.heat + 15);
      state.escapeTimer = 10;
      broadcastState("ESCAPE phase");
      scheduleNextPhase(10000, "ESCAPE->RESULT");
      break;

    case "ESCAPE":
      resolveHeist();
      break;

    default:
      // do nothing
      break;
  }
}

function resolveHeist() {
  clearPhaseTimer();

  const roll = Math.random() * 100;
  const success = roll < (state.successChance || 50);

  state.phase = "RESULT";
  state.lastResult = success ? "SUCCESS" : "FAIL";
  state.loot = success ? Math.round(50 + Math.random() * 200) : 0;

  console.log(
    `Heist result: ${state.lastResult} (roll=${roll.toFixed(
      1
    )}, chance=${state.successChance})`
  );

  broadcastState("RESULT phase");

  // Reset back to IDLE after a short delay
  phaseTimer = setTimeout(() => {
    state = createInitialState();
    broadcastState("RESET");
  }, 8000);
}

function addCrewMember(username) {
  if (!username) return;

  if (state.phase === "IDLE" || state.phase === "PLANNING") {
    if (!state.crew.includes(username)) {
      state.crew.push(username);
      broadcastState(`${username} joined the crew`);
    }
  }
}

function registerGift(username, diamonds, giftName) {
  if (!username || !diamonds) return;

  const current = topGifters.get(username) || 0;
  topGifters.set(username, current + diamonds);
  broadcastTopGifters();

  // A bit of spice: big gifts boost the success chance slightly
  if (diamonds >= 10) {
    state.successChance = Math.min(100, state.successChance + 3);
    broadcastState(`${username} boosted the crew with ${giftName || "a gift"}`);
  }
}

// ─────────────────────────────────────────────
// TikTok event handlers (called from connector)
// ─────────────────────────────────────────────

function handleTikTokChat(payload) {
  const { username, comment, role } = payload;
  if (!comment) return;

  const text = comment.trim().toLowerCase();

  // streamer / mod can force start with !heist
  if ((text === "!heist" || text === "!start") && (role === "streamer" || role === "moderator")) {
    startHeist(`@${username}`);
  }

  // anyone can join with !join
  if (text === "!join") {
    addCrewMember(username);
  }

  // send raw chat to overlay if you want to use it later
  io.emit("heist:chat", payload);
}

function handleTikTokGift(payload) {
  const { username, giftName, repeatCount, diamondValue } = payload;

  const diamonds = Number(diamondValue || 0) * Number(repeatCount || 1);
  registerGift(username, diamonds, giftName);
}

// ─────────────────────────────────────────────
// Socket.IO wiring
// ─────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Initial state snapshot
  socket.emit("heist:state", { ...state, reason: "initial" });
  socket.emit("heist:top-gifters", Array.from(topGifters.entries()));

  // Debug controls from local browser console
  socket.on("heist:debug:start", () => startHeist("debug"));
  socket.on("heist:debug:join", (username) =>
    addCrewMember(username || "DebugUser")
  );

  // Called from TikTok connector
  socket.on("tiktok:chat", handleTikTokChat);
  socket.on("tiktok:gift", handleTikTokGift);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`Baz City Heist server listening on port ${PORT}`);
});
