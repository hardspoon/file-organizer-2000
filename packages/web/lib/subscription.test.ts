import { getUserSubscriptionStatus, SubscriptionStatus } from './subscription';
import { db } from '@/drizzle/schema';

// Mock dependencies
const mockDbFrom = jest.fn();
const mockDbWhere = jest.fn();
const mockDbLimit = jest.fn();
const mockDbExecute = jest.fn();

jest.mock('@/drizzle/schema', () => ({
  UserUsageTable: {},
  db: {
    select: jest.fn(),
  },
  eq: jest.fn(),
}));

describe('getUserSubscriptionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default chain
    mockDbFrom.mockReturnThis();
    mockDbWhere.mockReturnThis();
    mockDbLimit.mockReturnThis();
    mockDbExecute.mockResolvedValue([]);

    // Chain the methods
    (db.select as jest.Mock).mockReturnValue({
      from: mockDbFrom,
    });
    mockDbFrom.mockReturnValue({
      where: mockDbWhere,
    });
    mockDbWhere.mockReturnValue({
      limit: mockDbLimit,
    });
    mockDbLimit.mockReturnValue({
      execute: mockDbExecute,
    });
  });

  describe('Happy Path', () => {
    it('should return active subscription status', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'paid',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result).toEqual({
        subscriptionStatus: 'active',
        paymentStatus: 'paid',
        currentProduct: 'pro',
        billingCycle: 'monthly',
        active: true,
      });
    });

    it('should return inactive subscription when status is not active', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'inactive',
          paymentStatus: 'unpaid',
          currentProduct: null,
          billingCycle: 'none',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result).toEqual({
        subscriptionStatus: 'inactive',
        paymentStatus: 'unpaid',
        currentProduct: null,
        billingCycle: 'none',
        active: false,
      });
    });

    it('should return active when paymentStatus is succeeded', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'succeeded',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result.active).toBe(true);
    });

    it('should return inactive when paymentStatus is not paid or succeeded', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'pending',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result.active).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return default values when userId is empty string', async () => {
      const result = await getUserSubscriptionStatus('');

      expect(result).toEqual({
        subscriptionStatus: 'inactive',
        paymentStatus: 'unpaid',
        currentProduct: null,
        billingCycle: 'none',
        active: false,
      });
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should return default values when userId is null', async () => {
      const result = await getUserSubscriptionStatus(null as any);

      expect(result).toEqual({
        subscriptionStatus: 'inactive',
        paymentStatus: 'unpaid',
        currentProduct: null,
        billingCycle: 'none',
        active: false,
      });
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should return default values when no user record found', async () => {
      mockDbExecute.mockResolvedValueOnce([]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result).toEqual({
        subscriptionStatus: 'inactive',
        paymentStatus: 'unpaid',
        currentProduct: null,
        billingCycle: 'none',
        active: false,
      });
    });

    it('should handle null currentProduct', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'paid',
          currentProduct: null,
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result.currentProduct).toBe(null);
    });

    it('should handle undefined currentProduct', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'paid',
          currentProduct: undefined,
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');

      expect(result.currentProduct).toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('should return error status when database query fails', async () => {
      mockDbExecute.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getUserSubscriptionStatus('test-user');

      expect(result).toEqual({
        subscriptionStatus: 'inactive',
        paymentStatus: 'error',
        currentProduct: null,
        billingCycle: 'none',
        active: false,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching subscription status:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle database timeout errors', async () => {
      mockDbExecute.mockRejectedValueOnce(new Error('Query timeout'));

      const result = await getUserSubscriptionStatus('test-user');

      expect(result.paymentStatus).toBe('error');
      expect(result.active).toBe(false);
    });
  });

  describe('Subscription Status Combinations', () => {
    it('should correctly identify active subscription (active + paid)', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'paid',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');
      expect(result.active).toBe(true);
    });

    it('should correctly identify active subscription (active + succeeded)', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'succeeded',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');
      expect(result.active).toBe(true);
    });

    it('should correctly identify inactive subscription (active + pending)', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'active',
          paymentStatus: 'pending',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');
      expect(result.active).toBe(false);
    });

    it('should correctly identify inactive subscription (inactive + paid)', async () => {
      mockDbExecute.mockResolvedValueOnce([
        {
          userId: 'test-user',
          subscriptionStatus: 'inactive',
          paymentStatus: 'paid',
          currentProduct: 'pro',
          billingCycle: 'monthly',
        },
      ]);

      const result = await getUserSubscriptionStatus('test-user');
      expect(result.active).toBe(false);
    });
  });
});
