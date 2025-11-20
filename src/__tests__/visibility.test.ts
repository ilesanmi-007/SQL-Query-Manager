import { StorageManager } from '../lib/storage';
import { Query } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Query Visibility', () => {
  let storage: StorageManager;
  const userId1 = 'user1';
  const userId2 = 'user2';

  beforeEach(() => {
    localStorageMock.clear();
    storage = new StorageManager();
  });

  const createTestQuery = (id: number, userId: string, visibility: 'public' | 'private' = 'private'): Query => ({
    id,
    name: `Test Query ${id}`,
    sql: 'SELECT * FROM test',
    description: 'Test description',
    result: 'Test result',
    date: '2023-01-01',
    timestamp: '2023-01-01 12:00:00',
    currentVersion: 1,
    tags: [],
    isFavorite: false,
    userId,
    visibility
  });

  describe('listPublicQueries', () => {
    it('should return only public queries', async () => {
      const privateQuery = createTestQuery(1, userId1, 'private');
      const publicQuery1 = createTestQuery(2, userId1, 'public');
      const publicQuery2 = createTestQuery(3, userId2, 'public');

      await storage.saveQuery(privateQuery);
      await storage.saveQuery(publicQuery1);
      await storage.saveQuery(publicQuery2);

      const publicQueries = await storage.listPublicQueries();
      
      expect(publicQueries).toHaveLength(2);
      expect(publicQueries.every(q => q.visibility === 'public')).toBe(true);
      expect(publicQueries.map(q => q.id)).toEqual(expect.arrayContaining([2, 3]));
    });

    it('should return empty array when no public queries exist', async () => {
      const privateQuery = createTestQuery(1, userId1, 'private');
      await storage.saveQuery(privateQuery);

      const publicQueries = await storage.listPublicQueries();
      expect(publicQueries).toHaveLength(0);
    });
  });

  describe('listUserQueries', () => {
    it('should return only queries belonging to the specified user', async () => {
      const user1Query1 = createTestQuery(1, userId1, 'private');
      const user1Query2 = createTestQuery(2, userId1, 'public');
      const user2Query = createTestQuery(3, userId2, 'private');

      await storage.saveQuery(user1Query1);
      await storage.saveQuery(user1Query2);
      await storage.saveQuery(user2Query);

      const user1Queries = await storage.listUserQueries(userId1);
      const user2Queries = await storage.listUserQueries(userId2);

      expect(user1Queries).toHaveLength(2);
      expect(user1Queries.every(q => q.userId === userId1)).toBe(true);
      
      expect(user2Queries).toHaveLength(1);
      expect(user2Queries[0].userId).toBe(userId2);
    });

    it('should return empty array for user with no queries', async () => {
      const userQueries = await storage.listUserQueries('nonexistent-user');
      expect(userQueries).toHaveLength(0);
    });
  });

  describe('setQueryVisibility', () => {
    it('should update query visibility for owner', async () => {
      const query = createTestQuery(1, userId1, 'private');
      await storage.saveQuery(query);

      await storage.setQueryVisibility(1, 'public', userId1);

      const publicQueries = await storage.listPublicQueries();
      expect(publicQueries).toHaveLength(1);
      expect(publicQueries[0].visibility).toBe('public');
    });

    it('should toggle visibility back to private', async () => {
      const query = createTestQuery(1, userId1, 'public');
      await storage.saveQuery(query);

      await storage.setQueryVisibility(1, 'private', userId1);

      const publicQueries = await storage.listPublicQueries();
      expect(publicQueries).toHaveLength(0);

      const userQueries = await storage.listUserQueries(userId1);
      expect(userQueries[0].visibility).toBe('private');
    });

    it('should not update visibility for non-owner', async () => {
      const query = createTestQuery(1, userId1, 'private');
      await storage.saveQuery(query);

      // Try to change visibility as different user
      await storage.setQueryVisibility(1, 'public', userId2);

      const publicQueries = await storage.listPublicQueries();
      expect(publicQueries).toHaveLength(0);
    });
  });

  describe('Query isolation', () => {
    it('should ensure users only see their own private queries', async () => {
      const user1Private = createTestQuery(1, userId1, 'private');
      const user2Private = createTestQuery(2, userId2, 'private');
      const publicQuery = createTestQuery(3, userId1, 'public');

      await storage.saveQuery(user1Private);
      await storage.saveQuery(user2Private);
      await storage.saveQuery(publicQuery);

      const user1Queries = await storage.listUserQueries(userId1);
      const user2Queries = await storage.listUserQueries(userId2);

      // User 1 should see their private and public queries
      expect(user1Queries).toHaveLength(2);
      expect(user1Queries.map(q => q.id)).toEqual(expect.arrayContaining([1, 3]));

      // User 2 should only see their private query
      expect(user2Queries).toHaveLength(1);
      expect(user2Queries[0].id).toBe(2);
    });
  });

  describe('Default visibility', () => {
    it('should default to private visibility when not specified', async () => {
      const query = createTestQuery(1, userId1);
      await storage.saveQuery(query);

      const userQueries = await storage.listUserQueries(userId1);
      expect(userQueries[0].visibility).toBe('private');

      const publicQueries = await storage.listPublicQueries();
      expect(publicQueries).toHaveLength(0);
    });
  });
});
