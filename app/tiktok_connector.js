/* TikTok → Socket.IO Forwarder (V5 clean) */

const { WebcastPushConnection } = require('tiktok-live-connector');
const io = require('socket.io-client');

const socket = io("http://localhost:3000", {
    transports: ["websocket"]
});

// CHANGE THIS TO YOUR LIVE USERNAME
let tiktokUsername = "baz7891";   // <- your account

let tiktok = new WebcastPushConnection(tiktokUsername);

console.log(`Connecting to TikTok LIVE as @${tiktokUsername}…`);

tiktok.connect().then(state => {
    console.log(`Connected to @${tiktokUsername}`);
}).catch(err => {
    console.error('Connection error:', err);
});

// Forward CHAT messages:
tiktok.on('chat', data => {
    socket.emit("tiktok_chat", {
        userId: data.userId,
        uniqueId: data.uniqueId,
        displayName: data.nickname,
        text: data.comment
    });
});

// Forward GIFTS:
tiktok.on('gift', data => {
    socket.emit("tiktok_gift", {
        userId: data.userId,
        uniqueId: data.uniqueId,
        displayName: data.nickname,
        giftId: data.giftId,
        giftName: data.giftName,
        diamondCount: data.diamondCount
    });
});
