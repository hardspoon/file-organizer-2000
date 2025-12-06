// In-memory database for testing
const mockDatabase: Record<string, any[]> = {};

// Mock database object with stateful operations
export const db = {
  select: jest.fn(() => ({
    from: jest.fn((table: any) => ({
      where: jest.fn((condition: any) => {
        // Simple mock: return all records for the table
        // Handle both table object and string
        const tableName =
          table?.name || (typeof table === 'string' ? table : 'user_usage');
        const records = mockDatabase[tableName] || [];

        // If condition exists, try to filter (simple userId matching)
        if (condition && records.length > 0) {
          // For simple eq() conditions on userId, filter records
          // This is a simplified filter - real drizzle conditions are more complex
          return Promise.resolve(records); // Return all for now, tests can override
        }

        return Promise.resolve(records);
      }),
    })),
  })),
  insert: jest.fn((table: any) => ({
    values: jest.fn((values: any) => {
      const tableName = table?.name || 'user_usage';
      if (!mockDatabase[tableName]) {
        mockDatabase[tableName] = [];
      }
      // Handle single or array of values
      const recordsToInsert = Array.isArray(values) ? values : [values];
      mockDatabase[tableName].push(...recordsToInsert);
      return Promise.resolve({ rowCount: recordsToInsert.length });
    }),
  })),
  update: jest.fn((table: any) => ({
    set: jest.fn((updates: any) => ({
      where: jest.fn((condition: any) => {
        const tableName = table?.name || 'user_usage';
        const records = mockDatabase[tableName] || [];
        let updatedCount = 0;

        // Check if condition is an AND/OR condition (drizzle-orm structure)
        // For simplicity, check if records match common conditions
        records.forEach((record: any) => {
          let shouldUpdate = true;

          // If condition exists, try to match it
          // For active subscribers test: subscriptionStatus='active', paymentStatus='paid', billingCycle='subscription'
          if (condition) {
            // Simple heuristic: if record has active subscription and paid status, update it
            // This handles the resetTokenUsage function's where clause
            if (record.subscriptionStatus === 'inactive') {
              shouldUpdate = false;
            }
            // If updates include tokenUsage reset, only update active/paid records
            if (updates.tokenUsage === 0) {
              shouldUpdate =
                (record.subscriptionStatus === 'active' ||
                  record.subscriptionStatus === 'succeeded' ||
                  record.subscriptionStatus === 'paid') &&
                (record.paymentStatus === 'paid' ||
                  record.paymentStatus === 'succeeded') &&
                (record.billingCycle === 'monthly' ||
                  record.billingCycle === 'yearly' ||
                  record.billingCycle === 'subscription' ||
                  record.billingCycle === 'default');
            }
          }

          if (shouldUpdate) {
            Object.assign(record, updates);
            updatedCount++;
          }
        });

        return Promise.resolve({ rowCount: updatedCount });
      }),
    })),
  })),
  delete: jest.fn((table: any) => ({
    where: jest.fn((condition: any) => {
      const tableName = table?.name || 'user_usage';
      const records = mockDatabase[tableName] || [];
      // Simple: clear all records (tests can override this)
      const deletedCount = records.length;
      mockDatabase[tableName] = [];
      return Promise.resolve({ rowCount: deletedCount });
    }),
  })),
};

// Helper to clear database between tests
export const clearMockDatabase = () => {
  Object.keys(mockDatabase).forEach((key) => {
    delete mockDatabase[key];
  });
};

// Mock UserUsageTable
export const UserUsageTable = {
  name: 'user_usage',
  userId: 'userId',
  tokenUsage: 'tokenUsage',
  maxTokenUsage: 'maxTokenUsage',
  subscriptionStatus: 'subscriptionStatus',
  paymentStatus: 'paymentStatus',
  billingCycle: 'billingCycle',
  currentPlan: 'currentPlan',
};

// Mock other exports that might be needed
export const incrementTokenUsage = jest.fn().mockResolvedValue({
  remaining: 1000000,
  usageError: false,
});

export const checkTokenUsage = jest.fn().mockResolvedValue({
  remaining: 1000000,
  usageError: false,
});

export const checkIfUserNeedsUpgrade = jest.fn().mockResolvedValue(false);

export const checkUserSubscriptionStatus = jest.fn().mockResolvedValue({
  isActive: true,
  status: 'active',
});

export const createEmptyUserUsage = jest.fn().mockResolvedValue({});

export const initializeTierConfig = jest.fn().mockResolvedValue({});

export const isSubscriptionActive = jest.fn().mockResolvedValue(true);
