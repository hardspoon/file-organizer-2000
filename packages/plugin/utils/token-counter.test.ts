import { initializeTokenCounter, getTokenCount, cleanup } from './token-counter';

// Mock tiktoken
jest.mock('tiktoken/init', () => {
  let mockEncoding: any = null;

  return {
    init: jest.fn((instantiateFn: any) => {
      return Promise.resolve().then(() => {
        mockEncoding = {
          encode: jest.fn((text: string) => {
            // Simple mock: approximate token count (roughly 1 token per 4 characters)
            // This is a simplified approximation for testing
            const tokens = Math.ceil(text.length / 4);
            return new Array(tokens);
          }),
          free: jest.fn(() => {
            mockEncoding = null;
          }),
        };
      });
    }),
    get_encoding: jest.fn((name: string) => {
      if (!mockEncoding) {
        throw new Error('Encoding not initialized');
      }
      return mockEncoding;
    }),
  };
});

describe('token-counter', () => {
  beforeEach(() => {
    // Clean up before each test
    cleanup();
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  describe('initializeTokenCounter', () => {
    it('should initialize token counter successfully', async () => {
      await initializeTokenCounter();

      // Should be able to get token count after initialization
      const count = getTokenCount('test');
      expect(count).toBeGreaterThan(0);
    });

    it('should return the same promise if called multiple times during initialization', async () => {
      const promise1 = initializeTokenCounter();
      const promise2 = initializeTokenCounter();

      expect(promise1).toBe(promise2);

      await promise1;
      await promise2;
    });

    it('should handle initialization errors', async () => {
      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { init } = require('tiktoken/init');
      (init as jest.Mock).mockRejectedValueOnce(new Error('Initialization failed'));

      await expect(initializeTokenCounter()).rejects.toThrow('Initialization failed');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing tiktoken:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTokenCount', () => {
    beforeEach(async () => {
      await initializeTokenCounter();
    });

    it('should return token count for simple text', () => {
      const count = getTokenCount('hello world');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for empty string', () => {
      const count = getTokenCount('');
      expect(count).toBe(0);
    });

    it('should handle long text', () => {
      const longText = 'a'.repeat(1000);
      const count = getTokenCount(longText);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle text with special characters', () => {
      const specialText = 'Hello, world! @#$%^&*()';
      const count = getTokenCount(specialText);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle text with newlines', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      const count = getTokenCount(multilineText);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const unicodeText = 'Hello 世界 🌍';
      const count = getTokenCount(unicodeText);
      expect(count).toBeGreaterThan(0);
    });

    it('should throw error if not initialized', () => {
      cleanup();

      expect(() => getTokenCount('test')).toThrow(
        'Token counter not initialized. Call initializeTokenCounter() first.'
      );
    });

    it('should return consistent counts for same input', () => {
      const text = 'This is a test string';
      const count1 = getTokenCount(text);
      const count2 = getTokenCount(text);

      expect(count1).toBe(count2);
    });
  });

  describe('cleanup', () => {
    it('should cleanup encoding and reset state', async () => {
      await initializeTokenCounter();
      getTokenCount('test'); // Use it

      cleanup();

      // Should throw error after cleanup
      expect(() => getTokenCount('test')).toThrow(
        'Token counter not initialized. Call initializeTokenCounter() first.'
      );
    });

    it('should allow re-initialization after cleanup', async () => {
      await initializeTokenCounter();
      cleanup();

      // Should be able to initialize again
      await initializeTokenCounter();
      const count = getTokenCount('test');
      expect(count).toBeGreaterThan(0);
    });

    it('should be safe to call multiple times', () => {
      cleanup();
      cleanup();
      cleanup();
      // Should not throw
    });
  });

  describe('integration', () => {
    it('should work with full workflow: init -> count -> cleanup -> init -> count', async () => {
      // First cycle
      await initializeTokenCounter();
      const count1 = getTokenCount('first test');
      expect(count1).toBeGreaterThan(0);

      cleanup();

      // Second cycle
      await initializeTokenCounter();
      const count2 = getTokenCount('second test');
      expect(count2).toBeGreaterThan(0);

      cleanup();
    });

    it('should handle rapid initialization and cleanup', async () => {
      for (let i = 0; i < 5; i++) {
        await initializeTokenCounter();
        getTokenCount(`test ${i}`);
        cleanup();
      }

      // Final initialization should work
      await initializeTokenCounter();
      const count = getTokenCount('final test');
      expect(count).toBeGreaterThan(0);
    });
  });
});

