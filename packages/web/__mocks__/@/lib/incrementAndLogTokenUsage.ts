export const incrementAndLogTokenUsage = jest.fn().mockResolvedValue({
  remaining: 1000000,
  usageError: false,
  needsUpgrade: false,
});

