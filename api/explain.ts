import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. CORS Headers (Standard for Vercel/Next.js API routes)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle Preflight Options
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 4. API Key Check
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Config Error: API Key missing' });
  }

  try {
    const { mnemonic, meaning, category } = req.body;

    // 5. Initialize the NEW SDK
    const ai = new GoogleGenAI({ apiKey });

    // 6. System Persona
    const systemInstruction = `You are a top-tier Clinical Nursing Instructor helping a student master a specific medical mnemonic.
    
    Structure your response with these exact sections (use bold labels like **Label:**, do not use markdown headers like #):
    
    1. **Clinical Application:** Explain when and why we use this assessment or intervention in a hospital setting.
    2. **Memory Hook:** Give a clever trick, visualization, or rhyme to make it stick forever.
    3. **Board Exam Alert:** Identify one common trick question, 'Red Flag', or priority nursing action related to this topic.

    Tone: Professional, high-yield, and concise (max 250 words total).`;

    const prompt = `
      Mnemonic: ${mnemonic}
      Category: ${category}
      Meaning: ${meaning}

      Provide a clinical deep dive.
    `;

    // 7. Call Gemini 3 (or fallback to 1.5 Pro if 3 is unstable)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Latest preview model
      contents: prompt,
      config: {
        systemInstruction: systemInstruction, // Correct syntax for new SDK
        temperature: 0.7,
      }
    });

    // 8. Return text
    return res.status(200).json({ text: response.text() }); // Note: response.text() is a function in some versions, or response.text in others. The new SDK usually returns an object where you access .text 

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Failed to generate explanation.", 
      details: error.message 
    });
  }
}
