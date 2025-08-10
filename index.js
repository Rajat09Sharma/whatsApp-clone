require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { join } = require('node:path');
const apiRoute = require("./routes/message")

const connectDB = require("./config/db");
const { log, timeStamp } = require("node:console");
const Message = require("./model/message");


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://spontaneous-blini-333547.netlify.app",
    methods: ["GET", "POST"]
  }
});
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "https://spontaneous-blini-333547.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


connectDB();

app.use("/api", apiRoute);

// Webhook Endpoint
app.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    if (payload.payload_type !== "whatsapp_webhook") {
      return res.status(400).json({ error: "Invalid payload type" });
    }

    const entry = payload.metaData.entry?.[0];
    const roomId = payload.metaData?.gs_app_id;
    const value = entry?.changes?.[0]?.value;
    const contact = value?.contacts?.[0];
    const message = value?.messages?.[0];
    const status = entry?.statuses?.[0].status;

    if (!contact || !message) {
      return res.status(400).json({ error: "Missing contact or message data" });
    }

    const messageDoc = await Message.create({
      wa_id: contact.wa_id,
      name: contact.profile.name,
      from: message.from,
      text: message.text?.body || "",
      status: status || "sent",
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      roomId: roomId,
    });

    res.status(200).json({ msg: messageDoc, message: "Hook data created successfully." });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async (data) => {

    console.log(data);
    const roomId = data.roomId;

    try {
      await Message.create({ ...data });
      console.log("Message saved to DB");
    } catch (err) {
      console.error("Error saving message:", err);
    }

    socket.to(roomId).emit(`receiveMessage:${roomId}`, {
      ...data
    });
    socket.emit(`receiveMessage:${roomId}`, {
      ...data
    });
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server started successfully on ${PORT}.`);

});

