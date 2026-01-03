---
description: Repository Information Overview
alwaysApply: true
---

# Secure Vault Information

## Summary

Full-stack TypeScript monorepo for a Progressive Web App (PWA) that securely manages personal financial data. Features end-to-end AES-256-GCM encryption, PIN and biometric authentication, bank account/debit card/net banking storage with Supabase backend, and offline support via service workers.

## Repository Structure

- **Frontend** (root): React 18 + Vite application with components, hooks, and utilities
- **Backend** (`src/server/`): Express.js REST API with authentication and database routes
- **Database** (`src/supabase/`): Supabase migrations and schema definitions
- **Public** (`src/public/`): PWA manifest and service worker for offline functionality

## Language & Runtime

**Frontend**:
- **Language**: TypeScript 5.5.4
- **Runtime**: Node.js 18+
- **Build System**: Vite 5.2.0
- **Package Manager**: npm

**Backend**:
- **Language**: TypeScript 5.3.3
- **Runtime**: Node.js 18+ (ES2020 target)
- **Build System**: TypeScript compiler (tsc)
- **Package Manager**: npm
- **Development Runtime**: tsx 4.7.0

## Dependencies

### Frontend Main
- **React**: 18.3.1, react-dom 18.3.1
- **Styling**: Tailwind CSS 3.4.17, PostCSS, Autoprefixer
- **UI/Animation**: Framer Motion 11.5.4, Lucide React 0.522.0
- **Routing**: React Router DOM 6.26.2
- **Backend/Auth**: Express 4.19.2, jsonwebtoken (latest), bcryptjs (latest)
- **Database**: @supabase/supabase-js 2.45.4
- **Utilities**: dotenv (latest), crypto (latest), cors (latest)

### Frontend Dev
- TypeScript, Vite, @vitejs/plugin-react, ESLint with TypeScript/React plugins, React Refresh

### Backend Main
- **Server**: Express 4.18.2, cors 2.8.5, dotenv 16.4.1
- **Database**: @supabase/supabase-js 2.39.3
- **Auth**: jsonwebtoken 9.0.2, bcryptjs 2.4.3
- **Validation**: zod 3.22.4

### Backend Dev
- TypeScript 5.3.3, tsx 4.7.0, type definitions (@types/express, @types/cors, @types/bcryptjs, @types/jsonwebtoken, @types/node)

## Build & Installation

**Frontend**:
```bash
npm install
npm run dev        # Development with Vite
npm run build      # Production build
npm run preview    # Preview built app
npm run lint       # ESLint check
```

**Backend**:
```bash
cd src/server
npm install
npm run dev        # Development with tsx watch
npm run build      # TypeScript compilation
npm start          # Run compiled JS (dist/index.js)
```

## Main Entry Points

**Frontend**: `src/index.tsx` - React root render  
**Frontend App**: `src/App.tsx` - Main application component  
**Backend API**: `src/server/src/index.ts` - Express server (default port 3000)

## API Routes (Backend)

- `GET /health` - Health check endpoint
- `POST /api/auth/*` - Authentication routes (authRoutes)
- `GET/POST /api/bank-accounts/*` - Bank account management
- `GET/POST /api/debit-cards/*` - Debit card management
- `GET/POST /api/net-banking/*` - Net banking credentials

## Testing

**No formal testing framework configured**. Manual testing checklist provided in README:
- PIN authentication, biometric unlock
- Session timeout (30 min)
- CRUD operations for bank accounts, debit cards, net banking
- Field encryption/decryption, masked field reveal
- Theme toggle, PWA installation, offline functionality

## Docker

No Docker configuration present in repository.

## Configuration Files

- **Vite**: `vite.config.ts` - React plugin
- **TypeScript**: `tsconfig.json` (frontend, ES2020 target), `src/server/tsconfig.json` (backend, NodeNext)
- **Tailwind**: `tailwind.config.js` - Custom color palette (cyan, magenta, neon), extended animations
- **ESLint**: `.eslintrc.cjs` - TypeScript parser, React hooks/refresh plugins
- **Environment**: `.env.example` (frontend), `src/server/.env` (backend)
- **PostCSS**: `postcss.config.js`

## Database

**Supabase PostgreSQL** with tables:
- `users` - User accounts with PIN hashes
- `sessions` - Active sessions with expiry
- `bank_accounts` - Encrypted bank account details
- `debit_cards` - Encrypted debit card information
- `net_banking` - Encrypted net banking credentials

Migration: `src/supabase/migrations/001_initial_schema.sql`

## Environment Variables

**Frontend (.env)**:
- `VITE_API_URL` - Backend API endpoint
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Backend (src/server/.env)**:
- `PORT` - Server port (default 3000)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret (32-byte hex)
- `ENCRYPTION_KEY` - AES-256-GCM encryption key (32-byte hex)
