const Message = require("../model/message")

async function getChatsListHandler(req, res) {
    try {
        const chatsList = await Message.aggregate([
            {
                $group: {
                    _id: "$wa_id",
                    name: { $first: "$name" },
                    roomId: { $first: "$roomId" }
                }
            },
            {
                $project: {
                    _id: 0,
                    wa_id: "$_id",
                    name: 1,
                    roomId: 1
                }
            }
        ]);

        return res.status(200).json({ chatsList, message: "Chats list found successfully" });

    } catch (error) {
        console.log("getChatsListHandler", error);

        return res.status(500).json({ message: "failed to fetch chats list!" });
    }
}


async function getMessagesHandler(req, res) {
    try {

        const { id, roomId } = req.params;
        if (!id || !roomId) {
            return res.status(500).json({ message: "Invalid id and roomId" });
        }

        const messages = await Message.find({ roomId: roomId }).sort({ timestamp: 1 });

        return res.status(200).json({ messages, message: "All message are fetch successfully." });


    } catch (error) {
        console.log("getMessagesHandler", error);
        return res.status(500).json({ message: "Failed to fetch messages." })

    }
}


async function postMessageHanlder(req, res) {

    try {

        const { roomId, text } = req.body;
        if (!roomId || !text) {
            return res.status(500).json({ message: "All fields are required." });
        }

        const msg = await Message.create({ ...req.body });
        return res.status(201).json({ currentMsg: msg, message: "Message created successfully." });

    } catch (error) {
        console.log("postMessageHanlder", error);
        return res.status(500).json({ message: "Failed post the message." })
    }

}

module.exports = {
    getChatsListHandler,
    getMessagesHandler,
    postMessageHanlder
}