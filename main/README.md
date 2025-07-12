# 👕 ReWear – AI-Powered Second-Hand Clothing Exchange Platform

**ReWear** is a smart fashion marketplace that uses advanced AI models to automate, moderate, and personalize second-hand clothing listings. It enhances user experience, boosts trust and safety, and helps buyers find the perfect fit faster.

---

## ✨ Core Features

### 🧥 1. Clothing Description Generator
Uses **Gemini 2.0 Flash Vision API** to auto-generate structured JSON descriptions from a clothing image.

**Extracted fields:**
- Title
- Detailed description
- Category and type
- Estimated size
- Visible condition
- Tags for search/filtering

**🔁 Built-in optimizations:**
- Auto image resizing (1024x1024)
- Fallback text handling if structured JSON fails

> 🔧 `class ClothingDescriptionGenerator`

---

### 📏 2. Size Prediction System

Given **user body measurements**, this module uses Gemini API to predict:
- Shirt size (XS to XXL)
- Pant waist and length
- Alternatives if between sizes
- Explanation of reasoning

**Simulates realistic test data** and uses Gemini’s structured JSON output or falls back to traditional sizing logic when offline.

> 🔧 `class SizePredictionSystem`

---

### 💬 3. Gemini-Powered Chatbot ("Bob")

Interactive, embedded **React chatbot** trained on Gemini Pro model.

**Chatbot highlights:**
- Name: Bob 🤖 – your friendly marketplace guide
- Contextual assistant for second-hand clothing
- Trained on:
  - Selling tips, pricing, shipping
  - Clothing condition grading
  - Buyer safety & fraud prevention
- Built-in suggestions & typing indicator
- React-based UI with conversation memory

> 🧠 Powered by `geminiService.ts` (prompt design + fallback handling)

---

### 🔞 4. NSFW & Nudity Detection System

Moderates clothing images before upload using the **Sightengine API** to detect:
- NSFW content (nudity, suggestive poses)
- Weapons (knife/firearm)
- Gore or violent imagery
- Offensive symbols or gestures
- Profanity in text overlays

✅ **Confidence-based filtering**  
🔄 JSON API response handling with fallback messaging  

> 🔧 Used before product listings go live

---

### 🎯 5. Personalized Clothing Recommender

Combines:
- 🔁 **Collaborative filtering** (KNN)
- 📄 **Content-based filtering** using TF-IDF or BERT
- 🧠 **Gemini multimodal analysis** for text + image-based preference matching

**Recommends items based on:**
- Liked history
- Tags, size, fit, condition
- Style preferences (via search or images)

> Useful for homepage, similar items, or personal feed

---

### 🎯 6. Auto Clothing Description Generator 

Automatically produce rich, structured metadata for any clothing item from its image using **Google’s Gemini Vision API**.
## ✨ Key Capabilities

- 🏷️ Generates:
  - **Title** (brief, catchy)
  - **Description** (100–200 words: style, fit, material, features)
  - **Category** (e.g., Tops, Dresses, Outerwear)
  - **Type** (e.g., T‑shirt, Blazer, Sneakers)
  - **Size** (estimated XS–XL or “Not specified”)
  - **Condition** (New, Like New, Good, Fair, Poor)
  - **Tags** for search and filtering

- 📏 **Image resizing** up to 1024×1024 to optimize API usage
- 🔄 **Base64 encoding** of images for inline upload
- ⚠️ **Fallback JSON** if parsing fails

---

## 🧱 Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React + Vite + TailwindCSS          |
| AI/ML       | Google Gemini Pro & Flash APIs      |
| Backend     | Python (FastAPI or Flask compatible)|
| Moderation  | Sightengine API                     |
| Recommender | scikit-learn, BERT, TF-IDF, KNN     |
| Chatbot     | React, Gemini Prompt Engineering    |

---


