# Trainee Mobile App — Phase 1 Task Breakdown

Executable task list for Phase 1 (MVP). Each task has an ID, title, description, files touched, endpoints, acceptance criteria, estimated effort, and dependencies.

Effort units: **XS** (≤1h), **S** (≤4h), **M** (≤1 day), **L** (2 days), **XL** (3+ days).

No code is written by this document — each task is to be executed in sequence or where dependencies allow parallelism.

---

## Phase 1 Kickoff Checklist

Before starting T1:

- [ ] Confirm `API_BASE_URL` in `src/constants/index.ts` matches the agreed backend environment.
- [ ] Obtain a valid test trainee account (email + password) on the live backend.
- [ ] Verify backend is reachable from dev machine (`curl <BASE>/auth/get-profile` with token).
- [ ] Confirm iOS simulator and Android emulator both run `npm run ios` / `npm run android` from a clean clone.
- [ ] Confirm `npm run lint` and `npx tsc --noEmit` both pass on `main` before starting work.
- [ ] Document the live `POST /auth/login` response shape (fills Gap 3).
- [ ] Document the `Notification` entity shape (fills Gap 14).

---

## Tasks

### T1 — Lock API Configuration and Probe Login

- **Description**: Verify and lock `API_BASE_URL`. Probe `/auth/login` live to document the exact response envelope. Update `docs/api-mapping.md` with the verified shape.
- **Files to touch**: `src/constants/index.ts`, `docs/api-mapping.md`.
- **Endpoints**: `POST /auth/login`, `GET /auth/get-profile`.
- **Acceptance**: `API_BASE_URL` committed; verified response shape committed to docs.
- **Effort**: S.
- **Depends on**: None.

---

### T2 — Define Typed DTOs

- **Description**: Create TypeScript types in `src/types/` matching the swagger schemas and observed live responses.
- **Types to define**:
  - `LoginDto`, `LoginResponse`, `UserProfile`
  - `Course`, `CourseLecture`, `CourseLesson` (validate against `src/types/course.ts`)
  - `LessonProgressResponseDto`, `LectureProgressResponseDto`, `CourseProgressResponseDto` (validate against `src/types/lessonProgress.ts`)
  - `Notification`, `NotificationListResponse`, `UnreadCountResponse`
  - `TrainingCenter`, `TrainingCenterNote`
  - `JoinRequest`
- **Files**: `src/types/auth.ts`, `src/types/course.ts`, `src/types/lesson.ts`, `src/types/notification.ts`, `src/types/trainingCenter.ts`, `src/types/joinRequest.ts`, `src/types/index.ts`.
- **Endpoints**: none (type-only).
- **Acceptance**: `npx tsc --noEmit` passes; no `any` types in new files.
- **Effort**: M.
- **Depends on**: T1.

---

### T3 — Harden `apiClient`

- **Description**: Ensure `apiClient` reads the secure-store token, adds the `Authorization` header, unwraps the `{ status, data }` envelope, normalizes errors to an `ApiError` class, and handles 401 by clearing session + redirecting.
- **Files**: `src/utils/apiClient.ts`, `src/utils/storage.ts`.
- **Endpoints**: cross-cutting.
- **Acceptance**: A deliberately-expired token causes a redirect to `/login` and a "Session expired" toast on the next API call.
- **Effort**: M.
- **Depends on**: T2.

---

### T4 — Finalize `authService`

- **Description**: Implement/verify `login`, `logout`, `getProfile`, `isAuthenticated` in `src/services/authService.ts`. Must use `apiClient` and `expo-secure-store`.
- **Files**: `src/services/authService.ts`.
- **Endpoints**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/get-profile`.
- **Acceptance**: Unit-level behavior verified against live API in a dev device. Token persists across cold restarts.
- **Effort**: S.
- **Depends on**: T3.

---

### T5 — Login Screen

- **Description**: Build Login screen wired to `authService.login`. Validate email + password; show inline errors on 401; on success hydrate profile via `getProfile` and redirect to `/(tabs)/home`. If `is_first_login === true`, redirect to `/reset-password` (stub that screen with a placeholder for Phase 2 if Gap 5 unresolved).
- **Files**: `app/login.tsx`, `src/components/Input.tsx` (if adjustments needed), `src/components/Button.tsx`.
- **Endpoints**: `POST /auth/login`, `GET /auth/get-profile`.
- **Acceptance**:
  - Happy path redirects to Home.
  - Wrong password shows inline error.
  - Empty fields disable submit.
  - Password visibility toggle works.
  - RTL layout verified.
- **Effort**: M.
- **Depends on**: T4.

---

### T6 — Auth Gate at `app/index.tsx`

- **Description**: Verify/adjust the existing gate so it redirects based on `AuthProvider` state and respects the first-login flag.
- **Files**: `app/index.tsx`, `src/hooks/useAuth.tsx`, `app/_layout.tsx`.
- **Endpoints**: `GET /auth/get-profile` (via `checkAuth()`).
- **Acceptance**: Cold start with valid token lands on Home; with missing token lands on Login; with expired token lands on Login.
- **Effort**: S.
- **Depends on**: T5.

---

### T7 — Profile Screen (Read-Only)

- **Description**: Implement the Profile tab reading from `AuthContext.profile`. Show avatar, full name, email, nickname, gender, birth date, training center, state. Include "Logout" action that calls `authService.logout()`, clears state, and redirects.
- **Files**: `app/(tabs)/profile.tsx`.
- **Endpoints**: `GET /auth/get-profile` (via context), `POST /auth/logout`.
- **Acceptance**: Profile renders all fields for the test account; logout returns to Login and local storage is empty.
- **Effort**: M.
- **Depends on**: T6.

---

### T8 — `courseService.getAllCourses`

- **Description**: Implement `courseService.getAllCourses({ page, pageItemsCount, search })` hitting `GET /course/get-all-courses`.
- **Files**: `src/services/courseService.ts`, `src/types/course.ts`.
- **Endpoints**: `GET /course/get-all-courses`.
- **Acceptance**: Returns a typed list. Pagination and search params forward correctly.
- **Effort**: S.
- **Depends on**: T3.

---

### T9 — Available Courses Tab

- **Description**: Build the Available Courses tab using `FlatList` + existing `AvailableCourseCard`. Add a `SearchBar` header and pull-to-refresh. Show skeleton during loading, `EmptyState` on no results, and error banner with retry.
- **Files**: `app/(tabs)/courses.tsx`, `src/components/SearchBar.tsx` (new), `src/components/ErrorBanner.tsx` (new), `src/hooks/useCourses.ts` (new).
- **Endpoints**: `GET /course/get-all-courses`.
- **Acceptance**: Scroll paginates; search debounces at 400 ms; pull-to-refresh works; empty and error states render correctly; RTL verified.
- **Effort**: L.
- **Depends on**: T8.

---

### T10 — `courseService.getCourse` + `getCourseLecturesAndLessons`

- **Description**: Implement `getCourse(id)` and `getCourseLecturesAndLessons(id)` and `getTrainingCentersByCourse(id)`.
- **Files**: `src/services/courseService.ts`.
- **Endpoints**: `GET /course/get-course`, `GET /course/get-course-lectures-and-lessons`, `GET /course/get-training-centers-by-course`.
- **Acceptance**: Each function returns a typed payload. Errors propagate.
- **Effort**: S.
- **Depends on**: T2.

---

### T11 — Course Details Screen

- **Description**: Build the Course Details screen at `app/course/[id].tsx`. Show hero + overview, training center section, and curriculum (lectures → lessons, read-only in MVP). The "Request to Join" CTA is stubbed disabled in MVP with a tooltip "Coming in Phase 2".
- **Files**: `app/course/[id].tsx`, `src/components/LectureItem.tsx` (new), `src/components/LessonItem.tsx` (new), `src/hooks/useCourseDetails.ts` (new).
- **Endpoints**: `GET /course/get-course`, `GET /course/get-course-lectures-and-lessons`, `GET /course/get-training-centers-by-course`.
- **Acceptance**: All three fetches resolve and render; nested scroll works; back button returns to previous tab; RTL verified; handles 404 gracefully.
- **Effort**: L.
- **Depends on**: T9, T10.

---

### T12 — `lessonProgressService.getMyCourses`

- **Description**: Implement `getMyCourses()` hitting `GET /lesson-progress/my-courses`.
- **Files**: `src/services/lessonProgressService.ts` (exists; verify/adjust), `src/types/lessonProgress.ts`.
- **Endpoints**: `GET /lesson-progress/my-courses`.
- **Acceptance**: Returns `CourseProgressResponseDto[]`.
- **Effort**: S.
- **Depends on**: T3.

---

### T13 — My Courses Tab

- **Description**: Build the My Courses tab with a segmented Active/Completed toggle. Use `lesson-progress/my-courses` to drive both states — "Completed" filters where `progress_percentage === 100`.
- **Files**: `app/(tabs)/my-courses.tsx`, `src/hooks/useMyCourses.ts` (new), `src/components/CompletedCourseCard.tsx` (exists), `src/components/CourseCard.tsx` (exists).
- **Endpoints**: `GET /lesson-progress/my-courses`.
- **Acceptance**: Both tabs populate correctly. Empty states render CTA to Available Courses.
- **Effort**: M.
- **Depends on**: T12.

---

### T14 — `notificationService` + Notifications Screen + Unread Badge

- **Description**: Implement `getMyNotifications` and `getUnreadCount` in `src/services/notificationService.ts`. Add the Notifications screen with a paginated list. Show an unread badge on the Home tab bell icon driven by `getUnreadCount` (poll every 30s while on Home).
- **Files**: `src/services/notificationService.ts` (new), `app/notifications.tsx` (new), `app/(tabs)/home.tsx` (badge integration), `src/components/NotificationItem.tsx` (new), `src/hooks/useNotifications.ts` (new).
- **Endpoints**: `GET /notification/my-notifications`, `GET /notification/unread-count`.
- **Acceptance**: List paginates; badge updates. No mark-as-read action yet (Phase 2).
- **Effort**: L.
- **Depends on**: T3.

---

### T15 — Logout Flow

- **Description**: Wire logout in Profile. Call `POST /auth/logout`, clear secure store, reset `AuthContext`, navigate to `/login`. Show confirmation dialog before executing.
- **Files**: `app/(tabs)/profile.tsx`, `src/hooks/useAuth.tsx`, `src/services/authService.ts`.
- **Endpoints**: `POST /auth/logout`.
- **Acceptance**: After logout, re-opening the app lands on Login. No residual data in secure store or memory.
- **Effort**: S.
- **Depends on**: T7.

---

### T16 — RTL + Arabic i18n for Phase 1 Screens

- **Description**: Ensure all user-facing strings on Login, Home, Available Courses, My Courses, Course Details, Profile, and Notifications come from `src/i18n/ar.ts`. Verify RTL layout on all screens. Apply logical margins/paddings.
- **Files**: `src/i18n/ar.ts` (new or expanded), screen files.
- **Endpoints**: none.
- **Acceptance**: No hard-coded Arabic strings inline in components. RTL is correct on iOS + Android.
- **Effort**: M.
- **Depends on**: T5, T7, T9, T11, T13, T14.

---

### T17 — Phase 1 QA Pass

- **Description**: Execute a manual QA pass against the live API. Log every deviation from swagger, every UX bug, and every accessibility issue. Update `docs/api-mapping.md` and `docs/backend-gaps.md` with any new findings.
- **Files**: docs updates.
- **Endpoints**: all Phase 1 endpoints.
- **Acceptance**: QA checklist (see below) fully signed off.
- **Effort**: M.
- **Depends on**: T16.

---

## Task Dependency Graph

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 ─────────┐
                       │                  │
                       ├──────────────────┘
                       ↓
               T8 → T9 → T11
               ↓
               T10 ─────────┘
               ↓
               T12 → T13
               ↓
               T14
               ↓
               T15
               ↓
               T16
               ↓
               T17 (QA)
```

---

## Phase 1 Manual QA Checklist

Auth
- [ ] Login with valid credentials lands on Home.
- [ ] Login with wrong credentials shows inline error.
- [ ] Login with no network shows retry affordance.
- [ ] Token persists across app kill/reopen.
- [ ] Expired/invalid token forces redirect to Login on next call.
- [ ] Logout clears session and returns to Login.

Navigation
- [ ] Tabs work (Home / Courses / My Courses / Profile).
- [ ] Deep-link to `/course/[id]` works.
- [ ] Back button behavior consistent on iOS + Android.

Available Courses
- [ ] List paginates.
- [ ] Search debounces and filters.
- [ ] Pull-to-refresh works.
- [ ] Empty, loading, and error states render correctly.

Course Details
- [ ] Overview renders with metadata.
- [ ] Training center section renders.
- [ ] Curriculum tree renders lectures + lessons.
- [ ] Back navigation works.
- [ ] RTL-correct.

My Courses
- [ ] Active tab shows enrolled courses.
- [ ] Completed tab filters where progress = 100%.
- [ ] Empty state CTAs to Available Courses.

Notifications
- [ ] List renders with title, body, timestamp, read indicator.
- [ ] Unread badge reflects server count.
- [ ] Badge polls while on Home tab.

Profile
- [ ] All fields render.
- [ ] Logout works.

RTL + i18n
- [ ] No English strings in Arabic mode.
- [ ] Logical margins/paddings used.
- [ ] Directional icons mirrored where necessary.

Non-functional
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] Cold start < 3s on mid-range Android.
- [ ] No crashes in a 15-minute exploration session.

---

## Phase 1 Exit Review Template

- **Ship date**: _______________
- **Build number**: iOS _______, Android _______
- **Known issues**: (list bugs with severity)
- **Deferred to Phase 2**: (list items moved by scope cut)
- **Backend gaps resolved during Phase 1**: (update `docs/backend-gaps.md`)
- **Backend gaps still open**: (link to tickets)
- **Metrics baseline established**:
  - Crash-free sessions: ____%
  - Cold start p50 / p95: ____ / ____
  - Login success rate: ____%
  - Time-to-home: ____
- **Decision**: Proceed to Phase 2 / Hold for fixes.
