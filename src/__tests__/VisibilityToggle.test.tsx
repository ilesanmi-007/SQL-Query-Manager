import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisibilityToggle from '../components/VisibilityToggle';
import { Query } from '../types';
import * as storage from '../lib/storage';

// Mock the storage module
jest.mock('../lib/storage', () => ({
  storage: {
    setQueryVisibility: jest.fn()
  }
}));

const mockStorage = storage.storage as jest.Mocked<typeof storage.storage>;

describe('VisibilityToggle', () => {
  const mockQuery: Query = {
    id: 1,
    name: 'Test Query',
    sql: 'SELECT * FROM test',
    description: 'Test description',
    result: 'Test result',
    date: '2023-01-01',
    timestamp: '2023-01-01 12:00:00',
    currentVersion: 1,
    tags: [],
    isFavorite: false,
    userId: 'user1',
    visibility: 'private'
  };

  const mockOnVisibilityChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Owner interactions', () => {
    it('should render toggle button for query owner', () => {
      render(
        <VisibilityToggle 
          query={mockQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Private');
    });

    it('should toggle from private to public', async () => {
      mockStorage.setQueryVisibility.mockResolvedValue();

      render(
        <VisibilityToggle 
          query={mockQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockStorage.setQueryVisibility).toHaveBeenCalledWith(1, 'public', 'user1');
        expect(mockOnVisibilityChange).toHaveBeenCalledWith(1, 'public');
      });
    });

    it('should toggle from public to private', async () => {
      const publicQuery = { ...mockQuery, visibility: 'public' as const };
      mockStorage.setQueryVisibility.mockResolvedValue();

      render(
        <VisibilityToggle 
          query={publicQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Public');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockStorage.setQueryVisibility).toHaveBeenCalledWith(1, 'private', 'user1');
        expect(mockOnVisibilityChange).toHaveBeenCalledWith(1, 'private');
      });
    });

    it('should show loading state during update', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStorage.setQueryVisibility.mockReturnValue(promise);

      render(
        <VisibilityToggle 
          query={mockQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveTextContent('Updating...');
      expect(button).toBeDisabled();

      resolvePromise!();
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should handle update errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorage.setQueryVisibility.mockRejectedValue(new Error('Update failed'));

      render(
        <VisibilityToggle 
          query={mockQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to update visibility:', expect.any(Error));
        expect(button).not.toBeDisabled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Non-owner interactions', () => {
    it('should render read-only badge for non-owner (private query)', () => {
      render(
        <VisibilityToggle 
          query={mockQuery} 
          currentUserId="user2" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const badge = screen.getByText('Private');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('SPAN');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render read-only badge for non-owner (public query)', () => {
      const publicQuery = { ...mockQuery, visibility: 'public' as const };

      render(
        <VisibilityToggle 
          query={publicQuery} 
          currentUserId="user2" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const badge = screen.getByText('Public');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('SPAN');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct styles for private query', () => {
      render(
        <VisibilityToggle 
          query={mockQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply correct styles for public query', () => {
      const publicQuery = { ...mockQuery, visibility: 'public' as const };

      render(
        <VisibilityToggle 
          query={publicQuery} 
          currentUserId="user1" 
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-100', 'text-green-800');
    });
  });
});
