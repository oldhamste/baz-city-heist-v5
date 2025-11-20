// Gift leaderboard – right side panel

const rightEl = document.getElementById("hud-right");
const gifters = new Map(); // key -> { name, total, lastGift }

export function initLeaderboard() {
  if (!rightEl) return;
  rightEl.innerHTML = `
    <div class="leaderboard-header">Top Gifters</div>
    <div class="leaderboard-list" id="leaderboard-list"></div>
  `;
}

function renderLeaderboard() {
  if (!rightEl) return;
  const container = document.getElementById("leaderboard-list");
  if (!container) return;

  const entries = Array.from(gifters.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  container.innerHTML = entries
    .map(e => {
      return `
        <div class="leaderboard-item">
          <span class="leaderboard-name">${escapeHtml(e.name)}</span>
          <span class="leaderboard-score">${e.total}</span>
        </div>
      `;
    })
    .join("");
}

export function updateLeaderboardFromGift(gift = {}) {
  const name = gift.displayName || gift.username || gift.uniqueId || "Unknown";
  const id = gift.userId || gift.uniqueId || name;
  const diamonds = gift.diamondCount || gift.diamonds || 1;

  const current = gifters.get(id) || { name, total: 0, lastGift: "" };
  current.name = name;
  current.total += diamonds;
  current.lastGift = gift.giftName || current.lastGift;
  gifters.set(id, current);
  renderLeaderboard();
}

// Optional: if back-end sends aggregated leaderboard in state
export function updateLeaderboardFromState(state = {}) {
  if (!state.topGifters) return;
  gifters.clear();
  state.topGifters.forEach((g) => {
    if (!g) return;
    const id = g.id || g.userId || g.uniqueId || g.name;
    const name = g.name || g.displayName || g.username || id;
    const total = g.total || g.diamonds || g.amount || 0;
    gifters.set(id, { name, total, lastGift: g.lastGift || "" });
  });
  renderLeaderboard();
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
