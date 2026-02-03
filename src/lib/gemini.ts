export const getGeminiResponse = async (userPrompt: string) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch from API');
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("UDoc API Error:", error);
    
    if (error.message?.includes("API key not configured")) {
      return "Error: API Key is not configured on the server. Please check Vercel settings.";
    }
    
    return `I'm sorry, I'm having trouble connecting to the medical database. (Error: ${error.message || "Unknown error"})`;
  }
};
