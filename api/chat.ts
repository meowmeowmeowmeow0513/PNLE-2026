import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. CORS Headers (Optional, but good for local dev setups depending on proxy)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Method Check
  if (req.method !== 'POST') {
    console.error(`[API] Invalid Method: ${req.method}`);
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 3. API Key Check
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY; // Fallback to standard API_KEY if specific one missing
  console.log(`[API] Checking API Key presence: ${!!apiKey}`);

  if (!apiKey) {
    console.error('[API] CRITICAL: GEMINI_API_KEY is missing in environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: API Key missing.' });
  }

  try {
    // 4. Input Validation
    const { messages } = req.body;
    console.log(`[API] Received request with ${messages?.length || 0} messages.`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request body. "messages" array required.' });
    }

    // 5. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // 6. Define System Persona
    const systemInstruction = `You are a strict but encouraging Clinical Nursing Instructor for PNLE candidates.
    1. If the student asks a test question or for a direct answer, DO NOT give it. Instead, ask guiding questions like "What is the priority assessment here?" or "Apply the ABCs."
    2. Use high-yield Mnemonics (e.g., MONA, BUBBLE-HE, ADPIE) to explain concepts whenever relevant.
    3. Keep responses concise (under 4 sentences) unless explicitly asked to elaborate.
    4. Be professional, academic, but supportive. Use phrases like "Batch Spirit" or "Future RN".`;

    // 7. Format History for Gemini
    // We take the last message as the prompt, and the rest as history if needed.
    // For simplicity and robustness with the specific 2.5/1.5 models, we will generate content based on the conversation flow.
    // We will construct a prompt chain.
    
    const lastMessage = messages[messages.length - 1];
    
    // Construct a "chat" context string from previous messages to maintain context state-lessly
    // (Optimization: In a production app, you might use 'contents' with role mapping, but text concatenation is robust for simple turns)
    let contextPrompt = "";
    if (messages.length > 1) {
        contextPrompt = "PREVIOUS CONVERSATION HISTORY:\n";
        messages.slice(0, -1).forEach((m: any) => {
            contextPrompt += `${m.role === 'user' ? 'Student' : 'Instructor'}: ${m.text}\n`;
        });
        contextPrompt += "\nCURRENT QUESTION:\n";
    }
    
    const finalPrompt = `${contextPrompt}${lastMessage.text}`;

    console.log('[API] Sending request to Gemini...');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Or gemini-1.5-flash
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // 8. Extract Response
    const text = response.text;
    console.log('[API] Success! Generated response length:', text?.length);

    return res.status(200).json({ text: text });

  } catch (error: any) {
    console.error('[API] Execution Error:', error);
    
    // Robust Error Response
    const errorMessage = error.message || 'An unexpected error occurred processing your request.';
    return res.status(500).json({ 
        error: errorMessage,
        details: error.toString() 
    });
  }
}
