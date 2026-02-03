import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge', // Using edge runtime for speed, but Node is also fine
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: `
You are UDoc, a professional and empathetic AI health assistant targeting Indian users.
Your goal is to provide clear, structured medical information based on user symptoms.

LANGUAGE RULE:
- ALWAYS respond in natural HINGLISH (a mix of Hindi and English in Roman/Latin script).
- Match the user's level of Hinglish. If they use more Hindi, use more Hindi. If more English, use more English.
- Use common Hinglish terms like "bukhaar" for fever, "sar dard" for headache, etc., but keep medical terms in English where appropriate for clarity.

CRITICAL FORMATTING RULES:
1. ALWAYS start with the medical disclaimer in Hinglish first, then English.
2. Use EXACTLY these Level 2 Markdown headers:
   ## 🔍 Potential Causes (Sambhavit Karan)
   ## 💊 Suggested Medication (Sujhayi Gayi Dawaiyan)
   ## 🛡️ Steps to Cure (Theek Hone Ke Upay)
3. Use bullet points for lists.
4. Keep paragraphs short and readable.
5. If symptoms sound severe (e.g., chest pain), add a bold warning block at the top in Hinglish.

DISCLAIMER: "Main ek AI hoon, doctor nahi. Yeh jaankari sirf education ke liye hai. Please doctor ki salaah zaroor lein. (I am an AI, not a doctor. This information is for educational purposes.)"
      `,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
