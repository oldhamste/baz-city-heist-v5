
/**
 * Example TikTok → Baz City Heist connector
 *
 * Run this from Node on the same machine as your Baz server.
 * 1) npm install tiktok-live-connector socket.io-client
 * 2) node tiktok_connector_example.js
 *
 * Make sure your Baz server is running first:
 *    cd app
 *    node server/server.js
 */

const { WebcastPushConnection } = require('tiktok-live-connector');
const { io } = require('socket.io-client');

// TODO: change this to your TikTok username (without the @)
const TIKTOK_USERNAME = "baz7891";

// If your Baz server runs somewhere else, change the URL:
const BAZ_SERVER_URL = "http://localhost:3000";

const socket = io(BAZ_SERVER_URL);

// Connect to TikTok live chat
const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

tiktok.on('chat', (data) => {
    socket.emit('tiktok_chat', {
        userId: data.userId,
        uniqueId: data.uniqueId,
        displayName: data.nickname,
        text: data.comment
    });
});

tiktok.on('gift', (gift) => {
    socket.emit('tiktok_gift', {
        userId: gift.userId,
        uniqueId: gift.uniqueId,
        displayName: gift.nickname,
        giftName: gift.giftName,
        diamondCount: gift.diamondCount
    });
});

tiktok.connect().then(state => {
    console.log(`Connected to TikTok as @${TIKTOK_USERNAME}`);
}).catch(err => {
    console.error('Failed to connect to TikTok:', err);
});
