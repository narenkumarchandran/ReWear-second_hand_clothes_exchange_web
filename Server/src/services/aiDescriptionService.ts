
class AIDescriptionService {
  private geminiApiKey = 'AIzaSyApSEbbZdNCPhH03DasQGkxpwd1A7NrZDY';
  private deepAiApiKey = '6c9b30c6-b27e-4e14-a258-35285c6a7f02';

  async generateClothingDescription(imageFile: File) {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `
        Analyze this clothing item image and provide detailed information in JSON format:
        {
          "title": "Brief, catchy title (max 50 characters)",
          "description": "Detailed description including style, fit, material, features (100-200 words)",
          "category": "Main category (Tops, Bottoms, Dresses, Outerwear, Footwear, Accessories)",
          "type": "Specific type (T-shirt, Jeans, Blazer, etc.)",
          "size": "Predicted size based on visual analysis (XS, S, M, L, XL) - analyze proportions, measurements visible, fit on model if present",
          "condition": "Condition assessment (New, Like New, Good, Fair)",
          "color": "Primary color of the item",
          "brand": "Brand if visible or 'Unknown'",
          "tags": ["relevant", "search", "tags"],
          "estimatedPrice": "Suggested price range in USD (e.g., '$15-25')"
        }
        
        For size prediction, carefully analyze:
        - Overall proportions and fit
        - Any visible size tags or labels
        - How the item fits on the person wearing it
        - Measurements if any rulers or size references are visible
        - Compare to standard sizing expectations for the item type
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }]
        })
      });

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('AI Description Error:', error);
      return this.getFallbackDescription();
    }
  }

  async predictSize(imageFile: File) {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `
        Analyze this clothing item image and predict its size. Focus on:
        - Visible size tags or labels
        - Overall proportions and measurements
        - How the item fits on any person wearing it
        - Comparison to standard sizing for this type of clothing
        - Any rulers, measuring tapes, or size references in the image
        
        Provide your response in JSON format:
        {
          "predictedSize": "XS/S/M/L/XL/XXL or specific size if visible",
          "confidence": "High/Medium/Low",
          "reasoning": "Brief explanation of why you chose this size",
          "visibleSizeTag": "true/false - whether a size tag is clearly visible"
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }]
        })
      });

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Size prediction error:', error);
      return {
        predictedSize: 'M',
        confidence: 'Low',
        reasoning: 'Unable to analyze image for size prediction',
        visibleSizeTag: false
      };
    }
  }

  async moderateImage(imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('https://api.deepai.org/api/nsfw-detector', {
        method: 'POST',
        headers: { 'api-key': this.deepAiApiKey },
        body: formData
      });

      const result = await response.json();
      const nsfwScore = result.output?.nsfw_score || 0;

      return {
        isAppropriate: nsfwScore < 0.5,
        nsfwScore,
        message: nsfwScore >= 0.5 ? 'Image may contain inappropriate content' : 'Image is appropriate'
      };
    } catch (error) {
      console.error('Image moderation error:', error);
      return { isAppropriate: true, nsfwScore: 0, message: 'Moderation unavailable' };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getFallbackDescription() {
    return {
      title: 'Clothing Item',
      description: 'Please add a detailed description of this item.',
      category: 'Tops',
      type: 'T-shirt',
      size: 'M',
      condition: 'Good',
      color: 'Unknown',
      brand: 'Unknown',
      tags: ['clothing', 'fashion'],
      estimatedPrice: '$10-20'
    };
  }
}

export const aiDescriptionService = new AIDescriptionService();
