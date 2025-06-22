// chatController.js
import { getAIResponse } from '../services/openaiService.js';
import { redisClient } from '../services/redisService.js';
import { logger } from '../utils/logger.js';

export async function handleChat(req, res) {
  const { userId, message } = req.body;

  if (!userId || !message) {
    logger.warn("Missing userId or message in request body.");
    return res.status(400).json({ error: "userId and message are required." });
  }

  try {
    logger.info(`Handling message from ${userId}: "${message}"`);

    // 1. Fetch past conversation
    let pastMessages = await redisClient.get(`chat:${userId}`);
    pastMessages = pastMessages ? JSON.parse(pastMessages) : [];

    // 2. Add new user message
    pastMessages.push({ role: "user", text: message });

    // 3. Add system prompt
    const systemPrompt = {
      role: "user",
      parts: [
        {
          text:
            "You are a helpful AI assistant. If you cannot do something physically or don't have access, please clearly say so using phrases like 'I'm sorry', 'I can't', 'I cannot', or similar.",
        },
      ],
    };

    // 4. Format messages for Gemini
    const formattedForGemini = [
      systemPrompt,
      ...pastMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
    ];

    // 5. Get response from Gemini
    const aiResponse = await getAIResponse(formattedForGemini);

    logger.info(`Gemini responded to ${userId}: "${aiResponse}"`);

    // 6. Append assistant response
    pastMessages.push({ role: "assistant", text: aiResponse });

    // 7. Save updated conversation
    await redisClient.set(`chat:${userId}`, JSON.stringify(pastMessages));
    logger.info(`Updated conversation saved for ${userId}`);

    // 8. Escalation check
    const escalate =
      aiResponse.toLowerCase().includes("i can't") ||
      aiResponse.toLowerCase().includes("i cannot") ||
      aiResponse.toLowerCase().includes("i'm sorry") ||
      aiResponse.toLowerCase().includes("i do not have");

    if (escalate) {
      logger.warn(`Escalation detected for ${userId}`);
    }

    // 9. Send response
    res.json({ response: aiResponse, escalate });

  } catch (error) {
    logger.error(`Chat error for ${userId}: ${error.message}`);
    res.status(500).json({ response: "Sorry, something went wrong." });
  }
}
