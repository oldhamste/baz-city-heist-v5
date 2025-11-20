// Background animations – apply mode-based classes on bg-layer

const bgEl = document.getElementById("bg-layer");

export function initBackgrounds() {
  // Nothing special at init; classes are added in update.
}

export function updateBackgrounds(state = {}) {
  if (!bgEl) return;
  const mode = state.heistMode || "standard";
  bgEl.classList.remove("firestorm", "cyber", "casino", "stealth_ops");

  if (mode === "firestorm") bgEl.classList.add("firestorm");
  if (mode === "cyber") bgEl.classList.add("cyber");
  if (mode === "casino") bgEl.classList.add("casino");
  if (mode === "stealth_ops") bgEl.classList.add("stealth_ops");
}
