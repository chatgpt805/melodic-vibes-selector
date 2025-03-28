
export type EmotionTypes = "happy" | "sad" | "energetic" | "relaxed" | "romantic" | "focused";

export const emotionToMusicMap: Record<EmotionTypes, string> = {
  "happy": "upbeat happy songs",
  "sad": "emotional ballads",
  "energetic": "high energy dance music",
  "relaxed": "chill lofi music",
  "romantic": "love songs",
  "focused": "instrumental concentration music"
};

// This function would be used with a real AI image analysis
export const getEmotionFromImage = (imageData: string): Promise<EmotionTypes> => {
  // In a real application, this would call an AI API to analyze the image
  // For now, we'll return a random emotion
  return new Promise((resolve) => {
    setTimeout(() => {
      const emotions: EmotionTypes[] = ["happy", "sad", "energetic", "relaxed", "romantic", "focused"];
      resolve(emotions[Math.floor(Math.random() * emotions.length)]);
    }, 1500);
  });
};
