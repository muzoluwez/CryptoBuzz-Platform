import "dotenv/config";
import http from "http";
// import { Server } from "socket.io";

import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

let server;
// let io;

server = http.createServer(app);

// io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     socket.on("sendMessage", (data) => {
//         console.log("Received message:", data);

//         io.emit("receiveMessage", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//     });
// });

// app.set("io", io);

const start = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("MONGODB_URI not set in environment. Exiting.");
      process.exit(1);
    }

    await connectDB();

    server.listen(PORT, () => {
      console.log(`⚙️  Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server:", err);
    process.exit(1);
  }
};

start();
