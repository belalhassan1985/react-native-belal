# Trainee Mobile App — Screens Specification

This document specifies every trainee-facing screen: route, purpose, data sources, components, states, user actions, and RTL notes.

Total screens: **13** (11 primary + 2 secondary stacks).

Navigation model: `expo-router` with a `(tabs)` group for authenticated top-level navigation and stack routes for details.

---

## Navigation Map

```
app/
├── index.tsx                       # Splash / auth gate
├── _layout.tsx                     # Root layout (AuthProvider, I18nProvider, Stack)
├── login.tsx                       # Login
├── reset-password.tsx              # Reset First Login
├── notifications.tsx               # Notifications list
├── join-requests.tsx               # Join request status list
├── (tabs)/
│   ├── _layout.tsx                 # Tab bar
│   ├── home.tsx                    # Home / Dashboard
│   ├── courses.tsx                 # Available Courses
│   ├── my-courses.tsx              # My Enrolled Courses
│   └── profile.tsx                 # Profile
├── course/
│   └── [id].tsx                    # Course Details
├── lecture/
│   └── [id].tsx                    # Lecture Details
├── lesson/
│   └── [id].tsx                    # Lesson Viewer
└── training-center/
    └── [id].tsx                    # Training Center Details
```

---

## Screen 1 — Splash / Auth Check

- **Route**: `app/index.tsx`
- **Purpose**: Show a brief splash while determining auth state and routing the user.
- **Data sources**:
  - `AuthProvider.checkAuth()` → reads token from `expo-secure-store`.
  - `GET /auth/get-profile` (validation call).
- **UI components**: `Loading` (existing in `src/components/Loading.tsx`), brand logo.
- **States**:
  - Loading (default) — spinner centered.
  - Authenticated → `router.replace('/(tabs)/home')`.
  - Unauthenticated → `router.replace('/login')`.
  - First-login detected → `router.replace('/reset-password')`.
- **User actions**: None (automatic).
- **RTL notes**: Logo centered, no directional elements.

```
┌─────────────────────────────┐
│                             │
│          [ LOGO ]           │
│                             │
│         ⟳  loading          │
│                             │
└─────────────────────────────┘
```

---

## Screen 2 — Login

- **Route**: `app/login.tsx` (already stubbed)
- **Purpose**: Authenticate trainee with email + password.
- **Data sources**:
  - `POST /auth/login` with `{ email, password }`.
  - On success, `GET /auth/get-profile` to detect `is_first_login`.
- **UI components**:
  - `Input` (email, password) — existing component
  - `Button` (primary) — existing component
  - Logo, tagline, "Forgot password?" link (future)
- **States**:
  - Idle — empty inputs, disabled button until fields valid.
  - Submitting — button loading, inputs disabled.
  - Error — inline error banner (wrong credentials, network error).
  - Success → redirect.
- **User actions**: Submit, toggle password visibility, paste email.
- **RTL notes**: Email field uses LTR input direction even under RTL layout; password field follows system direction.

```
┌─────────────────────────────┐
│        [ LOGO ]             │
│   Training Management       │
│                             │
│   البريد الإلكتروني         │
│   ┌───────────────────┐     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   كلمة المرور               │
│   ┌───────────────────┐     │
│   │                👁  │     │
│   └───────────────────┘     │
│                             │
│   [     تسجيل الدخول    ]   │
│                             │
└─────────────────────────────┘
```

---

## Screen 3 — Reset First Login

- **Route**: `app/reset-password.tsx` (new)
- **Purpose**: Force first-time users to set a new password.
- **Data sources**: `POST /auth/reset-first-login` (body shape per `ResetFirstLoginDto`).
- **UI components**: `Input` (new password, confirm), `Button`, validation hint list.
- **States**:
  - Idle, submitting, success → navigate home, error → inline.
  - Password strength indicator (client-side).
- **User actions**: Submit, show/hide password, cancel (→ logout).
- **RTL notes**: Error messages and instructions all Arabic-first; ensure password dots render correctly under RTL.

---

## Screen 4 — Home / Dashboard

- **Route**: `app/(tabs)/home.tsx` (already stubbed)
- **Purpose**: Overview dashboard with greeting, enrolled course progress, unread notifications, and quick actions.
- **Data sources**:
  - `GET /auth/get-profile` (greeting + avatar)
  - `GET /lesson-progress/my-courses` (enrolled courses preview)
  - `GET /notification/unread-count` (badge)
- **UI components**:
  - Header with avatar + bell icon + unread badge
  - `StatsCard` (existing) — total courses, completed courses, progress %
  - Horizontal list of enrolled course cards (`ModernCourseCard` existing)
  - CTA: "تصفح الدورات المتاحة" → navigates to Available Courses tab
- **States**:
  - Loading — `Skeleton` placeholders.
  - Empty (no enrolled courses) — `EmptyState` with CTA to browse courses.
  - Error — retry banner.
- **User actions**:
  - Tap bell → `/notifications`
  - Tap course card → `/course/[id]`
  - Tap CTA → switch tab to Available Courses
  - Pull to refresh → re-fetch all three endpoints
- **RTL notes**: Horizontal list reverses scroll direction under RTL; bell icon position flips to the logical start side.

---

## Screen 5 — Available Courses

- **Route**: `app/(tabs)/courses.tsx` (new)
- **Purpose**: Browse all courses the trainee can request to join.
- **Data sources**:
  - `GET /course/get-all-courses?page=&pageItemsCount=&search=`
  - For each course card, optionally `GET /course-join-request/get-course-join-status` (or batched client-side filter of `/course-join-request/get-my-join-requests`).
- **UI components**:
  - Search input at top
  - Filter chips (category, training center) — Phase 2
  - `AvailableCourseCard` (existing) with status badge (Not requested / Pending / Enrolled)
  - Infinite scroll via `FlatList`
- **States**:
  - Loading (initial) — skeleton cards
  - Loading (more) — footer spinner
  - Empty (no results) — `EmptyState`
  - Error — retry banner
- **User actions**:
  - Tap card → `/course/[id]`
  - Search → re-fetch with `search` query
  - Pull to refresh
- **RTL notes**: Search icon mirrored; card content aligned `start`.

---

## Screen 6 — My Enrolled Courses

- **Route**: `app/(tabs)/my-courses.tsx` (may consolidate with existing `completed.tsx`)
- **Purpose**: List of courses the trainee is actively enrolled in.
- **Data sources**:
  - `GET /lesson-progress/my-courses` (returns `CourseProgressResponseDto[]`)
- **UI components**:
  - Segmented control: **Active** | **Completed**
  - `CourseCard` / `CompletedCourseCard` (existing)
  - Progress bar per card (`ProgressBar` existing)
- **States**:
  - Loading, Empty (no enrolled courses — CTA to browse), Error
- **User actions**:
  - Tap card → `/course/[id]`
  - Toggle Active/Completed segment
  - Pull to refresh
- **RTL notes**: Segmented control order logical start→end.

---

## Screen 7 — Profile

- **Route**: `app/(tabs)/profile.tsx` (already stubbed)
- **Purpose**: View (and eventually edit) personal info + access to account-related actions.
- **Data sources**:
  - `GET /auth/get-profile`
  - (Phase 2) `GET /trainee/get-one-trainee?id=...`
  - (Phase 2) `PUT /trainee/update-trainee`
- **UI components**:
  - Profile header (avatar, full name, nickname, email)
  - Info list items (gender, birth date, training center, state)
  - Menu items:
    - "طلباتي للالتحاق" → `/join-requests`
    - "الإشعارات" → `/notifications`
    - "تعديل الملف الشخصي" (Phase 2)
    - "تسجيل الخروج"
- **States**: Loading (skeleton), Error (retry), Success (data).
- **User actions**: Navigate menu items, logout (confirmation dialog).
- **RTL notes**: Menu chevrons flip under RTL.

---

## Screen 8 — Notifications

- **Route**: `app/notifications.tsx` (new)
- **Purpose**: List all notifications with read/unread state.
- **Data sources**:
  - `GET /notification/my-notifications` (paginated)
  - `POST /notification/{id}/mark-as-read`
  - `POST /notification/mark-all-as-read`
- **UI components**:
  - Header with "وضع علامة مقروء على الكل" action
  - List item: title, body preview, timestamp (relative), read indicator dot
- **States**: Loading, Empty ("لا توجد إشعارات"), Error.
- **User actions**:
  - Tap item → mark read + optional deep link
  - Mark-all-as-read
  - Pull to refresh
- **RTL notes**: Read indicator on logical start side.

---

## Screen 9 — Course Details

- **Route**: `app/course/[id].tsx` (already stubbed)
- **Purpose**: Full course information and syllabus; entry point to lessons.
- **Data sources**:
  - `GET /course/get-course?id={id}`
  - `GET /course/get-course-lectures-and-lessons?id={id}`
  - `GET /course/get-training-centers-by-course?id={id}`
  - `GET /course-join-request/get-course-join-status?course_id={id}` (to determine enrolled/pending state)
  - If enrolled: `GET /lesson-progress/course/{courseId}` for aggregate progress
- **UI components**:
  - Hero image + title + category
  - Meta row: dates, status badge, training center link
  - Tabs or sections: **Overview** · **Curriculum (Lectures/Lessons)** · **Training Center**
  - CTA button (context-aware):
    - Not requested → "طلب الالتحاق" → opens confirmation
    - Pending → "بانتظار الموافقة" (disabled)
    - Enrolled → "متابعة التعلم" → jumps to first uncompleted lesson
- **States**: Loading (skeleton), Error (retry), Success.
- **User actions**:
  - Tap lecture → `/lecture/[id]`
  - Tap lesson → `/lesson/[id]` (only when enrolled)
  - Tap training center link → `/training-center/[id]`
  - Request to join
- **RTL notes**: Hero text aligned start; progress bar fills from start.

---

## Screen 10 — Lecture Details

- **Route**: `app/lecture/[id].tsx` (new)
- **Purpose**: Show lecture metadata and ordered lessons under it.
- **Data sources**: `GET /course-lecture/get-lecture?id={id}` (which includes lessons) or list from the course-level curriculum fetch.
- **UI components**: Title, description, ordered lesson list with duration and completion state.
- **States**: Loading, Error, Success.
- **User actions**: Tap lesson → `/lesson/[id]`.
- **RTL notes**: Lesson index numbers display in Eastern Arabic numerals when locale dictates.

---

## Screen 11 — Lesson Viewer

- **Route**: `app/lesson/[id].tsx` (already stubbed)
- **Purpose**: Display lesson content (video or text) and record progress.
- **Data sources**:
  - `GET /course-lesson/get-lesson?id={id}`
  - `GET /lesson-progress/lesson/{lessonId}` (seed last position)
  - `POST /lesson-progress/update` on periodic interval + on exit
- **UI components**:
  - Video player (TBD: `expo-video` or `react-native-video`)
  - Title, description, resources list (if backend adds)
  - Prev / Next lesson buttons
- **States**: Loading, Error (lesson unavailable), Playing, Paused, Completed.
- **User actions**: Play/pause/seek, mark complete, next/prev, back to course.
- **RTL notes**: Player controls remain LTR (standard media convention); surrounding UI RTL.

---

## Screen 12 — Training Center Details

- **Route**: `app/training-center/[id].tsx` (new)
- **Purpose**: Show training center info and public notes.
- **Data sources**:
  - `GET /training-center/get-training-center?id={id}`
  - `GET /training-center/get-all-notes-bt-training-center?training_center_id={id}` (if trainee authorized)
- **UI components**: Center name, address, contact, map link (Phase 2), list of notes.
- **States**: Loading, Error, Success, Empty (no notes).
- **User actions**: Tap phone → dial; tap address → open maps; tap note → expand.
- **RTL notes**: Address lines aligned start.

---

## Screen 13 — Join Requests Status

- **Route**: `app/join-requests.tsx` (new)
- **Purpose**: Track all courses the trainee has requested to join and their status.
- **Data sources**: `GET /course-join-request/get-my-join-requests`.
- **UI components**: Request card: course name, training center, status chip (Pending/Approved/Rejected), requested-at timestamp, QR button for Pending (optional).
- **States**: Loading, Empty, Error, Success.
- **User actions**:
  - Tap card → `/course/[id]`
  - Tap QR (Pending only) → modal showing `GET /course-join-request/generate-qr/{requestId}` (Phase 3)
- **RTL notes**: Status chip positioned on logical end side.

---

## Shared / Reusable Components Inventory

From `src/components/`:
- `Button.tsx` — primary/secondary buttons
- `Input.tsx` — text input with label
- `Loading.tsx` — full-screen spinner
- `Skeleton.tsx` — placeholder blocks
- `EmptyState.tsx` — empty state composition
- `Card.tsx`, `CourseCard.tsx`, `ModernCourseCard.tsx`, `AvailableCourseCard.tsx`, `CompletedCourseCard.tsx`, `PublicCourseCard.tsx` — card variants
- `ProgressBar.tsx` — linear progress
- `StatsCard.tsx` — KPI card
- `AnimatedTabBar.tsx` — custom tab bar

New components to introduce during Phase 1/2:
- `NotificationItem`
- `JoinRequestCard`
- `LectureItem`
- `LessonItem`
- `StatusBadge`
- `SearchBar`
- `ErrorBanner`
- `OfflineBanner`

---

## Global UI Patterns

- **Theme**: dark-first, see `src/constants/index.ts` `COLORS` object.
- **Spacing**: use `SPACING` tokens exclusively.
- **Typography**: use `FONT_SIZE` tokens; Arabic font family applied at root.
- **Border radius**: use `BORDER_RADIUS` tokens.
- **Motion**: prefer `react-native-reanimated` animations; avoid LayoutAnimation on RTL.
- **Feedback**: haptics via `expo-haptics` for primary CTAs and success states.
