// Mock tiktoken init for testing

let mockEncoding: any = null;

export function init(instantiateFn: any): Promise<void> {
  return Promise.resolve().then(() => {
    mockEncoding = {
      encode: (text: string) => {
        // Simple mock: approximate token count (roughly 1 token per 4 characters)
        return new Array(Math.ceil(text.length / 4));
      },
      free: () => {
        mockEncoding = null;
      },
    };
  });
}

export function get_encoding(name: string): any {
  if (!mockEncoding) {
    throw new Error('Encoding not initialized');
  }
  return mockEncoding;
}

