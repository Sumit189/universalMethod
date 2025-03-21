import { ReturnType, UniversalMethodOptions } from './types';
import { generatePrompt } from './utils/prompt';
import { convertToType, getDefaultValue } from './utils/conversion';
import { callOpenAI } from './services/openai';
import { callGemini } from './services/gemini';

export async function universalMethod(
  query: string,
  returnType: ReturnType = String,
  options: UniversalMethodOptions = {}
): Promise<unknown> {
  try {
    if (typeof query !== 'string') {
      throw new Error('Query must be a string');
    }

    if (![String, Number, Boolean, Object, Array].includes(returnType as any) && 
        typeof returnType !== 'function') {
      throw new Error('Invalid return type');
    }

    const model = process.env.UNIVERSAL_METHOD_MODEL || 'openai';
    const apiKey = process.env.UNIVERSAL_METHOD_KEY;

    if (!apiKey) {
      throw new Error('API key not found. Please set UNIVERSAL_METHOD_KEY in environment variables.');
    }

    const prompt = generatePrompt(query, returnType);
    const modelOptions = {
      model: options.model || (model.toLowerCase().includes('openai') ? 'gpt-4o' : 'gemini-2.0-flash'),
      temperature: options.temperature || 0.3
    };
    
    let responseText: string;
    if (model.toLowerCase().includes('openai')) {
      responseText = await callOpenAI(prompt, apiKey, modelOptions);
    } else if (model.toLowerCase().includes('gemini')) {
      responseText = await callGemini(prompt, apiKey, modelOptions);
    } else {
      throw new Error(`Unsupported model: ${model}. Please use 'openai' or 'gemini'.`);
    }

    return convertToType(responseText, returnType, 0, query, model, apiKey, modelOptions);
  } catch (error) {
    process.stderr.write(`UniversalMethod Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return getDefaultValue(returnType);
  }
}

export * from './types'; 