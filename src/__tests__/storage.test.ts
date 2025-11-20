import { StorageManager } from '../lib/storage';
import { Query } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('StorageManager', () => {
  let storage: StorageManager;
  const mockQuery: Query = {
    id: 1,
    name: 'Test Query',
    sql: 'SELECT * FROM users',
    description: 'Test description',
    result: 'Test result',
    date: '2023-01-01',
    timestamp: '2023-01-01 12:00:00',
    currentVersion: 1,
    tags: [],
    isFavorite: false,
    userId: 'user123',
    versions: []
  };

  beforeEach(() => {
    storage = new StorageManager();
    jest.clearAllMocks();
  });

  describe('getQueries', () => {
    it('should return empty array when no queries exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const queries = await storage.getQueries('user123');
      
      expect(queries).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('sqlQueries');
    });

    it('should return user-specific queries', async () => {
      const allQueries = [
        { ...mockQuery, userId: 'user123' },
        { ...mockQuery, id: 2, userId: 'user456' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(allQueries));
      
      const queries = await storage.getQueries('user123');
      
      expect(queries).toHaveLength(1);
      expect(queries[0].userId).toBe('user123');
    });
  });

  describe('saveQuery', () => {
    it('should save query to localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      await storage.saveQuery(mockQuery);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sqlQueries',
        JSON.stringify([mockQuery])
      );
    });
  });

  describe('deleteQuery', () => {
    it('should delete user-owned query only', async () => {
      const allQueries = [
        { ...mockQuery, userId: 'user123' },
        { ...mockQuery, id: 2, userId: 'user456' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(allQueries));
      
      await storage.deleteQuery(1, 'user123');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sqlQueries',
        JSON.stringify([{ ...mockQuery, id: 2, userId: 'user456' }])
      );
    });

    it('should not delete query owned by different user', async () => {
      const allQueries = [{ ...mockQuery, userId: 'user456' }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(allQueries));
      
      await storage.deleteQuery(1, 'user123');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sqlQueries',
        JSON.stringify(allQueries)
      );
    });
  });
});
