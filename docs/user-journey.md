# Trainee Mobile App — User Journey

## Primary Persona

**The Trainee**
- Authenticated mobile user enrolled in the Training Management System (TCMS).
- Arabic-first user; app is RTL by default with dark theme.
- Uses the app to discover courses, request enrollment, track lessons, and stay informed via notifications.
- Owns only **self-read** and **self-update** privileges — no admin operations.

---

## Journey 1 — First-Time Login (Forced Password Reset)

**Trigger**: Trainee receives credentials (serial number / email + temporary password) from a center admin and opens the app for the first time.

**Flow**:
1. App launches → `app/index.tsx` splash + auth check.
2. No token in `expo-secure-store` → redirect to `/login`.
3. Trainee enters email + temporary password → `POST /auth/login`.
4. Server responds with `token` + `role` + `is_first_login: true` on the profile.
5. App stores token securely.
6. App calls `GET /auth/get-profile` → detects `is_first_login === true`.
7. Redirect to `/reset-password` (Reset First Login screen).
8. Trainee sets a new password → `POST /auth/reset-first-login`.
9. On success, navigate to `/(tabs)/home`.

**Success criteria**: Trainee cannot reach any tab before completing first-login reset.

**Edge cases**:
- Wrong credentials → inline error on Login screen.
- Server returns `is_first_login: true` but reset API fails → user stays on reset screen with retry affordance.
- User backgrounds the app mid-reset → on resume, re-check `is_first_login` and re-gate.

---

## Journey 2 — Returning User (Auto-Login)

**Trigger**: Previously logged-in trainee re-opens the app.

**Flow**:
1. Splash screen shown via `expo-splash-screen`.
2. `AuthProvider.checkAuth()` reads token from `expo-secure-store`.
3. Token exists → call `GET /auth/get-profile` to validate.
4. 200 response → `isAuthenticated = true` → redirect to `/(tabs)/home`.
5. 401 response → clear token → redirect to `/login`.
6. Network offline → show cached profile (if any) + banner "Offline mode"; retry silently when online.

**Success criteria**: Warm-start to Home in under 1.5s on a mid-range Android device with warm cache.

**Edge cases**:
- Token present but corrupted → catch JSON parse errors → clear and redirect to login.
- Clock skew causing premature token expiry → handled by 401 interceptor.

---

## Journey 3 — Course Discovery & Enrollment Request

**Trigger**: Trainee wants to explore and request enrollment in a new course.

**Flow**:
1. From Home, tap **Available Courses** tab (or "Browse Courses" CTA on Home).
2. Screen fetches `GET /course/get-all-courses` with pagination.
3. Trainee scrolls the list; uses search input → re-fetches with `search` query param.
4. Trainee taps a course card → navigates to `/course/[id]`.
5. Course Details screen fetches:
   - `GET /course/get-course?id=...`
   - `GET /course/get-course-lectures-and-lessons?id=...`
   - `GET /course/get-training-centers-by-course?id=...`
   - `GET /course-join-request/get-course-join-status?course_id=...` (to know if already requested/enrolled)
6. If not yet requested: "Request to Join" button is active.
7. Trainee taps button → optional reason input sheet → confirmation dialog → `POST /course-join-request/create-course-join-request`.
8. On 201, show success toast; update status badge to "Pending".
9. Trainee can later view status under "My Join Requests" (from Profile menu or Home shortcut).

**Success criteria**: A new join request is visible in `GET /course-join-request/get-my-join-requests` within one refresh cycle.

**Edge cases**:
- Course already requested → "Pending approval" state, button disabled.
- Course already enrolled → navigate to the enrolled-course variant of Course Details.
- Course is archived/ended → show badge; hide join button.

---

## Journey 4 — Active Learning (Enrolled Course)

**Trigger**: Trainee is enrolled in a course and wants to view lectures/lessons.

**Flow**:
1. From Home, the "My Courses" card shows enrolled courses (data from `GET /lesson-progress/my-courses`).
2. Tap a course → navigate to `/course/[id]` (enrolled variant with lecture/lesson tree).
3. Screen shows curriculum tree:
   - Lectures from `GET /course-lecture/get-all-lectures-by-course`
   - Expand a lecture → list of lessons
4. Tap a lesson → `/lesson/[id]` → fetches `GET /course-lesson/get-lesson`.
5. Lesson Viewer shows content (video or text).
6. (Phase 2) As the trainee progresses, the client calls `POST /lesson-progress/update` with `{ lesson_id, watched_seconds, last_position, is_completed, video_duration }`.
7. Progress aggregates shown on Course Details via `GET /lesson-progress/course/{courseId}`.

**Success criteria**: Lesson opens in under 2s; progress persists across sessions.

**Edge cases**:
- Lesson marked completed but `is_completed: false` on server → trust server.
- Video duration unknown → skip progress update until `loadedmetadata`.
- Lesson fetch 404 → show "Lesson unavailable" empty state.

---

## Journey 5 — Notifications

**Trigger**: Trainee sees an unread badge on the bell icon in the header.

**Flow**:
1. Badge value from `GET /notification/unread-count` (fetched on Home mount + focus).
2. Tap bell → navigate to `/notifications`.
3. Screen fetches `GET /notification/my-notifications` (paginated).
4. Render list of notifications (title, body, timestamp, read/unread indicator).
5. Tap an item:
   - Call `POST /notification/{id}/mark-as-read`.
   - If notification has a deep link (e.g., course-approved), navigate to `/course/[id]`.
6. "Mark all as read" action → `POST /notification/mark-all-as-read`.
7. Badge re-fetched on return to Home.

**Success criteria**: Read state is consistent across re-opens; badge clears after all-read action.

**Edge cases**:
- Large notification lists → paginate.
- Notification references a deleted course → show toast "Resource unavailable".
- Offline → cached list shown with "last synced" timestamp.

---

## Journey 6 — Profile & Logout

**Trigger**: Trainee opens the Profile tab.

**Flow**:
1. Tabs → Profile.
2. Screen fetches `GET /auth/get-profile` (and optionally `GET /trainee/get-one-trainee?id=...` for richer data).
3. Displays: avatar (`image_url`), full name, email, nickname, gender, birth date, training center, state.
4. (Phase 2) "Edit profile" action → form → `PUT /trainee/update-trainee`.
5. "My Join Requests" menu → `/join-requests`.
6. "Notifications" shortcut → `/notifications`.
7. "Logout" button → confirmation → `POST /auth/logout` → clear secure store → navigate to `/login`.

**Success criteria**: Logout clears all sensitive data; re-login requires full credentials.

**Edge cases**:
- Profile image fails to load → fall back to initials avatar.
- Logout request fails network-side → still clear local session and redirect (server cleanup is best-effort).

---

## Edge Cases & Cross-Cutting States

### 401 Unauthorized Mid-Session
- `apiClient` interceptor catches 401.
- Clears token, sets `isAuthenticated = false`, redirects to `/login`.
- Shows toast "Session expired. Please log in again."

### Pending Join Request State
- UI must distinguish: **Not requested**, **Pending**, **Approved (enrolled)**, **Rejected**.
- Source of truth: `GET /course-join-request/get-course-join-status`.

### Network Offline
- Global online/offline banner via `@react-native-community/netinfo` (to be added).
- Read-only cached data shown; mutations queued or blocked with clear messaging.

### RTL-Specific Gestures
- Back-swipe gesture mirrored for RTL.
- Icons that imply direction (chevrons, arrows) must flip under RTL.
- Avoid `marginLeft`/`marginRight`; prefer `marginStart`/`marginEnd`.

### First-Login Enforcement
- Any authenticated route must re-check `is_first_login`; if true, redirect to `/reset-password`.

---

## Success Metrics per Journey

| Journey | Metric | Target |
|---------|--------|--------|
| First-time login | Time from install to Home | < 90s |
| Returning user | Cold start to Home | < 2.5s |
| Course discovery | Browse → Join tap rate | > 15% |
| Course discovery | Join request success rate | > 98% |
| Active learning | Lesson open → play success | > 95% |
| Active learning | Lessons completed per weekly active user | > 3 |
| Notifications | Tap-through rate | > 25% |
| Profile & logout | Logout-to-login round trip | < 10s |

---

## Out-of-Scope Journeys (Explicitly Deferred)

- In-app course purchase or payment.
- Course ratings and reviews.
- Peer messaging / chat.
- Self-service account creation (accounts are provisioned by admins).
- Content downloads for offline viewing (Phase 3 candidate).
