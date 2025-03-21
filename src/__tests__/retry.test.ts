import { universalMethod } from '../index';
import { callOpenAI } from '../services/openai';
import { callGemini } from '../services/gemini';

// Mock the AI service calls
jest.mock('../services/openai');
jest.mock('../services/gemini');

describe('Retry Functionality', () => {
  beforeEach(() => {
    process.env.UNIVERSAL_METHOD_KEY = 'test-key';
    process.env.UNIVERSAL_METHOD_MODEL = 'openai';
    jest.clearAllMocks();
  });

  describe('Number Conversion Retries', () => {
    test('retries when number conversion fails', async () => {
      // Mock responses: first fails, second succeeds
      (callOpenAI as jest.Mock)
        .mockResolvedValueOnce('not a number')
        .mockResolvedValueOnce('42');

      const result = await universalMethod('Give me a number', Number);
      
      expect(result).toBe(42);
      expect(callOpenAI).toHaveBeenCalledTimes(2);
      
      // Check if retry prompt contains error information
      const retryCall = (callOpenAI as jest.Mock).mock.calls[1];
      expect(retryCall[0]).toContain('Previous attempt failed');
      expect(retryCall[0]).toContain('Could not convert response to number');
    });

    test('returns default value after max retries', async () => {
      // Mock responses: all fail
      (callOpenAI as jest.Mock)
        .mockResolvedValueOnce('not a number')
        .mockResolvedValueOnce('still not a number')
        .mockResolvedValueOnce('still not a number');

      const result = await universalMethod('Give me a number', Number);
      
      expect(result).toBe(0); // Default value for Number
      expect(callOpenAI).toHaveBeenCalledTimes(3);
    });
  });

  describe('Boolean Conversion Retries', () => {
    test('retries when boolean conversion fails', async () => {
      // Mock responses: first fails, second succeeds
      (callOpenAI as jest.Mock)
        .mockResolvedValueOnce('maybe')
        .mockResolvedValueOnce('true');

      const result = await universalMethod('Is it true?', Boolean);
      
      expect(result).toBe(true);
      expect(callOpenAI).toHaveBeenCalledTimes(2);
      
      // Check if retry prompt contains error information
      const retryCall = (callOpenAI as jest.Mock).mock.calls[1];
      expect(retryCall[0]).toContain('Previous attempt failed');
      expect(retryCall[0]).toContain('Could not convert response to boolean');
    });
  });

  describe('JSON Conversion Retries', () => {
    test('retries when JSON parsing fails', async () => {
      // Mock responses: first fails, second succeeds
      (callOpenAI as jest.Mock)
        .mockResolvedValueOnce('invalid json')
        .mockResolvedValueOnce('{"name": "John"}');

      const result = await universalMethod('Give me a JSON object', Object);
      
      expect(result).toEqual({ name: 'John' });
      expect(callOpenAI).toHaveBeenCalledTimes(2);
    });

    test('retries when array type validation fails', async () => {
      // Mock responses: first fails (object instead of array), second succeeds
      (callOpenAI as jest.Mock)
        .mockResolvedValueOnce('{"items": [1, 2]}')
        .mockResolvedValueOnce('[1, 2, 3]');

      const result = await universalMethod('Give me an array', Array);
      
      expect(result).toEqual([1, 2, 3]);
      expect(callOpenAI).toHaveBeenCalledTimes(2);
    });
  });

  describe('Gemini Model Retries', () => {
    beforeEach(() => {
      process.env.UNIVERSAL_METHOD_MODEL = 'gemini';
    });

    test('retries with Gemini model', async () => {
      // Mock responses: first fails, second succeeds
      (callGemini as jest.Mock)
        .mockResolvedValueOnce('not a number')
        .mockResolvedValueOnce('42');

      const result = await universalMethod('Give me a number', Number);
      
      expect(result).toBe(42);
      expect(callGemini).toHaveBeenCalledTimes(2);
    });
  });
}); 