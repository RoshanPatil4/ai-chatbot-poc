import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getAIResponse(messages) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: messages,
    });

    const response = await result.response;
    return response.text?.() || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message || error);
    return "Sorry, I'm having trouble answering right now.";
  }
}
