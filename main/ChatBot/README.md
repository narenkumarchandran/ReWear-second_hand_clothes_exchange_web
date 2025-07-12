# 🛍️ Bob – AI Marketplace Assistant (Chatbot)

A friendly, real-time chatbot built with **React + Gemini Pro API** to guide users in buying and selling used clothes on the **ReWear** platform.

---

## ✨ Features

- 🤖 AI-Powered Assistant (`Gemini Pro`)
- 💬 Chat interface with typing indicator and quick suggestions
- 🔁 Maintains conversation history contextually
- 🛡️ Responds only to marketplace-related queries
- 🧠 Uses custom prompt and memory for accurate, consistent responses
- 📱 Mobile-friendly design with TailwindCSS styling
- 🧹 Clear chat and error fallback support

---

## 📦 Technologies Used

| Tool / Library            | Purpose                                      |
|---------------------------|----------------------------------------------|
| `React`                   | Frontend UI                                  |
| `TypeScript`              | Type safety                                  |
| `@google/generative-ai`   | Gemini Pro integration                       |
| `TailwindCSS`             | UI styling                                   |
| `Lucide-React`            | Icon set                                     |
| `Vite` (or CRA)           | React build tooling                          |

---

## 🧠 Personality: Bob the Assistant

- **Character**: Friendly, knowledgeable, helpful
- **Tone**: Professional yet supportive
- **Expertise**:
  - Selling/buying tips
  - Marketplace operations
  - Safety & dispute resolution
  - Platform rules and trends
  - Pricing & packaging guidance

> ✅ Bob always stays in character and redirects unrelated queries politely.

---

## 🚀 How It Works

1. Chatbox opens with a welcome message from Bob
2. User types queries or selects quick suggestions
3. Bob uses Gemini Pro (`geminiService.ts`) to:
   - Append system prompt
   - Maintain chat history
   - Format messages
   - Send request to Gemini
4. The response is displayed in the UI
5. Typing indicator shows while waiting for reply

---

