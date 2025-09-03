# Team Name: Techie_Scanners
# Team ID: 3142
# Problem Statement: ReWear – Community Clothing Exchange
# Team Leader Mail ID: aerosibin777@gmail.com
# 👕 ReWear Frontend – AI-Enhanced Clothing Exchange Platform

# Project Demo
https://github.com/user-attachments/assets/ccd11c71-e4ed-4a0d-b6e0-991c524a2971


---
Welcome to the **frontend** of ReWear – a smart, sustainable platform where users can **buy, sell, and explore second-hand clothes** using cutting-edge **AI assistance**. This interface is built to provide a seamless and intelligent experience powered by visual understanding and personalized recommendations.

---

## ⚙️ Tech Stack

- **React** (with TypeScript)
- **TailwindCSS** – responsive and utility-first styling
- **ShadCN UI** – beautiful, accessible components
- **Lucide React** – modern icon set
- **Gemini Pro (Google Generative AI)** – for chatbot and visual tasks
- **Sightengine NSFW API** – for content moderation
- **REST API integration** – connects to an Odoo 25 backend

---

## 🚀 Key Frontend Features & Workflow

### 🧥 1. Clothing Upload + Auto Description (Gemini Vision)
- Users can upload a clothing image.
- The image is sent to the Gemini 2.0 Flash model.
- A structured response is returned with:
  - **Title**
  - **Detailed description**
  - **Category & type**
  - **Estimated size**
  - **Condition**
  - **Search tags**
- Users can review/edit the fields before submitting.

---

### 🔐 2. User Authentication
- Login and signup are securely handled through the backend API (Odoo 25).
- Tokens or session data are stored in the browser for subsequent requests.

---

### 🧼 3. NSFW & Content Moderation (Sightengine API)
- Every image upload is passed through a **moderation pipeline**.
- The image is checked for:
  - Nudity
  - Weapons
  - Gore
  - Profanity or offensive text
- If flagged, the upload is blocked and users are notified.

---

### 🤖 4. "Bob" – AI Marketplace Chatbot (Gemini Pro)
- Chat interface opens via a floating button.
- "Bob" helps with:
  - Selling and pricing tips
  - Sizing guidance
  - Marketplace policies
  - Shipping, returns, safety, and more
- Built using **Gemini Pro** and maintains session context.
- Suggests quick questions based on conversation flow.

---

### 🎯 5. Personalized Clothing Recommendation Engine
- Uses a **hybrid recommendation system**:
  - **Collaborative Filtering (KNN)** – based on user behavior
  - **Content-Based Filtering (TF-IDF or BERT)** – based on item similarity
  - **Gemini Pro** – to refine suggestions based on textual style prompts
- Continuously updates suggestions as user preferences evolve.

---

### 📏 6. Virtual Size Prediction System
- Users enter measurements (e.g., chest, waist, inseam, etc.).
- Gemini generates a JSON-based response with:
  - Recommended shirt & pant sizes
  - Numeric size equivalents
  - Alternatives (if between sizes)
  - Reasoning for each recommendation

---

### 🛍️ 7. Seamless Shopping Interface
- Interactive product cards
- Real-time filter & search functionality
- Responsive layout for mobile and desktop
- Category-based browsing
- Saved preferences and smart navigation

---

## 🔄 Backend API Integration
- Frontend interacts with the Odoo 25 backend through RESTful endpoints for:
  - Clothing listings
  - User authentication
  - Order & transaction sync
- Separate microservices handle AI tasks (moderation, description, recommendation).

---

## 🧩 Extensibility & Future Enhancements
- Multi-language support via Gemini multilingual models
- Image-to-style-matching or visual similarity search
- Add-to-cart integration with shipping options
- Push notifications for recommendations or chat

---


---
## 👨‍💻 Team Details 

- [Sibin](https://github.com/aerosibin) – aerosibin777@gmail.com  
- [Narenkumar C](https://github.com/narenkumarchandran) – narenkumarchandran@gmail.com  
- [Jaiganesh Jaisurrya](https://github.com/scara-02) – jaiganeshjaisurrya@gmail.com  
- [Lakshmi Narayanan](https://github.com/plan28-06) – planar2006@gmail.com  

---

## ✅ Summary

ReWear's frontend is built to **empower users** to confidently list, explore, and purchase pre-loved clothes using intelligent features like:

- 🧠 AI-generated descriptions  
- 🎯 Personalized recommendations  
- 🧑‍💻 Virtual sizing assistant  
- 🤖 Marketplace chatbot  
- 🛡️ Content moderation  

Start your journey with sustainable fashion – powered by AI!



