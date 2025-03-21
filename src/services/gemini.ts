import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIModelOptions } from '../types';

export async function callGemini(prompt: string, apiKey: string, options: AIModelOptions): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const generativeModel = genAI.getGenerativeModel({ model: options.model });
  const result = await generativeModel.generateContent({
    contents: [
      { role: 'system', parts: [{ text: 'You are a function simulator, you strictly need to respond to user query without adding anything extra. Stick to it.' }] },
      { role: 'user', parts: [{ text: prompt }] }
    ],
    generationConfig: { temperature: options.temperature },
  });

  return result.response.text().trim();
} 