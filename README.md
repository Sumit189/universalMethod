# Universal Method

A powerful package that converts natural language queries into typed responses using AI. Supports both OpenAI and Google's Gemini models.

## Features

- Convert natural language queries to typed responses
- Support for multiple AI models (OpenAI and Gemini)
- Type-safe responses (String, Number, Boolean, Object, Array, or custom types)
- Automatic type conversion and validation
- Configurable model options and temperature
- Error handling with appropriate default values
- Automatic retries with error feedback (up to 2 retries)
- No manual logic needed - just ask in natural language!

## Installation

```bash
npm install @sumit-paul/universal-method
```

## Quick Start

```typescript
import { universalMethod } from '@sumit-paul/universal-method';

// Get a typed response for a data transformation
const result = await universalMethod(
  'Convert this date string "2024-03-19" to a more readable format',
  String
);

// Parse and validate JSON data
const data = await universalMethod(
  'Parse this JSON string: {"name": "John", "age": 30}',
  Object
);

// Extract specific information
const numbers = await universalMethod(
  'Extract all numbers from this text: "The price is $99.99 and quantity is 5"',
  Array
);

// Validate boolean conditions
const isValid = await universalMethod(
  'Check if "test@example.com" is a valid email address',
  Boolean
);

// Custom options
const custom = await universalMethod('Complex query', String, {
  model: 'gpt-4',
  temperature: 0.7
});
```

## Error Handling and Retries

Universal Method includes automatic retry functionality when type conversion fails:

```typescript
// If the AI response can't be converted to the expected type,
// the system will automatically retry up to 2 times with error feedback
const result = await universalMethod(
  'Give me a number between 1 and 10',
  Number
);

// If all retries fail, it returns the appropriate default value:
// - 0 for Number
// - false for Boolean
// - [] for Array
// - {} for Object
// - '' for String
// - null for custom types
```

The retry system:
1. Logs the conversion error to stderr
2. Creates a new prompt that includes:
   - The original query
   - The error message
   - The expected return type
3. Makes up to 2 retry attempts
4. Returns the default value if all retries fail

## Examples

### 1. Data Parsing and Validation
```typescript
// Parse complex JSON structures
const parsedData = await universalMethod(
  'Parse this nested JSON: {"user": {"name": "John", "settings": {"theme": "dark"}}}',
  Object
);

// Validate data format
const isValidFormat = await universalMethod(
  'Check if "2024-03-19T10:00:00Z" is a valid ISO date string',
  Boolean
);
```

### 2. Text Processing
```typescript
// Extract structured data from text
const extractedData = await universalMethod(
  'Extract name, email, and phone from: "Contact John at john@example.com or 123-456-7890"',
  Object
);

// Format text according to rules
const formattedText = await universalMethod(
  'Format this text as a proper title: "the quick brown fox jumps over the lazy dog"',
  String
);
```

### 3. Data Transformation
```typescript
// Convert between data formats
const convertedData = await universalMethod(
  'Convert this CSV row to JSON: "name,age,city\nJohn,30,New York"',
  Object
);

// Transform data structure
const transformedData = await universalMethod(
  'Transform this array of objects to group by category: [{"name": "Item1", "category": "A"}, {"name": "Item2", "category": "A"}]',
  Object
);
```

### 4. Data Validation
```typescript
// Validate data against rules
const validationResult = await universalMethod(
  'Check if this password meets security requirements: "Password123!"',
  Object
);

// Validate business rules
const businessValidation = await universalMethod(
  'Check if order total $150 with 10% discount is valid for free shipping (threshold: $100)',
  Boolean
);
```

### 5. Data Extraction
```typescript
// Extract specific information
const extractedInfo = await universalMethod(
  'Extract all URLs from this text: "Visit https://example.com or http://test.com"',
  Array
);

// Parse complex strings
const parsedInfo = await universalMethod(
  'Parse this log entry: "[2024-03-19 10:00:00] ERROR: Connection failed (code: 404)"',
  Object
);
```

## Why Universal Method?

Universal Method eliminates the need for writing complex manual logic. Instead of:
- Writing regex patterns for text manipulation
- Implementing complex data parsing logic
- Creating validation functions
- Building data transformation utilities
- Writing string manipulation code

Just ask in natural language and get typed responses!

## Configuration

Set the following environment variables:

```env
UNIVERSAL_METHOD_KEY=your_api_key_here
UNIVERSAL_METHOD_MODEL=openai  # or 'gemini'
```

## API

### `universalMethod(query: string, returnType?: ReturnType, options?: UniversalMethodOptions): Promise<unknown>`

- `query`: The natural language query to process
- `returnType`: The expected return type (String, Number, Boolean, Object, Array, or custom constructor)
- `options`: Optional configuration
  - `model`: Override the default AI model
  - `temperature`: Control response randomness (0.0 to 1.0)

The function will automatically retry up to 2 times if type conversion fails, providing error feedback to the AI model.

## Best Practices

1. **Type Safety**: Always specify the return type for better type inference and validation
2. **Error Handling**: Wrap calls in try-catch blocks for graceful error handling
3. **Temperature**: Adjust temperature based on your needs:
   - Lower (0.1-0.3): More consistent, factual responses
   - Higher (0.7-0.9): More creative, varied responses
4. **Model Selection**: Choose the appropriate model based on your use case:
   - GPT-4: Complex reasoning, detailed responses
   - GPT-3.5: General purpose, faster responses
   - Gemini: Alternative option with good performance

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Type checking
npm run typecheck
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you find this package useful, consider buying me a coffee:
<p>
  <a href="https://buymeacoffee.com/sumit189">
    <img src="./assets/black-button.png" alt="Buy Me A Coffee" width="300"/>
  </a>
</p>