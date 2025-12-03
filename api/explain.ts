
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing' });
  }

  try {
    const { mnemonic, meaning, category } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    // System Persona: High-tier Clinical Instructor
    const systemInstruction = `You are a top-tier Clinical Nursing Instructor helping a student master a specific medical mnemonic.
    
    Structure your response with these exact sections (do not use markdown headers like # or ##, just bold labels):
    1. **Clinical Application:** Explain *when* and *why* we use this assessment or intervention in a hospital setting.
    2. **Memory Hook:** Give a clever trick, visualization, or rhyme to make it stick forever.
    3. **Board Exam Alert:** Identify one common trick question, 'Red Flag', or priority nursing action related to this topic that appears on the PNLE/NCLEX.

    Tone: Professional, high-yield, and concise (max 250 words total).
    Format: Plain text with bolding for emphasis. No JSON.`;

    const prompt = `
      Mnemonic: ${mnemonic}
      Category: ${category}
      Meaning: ${meaning}

      Provide a clinical deep dive.
    `;

    // Using gemini-3-pro-preview for complex reasoning tasks (closest equivalent to 1.5 Pro for this SDK context)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate explanation." });
  }
}
