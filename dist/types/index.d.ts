export type ReturnType = String | Number | Boolean | Object | Array<unknown> | Function;
export type AIModel = 'openai' | 'gemini';
export interface UniversalMethodOptions {
    model?: string;
    temperature?: number;
}
export interface AIModelOptions {
    model: string;
    temperature: number;
}
