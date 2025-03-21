import { universalMethod } from '../index';

describe('Real API Tests', () => {
  // Skip these tests if no API key is provided
  const apiKey = process.env.UNIVERSAL_METHOD_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    test.skip('Skipping real API tests - no API key provided', () => {});
    return;
  }

  describe('Number Conversion', () => {
    test('converts simple arithmetic to number', async () => {
      const result = await universalMethod('What is 5 plus 7?', Number);
      expect(typeof result).toBe('number');
      expect(result).toBe(12);
    });

    test('handles decimal numbers', async () => {
      const result = await universalMethod('What is 10 divided by 4?', Number);
      expect(typeof result).toBe('number');
      expect(result).toBe(2.5);
    });
  });

  describe('Boolean Conversion', () => {
    test('evaluates simple true condition', async () => {
      const result = await universalMethod('Is 5 greater than 3?', Boolean);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    test('evaluates simple false condition', async () => {
      const result = await universalMethod('Is 2 greater than 5?', Boolean);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });

  describe('Array Conversion', () => {
    test('generates simple number array', async () => {
      const result = await universalMethod('Give me the first 3 prime numbers', Array);
      expect(Array.isArray(result)).toBe(true);
      expect(result as number[]).toEqual([2, 3, 5]);
    });

    test('generates string array', async () => {
      const result = await universalMethod('List the first three months of the year', Array);
      expect(Array.isArray(result)).toBe(true);
      expect(result as string[]).toEqual(['January', 'February', 'March']);
    });
  });

  describe('Object Conversion', () => {
    test('creates simple person object', async () => {
      const result = await universalMethod(
        'Create an object with name John and age 30',
        Object
      );
      expect(typeof result).toBe('object');
      expect(result as { name: string; age: number }).toEqual({ name: 'John', age: 30 });
    });

    test('creates nested object', async () => {
      const result = await universalMethod(
        'Create an object for a user with name John and address object containing city New York',
        Object
      );
      expect(typeof result).toBe('object');
      expect(result as { name: string; address: { city: string } }).toEqual({
        name: 'John',
        address: {
          city: 'New York'
        }
      });
    });
  });

  describe('String Conversion', () => {
    test('formats text properly', async () => {
      const result = await universalMethod(
        'Convert "hello world" to title case',
        String
      );
      expect(typeof result).toBe('string');
      expect((result as string).toLowerCase()).toBe('hello world');
    });
  });

  describe('Error Handling and Retries', () => {
    test('handles invalid number response with retry', async () => {
      const result = await universalMethod(
        'What is your favorite color?',
        Number
      );
      // Should eventually return default value after retries
      expect(typeof result).toBe('number');
      expect(result).toBe(0);
    });

    test('handles invalid boolean response with retry', async () => {
      const result = await universalMethod(
        'Tell me about your day',
        Boolean
      );
      // Should eventually return default value after retries
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });
}); 