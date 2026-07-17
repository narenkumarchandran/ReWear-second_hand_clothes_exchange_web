/**
 * Service to handle NSFW image moderation.
 */

const SIGHTENGINE_USER = import.meta.env.VITE_SIGHTENGINE_USER;
const SIGHTENGINE_SECRET = import.meta.env.VITE_SIGHTENGINE_SECRET;

export interface ModerationResult {
  isAppropriate: boolean;
  nsfwScore: number;
  message?: string;
}

export const nsfwService = {
  /**
   * Moderate image using SightEngine NSFW detector
   */
  async moderateImage(imageFile: File): Promise<ModerationResult> {
    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
      console.warn('SightEngine credentials not set. Bypassing moderation.');
      return { isAppropriate: true, nsfwScore: 0 };
    }

    try {
      const formData = new FormData();
      formData.append('media', imageFile);
      formData.append('models', 'nudity-2.0');
      formData.append('api_user', SIGHTENGINE_USER);
      formData.append('api_secret', SIGHTENGINE_SECRET);

      const response = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('SightEngine API error');
      }

      const data = await response.json();
      
      // SightEngine returns a 'nudity' object with scores for different categories
      const nsfwScore = data.nudity ? Math.max(
        data.nudity.sexual_activity || 0,
        data.nudity.sexual_display || 0,
        data.nudity.erotica || 0,
        data.nudity.suggestive || 0
      ) : 0;

      // Score > 0.5 is considered NSFW generally
      const isAppropriate = nsfwScore < 0.5;

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
  }
};
