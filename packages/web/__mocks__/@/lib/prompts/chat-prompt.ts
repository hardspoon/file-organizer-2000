export const getChatSystemPrompt = jest.fn((contextString: string, currentDatetime: string) => {
  return `You are a helpful assistant. Context: ${contextString}. Current time: ${currentDatetime}`;
});

