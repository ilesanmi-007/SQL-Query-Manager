-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Queries table
CREATE TABLE queries (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sql TEXT NOT NULL,
  description TEXT,
  result TEXT,
  result_image TEXT,
  date DATE DEFAULT CURRENT_DATE,
  timestamp VARCHAR(255),
  last_edited TIMESTAMP WITH TIME ZONE,
  versions JSONB DEFAULT '[]',
  current_version INTEGER DEFAULT 1,
  tags JSONB DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visibility VARCHAR(10) DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Queries policies
CREATE POLICY "Users can view own queries" ON queries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public queries" ON queries
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can insert own queries" ON queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queries" ON queries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queries" ON queries
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policies (can view all data)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can view all queries" ON queries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Indexes for performance
CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_queries_created_at ON queries(created_at);
CREATE INDEX idx_queries_visibility ON queries(visibility);
CREATE INDEX idx_users_email ON users(email);

-- Create default admin user (update password hash)
INSERT INTO users (email, name, password_hash, is_admin) 
VALUES ('admin@example.com', 'Admin User', '$2a$12$placeholder_hash', TRUE);
