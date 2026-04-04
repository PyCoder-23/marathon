const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * KairoMentor - A gentle, supportive AI companion for the Marathon Server.
 */
class KairoMentor {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("Kairo Mentor requires a valid Google AI API Key.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `
You are Kairo, a gentle, motivational, and supportive mentor for students in the Marathon Server.
Your goal is to help students stay consistent, disciplined, and focused on their goals.

PRIME DIRECTIVES:
1. PERSONALITY: Be a gentle guide. Use a supportive and encouraging tone.
2. TONE: Motivational but realistic. You are here to help them build long-term momentum.
3. EMOJIS: Use them naturally and sparingly to add warmth (e.g., 🚀, ✨, 💪, 🌱).
4. MARATHON SYSTEM: You know about the XP system, 25-minute study sessions, streaks, and the importance of proof-of-work.
5. ENGAGEMENT: Regularly ask users about their recent progress (e.g., "How much XP did you earn in the last 2-3 days?") and provide constructive feedback.
6. CONSTRAINTS: Stay strictly in English. Keep responses short, simple, and easy to understand.
7. IDENTITY: Your name is Kairo. Never break character. Avoid @-mentioning users directly in the text unless specifically asked.

You are NOT a drill sergeant. You are a wise mentor who believes in the user's potential.
`,
        });

        // In-memory conversation history: { channelId: [ { role, parts }, ... ] }
        this.memory = new Map();
        this.MAX_HISTORY = 40; // ~20 turns
    }

    /**
     * Generate a response for a given prompt in a channel.
     */
    async chat(channelId, authorName, userMessage) {
        let history = this.memory.get(channelId) || [];

        // Add user message to history
        history.push({
            role: "user",
            parts: [{ text: `${authorName}: ${userMessage}` }],
        });

        // Limit history size
        if (history.length > this.MAX_HISTORY) {
            history = history.slice(-this.MAX_HISTORY);
        }

        try {
            // Start a chat session with history
            const chatSession = this.model.startChat({
                history: history.slice(0, -1), // Everything except the new user message
                generationConfig: {
                    maxOutputTokens: 1500,
                },
            });

            const result = await chatSession.sendMessage(`${authorName}: ${userMessage}`);
            const response = await result.response;
            const replyText = response.text().trim();

            // Store the response in history
            history.push({
                role: "model",
                parts: [{ text: replyText }],
            });
            this.memory.set(channelId, history);

            // Add the mandatory disclaimer
            return `${replyText}\n\n*AI information may be inaccurate, please double check to verify correctness*`;

        } catch (error) {
            console.error("[Kairo AI Error]", error);
            throw error;
        }
    }

    /**
     * Clear memory for a specific channel
     */
    clearChannelMemory(channelId) {
        this.memory.delete(channelId);
    }

    /**
     * Clear all memory (global)
     */
    clearAllMemory() {
        this.memory.clear();
    }
}

module.exports = KairoMentor;
