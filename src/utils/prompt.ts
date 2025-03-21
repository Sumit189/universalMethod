import { ReturnType } from '../types';

export function generatePrompt(query: string, returnType: ReturnType): string {
  const typeString = getTypeString(returnType);
  const conversionRules = getConversionRules(returnType);
  
  return `
    Please respond to the following query: "${query}"
    
    Important: Your response must be ${typeString} without any additional text, explanations, or formatting.
    Just provide the direct answer that can be parsed as ${typeString}.
    
    Response will be converted using these rules:
    ${conversionRules}
    
    Note: If any conversion error occurs, the function will:
    1. Log the error to stderr
    2. Return a default value based on the returnType
  `;
}

function getTypeString(returnType: ReturnType): string {
  switch (returnType) {
    case Number:
      return 'a number only';
    case Boolean:
      return 'true or false only';
    case Array:
      return 'an array in JSON format';
    case Object:
      return 'an object in JSON format';
    case String:
      return 'a string';
    default:
      return 'a response';
  }
}

function getConversionRules(returnType: ReturnType): string {
  switch (returnType) {
    case Number:
      return '- Response will be cleaned to keep only digits, decimal points, and minus signs\n- Will be converted to a number using parseFloat\n- If conversion fails, will return 0';
    case Boolean:
      return '- Response will be converted to lowercase and trimmed\n- Returns true for: "true", "yes", "1"\n- Returns false for: "false", "no", "0"\n- If conversion fails, will return false';
    case Array:
      return '- Response must be valid JSON array format\n- If not an array or invalid JSON, will return empty array []';
    case Object:
      return '- Response must be valid JSON object format\n- If not an object or invalid JSON, will return empty object {}';
    case String:
      return '- Response will be returned as is\n- If conversion fails, will return empty string ""';
    default:
      return '- Response will be attempted to be parsed as JSON first\n- If JSON parsing fails, will be used as string\n- If conversion fails, will return null';
  }
} 