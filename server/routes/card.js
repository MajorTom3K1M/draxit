const express = require('express');
const router = express.Router();
const CardsControllers = require("../controllers/Cards");

router.post("/card/:roomId/create", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { playerId, image, round } = req.body;
        const card = await CardsControllers.createCard(roomId, playerId, image, round);
        res.status(200).send({ sucess: true }).end();
    } catch(err) {
        next(err);
    }
});

router.post("/card/:roomId/select", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { cardId, playerId } = req.body;
        const card = await CardsControllers.selectCard(roomId, cardId, playerId);
        res.status(200).send(card).end();
    } catch(err) {
        next(err);
    }
})

router.get("/card/:roomId", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { round } = req.query;
        const cards = await CardsControllers.getCards(roomId, round);
        res.status(200).send(cards).end();
    }catch(err) {
        next(err);
    }
})

router.use((err, req, res, next) => {
    console.log({ err });
    res
      .status(err.statusCode ? err.statusCode : 500)
      .send({ statusCode: err.statusCode ? err.statusCode : 500, message: err.message })
      .end();
});

module.exports = router;