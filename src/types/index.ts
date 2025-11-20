export interface QueryVersion {
  version: number;
  name: string;
  sql: string;
  description: string;
  result: string;
  resultImage?: string;
  editedAt: string;
  editedBy?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface Query {
  id: number;
  name: string;
  sql: string;
  description: string;
  result: string;
  resultImage?: string;
  date: string;
  timestamp: string;
  lastEdited?: string;
  versions?: QueryVersion[];
  currentVersion: number;
  tags?: string[];
  isFavorite: boolean;
  userId: string; // New: Associate queries with users
  visibility: 'public' | 'private'; // New: Query visibility
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  usageCount: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
  queryCount: number;
}

// New: User types
export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

// New: Storage interfaces
export interface StorageAdapter {
  getQueries(userId: string): Promise<Query[]>;
  saveQuery(query: Query): Promise<void>;
  updateQuery(query: Query): Promise<void>;
  deleteQuery(id: number, userId: string): Promise<void>;
  getAllQueries(): Promise<Query[]>; // Admin only
  getUsers(): Promise<User[]>; // Admin only
  listPublicQueries(): Promise<Query[]>; // New: Get public queries
  listUserQueries(userId: string): Promise<Query[]>; // New: Get user's queries
  setQueryVisibility(queryId: number, visibility: 'public' | 'private', userId: string): Promise<void>; // New: Toggle visibility
}

export type ColorTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'database';
export type ViewMode = 'list' | 'grid';
