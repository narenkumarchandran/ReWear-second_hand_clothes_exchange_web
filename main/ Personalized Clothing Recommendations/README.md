# 🧠 Personalized Clothing Recommendation System

This module intelligently recommends clothing items to users on **ReWear** based on their style preferences, past swap history, and item content similarity using a hybrid AI approach.

---

## ✨ Features

- 👤 **User-Based Collaborative Filtering** (KNN)
  - Recommends items liked by similar users
- 🏷️ **Content-Based Filtering** (TF-IDF or BERT)
  - Matches item descriptions and tags
- 📝 **Natural Language Text Search** (Gemini / SentenceTransformer)
  - Understands user style input like “I love oversized pastel hoodies”
- 🤝 Combines profile data, history, and item content for more accurate suggestions

---

## 🔧 Architecture Overview

```plaintext
[User Input] ──► [Gemini Text NLP] ──► Style Vector
        │
        ├──► [User-Item Interaction Matrix] ──► KNN Neighbors
        │
        └──► [Item Tags/Descriptions] ──► TF-IDF or BERT

                        ▼
                🔁 Aggregated Results
                        ▼
          ✅ Top N Recommendations from Catalog

