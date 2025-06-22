# AI-Powered Customer Support Chatbot (POC)

This project is a backend Proof of Concept (POC) for an AI-powered customer support chatbot. It is designed to handle customer queries in real-time using a large language model (LLM), persist chat history, and escalate unresolved queries to human agents when necessary.

## Features

- **Conversational AI Integration** with Gemini 1.5 Flash (can switch to OpenAI GPT for production)
- **Real-Time Messaging** via Socket.io (WebSocket)
- **Redis-Based Session Management** for persistent memory across chats
- **Automated Escalation Logic** based on fallback phrases
- **Logging with Winston** (chat-combined.log, chat-error.log)
- **Minimal Frontend** using basic HTML + JavaScript (for testing)


## Tech Stack

- **Backend**: Node.js + Express
- **AI Model**: Google Gemini API (1.5 Flash)
- **WebSockets**: Socket.io
- **Session Storage**: Redis
- **Logger**: Winston
- **Frontend**: Basic HTML/CSS/JS

## Folder Structure

```
ai-customer-bot/
├── controllers/
│   └── chatController.js
├── services/
│   ├── openaiService.js
│   └── redisService.js
├── utils/
│   └── logger.js
├── public/
│   └── index.html
├── logs/
│   ├── chat-combined.log
│   └── chat-error.log
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```


## Environment Variables (.env)

```env
GEMINI_API_KEY=your_real_gemini_api_key
REDIS_URL=redis://localhost:6379
PORT=3000
```
