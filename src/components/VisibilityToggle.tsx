'use client';

import { useState } from 'react';
import { Query } from '../types';
import { storage } from '../lib/storage';

interface VisibilityToggleProps {
  query: Query;
  currentUserId: string;
  onVisibilityChange: (queryId: number, newVisibility: 'public' | 'private') => void;
}

export default function VisibilityToggle({ query, currentUserId, onVisibilityChange }: VisibilityToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Only show toggle to query owner
  if (query.userId !== currentUserId) {
    return (
      <span className={`px-2 py-1 rounded text-xs ${
        query.visibility === 'public' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {query.visibility === 'public' ? 'Public' : 'Private'}
      </span>
    );
  }

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const newVisibility = query.visibility === 'public' ? 'private' : 'public';
      
      // Try API endpoint first
      try {
        const response = await fetch(`/api/queries/${query.id}/visibility`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visibility: newVisibility }),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }
      } catch {
        // Fallback to direct storage access
        await storage.setQueryVisibility(query.id, newVisibility, currentUserId);
      }
      
      onVisibilityChange(query.id, newVisibility);
    } catch (error) {
      console.error('Failed to update visibility:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`px-2 py-1 rounded text-xs transition-colors ${
        query.visibility === 'public'
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isUpdating ? 'Updating...' : (query.visibility === 'public' ? 'Public' : 'Private')}
    </button>
  );
}
