<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Baz City Heist Overlay</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- Background is drawn in CSS -->
  <div class="overlay-root">

    <!-- Top banner row -->
    <div class="top-banner-row">
      <canvas id="banner-canvas" class="banner-canvas"></canvas>
    </div>

    <!-- Main 3-column layout: HUD | GAME | TOP GIFTERS -->
    <div class="main-layout">
      <!-- Left: HUD -->
      <div id="hud-root" class="hud-column"></div>

      <!-- Middle: game area (for now just a placeholder) -->
      <div class="game-column">
        <div id="game-placeholder">
          HEIST GAME VIEW
          <span>(this is the space the actual game will use next update)</span>
        </div>
      </div>

      <!-- Right: Top Gifters -->
      <div id="leaderboard-root" class="leaderboard-column"></div>
    </div>

    <!-- Bottom-left: Baz camera frame -->
    <div class="baz-cam-frame">
      <div class="baz-cam-label">BAZ</div>
    </div>
  </div>

  <!-- Existing scripts -->
  <script src="components/backgrounds.js"></script>
  <script src="components/bars.js"></script>
  <script src="banner_engine.js"></script>
  <script src="baz_avatar.js"></script>
  <script src="components/hud.js"></script>
  <script src="components/leaderboard.js"></script>
  <script src="overlay.js"></script>
</body>
</html>
