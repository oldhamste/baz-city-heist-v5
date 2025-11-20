// Banner Engine – hybrid neon crime-tech

const bannerEl = document.getElementById("bannerArea");
let revertTimeout = null;

export function setBanner(name, duration = 0) {
  if (!bannerEl) return;
  const src = "banners/" + name + ".png";
  if (bannerEl.src && bannerEl.src.endsWith(src)) {
    // already showing
  } else {
    const snd = document.getElementById("snd-banner");
    if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }
  }
  bannerEl.src = src;
  if (revertTimeout) clearTimeout(revertTimeout);
  if (duration > 0) {
    revertTimeout = setTimeout(() => setBanner("starting_soon"), duration);
  }
}

export function applyModeEffects(mode) {
  // Kept simple; background + borders handle most of the feel.
  // This can be expanded if needed.
}

// --- Gift-triggered banners ---
export function giftBanner(giftName = "") {
  const n = giftName.toLowerCase();
  if (n.includes("lion")) {
    setBanner("follow_baz", 3000);
    const s = document.getElementById("snd-gift-lion");
    if (s) { s.currentTime = 0; s.play().catch(() => {}); }
  }
  if (n.includes("universe")) {
    document.body.classList.add("glitchEffect");
    setBanner("offline", 3000);
    const s = document.getElementById("snd-gift-universe");
    if (s) { s.currentTime = 0; s.play().catch(() => {}); }
    setTimeout(() => document.body.classList.remove("glitchEffect"), 3000);
  }
}

// --- Mode-specific animated borders ---
export function applyBorderEffects(mode) {
  document.body.classList.remove("fireBorder", "casinoBorder", "cyberBorder");
  if (mode === "firestorm") document.body.classList.add("fireBorder");
  if (mode === "casino") document.body.classList.add("casinoBorder");
  if (mode === "cyber") document.body.classList.add("cyberBorder");
}

// --- Chat command forced banners ---
export function forceBannerByChat(cmd = "") {
  const c = cmd.toLowerCase();
  if (c === "hype") setBanner("heist_incoming", 5000);
  if (c === "baz") setBanner("baz_cooking", 5000);
  if (c === "ldn") setBanner("join_ldn_rp", 5000);
}

// --- BAZ mood → banner filter sync ---
export function syncBannerToMood(mood = "") {
  if (mood === "angry") {
    document.body.style.filter = "hue-rotate(-30deg) saturate(1.5)";
  } else if (mood === "laugh") {
    document.body.style.filter = "brightness(1.3)";
  } else {
    document.body.style.filter = "";
  }
}
