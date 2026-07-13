/**
 * Gemini Chatbot Service
 * Provides multi-turn chat for the ReWear platform.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const SYSTEM_INSTRUCTION = `
You are the ReWear Assistant, an AI helper for a sustainable second-hand clothing exchange platform.
You should be helpful, concise, and friendly. You know about:
- Uploading items (AI auto-generates descriptions and predicts sizes)
- Eco-points system (used for buying instead of cash)
- Direct swaps (trading item for item)
- Sustainability (saving water and CO2 by buying second-hand)
Keep responses under 3 paragraphs. Use formatting (bold, bullet points) to be readable.
`;

export const geminiService = {
  /**
   * Send a multi-turn message to Gemini 1.5 Flash
   */
  async sendMessage(history: ChatMessage[], newMessage: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      console.warn('VITE_GEMINI_API_KEY is not set. Chatbot is in fallback mode.');
      return "Hi there! I'm currently in offline demo mode because my API key isn't configured. I'm the ReWear Assistant, here to help you navigate our sustainable fashion exchange. How can I help you today?";
    }

    try {
      // Format history for Gemini API
      // Note: Gemini API requires strict 'user' and 'model' roles.
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add the new message
      formattedHistory.push({
        role: 'user',
        parts: [{ text: newMessage }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: formattedHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Chatbot error:', error);
      return "I'm having trouble connecting right now. Please try again later!";
    }
  }
};
