const express = require("express");
const { getChatsListHandler, getMessagesHandler, postMessageHanlder } = require("../controller/message");

const router = express.Router();


router.get("/chats", getChatsListHandler);
router.get("/message/:id/:roomId", getMessagesHandler);
router.post("/message", postMessageHanlder);


module.exports = router;
