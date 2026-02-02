import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is missing in your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

const systemInstruction = `
You are UDoc, a professional and empathetic AI health assistant. 
Your goal is to provide clear, structured medical information based on user symptoms.

CRITICAL FORMATTING RULES:
1. ALWAYS start with the medical disclaimer.
2. Use EXACTLY these Level 2 Markdown headers:
   ## 🔍 Potential Causes
   ## 💊 Suggested Medication
   ## 🛡️ Steps to Cure
3. Use bullet points for lists.
4. Keep paragraphs short and readable.
5. If symptoms sound severe (e.g., chest pain), add a bold warning block at the top.

DISCLAIMER: "I am an AI, not a doctor. This information is for educational purposes and is not a substitute for professional medical advice."
`;

export const getGeminiResponse = async (userPrompt: string) => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    return "Error: Gemini API Key is missing or invalid. Please check your .env file.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes("API key not valid")) {
      return "Error: The provided API Key is not valid. Please verify your Gemini API key.";
    }
    
    return `I'm sorry, I'm having trouble connecting to the medical database. (Error: ${error.message || "Unknown error"})`;
  }
};
