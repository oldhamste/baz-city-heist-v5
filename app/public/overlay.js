import { bazTalkPulse, bazSetMood } from "./baz_avatar.js";
import {
  setBanner,
  applyModeEffects,
  giftBanner,
  applyBorderEffects,
  forceBannerByChat,
  syncBannerToMood,
} from "./banner_engine.js";
import { initHUD, updateHUD } from "./components/hud.js";
import { initBars, updateBars } from "./components/bars.js";
import { initBackgrounds, updateBackgrounds } from "./components/backgrounds.js";
import {
  initLeaderboard,
  updateLeaderboardFromGift,
  updateLeaderboardFromState,
} from "./components/leaderboard.js";

const socket = io();

let lastPhase = null;
let lastResult = null;

function playPhaseSound(phase) {
  let id = null;
  if (phase === "planning") id = "snd-planning";
  else if (phase === "action") id = "snd-action";
  else if (phase === "escape") id = "snd-escape";
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
}

function playResultSound(result) {
  let id = null;
  if (result === "win") id = "snd-win";
  else if (result === "fail") id = "snd-fail";
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHUD();
  initBars();
  initBackgrounds();
  initLeaderboard();
  setBanner("starting_soon");
});

socket.on("city_heist_state", (state) => {
  if (!state) return;

  // BAZ reacts
  bazTalkPulse();
  const mode = state.heistMode || "standard";
  switch (mode) {
    case "mayhem":
    case "firestorm":
      bazSetMood("angry");
      break;
    case "cyber":
      bazSetMood("cyber");
      break;
    case "stealth_ops":
      bazSetMood("stealth");
      break;
    case "casino":
      bazSetMood("laugh");
      break;
    default:
      bazSetMood("idle");
      break;
  }

  // Mode + borders + background
  applyModeEffects(mode);
  applyBorderEffects(mode);
  updateBackgrounds(state);

  // Banners by phase / result
  const phase = state.phase || "idle";
  if (phase !== lastPhase) {
    playPhaseSound(phase);
    if (phase === "planning") setBanner("heist_incoming");
    else if (phase === "action") setBanner("loading_baz_exe");
    else if (phase === "escape") setBanner("baz_cooking");
    lastPhase = phase;
  }

  const result = state.result || null;
  if (result && result !== lastResult) {
    playResultSound(result);
    if (result === "win") setBanner("heist_success", 5000);
    if (result === "fail") setBanner("heist_failed", 5000);
    lastResult = result;
  }

  // HUD + bars + leaderboard
  updateHUD(state);
  updateBars(state);
  updateLeaderboardFromState(state);
});

// Gift events
socket.on("tiktok_gift", (gift) => {
  if (!gift) return;
  giftBanner(gift.giftName || "");
  updateLeaderboardFromGift(gift);
});

// Chat commands (e.g. !banner hype | !banner baz | !banner ldn)
socket.on("chat_command", (cmd) => {
  if (!cmd) return;
  forceBannerByChat(cmd);
});

// BAZ mood sync -> banner filter
socket.on("baz_mood", (mood) => {
  syncBannerToMood(mood);
});
