const express = require("express");
const app = express();

// ... other middleware / code ...

// Serve everything in /public (JS, CSS, overlay.html, etc.)
app.use(express.static(__dirname + "/../public"));

// Serve overlay.html at the root path "/"
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/../public/overlay.html");
});

// ... rest of your TikTok / Socket.IO setup and app.listen(port) ...
