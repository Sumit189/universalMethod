import { universalMethod } from '../index';

describe('Calculator Examples', () => {
  test('performs complex calculations', async () => {
    const calculations = [
      {
        query: 'If I have 3 apples and eat 2, then buy 4 more, how many do I have?'
      },
      {
        query: 'Calculate 15% tip on a $85.50 restaurant bill'
      },
      {
        query: 'If a train travels at 60mph for 2.5 hours, how far does it go?'
      },
      {
        query: 'What is the area of a circle with radius 7 units?'
      },
      {
        query: 'Convert 32 degrees Fahrenheit to Celsius'
      }
    ];

    for (const { query } of calculations) {
      const result = await universalMethod(query, Number);
      expect(typeof result).toBe('number');
      // We don't check exact values since AI responses might vary
      expect(isFinite(result as number)).toBe(true);
    }
  });
});

describe('Time-Based Greeting Examples', () => {
  test('generates appropriate greetings for different scenarios', async () => {
    const greetings = [
      {
        query: 'Generate a professional greeting for a morning business email to my boss',
        contains: ['morning', 'dear', 'hope']
      },
      {
        query: 'Write a casual afternoon greeting for a friend',
        contains: ['hey', 'hi', 'afternoon']
      },
      {
        query: 'Create a formal evening welcome message for a hotel guest',
        contains: ['evening', 'welcome', 'assist']
      },
      {
        query: 'Make a friendly night time message for social media',
        contains: ['night', 'sweet dreams', 'tomorrow']
      }
    ];

    for (const { query, contains } of greetings) {
      const result = await universalMethod(query, String);
      expect(typeof result).toBe('string');
      // Check if response contains at least one expected word
      expect(
        contains.some(word => 
          (result as string).toLowerCase().includes(word))
      ).toBe(true);
    }
  });

  test('handles multilingual greetings', async () => {
    const multilingualQueries = [
      {
        query: 'Generate a morning greeting in Spanish',
        contains: ['buenos días', 'buen día']
      },
      {
        query: 'Create an evening greeting in French',
        contains: ['bonsoir', 'bonne soirée']
      },
      {
        query: 'Write a good night message in Japanese',
        contains: ['おやすみ', 'お休み']
      }
    ];

    for (const { query, contains } of multilingualQueries) {
      const result = await universalMethod(query, String);
      expect(typeof result).toBe('string');
      expect(
        contains.some(word => 
          (result as string).toLowerCase().includes(word.toLowerCase()))
      ).toBe(true);
    }
  });
});

describe('Advanced Calculator Examples', () => {
  test('handles complex mathematical expressions', async () => {
    const complexCalculations = [
      {
        query: 'If a company grows by 15% each year, how much will $1000 be worth after 3 years?',
        validate: (num: number) => num > 1000 && num < 2000
      },
      {
        query: 'Calculate monthly mortgage payment for a $300,000 loan at 3.5% APR for 30 years',
        validate: (num: number) => num > 1000 && num < 2000
      },
      {
        query: 'What is the probability of rolling two dice and getting a sum of 7?',
        validate: (num: number) => num > 0 && num < 1
      },
      {
        query: 'Calculate the volume of a sphere with radius 5 units',
        validate: (num: number) => num > 500 && num < 600
      }
    ];

    for (const { query, validate } of complexCalculations) {
      const result = await universalMethod(query, Number);
      expect(typeof result).toBe('number');
      expect(validate(result as number)).toBe(true);
    }
  });
});