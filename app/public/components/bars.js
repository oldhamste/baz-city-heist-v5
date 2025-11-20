// Bars – animated loot + heat based on state

export function initBars() {
  // Bars are created inside initHUD; nothing to do here for now.
}

export function updateBars(state = {}) {
  const lootFill = document.getElementById("loot-bar-fill");
  const heatFill = document.getElementById("heat-bar-fill");

  // Try to derive percentages from state; fall back to 0.
  let lootPct = 0;
  if (typeof state.lootPercent === "number") lootPct = state.lootPercent;
  else if (typeof state.loot === "number" && typeof state.maxLoot === "number" && state.maxLoot > 0) {
    lootPct = (state.loot / state.maxLoot) * 100;
  }

  let heatPct = 0;
  if (typeof state.heatPercent === "number") heatPct = state.heatPercent;
  else if (typeof state.heat === "number" && typeof state.maxHeat === "number" && state.maxHeat > 0) {
    heatPct = (state.heat / state.maxHeat) * 100;
  }

  lootPct = Math.max(0, Math.min(100, lootPct));
  heatPct = Math.max(0, Math.min(100, heatPct));

  if (lootFill) lootFill.style.width = lootPct + "%";
  if (heatFill) heatFill.style.width = heatPct + "%";
}
