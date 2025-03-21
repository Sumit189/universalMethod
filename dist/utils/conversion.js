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
export async function convertToType(responseText, returnType, retryCount = 0, originalQuery = '', model = '', apiKey = '', modelOptions = {}) {
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
                const { callOpenAI } = await import('../services/openai');
                retryResponse = await callOpenAI(retryPrompt, apiKey, modelOptions);
            }
            else if (model.toLowerCase().includes('gemini')) {
                const { callGemini } = await import('../services/gemini');
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
export function getDefaultValue(returnType) {
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
