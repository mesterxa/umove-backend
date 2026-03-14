# UMOVE ANNABA — Project Configuration

## Overview

UMOVE ANNABA is a professional mobile-first logistics/moving app for the Annaba region (Algeria). Built with Expo (React Native) + Express.js backend. Features Firebase Auth + Firestore for data persistence, multi-role access (Client / Partner / Admin), and a full multi-language system (Arabic RTL default, French, English).

## Brand
- Primary Blue: `#0A3D8F`
- Primary Orange: `#F47A20`
- Company: UMOVE ANNABA (Moving startup, Annaba, Algeria)

## User Preferences
- Communication: Simple, everyday language
- Admin email: `aymenmed25071999@gmail.com`

---

## System Architecture

### Frontend (Mobile App)
- **Framework**: Expo SDK ~54 (React Native) with `expo-router` file-based navigation
- **State Management**: React Context (Auth + Language), TanStack React Query for API calls
- **Firebase**: JS SDK v9+ — Auth (Email/Password) + Firestore
- **i18n**: Custom `lib/i18n.ts` — Arabic (RTL default), French, English; stored in AsyncStorage
- **RTL**: `I18nManager.forceRTL()` with `reloadAppAsync()` on language change
- **Navigation**: Stack only (no tabs). All screens use `headerShown: false`
- **Fonts**: Inter (400, 500, 600, 700) via `@expo-google-fonts/inter`

### App Screens
| Route | Description |
|---|---|
| `/` | Public landing page — hero, services, stats, "Why Us", quote form, "Be a Partner" CTA |
| `/login` | Firebase Email/Password login |
| `/signup` | Role selector (Client / Partner) + registration form |
| `/partner-setup` | Truck type + license plate form (Partners only, first-time) |
| `/dashboard` | Client dashboard: my orders, cancel button for active orders, payment summary modal on completion |
| `/partner-dashboard` | Yassir-like dispatch: GPS, Strict Driver Lock (one active order at a time), available orders polled 20s, accept button, my active orders with map button + status transitions, payment summary modal on completion |
| `/order-details` | OpenStreetMap screen for drivers (Leaflet.js + OSRM routing): live route polyline (driver → pickup → dropoff), color-coded markers, order info, call client, Start Navigation button |
| `/admin` | Admin-only panel: tabs for Orders / Users / Partners |
| `/settings` | Profile info, language switcher (AR/FR/EN), logout |

### Firebase Configuration (`lib/firebase.ts`)
```
apiKey: "AIzaSyBoTN26ZkMIDGnmlHU-qY_egHHuwJs9tIQ"
authDomain: "umove-annaba.firebaseapp.com"
projectId: "umove-annaba"
storageBucket: "umove-annaba.firebasestorage.app"
messagingSenderId: "771075643005"
appId: "1:771075643005:web:ffdb5f08a27f0190dac314"
```

### Firestore Collections
- `users/{uid}` — uid, email, name, phone, role (client|partner|admin), isApproved, needsTruckSetup, createdAt
- `partners/{uid}` — uid, truckType, licensePlate, status
- `orders/{id}` — orderId, clientName, clientPhone, pickupLocation {address, lat, lng}, dropoffLocation {address, lat, lng}, estimatedPrice (DZD), paymentMethod (cash|card|mobile_payment), status (searching|accepted|arrived|in_transit|completed), driverId (null until accepted), timestamp, updatedAt

### Auth Routing (AuthContext + _layout.tsx)
- `AuthRedirect` component auto-routes authenticated users to their correct dashboard
- Partners with `needsTruckSetup: true` → redirected to `/partner-setup`
- Admin email `aymenmed25071999@gmail.com` always gets `role: "admin"`

### Backend (Express API)
- **Framework**: Express.js 5 (`server/index.ts`)
- **Port**: 5000 — serves API + landing page HTML (`server/templates/landing-page.html`)
- **CORS**: Configured for Replit dev/deployment domains + allows `x-api-key`, `x-driver-id` headers
- **WebSocket**: `ws` server on `/ws/partners` — partners connect with `?driverId=&lat=&lng=` and receive `new_order` push events in real-time
- **Firestore**: Uses REST mode (`FIRESTORE_PREFER_REST=1`) for OpenSSL 3 compatibility

### Backend API Routes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Server health check |
| POST | `/api/deliveries` | None (client-facing) | Create order, triggers WebSocket notify to nearby partners |
| GET | `/api/deliveries?lat=&lng=` | `x-api-key` + `x-driver-id` (partner only, isApproved=true) | Returns `searching` orders sorted by proximity (Haversine) |
| PATCH | `/api/deliveries/:id` | `x-api-key` + `x-driver-id` | Advance order state machine. On `accepted`: checks Driver Lock (rejects 409 if driver has active order), sets `isBusy: true`. On `completed`/`cancelled`: sets `isBusy: false`. |
| POST | `/api/deliveries/:id/cancel` | Firebase Auth ID Token (Bearer) | Customer cancels order → sets status `cancelled`, frees driver (`isBusy: false`) |

### Backend Environment Variables
- `FIREBASE_PROJECT_ID` — Firebase project ID (secret)
- `FIREBASE_CLIENT_EMAIL` — Firebase service account email (secret)
- `FIREBASE_PRIVATE_KEY` — Firebase private key PEM (secret)
- `PARTNER_API_KEY` — Secret key required in `x-api-key` header for partner API access

### Key Backend Files
- `server/firebase-admin.ts` — Firebase Admin init with PEM normalization for OpenSSL 3
- `server/middleware/partnerAuth.ts` — `requireApiKey` + `requireApprovedPartner` middleware
- `server/utils/haversine.ts` — Distance calculation between GPS coordinates
- `server/websocket.ts` — WebSocket server, partner registry, proximity-based notify
- `server/routes/deliveries.ts` — Full delivery CRUD with new order schema
- `shared/orderSchema.ts` — Zod schemas + TypeScript types for orders

### Key Frontend Files
- `lib/partnerApi.ts` — Protected API service: `fetchAvailableOrders`, `acceptOrder`, `updateOrderStatus`, `cancelOrder`
- `lib/i18n.ts` — All three languages (AR/FR/EN) include dispatch UI strings
- `app/partner-dashboard.tsx` — Yassir-like dispatch: Driver Lock, isBusy badge, accept → navigate to map, payment summary modal
- `app/order-details.tsx` — Free map screen for drivers: WebView + Leaflet.js + OpenStreetMap tiles + OSRM routing polyline. No API key required. Color-coded markers (blue=driver, orange=pickup, red=dropoff), "Start Navigation" opens Google Maps for turn-by-turn navigation.
- `app/dashboard.tsx` — Customer dashboard with Cancel Order button + payment summary modal on completion

### Frontend Environment Variables
- `EXPO_PUBLIC_API_URL` — Backend URL (set to `https://$REPLIT_DEV_DOMAIN` in expo:dev script)
- `EXPO_PUBLIC_DOMAIN` — Legacy domain fallback (set to `$REPLIT_DEV_DOMAIN`)
- `EXPO_PUBLIC_PARTNER_API_KEY` — Shared secret for `x-api-key` header (same value as `PARTNER_API_KEY`)
- ~~`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`~~ — No longer needed. Maps now use OpenStreetMap (free, no API key) via Leaflet.js + OSRM routing inside a WebView.

---

## Firebase Console Setup Required

### 1. ✅ Email/Password Auth — ENABLED
### 2. ✅ Firestore Database — ENABLED

### 3. Add Authorized Domain for web browser auth
Firebase Auth restricts which domains can trigger auth. You must add your Replit dev domain:
- **Firebase Console** → Authentication → Settings → **Authorized Domains**
- Add: `7c76c8de-1de7-4b39-9ea5-c47fedb91e31-00-23vw3t2mk61rm.worf.replit.dev`
- Also add your deployed `.replit.app` domain once you publish

> **Note**: Auth works natively on physical device via Expo Go without this step. This only affects web browser testing.

### 4. Recommended Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /partners/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
  }
}
```

---

## Development Workflows
- **Start Backend**: `npm run server:dev` — Express on port 5000
- **Start Frontend**: `npm run expo:dev` — Metro bundler + Expo on port 8081

## Key Files
- `lib/firebase.ts` — Firebase app, auth, Firestore initialization
- `lib/i18n.ts` — All translations (AR/FR/EN) + language helpers
- `context/AuthContext.tsx` — Auth state, login/register/logout
- `context/LanguageContext.tsx` — Language state + RTL switching
- `constants/colors.ts` — Brand color palette
- `app/_layout.tsx` — Root layout, providers, AuthRedirect
