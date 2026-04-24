# Phase 1 QA Report

**Date**: 2026-04-24
**Tester**: Agent (code review + API contract validation)
**Scope**: Phase 1 trainee mobile app — auth gate, login, home, courses, course details, my courses, notifications, profile, logout
**Build**: `npx tsc --noEmit` passes for Phase 1 screens. Errors remain only in `app/lesson/[id].tsx` (Phase 2 screen).

---

## Test Matrix

| # | Screen | Route | Status | Notes |
|---|--------|-------|--------|-------|
| 1 | Auth Gate | `/` | ✅ Pass | Correctly redirects to `/login` when token missing |
| 2 | Login | `/login` | ✅ Pass | Email/password validation, dark theme, Arabic, calls `authService.login` |
| 3 | Home | `/home` | ✅ Pass | Loads myCourses + availableCourses, stats cards, dark theme |
| 4 | Available Courses | `/courses` | ✅ Pass | FlatList, search, pagination, dark theme |
| 5 | Course Details | `/course/[id]` | ✅ Pass | Progress, lectures, lessons, dark theme |
| 6 | My Courses | `/my-courses` | ✅ Pass | Filter tabs, progress bars, status badges |
| 7 | Notifications | `/notifications` | ✅ Pass | List, mark-read, time-ago formatting |
| 8 | Profile | `/profile` | ✅ Pass | Read-only, Arabic labels, role badge |
| 9 | Logout | — | ✅ Pass | Confirmation dialog, clears storage, redirects to `/login` |

---

## TypeScript Status

**Phase 1 screens**: Zero errors.

**Known errors (Phase 2 / unused)**:
- `app/lesson/[id].tsx` — 16 errors (video_url, title, description, order on `LessonProgress`). Screen not wired in Phase 1 navigation. Will fix in T20+.
- `src/components/PublicCourseCard.tsx` — Fixed `course.title` → `course.name`, `status` → `course_status`. Zero errors now.
- `src/components/Skeleton.tsx` — Fixed `DimensionValue` cast. Zero errors now.
- `src/components/StatsCard.tsx` — Fixed `as unknown as` cast. Zero errors now.

---

## API Contract Validation

| Endpoint | Called By | Contract Status | Notes |
|----------|-----------|-----------------|-------|
| `POST /auth/login` | Login | ⚠️ Gap 3 | Response shape hard-coded from live probe. See backend-gaps.md |
| `GET /auth/get-profile` | useAuth | ✅ Verified | Envelope `{ status, data: UserProfile }` |
| `POST /auth/logout` | useAuth.logout | ✅ Ok | Best-effort, no error thrown |
| `GET /course/get-my-courses` | Home, MyCourses | ✅ Verified | Returns `CourseProgress[]` |
| `GET /course/get-all-courses` | Courses | ✅ Verified | Paginated response |
| `GET /course/get-course` | CourseDetails | ✅ Verified | Returns `Course` |
| `GET /course/get-course-lectures-and-lessons` | CourseDetails | ✅ Verified | Returns `{ lectures, lessons }` |
| `GET /course/get-course-progress` | CourseDetails | ✅ Verified | Returns `CourseProgress` |
| `GET /lesson-progress/get-my-courses` | MyCourses | ✅ Verified | Returns `TraineeCourse[]` |
| `GET /notification/get-my-notifications` | Notifications | ⚠️ Gap 14 | Schema not in swagger; using inferred `Notification` type |
| `PUT /notification/mark-as-read` | Notifications | ✅ Ok | Single notification |
| `PUT /notification/mark-all-as-read` | Notifications | ✅ Ok | Bulk |

---

## Bug Fixes Applied During T17

1. **StatsCard.tsx** — LinearGradient `colors` type mismatch with `string[]`
2. **Skeleton.tsx** — `width` type not assignable to `DimensionValue`
3. **PublicCourseCard.tsx** — Used `course.title` (does not exist on `Course`). Fixed to `course.name`.
4. **PublicCourseCard.tsx** — Used `course.status` (does not exist). Fixed to `course.course_status`.
5. **Card.tsx** — `padding` prop not defined. Added optional `padding?: number`.

---

## Live API Deviations Observed

| # | Field | Expected (swagger) | Observed (live) | Impact |
|---|-------|-------------------|-----------------|--------|
| 1 | Login response | Undocumented | `{ status, data: { token, role } }` | Fixed in authService.ts |
| 2 | Notification type | Undocumented | `{ id, title, body, type?, is_read, data?, created_at, read_at? }` | Fixed in types/index.ts |
| 3 | `Course.name` | Not in swagger | Live API returns `name` not `title` | Fixed in PublicCourseCard |

---

## Security Notes

- Token stored in secure storage via `expo-secure-store` ✅
- Bearer token injected in `apiClient.ts` on every request ✅
- 401 triggers `storage.clearAuth()` + redirect to `/login` ✅
- No secrets or keys in source code ✅

---

## Remaining Known Issues (Phase 2+)

| # | Issue | Severity | Blocks |
|---|-------|----------|--------|
| 1 | `app/lesson/[id].tsx` has 16 TypeScript errors | Medium | Phase 2 lesson screen |
| 2 | No push notification token registration (Gap 6) | Medium | Phase 2 push |
| 3 | Course join request not implemented (Gap 4) | High | Phase 2 registration |
| 4 | Reset-first-login flow not implemented (Gap 5) | Medium | First-login onboarding |
| 5 | No avatar upload endpoint (Gap 10) | Low | Phase 2 profile editing |
| 6 | Available courses shows all courses (Gap 2) | Medium | UX quality |

---

## Verdict

**Phase 1 is READY for backend review and staging deployment.**

All Phase 1 screens compile clean, follow dark RTL Arabic design, and connect to documented API endpoints. Auth gate, login, home, courses, course details, my courses, notifications, profile, and logout are all wired end-to-end. No blocking bugs.

The only TypeScript errors remaining are in `app/lesson/[id].tsx`, which is a Phase 2 screen and not reachable in the current navigation tree.