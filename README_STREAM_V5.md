
# BAZ City Heist – Stream Pack V5 (Stream‑Ready)

This folder is a clean, stream‑ready version of your BAZ City Heist game.

Contents:
- `app/` → the actual Baz City Heist server + overlay (V10 core).
- `tiktok_connector_example.js` → example connector that sends TikTok chat + gifts into the game.
- `app/public/assets/baz/` → drop your BAZ webcam image here as `baz.png`.
- `README_STREAM_V5.md` → this guide.

---

## 1. Install and run Baz City Heist locally

From **this folder**:

```bash
cd app
npm install
node server/server.js
```

If it works you will see:

```text
V10 server running with TikTok integration
```

Now open your browser and go to:

```text
http://localhost:3000/overlay.html
```

You should see:
- Left HUD with Phase, Mode, Loot, Heat, Success %, Escape timer.
- Right Top Gifters panel.
- Background gradient.

---

## 2. Add BAZ webcam image

Place your BAZ face PNG here:

```text
app/public/assets/baz/baz.png
```

Then refresh:

```text
http://localhost:3000/overlay.html
```

BAZ should appear bottom‑left like a webcam.

---

## 3. Install TikTok connector dependencies

From the **V5 root** (same folder as this README):

```bash
npm install tiktok-live-connector socket.io-client
```

---

## 4. Configure and run the TikTok connector

Edit `tiktok_connector_example.js` and change:

```js
const TIKTOK_USERNAME = "your_tiktok_username_here";
```

to your real username **without** the `@`, e.g.:

```js
const TIKTOK_USERNAME = "baz7891";
```

Make sure your Baz server is still running (`node server/server.js` inside `app/`).

Then in another terminal, from the V5 root:

```bash
node tiktok_connector_example.js
```

If it works you will see something like:

```text
Connected to TikTok as @baz7891
```

When you are actually live on TikTok, chat messages and gifts will now be forwarded into your Baz server as:
- `tiktok_chat` events (for `!join`, `!hack`, `!smash`, `!rush`, `!sneak` etc.)
- `tiktok_gift` events (for power boosts + top gifters).

---

## 5. Use the overlay in TikTok Live Studio (or OBS)

In TikTok Live Studio:

1. Create a new scene (e.g. "BAZ HEIST").
2. Add a **Browser Source**.
3. Use URL:

```text
http://localhost:3000/overlay.html
```

4. Set the canvas to 1080×1920 (vertical).
5. Stretch the browser source to fill the screen.

Now:
- The game auto‑runs heists.
- Viewers type commands in chat.
- Gifts power up players.
- BAZ appears bottom‑left.

---

## 6. Deploy to Render (optional)

If you want to host the Baz server online:

1. Create a GitHub repo from the **`app/`** folder.
2. On Render, create a Web Service pointing at that repo.
3. Set:
   - Build command: `npm install`
   - Start command: `node server/server.js`
4. When deployed, your overlay URL will be:

```text
https://YOUR-RENDER-APP.onrender.com/overlay.html
```

You can then use this URL in TikTok Live Studio instead of `localhost`.

---

This V5 pack is meant to be the version you actually **run and stream with** while keeping all your other master zips as backups and archives.
