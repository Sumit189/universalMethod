import OpenAI from 'openai';
export async function callOpenAI(prompt, apiKey, options) {
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
