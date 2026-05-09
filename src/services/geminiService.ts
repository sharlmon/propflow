import { GoogleGenAI, Type } from '@google/genai';

// Improvement: Handle missing API key gracefully
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // Use Vite env var
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateLeaseSummary(leaseText: string): Promise<string> {
  if (!ai) {
    return 'AI service is not configured (Missing API Key).';
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Updated to latest stable or preview if available, user had 1.5-flash-preview but @google/genai suggests using newer
      contents: `Please summarize the following lease agreement into key bullet points (Rent, Duration, Late Fees, Rules): \n\n${leaseText}`,
      config: {
        systemInstruction: 'You are a legal assistant specializing in real estate. Be concise and accurate.',
      },
    });
    return response.text || 'Failed to generate summary.';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'Failed to generate summary due to an error.';
  }
}

export async function analyzeMaintenanceTriage(
  description: string,
): Promise<{ priority: string; advice: string }> {
  if (!ai) {
    // Mock response if no key
    return { priority: 'Medium', advice: 'AI processing unavailable. Please assess manually.' };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Analyze this maintenance request and suggest a priority level (Emergency, High, Medium, Low) and a short triage advice: "${description}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING },
            advice: { type: Type.STRING },
          },
          required: ['priority', 'advice'],
        },
      },
    });

    // @google/genai returns parsed object for JSON responses usually, but let's be safe
    const text = response.text;
    if (text) {
      try {
        return JSON.parse(text);
      } catch {
        return { priority: 'Medium', advice: 'Failed to parse AI response.' };
      }
    }
    return { priority: 'Medium', advice: 'No response from AI.' };
  } catch (error) {
    console.error('Gemini Error:', error);
    return { priority: 'Medium', advice: 'Error during analysis.' };
  }
}
