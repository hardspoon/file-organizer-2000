import { trackLoopsEvent } from './loops';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('trackLoopsEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LOOPS_API_KEY = 'test-loops-key';
  });

  afterEach(() => {
    delete process.env.LOOPS_API_KEY;
  });

  describe('Happy Path', () => {
    it('should send event to Loops API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        userId: 'user_123',
        eventName: 'subscription_created',
        data: {
          plan: 'pro',
          billingCycle: 'monthly',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://app.loops.so/api/v1/events/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-loops-key',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            eventName: 'subscription_created',
            userId: 'user_123',
            firstName: 'John',
            lastName: 'Doe',
            userGroup: 'StripeCustomers',
            plan: 'pro',
            billingCycle: 'monthly',
          }),
        }
      );
    });

    it('should handle minimal event data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'event_name',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://app.loops.so/api/v1/events/send',
        expect.objectContaining({
          body: JSON.stringify({
            email: 'test@example.com',
            eventName: 'event_name',
            userId: 'user_123',
            firstName: undefined,
            lastName: undefined,
            userGroup: 'StripeCustomers',
          }),
        })
      );
    });

    it('should include custom data in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'custom_event',
        data: {
          customField1: 'value1',
          customField2: 123,
          customField3: true,
        },
      });

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.customField1).toBe('value1');
      expect(body.customField2).toBe(123);
      expect(body.customField3).toBe(true);
    });

    it('should always include userGroup as StripeCustomers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'event',
      });

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.userGroup).toBe('StripeCustomers');
    });
  });

  describe('Error Handling', () => {
    it('should log error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'event',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Loops tracking failed:',
        'Bad Request'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not throw when network error occurs', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw
      await expect(
        trackLoopsEvent({
          email: 'test@example.com',
          userId: 'user_123',
          eventName: 'event',
        })
      ).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error tracking Loops event:',
        networkError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing LOOPS_API_KEY gracefully', async () => {
      delete process.env.LOOPS_API_KEY;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'event',
      });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: '',
        userId: 'user_123',
        eventName: 'event',
      });

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.email).toBe('');
    });

    it('should handle missing optional fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'event',
        // No firstName, lastName, or data
      });

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.firstName).toBeUndefined();
      expect(body.lastName).toBeUndefined();
    });

    it('should handle empty data object', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Success'),
      });

      await trackLoopsEvent({
        email: 'test@example.com',
        userId: 'user_123',
        eventName: 'event',
        data: {},
      });

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      // Should only have standard fields, no extra data fields
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('eventName');
      expect(body).toHaveProperty('userId');
      expect(body).toHaveProperty('userGroup');
    });
  });
});

