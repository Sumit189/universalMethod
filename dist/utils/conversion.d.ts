import { ReturnType } from '../types';
export declare function convertToType(responseText: string, returnType: ReturnType, retryCount?: number, originalQuery?: string, model?: string, apiKey?: string, modelOptions?: any): Promise<unknown>;
export declare function getDefaultValue(returnType: ReturnType): unknown;
