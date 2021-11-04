const express = require('express');
const app = express.Router();
const room = require("./routes/room");
const player = require("./routes/player");
const card = require("./routes/card");

app.use("/", room);
app.use("/", player);
app.use("/", card);

module.exports = app;