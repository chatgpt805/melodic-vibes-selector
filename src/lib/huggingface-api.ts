
// This file integrates with the Hugging Face API for AI-powered recommendations

// Hugging Face API configuration
const HUGGINGFACE_API_KEY = "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";
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B";

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

// Process music search query using Hugging Face model
export const processQueryWithAI = async (
  userInput: string
): Promise<string> => {
  try {
    console.log(`Processing query with Hugging Face API: ${userInput}`);
    
    // Craft a prompt for the model
    const prompt = `
Based on this user request: "${userInput}", 
provide a search query for finding music videos. 
If the request is about trending music on a platform like Instagram, TikTok, etc., 
respond with an appropriate search query.
Keep your response focused, concise, and ONLY return the search query text with no additional formatting.
`;

    // Make API call to Hugging Face
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      })
    });

    const data: HuggingFaceResponse = await response.json();
    
    if (data.error) {
      console.error("Hugging Face API error:", data.error);
      // Fall back to the original query if there's an error
      return userInput;
    }

    // Process the response to extract just the search query
    let processedResponse = data.generated_text || "";
    
    // Clean up the response to get just the search query
    // Remove any quotation marks, line breaks and leading/trailing whitespace
    processedResponse = processedResponse.replace(/^["""''']|["""''']$/g, "")
      .split("\n").pop() || "";
    processedResponse = processedResponse.trim();
    
    console.log("Processed AI response:", processedResponse);
    
    return processedResponse || userInput; // fallback to original input if empty
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    // Fall back to the original query in case of error
    return userInput;
  }
};
