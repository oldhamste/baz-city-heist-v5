// app/tiktok_connector.js
const { WebcastPushConnection } = require("tiktok-live-connector");
const io = require("socket.io-client");

const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || "baz7891";
const SERVER_URL = process.env.HEIST_SERVER_URL || "http://localhost:3000";

console.log(`Connecting to TikTok LIVE as @${TIKTOK_USERNAME}…`);
console.log(`Game server URL: ${SERVER_URL}`);

// Socket.IO client -> your game server
const socket = io(SERVER_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("✔ Connected to Baz City Heist server via Socket.IO");
});

socket.on("disconnect", () => {
  console.log("✖ Disconnected from game server");
});

socket.on("connect_error", (err) => {
  console.error("Game server connection error:", err.message);
});

// TikTok connector
const tiktok = new WebcastPushConnection(TIKTOK_USERNAME, {
  // You can tweak options here later if needed
});

tiktok
  .connect()
  .then((state) => {
    console.log(`✔ Connected to TikTok room for @${TIKTOK_USERNAME}`);
    if (state.roomId) {
      console.log("Room ID:", state.roomId);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to TikTok:", err.message || err);
  });

// Chat messages
tiktok.on("chat", (data) => {
  const payload = {
    username: data.uniqueId,
    comment: data.comment,
    role: data?.user?.role || "viewer", // "streamer" | "moderator" | etc
  };

  console.log(`[CHAT] ${payload.username}: ${payload.comment}`);
  socket.emit("tiktok:chat", payload);
});

// Gifts
tiktok.on("gift", (data) => {
  // Only act when the gift combo is completed
  if (data.repeatEnd === 0) return;

  const payload = {
    username: data.uniqueId,
    giftName: data.giftName,
    repeatCount: data.repeatCount,
    diamondValue: data.diamondCount,
  };

  console.log(
    `[GIFT] ${payload.username} sent ${payload.repeatCount}x ${payload.giftName} (${payload.diamondValue} diamonds)`
  );

  socket.emit("tiktok:gift", payload);
});

// Basic error logging
tiktok.on("streamEnd", () => {
  console.log("TikTok stream ended.");
});

tiktok.on("disconnected", () => {
  console.log("Disconnected from TikTok; will retry automatically.");
});

tiktok.on("error", (err) => {
  console.error("TikTok error:", err.message || err);
});
