-- Update all existing queries to be public and owned by admin
UPDATE queries 
SET 
  visibility = 'public',
  user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id IS NULL OR user_id = '';

-- Ensure admin user exists
INSERT INTO users (id, email, name, password_hash, is_admin) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin User', '$2a$12$placeholder_hash', TRUE)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  is_admin = EXCLUDED.is_admin;
