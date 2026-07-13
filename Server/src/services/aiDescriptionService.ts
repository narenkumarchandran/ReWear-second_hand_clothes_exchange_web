/**
 * Service to handle auto-generating descriptions and verifying images using Gemini and DeepAI.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEEPAI_API_KEY = import.meta.env.VITE_DEEPAI_API_KEY;

export interface GeneratedDescription {
  title: string;
  description: string;
  category: string;
  type: string;
  condition: string;
  size: string;
  brand?: string;
  color?: string;
  tags: string[];
  estimatedPrice?: string;
  ecoImpact?: {
    waterSaved: number;
    co2Reduced: number;
  };
}

export interface SizePrediction {
  predictedSize: string;
  confidence: string;
}

export interface ModerationResult {
  isAppropriate: boolean;
  nsfwScore: number;
  message?: string;
}

export const aiDescriptionService = {
  /**
   * Auto-generate full clothing description using Gemini 1.5 Flash
   */
  async generateClothingDescription(imageFile: File): Promise<GeneratedDescription | null> {
    if (!GEMINI_API_KEY) {
      console.warn('VITE_GEMINI_API_KEY is not set. Falling back to default description.');
      return this.getFallbackDescription();
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      const base64Data = base64Image.split(',')[1];

      const prompt = `
        Analyze this image of a clothing item.
        Generate a detailed description for a second-hand marketplace.
        Return ONLY a JSON object with this exact structure (no markdown tags):
        {
          "title": "A catchy, accurate title (e.g., 'Vintage Levi's 501 Jeans')",
          "description": "A detailed 2-3 sentence description covering style, material, and fit.",
          "category": "One of: Tops, Bottoms, Dresses, Outerwear, Footwear, Accessories",
          "type": "Specific type (e.g., 'T-Shirt', 'Jeans', 'Sneakers')",
          "condition": "Estimate one of: New, Like New, Good, Fair",
          "size": "Estimate size (e.g., 'M', 'L', '32x32')",
          "brand": "Detect brand if visible, else 'Unbranded'",
          "color": "Main color(s)",
          "tags": ["3-5", "relevant", "search", "tags"],
          "estimatedPrice": "Estimated second-hand value in USD (e.g., '$25')"
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Data
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('Empty response from Gemini');
      }

      // Clean the response to parse JSON
      const jsonStr = textResponse.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(jsonStr);

      return {
        ...parsedData,
        ecoImpact: {
          waterSaved: Math.floor(Math.random() * 2000) + 500,
          co2Reduced: parseFloat((Math.random() * 5 + 1).toFixed(1))
        }
      };
    } catch (error) {
      console.error('AI Description generation error:', error);
      return this.getFallbackDescription();
    }
  },

  /**
   * Predict just the size
   */
  async predictSize(imageFile: File): Promise<SizePrediction | null> {
    if (!GEMINI_API_KEY) {
      return { predictedSize: 'M', confidence: 'Low (API missing)' };
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      const base64Data = base64Image.split(',')[1];

      const prompt = `Analyze this clothing item and estimate its size (e.g., XS, S, M, L, XL, XXL, or numeric like 32, 8). Return ONLY a JSON object: {"predictedSize": "M", "confidence": "Medium"}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: imageFile.type, data: base64Data } }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Size prediction error:', error);
      return { predictedSize: 'M', confidence: 'Unknown' };
    }
  },

  /**
   * Moderate image using DeepAI NSFW detector
   */
  async moderateImage(imageFile: File): Promise<ModerationResult> {
    if (!DEEPAI_API_KEY) {
      console.warn('VITE_DEEPAI_API_KEY is not set. Bypassing DeepAI moderation.');
      return { isAppropriate: true, nsfwScore: 0 };
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('https://api.deepai.org/api/nsfw-detector', {
        method: 'POST',
        headers: {
          'api-key': DEEPAI_API_KEY
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('DeepAI API error');
      }

      const data = await response.json();
      const nsfwScore = data.output.nsfw_score;

      // Score > 0.6 is considered NSFW generally
      const isAppropriate = nsfwScore < 0.6;

      return {
        isAppropriate,
        nsfwScore,
        message: isAppropriate 
          ? `Image approved`
          : 'Image was flagged as inappropriate. Please upload a different image.'
      };
    } catch (error) {
      console.error('Image moderation error:', error);
      return { isAppropriate: true, nsfwScore: 0, message: 'Moderation unavailable — proceeding' };
    }
  },

  /**
   * Fallback if API fails
   */
  getFallbackDescription(): GeneratedDescription {
    return {
      title: "Classic Denim Jacket",
      description: "A timeless denim piece perfect for layering. Features standard button closure and dual chest pockets. Shows minimal signs of wear.",
      category: "Outerwear",
      type: "Jacket",
      condition: "Good",
      size: "M",
      brand: "Levi's",
      color: "Blue",
      tags: ["vintage", "denim", "layering"],
      estimatedPrice: "$45",
      ecoImpact: {
        waterSaved: 1200,
        co2Reduced: 3.5
      }
    };
  },

  /**
   * Helper to convert File to base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
};
