# Trainee Mobile App — Architecture

This document defines the technical architecture of the trainee-facing React Native (Expo) application: high-level shape, API layer, auth handling, state management, folder structure, routing, theming, errors, performance, security, and testing strategy.

It reflects the current state of the codebase (Expo 54, React Native 0.81, expo-router 6, React 19, React Compiler on, New Architecture on) and the target state at the end of Phase 1.

---

## 1. High-Level Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        Expo App Shell                        │
│  (app/_layout.tsx: providers + stack + splash)              │
├──────────────────────────────────────────────────────────────┤
│   Providers:                                                 │
│     - I18nProvider (Arabic-first)                            │
│     - AuthProvider (token + profile)                         │
│     - ThemeProvider (dark default)                           │
│     - ErrorBoundary                                          │
├──────────────────────────────────────────────────────────────┤
│   Routing (expo-router):                                     │
│     app/index.tsx  → auth gate                               │
│     app/login.tsx, app/reset-password.tsx                    │
│     app/(tabs)/home, courses, my-courses, profile            │
│     app/course/[id], lecture/[id], lesson/[id]               │
│     app/notifications, join-requests                         │
├──────────────────────────────────────────────────────────────┤
│   Screens → feature hooks → services                         │
│     (e.g. useAuth, useHomeData, courseService, ...)          │
├──────────────────────────────────────────────────────────────┤
│   Services (src/services/*)                                  │
│     authService, userService, courseService,                 │
│     lessonProgressService, notificationService,              │
│     joinRequestService, trainingCenterService                │
├──────────────────────────────────────────────────────────────┤
│   apiClient (src/utils/apiClient.ts)                         │
│     - Base URL                                               │
│     - Bearer token injection (expo-secure-store)             │
│     - 401 auto-logout                                        │
│     - Response envelope unwrap                               │
│     - Error normalization                                    │
├──────────────────────────────────────────────────────────────┤
│   Backend (TCMS)                                             │
│     https://api.tcms-iraq.com (see src/constants/index.ts)   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. API Layer

### 2.1 Responsibilities of `apiClient`

- **Base URL**: reads from `src/constants/index.ts` → `API_BASE_URL`.
- **Token injection**: reads token from `expo-secure-store` for every outgoing request. Adds `Authorization: Bearer <token>` header.
- **Response envelope unwrap**: the backend returns `{ status, data }`. The client exposes only `data` to callers, or throws on `status === false`.
- **Error normalization**: maps HTTP status + server `message` into a typed `ApiError` class with a stable shape.
- **401 handling**: on `401`, clear secure-store token, update `AuthContext.isAuthenticated = false`, and redirect to `/login`. Emit a toast "Session expired".
- **Timeouts**: 15 seconds default, 60 seconds for upload calls.
- **Retry policy**: none in MVP (avoid hidden retries in auth-sensitive flows). Phase 2: idempotent `GET`s retried twice with exponential backoff on network error.
- **Logging**: redact `Authorization` header from any debug logs.

### 2.2 Service Module Convention

One service file per backend module under `src/services/`:

```
authService.ts             -> /auth/*
userService.ts             -> /auth/get-profile + local profile cache
courseService.ts           -> /course/*, /course-lecture/*, /course-lesson/*
joinRequestService.ts      -> /course-join-request/*
lessonProgressService.ts   -> /lesson-progress/*
notificationService.ts     -> /notification/*
trainingCenterService.ts   -> /training-center/*
traineeService.ts          -> /trainee/* (self-read/update only)
```

Each service exports pure async functions that:
- accept typed parameters
- return typed payloads (from `src/types/`)
- never touch React state directly

---

## 3. Auth Handling

### 3.1 Storage

- Token persists in **`expo-secure-store`** (keychain on iOS, EncryptedSharedPreferences on Android). Never `AsyncStorage`, never in-memory only.
- Profile cache persists in memory only; re-fetched on cold start to validate session.

### 3.2 `AuthProvider` contract

```
interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  login(email, password): Promise<void>;
  logout(): Promise<void>;
  refreshProfile(): Promise<void>;
}
```

Rules:
- `checkAuth()` runs on provider mount. It reads the token, calls `GET /auth/get-profile`, and sets state. A failure clears the token.
- `login()` stores token, fetches profile, sets state, and redirects (caller's responsibility).
- `logout()` calls `POST /auth/logout` (best-effort), clears token, resets state, redirects to `/login`.
- `refreshProfile()` re-fetches without touching token state. Used after `reset-first-login` and `update-trainee`.

### 3.3 First-Login Enforcement

Every authenticated layout checks `profile?.is_first_login`. If `true`, it redirects to `/reset-password`. The reset screen calls `POST /auth/reset-first-login` then `refreshProfile()`.

### 3.4 Token Refresh Strategy

- **MVP**: no refresh-token workflow visible in swagger. When a token expires, the `apiClient` 401 handler forces re-login.
- **Phase 2** (if backend provides): add `/auth/refresh` integration with a silent refresh on 401.

### 3.5 Logout Cascade

1. Attempt `POST /auth/logout` (don't block on errors).
2. Clear token from `expo-secure-store`.
3. Clear in-memory profile and any cached service data.
4. `router.replace('/login')`.

---

## 4. State Management

### 4.1 MVP Approach

**React Context + per-feature hooks.** No Redux, no Zustand, no TanStack Query in Phase 1.

Rationale:
- Current codebase already uses this pattern (`useAuth`, `useHomeData`).
- Fewer dependencies reduces build risk on React 19 + New Architecture.
- Most screens are read-mostly with simple lifecycle: fetch-on-mount, invalidate-on-focus.

Guidelines:
- Server data lives in feature hooks (`useCourses`, `useCourseDetails`, `useNotifications`).
- Hooks expose `{ data, isLoading, error, refetch }`.
- Mutations expose `{ mutate, isSubmitting, error }` and trigger `refetch` on dependent hooks via explicit calls.
- Cross-screen invalidation via lightweight event bus (e.g., `DeviceEventEmitter`) or shared context refs when needed.

### 4.2 Phase 2 Upgrade Path

Adopt **@tanstack/react-query** if and when any of the following is true:
- More than 3 screens need shared cache invalidation.
- Offline-first becomes a requirement.
- Optimistic UI updates are required for mutations.

Migration cost: rewrite feature hooks as `useQuery` / `useMutation`. Services remain unchanged.

### 4.3 Local UI State

- `useState` / `useReducer` for transient UI state.
- `react-hook-form` is **not** currently a dependency; keep form state with `useState` until complexity justifies adoption.

---

## 5. Folder Structure (Target)

```
app/                                # expo-router routes only
├── _layout.tsx                     # Providers + root Stack
├── index.tsx                       # Auth gate
├── login.tsx
├── reset-password.tsx
├── notifications.tsx
├── join-requests.tsx
├── (tabs)/
│   ├── _layout.tsx                 # Tab bar
│   ├── home.tsx
│   ├── courses.tsx
│   ├── my-courses.tsx
│   └── profile.tsx
├── course/[id].tsx
├── lecture/[id].tsx
├── lesson/[id].tsx
└── training-center/[id].tsx

src/
├── components/                     # Reusable, screen-agnostic UI
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   ├── Card.tsx
│   ├── CourseCard.tsx
│   ├── ModernCourseCard.tsx
│   ├── AvailableCourseCard.tsx
│   ├── CompletedCourseCard.tsx
│   ├── PublicCourseCard.tsx
│   ├── ProgressBar.tsx
│   ├── StatsCard.tsx
│   ├── AnimatedTabBar.tsx
│   └── index.ts
├── features/                       # Feature-scoped logic (new)
│   ├── auth/
│   ├── courses/
│   ├── lessons/
│   ├── notifications/
│   ├── profile/
│   └── joinRequests/
├── services/                       # API services (one per module)
│   ├── authService.ts
│   ├── userService.ts
│   ├── courseService.ts
│   ├── lessonProgressService.ts
│   ├── notificationService.ts
│   ├── joinRequestService.ts
│   ├── trainingCenterService.ts
│   └── traineeService.ts
├── hooks/                          # Cross-cutting hooks
│   ├── useAuth.tsx
│   ├── useI18n.tsx
│   ├── useHomeData.ts
│   ├── useCourses.ts
│   ├── useCourseDetails.ts
│   ├── useNotifications.ts
│   └── useMyCourses.ts
├── types/                          # Typed DTOs matching swagger
│   ├── index.ts
│   ├── auth.ts
│   ├── course.ts
│   ├── lesson.ts
│   ├── lessonProgress.ts
│   ├── notification.ts
│   ├── joinRequest.ts
│   ├── trainingCenter.ts
│   └── trainee.ts
├── utils/                          # Pure utilities
│   ├── apiClient.ts
│   ├── storage.ts                  # secure-store wrapper
│   ├── formatters.ts               # date/number/locale formatters
│   └── validation.ts
├── constants/                      # Theme, API config, enums
│   ├── index.ts                    # API_BASE_URL, COLORS, SPACING, FONT_SIZE, BORDER_RADIUS
│   ├── theme.ts
│   └── routes.ts                   # typed route constants
└── i18n/                           # Arabic-first translations
    ├── ar.ts
    └── en.ts                       # optional fallback
```

Principles:
- `app/` has no business logic — it only composes screens from feature hooks + components.
- `features/` is optional in MVP; if a screen is small, keep its logic in the route file.
- `services/` never imports from `components/` or `app/`.
- Types never import from services (one-way dependency graph).

---

## 6. Routing Strategy

- **expo-router 6** with `typedRoutes: true` (per `app.json`).
- Root `_layout.tsx` renders `<Stack>` with `<Slot />` inside providers.
- `(tabs)` group contains 4 tabs with a custom animated tab bar (existing `AnimatedTabBar`).
- Dynamic segments via `[id].tsx`.
- Deep linking via the `scheme: "reactnativebelal"` defined in `app.json`.
- Guard rails:
  - Unauthenticated users are redirected by `app/index.tsx` and any authenticated layout.
  - `is_first_login` gate in `_layout.tsx` of `(tabs)` group.

---

## 7. Theming, RTL, and Localization

### 7.1 Theme

- Colors: `src/constants/index.ts` → `COLORS` (dark-first palette).
- Spacing: `SPACING` tokens only. No magic numbers.
- Typography: `FONT_SIZE` tokens. Arabic-friendly font family set at app boot (e.g., IBM Plex Sans Arabic or Cairo).
- Radii: `BORDER_RADIUS` tokens.

### 7.2 RTL

- At app boot in `app/_layout.tsx`:
  ```
  import { I18nManager } from 'react-native';
  if (!I18nManager.isRTL) I18nManager.forceRTL(true);
  ```
- On first forced RTL, Expo requires a reload. This is a one-time cost.
- Prefer logical styles: `marginStart`, `marginEnd`, `paddingStart`, `paddingEnd`.
- Mirror direction-sensitive icons manually (`scaleX: -1`) when needed.

### 7.3 i18n

- Strings live in `src/i18n/ar.ts` (primary). An `en.ts` may be added as secondary.
- Access via `useI18n()` hook (exists). No hard-coded Arabic in components.

---

## 8. Error & Loading Patterns

- **Loading**: use `Skeleton` for list/grid, `Loading` (full-screen spinner) only for initial auth check.
- **Empty**: `EmptyState` component with title, subtitle, optional CTA.
- **Error**: `ErrorBanner` (new) with retry action. For destructive mutation errors, use a toast.
- **Error Boundary**: wrap the Stack in `app/_layout.tsx` with an `ErrorBoundary` that renders a recoverable fallback UI.

---

## 9. Performance

- **React Compiler** is enabled (`reactCompiler: true` in `app.json`). Avoid `useMemo` / `useCallback` unless measurement shows a benefit; compiler handles memoization.
- **New Architecture** (`newArchEnabled: true`) — ensure all native libraries are compatible (reanimated 4, gesture-handler 2, worklets 0.5).
- **Image caching** via `expo-image` (already installed).
- **Lists** use `FlatList` with `initialNumToRender`, `removeClippedSubviews` on Android, `keyExtractor` returning stable ids.
- **Navigation** minimizes bundle surprises by defining typed routes.

---

## 10. Security

- Tokens never in `AsyncStorage`. Use `expo-secure-store`.
- Never log `Authorization` headers or request bodies that contain credentials.
- Strip sensitive data from crash reports (opt-in telemetry only).
- All network traffic over HTTPS (enforced via `API_BASE_URL`).
- Clipboard access (for paste) is acceptable; don't copy tokens.
- SSL pinning is **out of scope** in MVP; reconsider if the app goes enterprise-grade.

---

## 11. Error Cases Matrix (End-to-End)

| Case | Where handled | Observable behavior |
|------|---------------|---------------------|
| Token missing | Auth gate | Redirect to login |
| Token expired | apiClient 401 | Clear session + redirect + toast |
| Server 5xx | apiClient | Error banner with retry |
| Validation 400/422 | Screen-level | Inline field errors |
| Conflict 409 | Screen-level | Toast with specific message |
| Network offline | apiClient | Error banner + offline banner |
| Fatal JS error | ErrorBoundary | Fallback UI with "Reload" |

---

## 12. Testing Strategy

- **None configured today** (no jest, no RNTL, no vitest, no detox).
- **Phase 2 recommendation**:
  - Unit: `jest` + `@testing-library/react-native` for hooks and components.
  - Integration: mock `apiClient` via MSW (React Native adapter) or axios-mock-adapter.
  - E2E: Detox or Maestro for critical flows (login, request-join, play lesson).
- **Until then**: rely on manual QA + TypeScript strict mode + ESLint (`expo lint`).

---

## 13. Dependencies Audit (from `package.json`)

Runtime (selected):
- `expo` 54.0.33 (New Architecture enabled)
- `expo-router` 6.0.23 (typed routes)
- `react` 19.1.0
- `react-native` 0.81.5
- `expo-secure-store` 15.0.8 (token storage)
- `@react-native-async-storage/async-storage` 2.2.0 (only for non-sensitive caches)
- `expo-image` 3.0.11 (image caching)
- `expo-linear-gradient` 55.0.13
- `react-native-gesture-handler` 2.28.0
- `react-native-reanimated` 4.1.1
- `react-native-safe-area-context` 5.6.0
- `react-native-screens` 4.16.0

Dev:
- `typescript` 5.9.2
- `eslint` + `eslint-config-expo`

To consider adding (Phase 2):
- `@react-native-community/netinfo` (offline detection)
- `@tanstack/react-query` (state/cache)
- `expo-notifications` (push)
- `expo-video` or `react-native-video` (lesson video playback)
- `zod` (runtime schema validation against swagger)

---

## 14. Commands & Tooling

From root (per `AGENTS.md`):
- `npm start` — interactive Expo dev server.
- `npm run android` | `npm run ios` | `npm run web`.
- `npm run lint` — `expo lint`.
- Typecheck via `npx tsc --noEmit` (no dedicated script).
- No test runner configured.

---

## 15. Non-Goals

- Not a web-first experience. `web` build exists but is secondary.
- No admin or center-employee capabilities.
- No offline-first data sync in MVP.
- No multi-tenant branding switching.
