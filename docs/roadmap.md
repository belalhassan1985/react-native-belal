# Trainee Mobile App — Implementation Roadmap

Three-phase roadmap for the trainee-facing mobile app. Every feature is tied to an existing endpoint in `swagger.json` (no speculative APIs).

---

## Phase 1 — MVP (Target: ~2 weeks)

**Theme**: "Trainee can log in, see their courses, and stay informed."

### Goals

- Trainee completes first login and reaches the Home tab.
- Trainee can browse the course catalog.
- Trainee can view a course's full details (including training center association and syllabus outline).
- Trainee can see their enrolled courses.
- Trainee can read notifications.
- Trainee can log out cleanly.

### Features

| # | Feature | Endpoints | Screen |
|---|---------|-----------|--------|
| 1 | Email/password login with token persistence | `POST /auth/login`, `GET /auth/get-profile` | Login |
| 2 | Auth gate + auto-redirect | `GET /auth/get-profile` | Splash/index |
| 3 | Profile view (read-only) | `GET /auth/get-profile` | Profile |
| 4 | Available courses list (search + pagination) | `GET /course/get-all-courses` | Available Courses |
| 5 | Course details (overview + curriculum tree + training center) | `GET /course/get-course`, `GET /course/get-course-lectures-and-lessons`, `GET /course/get-training-centers-by-course` | Course Details |
| 6 | My enrolled courses list | `GET /lesson-progress/my-courses` | My Courses |
| 7 | Lesson list (read-only, no playback) | same as (5) — inlined | Course Details |
| 8 | Notifications list + unread badge | `GET /notification/my-notifications`, `GET /notification/unread-count` | Notifications + Home badge |
| 9 | Logout | `POST /auth/logout` | Profile |

### Out of Scope for Phase 1

- Course join requests (Phase 2)
- Lesson playback + progress update (Phase 2)
- Password reset (first-login flow deferred unless backend confirms P0 gaps)
- Profile editing (Phase 2)
- Notification mark-as-read (Phase 2 — read-only display only in MVP)
- Training Center dedicated screen (Phase 2; info inlined in Course Details)

### Risks

- **Login response shape undocumented** → blocks release until backend confirms or live probe verifies. Mitigation: schedule a 30-minute pair session with backend.
- **`notification` schema undocumented** → client guesses shape. Mitigation: freeze shape after live probe and document in `src/types/notification.ts`.
- **React 19 + New Architecture edge cases** → could surface with third-party libs. Mitigation: smoke test on iOS + Android physical devices weekly.
- **No test framework** → regressions caught only at QA. Mitigation: type-strict TS, disciplined PR reviews, add Jest in Phase 2.

### Dependencies

- Backend confirms P0 items from `backend-gaps.md`.
- Design system tokens stabilized (`src/constants/index.ts`).
- Valid test account on the live API.

### Definition of Done — Phase 1

- All 9 features functional on iOS + Android against live API.
- All screens respect RTL + Arabic strings.
- No hard-coded secrets.
- `npm run lint` passes without errors.
- `npx tsc --noEmit` passes.
- Manual QA checklist signed off.

---

## Phase 2 — Engagement (Target: ~2 weeks)

**Theme**: "Trainee takes action and tracks progress."

### Goals

- Trainee can request to join a course and track the request status.
- Trainee can play lessons and have their progress saved.
- Trainee can complete the first-login password reset.
- Trainee can edit basic profile fields.
- Trainee can mark notifications as read.

### Features

| # | Feature | Endpoints |
|---|---------|-----------|
| 1 | Reset first login flow | `POST /auth/reset-first-login` + re-fetch profile |
| 2 | Profile editing | `GET /trainee/get-one-trainee`, `PUT /trainee/update-trainee` |
| 3 | Join course request | `POST /course-join-request/create-course-join-request`, `GET /course-join-request/get-course-join-status` |
| 4 | Join request status list | `GET /course-join-request/get-my-join-requests` |
| 5 | Lesson playback (video/text) | `GET /course-lesson/get-lesson` |
| 6 | Progress tracking | `POST /lesson-progress/update`, `GET /lesson-progress/lesson/{lessonId}` |
| 7 | Course progress bars | `GET /lesson-progress/course/{courseId}` |
| 8 | Notifications: mark-as-read + mark-all-as-read | `POST /notification/{id}/mark-as-read`, `POST /notification/mark-all-as-read` |
| 9 | Training Center details screen | `GET /training-center/get-training-center`, `GET /training-center/get-all-notes-bt-training-center`, `GET /training-center/get-note` |
| 10 | Lecture expansion screen | `GET /course-lecture/get-lecture` |

### Dependent Backend Gaps to Resolve

- P0 items not blocking Phase 1 (if any) must be resolved now.
- `CreateCourseJoinRequestDto` must be documented (Gap 4).
- Notification deep-link metadata (Gap 16) — recommended for richer UX.
- Lesson attachments endpoint (Gap 7) — if available, integrate.
- Change-password and forgot-password (Gaps 11, 12) — if available, expose in Profile.

### Risks

- **Video playback on iOS + Android + new architecture**: picking the right player (`expo-video` vs `react-native-video`) requires a spike.
- **Progress update cadence** too aggressive drains battery; too lax loses data. Aim for every 10s + on pause/unmount.

### Definition of Done — Phase 2

- Trainee can end-to-end discover, request, join (after admin approval externally), and start consuming a course.
- Progress persists and matches server after round-trip.
- Jest + RNTL wired with at least 3 smoke tests (login, course list, lesson open).
- `@tanstack/react-query` adopted if invalidation complexity grows.

---

## Phase 3 — Assessment & Advanced (Target: ~3 weeks)

**Theme**: "Trainee is assessed and the app becomes resilient."

### Goals

- Trainee can view and submit exams.
- Trainee can answer quizzes attached to lessons.
- Trainee can see their schedule and attendance history.
- Trainee can register on-site via QR.
- Push notifications arrive reliably.
- The app degrades gracefully offline.

### Features

| # | Feature | Endpoints |
|---|---------|-----------|
| 1 | Exam list for the trainee | `GET /trainee/get-trainee-exams`, `GET /exam/get-exam` |
| 2 | Exam attempt (start, answer, submit) | `POST /exam/start-exam`, `GET /exam/get-exam-questions`, `POST /exam/submit-exam`, `GET /exam/get-exam-attempt`, `GET /exam/get-user-exam-attempts` |
| 3 | Quiz interaction | `GET /quiz/get-quiz`, `POST /quiz/answer-quiz` |
| 4 | Lesson schedule / calendar | `GET /lesson-schedule/get-by-lesson`, `GET /lesson-schedule/get-all` (if trainee-authorized) |
| 5 | Attendance history | `GET /lesson-schedule/trainee-attendance-history` |
| 6 | Report answering (feedback forms) | `GET /report/get-report`, `POST /report/answer-report` |
| 7 | On-site QR registration UX | `GET /course-join-request/generate-qr/{requestId}` |
| 8 | Push notifications | `expo-notifications` + new backend endpoint for token registration (Gap 6) |
| 9 | Offline caching of key reads | Local cache via SQLite or MMKV |

### Dependent Backend Work

- Gap 6: device token registration endpoint.
- Gap 8: explicit trainee ACL on `/lesson-schedule/*`.
- Gap 13: trainee-scoped exam list.
- Gap 17: `my-upcoming` schedule endpoint.

### Risks

- Exam UX is high-stakes; any submission bug causes data loss. Mitigate with resumable attempts and clear error recovery.
- QR display vs. camera scan flow must coexist with admin app; verify end-to-end with backend.
- Offline mode expands surface area; scope strictly to read paths first.

### Definition of Done — Phase 3

- Trainee can take an exam start-to-finish on iOS and Android with stable network.
- Quizzes answered and scored.
- Push notifications arrive within 1 minute of backend dispatch on both platforms.
- E2E smoke tests (Maestro or Detox) cover login → course → lesson → exam submit.
- Crash-free rate > 99.5% across first 7 days of release.

---

## Cross-Phase Deliverables

### Documentation
- `docs/user-journey.md` (Phase 1 — done)
- `docs/screens.md` (Phase 1 — done)
- `docs/api-mapping.md` (Phase 1 — done; extended per phase)
- `docs/backend-gaps.md` (Phase 1 — done; updated per resolution)
- `docs/architecture.md` (Phase 1 — done; amended on major decisions)
- `docs/roadmap.md` (this file; updated end of each phase)
- `docs/tasks-phase1.md` (Phase 1)
- `docs/tasks-phase2.md` (start of Phase 2)
- `docs/tasks-phase3.md` (start of Phase 3)

### Quality Gates per Phase
- TypeScript strict, ESLint clean.
- Lighthouse of mobile proxies: cold start < 3s, screen transitions < 250ms on mid-range Android.
- Manual QA sign-off on Arabic RTL device.
- Crash-free sessions > 99% in first week.

---

## Release Strategy

- **Phase 1** → closed beta via Expo EAS Update with a small trainee cohort (10–20 users).
- **Phase 2** → public TestFlight / Play Console internal testing.
- **Phase 3** → public release on App Store + Play Store with versioned API contract (`x-api-version` header if backend supports it).

---

## Timeline Summary

| Phase | Duration | Target Ship |
|-------|----------|-------------|
| Phase 1 (MVP) | ~2 weeks | Closed beta |
| Phase 2 (Engagement) | ~2 weeks | Internal testing |
| Phase 3 (Assessment & Advanced) | ~3 weeks | Public launch |
| **Total** | **~7 weeks** | — |

Durations assume one full-time mobile engineer with backend responsiveness on documented gaps. Each phase boundary is a gate: do not start the next phase until the current definition-of-done is met.
