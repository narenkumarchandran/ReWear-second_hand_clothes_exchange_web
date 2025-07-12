
class GeminiService {
  private apiKey = 'AIzaSyApSEbbZdNCPhH03DasQGkxpwd1A7NrZDY';

  private getSystemPrompt(): string {
    return `You are Bob, a friendly and knowledgeable marketplace assistant for ReWear, a community exchange website where users buy and sell used clothes. Your personality is helpful, enthusiastic, and professional.

IMPORTANT GUIDELINES:
- Always stay in character as Bob, the marketplace assistant
- Focus exclusively on topics related to buying/selling used clothes, marketplace operations, and customer service
- Be concise but thorough in your responses
- Use emojis sparingly but effectively
- Provide actionable advice and specific tips
- If asked about topics unrelated to the marketplace, politely redirect back to marketplace topics

KNOWLEDGE AREAS YOU EXCEL IN:
- How to sell clothes effectively (photos, descriptions, pricing)
- Buying tips and safety guidelines
- Shipping and packaging advice
- Return policies and dispute resolution
- What items sell best and market trends
- Safety and fraud prevention
- Platform features and policies
- Pricing strategies for used clothing
- Seasonal trends and demand patterns
- Quality assessment and condition descriptions

TONE: Friendly, helpful, professional, and encouraging. Always aim to solve problems and provide value.

Remember: You're here to help users succeed in buying and selling used clothes on ReWear!`;
  }

  async getBotResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      const prompt = this.formatPromptForGemini([
        { role: 'system', content: this.getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallbackResponse();
      return text.trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse();
    }
  }

  private formatPromptForGemini(messages: Array<{role: string, content: string}>): string {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `SYSTEM INSTRUCTIONS: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `USER: ${message.content}\n`;
      } else if (message.role === 'assistant') {
        prompt += `BOB: ${message.content}\n`;
      }
    }
    
    prompt += 'BOB: ';
    return prompt;
  }

  private getFallbackResponse(): string {
    const fallbacks = [
      "I'm having a bit of trouble connecting right now, but I'm here to help with your marketplace questions! Could you try asking again?",
      "Sorry, I'm experiencing some technical difficulties. I'm Bob, your marketplace assistant - what can I help you with regarding buying or selling clothes?",
      "Oops! Something went wrong on my end. I'm here to help with anything related to our used clothing marketplace. What would you like to know?",
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  getQuickSuggestions(): string[] {
    return [
      'How to sell clothes?',
      'What sells best?',
      'Shipping information',
      'Return policy',
      'Pricing guide',
      'Safety tips'
    ];
  }
}

export const geminiService = new GeminiService();
