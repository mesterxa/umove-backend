# UMOVE ANNABA - Replit Configuration

## Overview

UMOVE ANNABA is a mobile-first moving/relocation services app for the Annaba region (Algeria). It allows users to request residential moving, office moving, and furniture assembly services. The app is built with Expo (React Native) for the mobile frontend and an Express.js backend, designed to run together on Replit.

The app presents service options in French, collects booking requests, and is styled with the UMOVE brand colors (deep blue #0A3D8F and orange #F47A20).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Mobile App)
- **Framework**: Expo (React Native) with expo-router for file-based navigation
- **Entry point**: `app/index.tsx` — single-page landing with service selection UI
- **Routing**: File-based routing via expo-router; currently only one main screen (`/`)
- **State/Data fetching**: TanStack React Query (`@tanstack/react-query`) with a custom `queryClient` in `lib/query-client.ts`
- **Fonts**: Inter font family (400, 500, 600, 700) loaded via `@expo-google-fonts/inter`
- **UI Libraries**: 
  - `expo-linear-gradient` for gradient backgrounds
  - `expo-haptics` for tactile feedback
  - `@expo/vector-icons` (Ionicons, MaterialCommunityIcons, FontAwesome5)
  - `react-native-gesture-handler` and `react-native-reanimated` for animations
  - `react-native-safe-area-context` for safe area handling
  - `react-native-keyboard-controller` for keyboard-aware layouts
- **Error handling**: Custom `ErrorBoundary` and `ErrorFallback` components wrapping the entire app
- **Brand colors**: Defined in `constants/colors.ts` — blue (`#0A3D8F`), orange (`#F47A20`)

### Backend (Express API)
- **Framework**: Express.js 5 (`server/index.ts`)
- **API routes**: Defined in `server/routes.ts` — currently a placeholder; all routes should be prefixed with `/api`
- **Storage layer**: `server/storage.ts` provides an `IStorage` interface with an in-memory `MemStorage` implementation (for development/prototype); can be swapped for a database-backed implementation
- **CORS**: Custom CORS middleware that allows Replit dev/deployment domains and localhost origins
- **Static serving**: Has a landing page HTML template (`server/templates/landing-page.html`) served for web visitors

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: `shared/schema.ts` — currently defines a `users` table with `id`, `username`, and `password` fields
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions
- **Config**: `drizzle.config.ts` reads `DATABASE_URL` from environment; migrations output to `./migrations`
- **Note**: The storage layer currently uses in-memory storage (`MemStorage`). The database schema is defined and ready; a Postgres-backed storage class needs to be implemented to replace `MemStorage`.

### Shared Code
- `shared/schema.ts` is shared between the frontend and backend via the `@shared/*` path alias in `tsconfig.json`

### Build & Deployment
- **Dev mode**: Two processes run together — `expo:dev` (Metro bundler) and `server:dev` (Express with tsx)
- **Production build**: `scripts/build.js` handles static Expo export; Express serves the built assets
- **Environment variables**: `EXPO_PUBLIC_DOMAIN` is used by the frontend to construct API URLs; `REPLIT_DEV_DOMAIN` and `REPLIT_INTERNAL_APP_DOMAIN` are used for Replit-specific URL resolution

## External Dependencies

| Dependency | Purpose |
|---|---|
| PostgreSQL (via `pg`) | Primary database; connected via `DATABASE_URL` env variable |
| Drizzle ORM + drizzle-kit | Database schema management and migrations |
| Expo SDK (~54) | Mobile app runtime and native APIs |
| expo-router (~6) | File-based navigation for React Native |
| TanStack React Query (^5) | Server state management and API data fetching |
| Express.js (^5) | Backend HTTP server |
| Inter Font (`@expo-google-fonts/inter`) | Typography |
| AsyncStorage (`@react-native-async-storage/async-storage`) | Local persistent storage on device |
| expo-location | Location services (imported, for future use) |
| expo-image-picker | Camera/gallery access (imported, for future use) |
| react-native-reanimated | Smooth animations |
| react-native-gesture-handler | Touch gesture support |
| Zod | Runtime schema validation |

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (required for backend database operations)
- `EXPO_PUBLIC_DOMAIN` — The domain where the Express API is served (set automatically by Replit dev scripts)
- `REPLIT_DEV_DOMAIN` — Set automatically by Replit in development
- `REPLIT_DOMAINS` — Set automatically by Replit for deployed domains