// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { redisClient } from './services/redisService.js';
import { handleChat } from './controllers/chatController.js';
import { getAIResponse } from './services/openaiService.js';
import { logger } from './utils/logger.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Redis test route
app.get('/', async (req, res) => {
  try {
    await redisClient.set('testKey', 'Hello Redis');
    const value = await redisClient.get('testKey');
    res.send(`Redis says: ${value}`);
  } catch (err) {
    res.status(500).send('Redis test failed');
  }
});

// REST endpoint fallback
app.post('/chat', handleChat);

// WebSocket handling
io.on('connection', (socket) => {
  console.log('>Client connected:', socket.id);

  socket.on("chat-message", async ({ userId, message }) => {
  try {
    // Fetch conversation from Redis
    let pastMessages = await redisClient.get(`chat:${userId}`);
    pastMessages = pastMessages ? JSON.parse(pastMessages) : [];

    pastMessages.push({ role: "user", text: message });

    // Add system prompt
    const systemPrompt = {
      role: "user",
      parts: [
        {
          text:
            "You are a helpful AI assistant. If you cannot do something physically or don't have access, please clearly say so using phrases like 'I'm sorry', 'I can't', 'I cannot', or similar.",
        },
      ],
    };

    const formatted = [
      systemPrompt,
      ...pastMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
    ];

    const aiReply = await getAIResponse(formatted);
    pastMessages.push({ role: "assistant", text: aiReply });
    await redisClient.set(`chat:${userId}`, JSON.stringify(pastMessages));

    // Escalation logic
    const escalate =
      aiReply.toLowerCase().includes("i can't") ||
      aiReply.toLowerCase().includes("i cannot") ||
      aiReply.toLowerCase().includes("i'm sorry") ||
      aiReply.toLowerCase().includes("i do not have");

    // Logging

    console.log("Emitting response:", aiReply);
    socket.emit("chat-response", { response: aiReply, escalate });


  } catch (error) {
    console.error("WebSocket error:", error);
    socket.emit("chat-response", { response: "Sorry, something went wrong." });
  }
});


  socket.on('disconnect', () => {
    console.log('<Client disconnected:', socket.id);
  });
});

// Start WebSocket + HTTP server
server.listen(PORT, () => {
  console.log(`Server with WebSocket running at http://localhost:${PORT}`);
});
