# SQL Query Manager

A modern web application for managing, organizing, and sharing SQL queries with advanced collaboration features.

## 🚀 Overview

SQL Query Manager is a Next.js application that provides developers and data analysts with a powerful platform to store, organize, and share SQL queries. Built with modern web technologies and cloud storage.

## ✨ Key Features

### 📝 Query Management
- Create & store SQL queries with descriptions and metadata
- Version control for tracking query changes
- Save query results and screenshots
- Favorites system for quick access

### 🏷️ Organization
- Tag system for categorizing queries
- Advanced search and filtering
- Smart organization by project or functionality

### 👥 Collaboration & Sharing
- Public/Private query visibility
- Public query feed for community sharing
- User profiles and query discovery
- Read-only sharing with proper permissions

### 🎨 User Experience
- Dark/Light mode toggle
- Multiple color themes (Ocean, Forest, Sunset, Purple, etc.)
- Responsive design for all devices
- Clean, intuitive interface

### ☁️ Supabase Cloud Storage
The application uses **Supabase** as its cloud database solution:
- **PostgreSQL Database**: Scalable cloud database
- **Real-time Updates**: Live synchronization across users
- **Row Level Security**: Database-level access control
- **Authentication**: Built-in user management
- **Automatic Backups**: Enterprise-grade data protection
- **Global CDN**: Fast worldwide access

## 🛠️ Technology Stack

- **Next.js 15** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Supabase** - PostgreSQL cloud database
- **NextAuth.js** - Authentication
- **Jest** - Testing framework

## 📦 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/ilesanmi-007/SQL-Query-Manager.git
   cd SQL-Query-Manager
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase credentials
   ```

3. **Database Setup**
   ```bash
   # Run schema in your Supabase project
   psql -f supabase-schema.sql
   ```

4. **Start Development**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## 🔧 Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎯 Use Cases

- **Individual Developers**: Personal SQL query library
- **Data Teams**: Collaborative query sharing and documentation
- **Organizations**: Centralized SQL knowledge base

## 🚦 Main API Endpoints

- `GET/POST /api/queries` - Query management
- `GET /api/queries/public` - Public queries feed
- `PATCH /api/queries/[id]/visibility` - Toggle query visibility

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
```

## 🗺️ Roadmap

- Direct database query execution
- Result visualization with charts
- Team workspaces
- Query templates and snippets
- Multi-database support

---

**Built with ❤️ by [Ilesanmi](https://github.com/ilesanmi-007)**

*Modern SQL query management with cloud storage and collaboration.*
