# 🔞 NSFW / Nudity Detector (Image Moderation)

This module automatically detects and blocks unsafe or inappropriate images (e.g., nudity, gore, weapons) before they are allowed on your clothing exchange platform like **ReWear**.

---

## ✅ Features

- 🔍 Detects **nudity**: raw, partial, or safe
- 🔫 Flags **weapons**: guns, knives, etc.
- ⚠️ Detects **offensive content**: symbols, gestures, hate content
- 💉 Filters **drugs** and **alcohol**
- 🩸 Detects **gore** and **violence**
- 🔤 Analyzes **text in images** for profanity, extremism, or spam
- 🚫 Automatically blocks unsafe images
- 📦 Easy integration into Python or Flask backend

---

## 🛠️ How It Works

1. User uploads an image
2. The image is sent to **Sightengine’s Moderation API**
3. The API returns a structured response with content probabilities
4. If unsafe content is detected, the image is blocked

---

## Image used when image is safe:
![1739042759287](https://github.com/user-attachments/assets/c6100fdb-8c6c-4e3d-b6d6-b1115d969106)
