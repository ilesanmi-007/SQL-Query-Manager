import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Only create Supabase client if environment variables exist
let supabase: any = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try Supabase first if available
          if (supabase) {
            const { data: user, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', credentials.email)
              .single();

            if (!error && user) {
              const isValid = await bcrypt.compare(credentials.password, user.password_hash);
              if (isValid) {
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  isAdmin: user.is_admin
                };
              }
            }
          }
        } catch (error) {
          console.warn('Supabase auth failed:', error);
        }

        // Fallback to hardcoded admin for testing
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
          const adminId = '24fa645d-d273-4ab1-b349-ba5d37e22e92'; // Use actual admin ID from database
          
          return {
            id: adminId,
            email: 'admin@example.com',
            name: 'Admin User',
            isAdmin: true
          };
        }

        // Check localStorage via API route
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: credentials.email, 
              password: credentials.password,
              users: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('users') || '[]') : []
            })
          });

          if (response.ok) {
            const data = await response.json();
            return data.user;
          }
        } catch (error) {
          console.warn('localStorage auth API failed:', error);
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub || crypto.randomUUID();
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};
