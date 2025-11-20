import { createClient } from '@supabase/supabase-js';
import { Query, User, StorageAdapter } from '../types';

class SupabaseAdapter implements StorageAdapter {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getQueries(userId: string): Promise<Query[]> {
    // Use API route instead of direct Supabase call
    const response = await fetch('/api/queries');
    
    if (!response.ok) {
      throw new Error('Failed to fetch queries');
    }
    
    return await response.json();
  }

  async saveQuery(query: Query): Promise<void> {
    // Use API route instead of direct Supabase call
    const response = await fetch('/api/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save query');
    }
  }

  async updateQuery(query: Query): Promise<void> {
    const { error } = await this.supabase
      .from('queries')
      .update(this.mapToDB(query))
      .eq('id', query.id)
      .eq('user_id', query.userId);
    
    if (error) throw error;
  }

  async deleteQuery(id: number | string, userId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('queries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getAllQueries(): Promise<Query[]> {
    const { data, error } = await this.supabase
      .from('queries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(this.mapFromDB) || [];
  }

  async listPublicQueries(): Promise<Query[]> {
    // Use API route instead of direct Supabase call
    const response = await fetch('/api/queries?visibility=public');
    
    if (!response.ok) {
      throw new Error('Failed to fetch public queries');
    }
    
    return await response.json();
  }

  async listUserQueries(userId: string): Promise<Query[]> {
    // Use API route instead of direct Supabase call
    const response = await fetch('/api/queries');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user queries');
    }
    
    return await response.json();
  }

  async setQueryVisibility(queryId: number, visibility: 'public' | 'private', userId: string): Promise<void> {
    // Use API route instead of direct Supabase call
    const response = await fetch(`/api/queries/${queryId}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visibility })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update visibility');
    }
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  }

  async updateUser(user: User): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
        is_admin: user.isAdmin
      })
      .eq('id', user.id);
    
    if (error) throw error;
  }

  private mapToDB(query: Query) {
    return {
      id: query.id,
      name: query.name,
      sql: query.sql,
      description: query.description,
      result: query.result,
      result_image: query.resultImage,
      date: query.date,
      timestamp: query.timestamp,
      last_edited: query.lastEdited,
      versions: JSON.stringify(query.versions),
      current_version: query.currentVersion,
      tags: JSON.stringify(query.tags),
      is_favorite: query.isFavorite,
      user_id: query.userId,
      visibility: query.visibility,
      created_at: new Date().toISOString()
    };
  }

  private mapFromDB(data: any): Query {
    return {
      id: data.id,
      name: data.name,
      sql: data.sql,
      description: data.description,
      result: data.result,
      resultImage: data.result_image,
      date: data.date,
      timestamp: data.timestamp,
      lastEdited: data.last_edited,
      versions: data.versions ? JSON.parse(data.versions) : [],
      currentVersion: data.current_version,
      tags: data.tags ? JSON.parse(data.tags) : [],
      isFavorite: data.is_favorite,
      userId: data.user_id,
      visibility: data.visibility || 'private'
    };
  }
}

class LocalStorageAdapter implements StorageAdapter {
  async getQueries(userId: string): Promise<Query[]> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    return queries.filter((q: Query) => q.userId === userId);
  }

  async saveQuery(query: Query): Promise<void> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    queries.unshift(query);
    localStorage.setItem('sqlQueries', JSON.stringify(queries));
  }

  async updateQuery(query: Query): Promise<void> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    const index = queries.findIndex((q: Query) => q.id === query.id && q.userId === query.userId);
    if (index !== -1) {
      queries[index] = query;
      localStorage.setItem('sqlQueries', JSON.stringify(queries));
    }
  }

  async deleteQuery(id: number | string, userId?: string): Promise<void> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    const filtered = userId 
      ? queries.filter((q: Query) => !(q.id === id && q.userId === userId))
      : queries.filter((q: Query) => q.id !== id);
    localStorage.setItem('sqlQueries', JSON.stringify(filtered));
  }

  async getAllQueries(): Promise<Query[]> {
    const saved = localStorage.getItem('sqlQueries');
    return saved ? JSON.parse(saved) : [];
  }

  async listPublicQueries(): Promise<Query[]> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    return queries.filter((q: Query) => q.visibility === 'public');
  }

  async listUserQueries(userId: string): Promise<Query[]> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    return queries.filter((q: Query) => q.userId === userId);
  }

  async setQueryVisibility(queryId: number, visibility: 'public' | 'private', userId: string): Promise<void> {
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    const index = queries.findIndex((q: Query) => q.id === queryId && q.userId === userId);
    if (index !== -1) {
      queries[index].visibility = visibility;
      localStorage.setItem('sqlQueries', JSON.stringify(queries));
    }
  }

  async getUsers(): Promise<User[]> {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  }

  async deleteUser(userId: string): Promise<void> {
    const saved = localStorage.getItem('users');
    const users = saved ? JSON.parse(saved) : [];
    const filtered = users.filter((u: User) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filtered));
  }

  async updateUser(user: User): Promise<void> {
    const saved = localStorage.getItem('users');
    const users = saved ? JSON.parse(saved) : [];
    const index = users.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
}

export class StorageManager {
  private adapter: StorageAdapter;

  constructor() {
    this.adapter = this.createAdapter();
  }

  private createAdapter(): StorageAdapter {
    if (typeof window !== 'undefined' && 
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        return new SupabaseAdapter();
      } catch (error) {
        console.warn('Supabase initialization failed, falling back to localStorage:', error);
        return new LocalStorageAdapter();
      }
    }
    return new LocalStorageAdapter();
  }

  async getQueries(userId: string): Promise<Query[]> {
    return this.adapter.getQueries(userId);
  }

  async saveQuery(query: Query): Promise<void> {
    return this.adapter.saveQuery(query);
  }

  async updateQuery(query: Query): Promise<void> {
    return this.adapter.updateQuery(query);
  }

  async deleteQuery(id: number | string, userId?: string): Promise<void> {
    return this.adapter.deleteQuery(id, userId);
  }

  async getAllQueries(): Promise<Query[]> {
    return this.adapter.getAllQueries();
  }

  async listPublicQueries(): Promise<Query[]> {
    return this.adapter.listPublicQueries();
  }

  async listUserQueries(userId: string): Promise<Query[]> {
    return this.adapter.listUserQueries(userId);
  }

  async setQueryVisibility(queryId: number, visibility: 'public' | 'private', userId: string): Promise<void> {
    return this.adapter.setQueryVisibility(queryId, visibility, userId);
  }

  async getUsers(): Promise<User[]> {
    return this.adapter.getUsers();
  }

  async deleteUser(userId: string): Promise<void> {
    return (this.adapter as any).deleteUser(userId);
  }

  async updateUser(user: User): Promise<void> {
    return (this.adapter as any).updateUser(user);
  }
}

export const storage = new StorageManager();
