const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    wa_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },
    roomId: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Message = mongoose.model("message", messageSchema);

module.exports = Message;

//  direction: {
//         type: String,
//         enum: ["inbound", "outbound"]
//     },
// phone_number_id: {
//     type: String
// },