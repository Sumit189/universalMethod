'use strict';

var OpenAI = require('openai');
var generativeAi = require('@google/generative-ai');

function generatePrompt(query, returnType) {
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
function getTypeString(returnType) {
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
function getConversionRules(returnType) {
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

function getTypeName(returnType) {
    if (returnType === String)
        return 'string';
    if (returnType === Number)
        return 'number';
    if (returnType === Boolean)
        return 'boolean';
    if (returnType === Array)
        return 'array';
    if (returnType === Object)
        return 'object';
    return 'unknown';
}
async function convertToType(responseText, returnType, retryCount = 0, originalQuery = '', model = '', apiKey = '', modelOptions = {}) {
    try {
        // Clean response text by removing ```json tags if present
        const cleanedResponse = responseText.replace(/^```json\n|\n```$/g, '');
        if (returnType === String) {
            return cleanedResponse;
        }
        if (returnType === Number) {
            const cleanedNumber = cleanedResponse.replace(/[^\d.-]/g, '');
            const number = parseFloat(cleanedNumber);
            if (isNaN(number)) {
                throw new Error('Could not convert response to number');
            }
            return number;
        }
        if (returnType === Boolean) {
            const lowercaseResponse = cleanedResponse.toLowerCase().trim();
            if (['true', 'yes', '1'].includes(lowercaseResponse)) {
                return true;
            }
            else if (['false', 'no', '0'].includes(lowercaseResponse)) {
                return false;
            }
            throw new Error('Could not convert response to boolean');
        }
        if (returnType === Object || returnType === Array) {
            const parsedJson = JSON.parse(cleanedResponse);
            if (returnType === Array && !Array.isArray(parsedJson)) {
                throw new Error('Response is not an array');
            }
            if (returnType === Object && (Array.isArray(parsedJson) || typeof parsedJson !== 'object')) {
                throw new Error('Response is not an object');
            }
            return parsedJson;
        }
        if (typeof returnType === 'function') {
            try {
                const parsedData = JSON.parse(cleanedResponse);
                return new returnType(parsedData);
            }
            catch {
                return new returnType(cleanedResponse);
            }
        }
        return cleanedResponse;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        process.stderr.write(`Type conversion error: ${errorMessage}\n`);
        if (retryCount < 2 && originalQuery && model && apiKey) {
            const typeName = getTypeName(returnType);
            const retryPrompt = `
        Previous attempt failed with error: "${errorMessage}"
        Original query: "${originalQuery}"
        Expected return type: ${typeName}
        
        Please fix your response to match the expected type. Your response must be ${typeName} without any additional text, explanations, or formatting.
        Just provide the direct answer that can be parsed as ${typeName}.
      `;
            let retryResponse;
            if (model.toLowerCase().includes('openai')) {
                const { callOpenAI } = await Promise.resolve().then(function () { return openai; });
                retryResponse = await callOpenAI(retryPrompt, apiKey, modelOptions);
            }
            else if (model.toLowerCase().includes('gemini')) {
                const { callGemini } = await Promise.resolve().then(function () { return gemini; });
                retryResponse = await callGemini(retryPrompt, apiKey, modelOptions);
            }
            else {
                throw new Error(`Unsupported model: ${model}`);
            }
            return convertToType(retryResponse, returnType, retryCount + 1, originalQuery, model, apiKey, modelOptions);
        }
        return getDefaultValue(returnType);
    }
}
function getDefaultValue(returnType) {
    if (returnType === Number)
        return 0;
    if (returnType === Boolean)
        return false;
    if (returnType === Array)
        return [];
    if (returnType === Object)
        return {};
    if (returnType === String)
        return '';
    return null;
}

async function callOpenAI(prompt, apiKey, options) {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
        model: options.model,
        messages: [
            { role: 'system', content: 'You are a function simulator, you strictly need to respond to user query without adding anything extra. Stick to it.' },
            { role: 'user', content: prompt }
        ],
        temperature: options.temperature,
    });
    return response.choices[0].message.content?.trim() || '';
}

var openai = /*#__PURE__*/Object.freeze({
  __proto__: null,
  callOpenAI: callOpenAI
});

async function callGemini(prompt, apiKey, options) {
    const genAI = new generativeAi.GoogleGenerativeAI(apiKey);
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

var gemini = /*#__PURE__*/Object.freeze({
  __proto__: null,
  callGemini: callGemini
});

async function universalMethod(query, returnType = String, options = {}) {
    try {
        if (typeof query !== 'string') {
            throw new Error('Query must be a string');
        }
        if (![String, Number, Boolean, Object, Array].includes(returnType) &&
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
        let responseText;
        if (model.toLowerCase().includes('openai')) {
            responseText = await callOpenAI(prompt, apiKey, modelOptions);
        }
        else if (model.toLowerCase().includes('gemini')) {
            responseText = await callGemini(prompt, apiKey, modelOptions);
        }
        else {
            throw new Error(`Unsupported model: ${model}. Please use 'openai' or 'gemini'.`);
        }
        return convertToType(responseText, returnType, 0, query, model, apiKey, modelOptions);
    }
    catch (error) {
        process.stderr.write(`UniversalMethod Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        return getDefaultValue(returnType);
    }
}

exports.universalMethod = universalMethod;
//# sourceMappingURL=index.js.map
