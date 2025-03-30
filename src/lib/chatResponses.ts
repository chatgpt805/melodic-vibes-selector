
interface ChatResponse {
  keywords: string[];
  response: string;
}

export const predefinedResponses: ChatResponse[] = [
  {
    keywords: ["who", "made", "developed", "creator", "build"],
    response: "VidAI was developed as a music discovery platform that combines the power of AI with a beautiful Ghibli-inspired interface. The development team focused on creating an immersive experience for music lovers around the world."
  },
  {
    keywords: ["what", "is", "vidai", "about", "purpose"],
    response: "VidAI is an AI-powered music discovery platform designed to help you explore music from different cultures and regions. I can help you find music based on your mood, preferences, or even images you share with me."
  },
  {
    keywords: ["help", "how", "use", "features"],
    response: "I can help you discover music in several ways! You can ask me for recommendations based on your mood (like 'I'm feeling happy'), genres (like 'show me some jazz'), or cultural regions (like 'Nepali music'). You can also upload images, and I'll suggest music that matches the vibe!"
  },
  {
    keywords: ["ghibli", "studio", "inspiration", "design"],
    response: "The design of VidAI is inspired by Studio Ghibli's magical and whimsical aesthetic. We wanted to create an atmosphere that feels both dreamy and comforting while you explore new music from around the world."
  },
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    response: "Hello! I'm VidAI, your music discovery assistant. How can I help you discover amazing music today?"
  }
];

export function findChatResponse(userInput: string): string | null {
  const input = userInput.toLowerCase();
  
  for (const item of predefinedResponses) {
    if (item.keywords.some(keyword => input.includes(keyword))) {
      return item.response;
    }
  }
  
  return null;
}
