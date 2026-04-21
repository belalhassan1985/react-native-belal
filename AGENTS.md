# AGENTS.md

## Project Overview
- Expo (React Native) app with expo-router file-based routing
- Entry: `expo-router/entry` (not a traditional index file)
- Routes live in `app/` directory
- Arabic RTL-first design

## Commands
```bash
npm start        # Start dev server (choose platform interactively)
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web
npm run lint     # ESLint via expo lint
```

## TypeScript
- Strict mode enabled
- Path alias: `@/*` → `./*`

## Architecture Notes
- File-based routing: `app/index.tsx` redirects to login or profile
- Routes: `/login`, `/(tabs)/profile`
- Source code in `src/` directory
- New Architecture enabled (`newArchEnabled: true` in app.json)
- React Compiler enabled (`reactCompiler: true` in experiments)
- Typed routes enabled (`typedRoutes: true`)

## Folder Structure
```
src/
  components/   # Reusable UI (Button, Input, Loading)
  services/     # API services (authService, userService)
  hooks/        # Custom hooks (useAuth, useI18n)
  types/        # TypeScript interfaces
  utils/        # API client, storage utilities
  constants/    # Colors, API config
```

## Testing
- **No test framework configured** - none of jest, testing-library, or vitest installed

## Key Dependencies
- expo-router@6, expo@54, react-native@0.81.5, react@19.1.0
- @react-native-async-storage/async-storage (token storage)
- react-native-reanimated@4.1.1, react-native-worklets@0.5.1

## Required Backend Endpoints
Update `src/constants/index.ts` with your API base URL:

| Endpoint | Method | Request | Response |
|----------|--------|---------|-----------|
| `/auth/login` | POST | `{ email, password }` | `{ status, data: { token, role } }` |
| `/auth/logout` | POST | - | - |
| `/auth/get-profile` | GET | Bearer token | `{ status, data: UserProfile }` |

UserProfile fields: id, email, role, first_name, second_name, third_name, fourth_name, nickname, gender, birth_date, training_center, state, image_url, is_first_login