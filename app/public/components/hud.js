// HUD – left side: phase, mode, crew, loot, heat, success, timer

const leftEl = document.getElementById("hud-left");

export function initHUD() {
  if (!leftEl) return;
  leftEl.innerHTML = `
    <div class="hud-title">BAZ CITY HEIST</div>
    <div class="hud-subtitle" id="hud-subtitle">Auto-play TikTok Heists</div>

    <div class="hud-row">
      <span class="hud-row-label">Phase</span>
      <span class="hud-row-value" id="hud-phase">Waiting...</span>
    </div>
    <div class="hud-row">
      <span class="hud-row-label">Mode</span>
      <span class="hud-row-value" id="hud-mode">-</span>
    </div>
    <div class="hud-row">
      <span class="hud-row-label">Crew</span>
      <span class="hud-row-value" id="hud-crew-count">0</span>
    </div>

    <div class="bar-block">
      <div class="bar-label">Loot</div>
      <div class="bar">
        <div class="bar-fill bar-fill-loot" id="loot-bar-fill"></div>
      </div>
    </div>

    <div class="bar-block">
      <div class="bar-label">Heat</div>
      <div class="bar">
        <div class="bar-fill bar-fill-heat" id="heat-bar-fill"></div>
      </div>
    </div>

    <div class="hud-row">
      <span class="hud-row-label">Success chance</span>
      <span class="hud-row-value" id="hud-success">-</span>
    </div>
    <div class="hud-row">
      <span class="hud-row-label">Escape timer</span>
      <span class="hud-row-value" id="hud-timer">-</span>
    </div>

    <div class="hud-crew-list" id="hud-crew-list"></div>
  `;
}

export function updateHUD(state = {}) {
  if (!leftEl) return;
  const phaseEl = document.getElementById("hud-phase");
  const modeEl = document.getElementById("hud-mode");
  const crewCountEl = document.getElementById("hud-crew-count");
  const successEl = document.getElementById("hud-success");
  const timerEl = document.getElementById("hud-timer");
  const crewListEl = document.getElementById("hud-crew-list");

  const phase = state.phase || "idle";
  const mode = state.heistMode || "standard";
  const players = state.players || state.crew || [];
  const success = state.successChance != null ? state.successChance : null;
  const escape = state.escapeTimer != null ? state.escapeTimer : null;

  if (phaseEl) phaseEl.textContent = phase.toUpperCase();
  if (modeEl) modeEl.textContent = mode.replace(/_/g, " ").toUpperCase();
  if (crewCountEl) crewCountEl.textContent = Array.isArray(players) ? players.length : 0;
  if (successEl) successEl.textContent = success != null ? Math.round(success) + "%" : "-";
  if (timerEl) timerEl.textContent = escape != null ? escape + "s" : "-";

  if (crewListEl && Array.isArray(players)) {
    crewListEl.innerHTML = players
      .map((p, idx) => {
        if (!p) return "";
        const name = (p.name || p.username || p.displayName || "Player " + (idx+1));
        const role = p.role || p.class || "";
        return `<div class="hud-crew-item"><span>${name}</span><span>${role}</span></div>`;
      })
      .join("");
  }
}
