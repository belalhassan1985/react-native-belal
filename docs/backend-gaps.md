# Trainee Mobile App — Backend Gaps

This document catalogues every gap, ambiguity, or undocumented contract found in `swagger.json` that blocks or weakens the trainee mobile experience.

Each gap is captured with: **Description · Impact · Workaround · Proposed endpoint/change · Priority**.

Priorities:
- **P0** — blocks MVP. Must be resolved before Phase 1 ship.
- **P1** — blocks Phase 2 feature quality.
- **P2** — nice-to-have for UX polish.

---

## Gap 1 — No Course Withdrawal / Unenroll Endpoint

- **Description**: No endpoint lets a trainee withdraw from a course they were enrolled in or cancel a pending join request.
- **Impact**: Mid. Trainees who join by mistake cannot self-correct; must contact admin.
- **Workaround (MVP)**: Hide "leave course" UI entirely. Provide contact-admin note instead.
- **Proposed endpoint**:
  - `DELETE /course-join-request/cancel-my-request?id=` (for Pending)
  - `DELETE /course/leave-course?course_id=` (for Approved/Enrolled)
- **Priority**: P1

---

## Gap 2 — No Server-Side "Available for Trainee" Filter on Courses

- **Description**: `GET /course/get-all-courses` returns all courses regardless of the trainee's eligibility, enrollment status, or center. No flag like `?available_for_me=true`.
- **Impact**: High. Trainee screen either shows irrelevant courses or must fetch and cross-reference their own join requests.
- **Workaround (MVP)**: Client-side filter — after fetching courses, annotate each card with join-request status from `GET /course-join-request/get-my-join-requests`. Hide courses the trainee is already enrolled in.
- **Proposed endpoint**: `GET /course/get-available-courses-for-trainee` or add query flag `is_eligible=true` to existing endpoint.
- **Priority**: P1

---

## Gap 3 — `POST /auth/login` Response Shape Not Documented

- **Description**: Swagger documents only a `200` status for `/auth/login` with no response schema. The DTO `LoginDto` is not expanded in the visible schema section either.
- **Impact**: High. The client must guess the envelope and the location of `token` / `role` / `is_first_login`.
- **Workaround (MVP)**: Probe the live endpoint once with valid credentials and hard-code the known shape (`{ status, data: { token, role } }`). Document it here after verification.
- **Proposed change**: Add `responses.200.content.application/json.schema` with `LoginResponseDto` including `token`, `role`, optionally `user` summary and `is_first_login`.
- **Priority**: P0

---

## Gap 4 — `POST /course-join-request/create-course-join-request` DTO

- **Description**: Swagger shows the endpoint path but the request DTO is not in `components.schemas`.
- **Impact**: High. Cannot implement Phase 2 course join without guessing the request body.
- **Workaround (MVP)**: Assumed `{ course_id: number }` — matches common patterns and matches the query-param style used elsewhere.
- **Proposed endpoint**: Publish `CreateCourseJoinRequestDto` with at minimum `{ course_id: number }`.
- **Status**: Implemented with `{ course_id: number }` body. If backend returns different shape, update `src/types/joinRequest.ts`.
- **Priority**: P0 (resolved for Phase 2)

---

## Gap 5 — `POST /auth/reset-first-login` DTO + Missing Change-Password Endpoint

- **Description**: `ResetFirstLoginDto` is not published. `POST /auth/reset-first-login` returns 400 "email and password required" — meaning it expects credentials, not a password-change payload. This endpoint is likely for credential-based auth reset, NOT a password-change endpoint. A proper change-password endpoint (`current_password` + `new_password`) is missing.
- **Impact**: High. First-login trainees cannot change password. Regular users cannot change password from Profile. The `/auth/reset-first-login` contract is incompatible with password-change use case.
- **Workaround (Phase 2)**: Reset-first-login is **optional by UX decision** — API call is disabled. Trainees can skip and access the app; change password via Profile when backend provides a proper endpoint.
- **Proposed change**: Backend must publish `ChangePasswordDto` with `{ current_password, new_password }` and expose `POST /auth/change-password`. Clarify `ResetFirstLoginDto` if it is meant for credential reset only.
- **Status**: OPEN — API disabled. Backend must provide confirmed change-password endpoint.
- **Priority**: P0 (backend must resolve)

---

## Gap 6 — No Push Notification Token Registration Endpoint

- **Description**: Nothing to register an Expo push token, APNS token, or FCM token against the current user.
- **Impact**: Medium. Push notifications cannot be delivered without backend storage of device tokens.
- **Workaround (MVP)**: In-app polling of `/notification/unread-count` every 30 seconds when Home tab is focused.
- **Proposed endpoint**: `POST /notification/register-device { platform: 'ios'|'android'|'web', token: string, device_id: string }` and corresponding unregister.
- **Priority**: P1 (required for Phase 2 push)

---

## Gap 7 — No Lesson Attachments / Resources Endpoint

- **Description**: No way to fetch downloadable materials (PDFs, slides, code samples) attached to a lesson.
- **Impact**: Medium. Lessons that reference attachments will appear incomplete.
- **Workaround (MVP)**: Omit attachments section. If the lesson payload includes URL fields in a future swagger update, wire them in.
- **Proposed endpoint**: `GET /course-lesson/get-lesson-attachments?lesson_id=`.
- **Priority**: P1

---

## Gap 8 — Trainee Authorization Unclear for `/lesson-schedule/*`

- **Description**: The `lesson-schedule` endpoints are described with admin-style behaviors (create, update, mark attendance), but `GET /lesson-schedule/get-by-lesson`, `GET /lesson-schedule/attendance-sheet`, and `GET /lesson-schedule/trainee-attendance-history` could theoretically serve trainees read-only. Swagger does not specify role-based ACL.
- **Impact**: Medium. Cannot confidently show trainees their own schedule or attendance history.
- **Workaround**: Defer schedule + attendance features to Phase 3. Validate with backend first.
- **Proposed change**: Explicit per-endpoint role annotations in swagger.
- **Priority**: P2

---

## Gap 9 — No "Recommended Courses" or "New Courses" Endpoint

- **Description**: No curated/personalized feed.
- **Impact**: Low. UX can use the default `get-all-courses` sorted by `created_at`.
- **Workaround**: Client-side sort by creation or start date.
- **Proposed endpoint**: `GET /course/get-recommended-courses-for-trainee`.
- **Priority**: P2

---

## Gap 10 — Profile Editing & Avatar Upload

- **Description**: `PUT /trainee/update-trainee` requires `image_url` as multipart binary. No dedicated "upload avatar" endpoint. Editable fields in DTO are unclear.
- **Impact**: Medium. Profile editing limited without clear DTO.
- **Workaround (Phase 2)**: Implemented `nickname` editing only via `PUT /trainee/update-trainee` with `{ nickname }`. Image upload deferred.
- **Proposed endpoint**: `POST /trainee/update-avatar` (multipart) for avatar-only upload.
- **Status**: Partial implementation — nickname editing works. Other fields (name, email, etc.) remain read-only per backend DTO.
- **Priority**: P1

---

## Gap 11 — No "Change Password" Endpoint (for Non-First-Login Users)

- **Description**: Only `/auth/reset-first-login` exists. No way for a normal user to rotate their password.
- **Impact**: Medium. Security hygiene feature missing.
- **Workaround (MVP)**: Hide the action from Profile screen.
- **Proposed endpoint**: `POST /auth/change-password { current_password, new_password }`.
- **Priority**: P1

---

## Gap 12 — No Forgot Password / Reset by Email Flow

- **Description**: No public endpoint to request a password reset by email.
- **Impact**: High for new trainees who lose credentials.
- **Workaround (MVP)**: Hide "Forgot password?" link or link to a support contact.
- **Proposed endpoints**:
  - `POST /auth/forgot-password { email }`
  - `POST /auth/reset-password-with-token { token, new_password }`
- **Priority**: P1

---

## Gap 13 — No Trainee-Scoped "My Exams" vs Admin List

- **Description**: `GET /trainee/get-trainee-exams` exists but its authorization scope is not explicit. It may return all exams if called by an admin-level token, or only the caller's exams.
- **Impact**: Medium. Need to confirm before surfacing in mobile.
- **Workaround**: Defer exams to Phase 3 and clarify with backend.
- **Proposed change**: Documented role-based filtering or a dedicated `GET /exam/my-exams` endpoint that infers user from token.
- **Priority**: P1

---

## Gap 14 — `Notification` Schema Not Published

- **Description**: The notification module endpoints exist but the notification entity shape is absent from `components.schemas`.
- **Impact**: High. The client cannot map the list response to typed models without guessing (e.g., `title`, `body`, `type`, `is_read`, `created_at`, `data`).
- **Workaround**: Probe live and document in `src/types/`.
- **Proposed change**: Publish `NotificationDto` and response wrappers.
- **Priority**: P0

---

## Gap 15 — Lesson Progress Response Envelope Inconsistency

- **Description**: `UpdateLessonProgressDto` omits `progress_percentage` in the request, while the response `LessonProgressResponseDto` includes it. Unclear whether the backend recomputes it or expects the client to send it.
- **Impact**: Low. Follow "client sends measurements; server computes derived fields".
- **Workaround**: Never send `progress_percentage`; trust server response.
- **Proposed change**: Add explicit inline comments in swagger to clarify "server-computed".
- **Priority**: P2

---

## Gap 16 — No Deep-Link / Route Metadata on Notifications

- **Description**: No standard field tells the client where to navigate when a notification is tapped (e.g., to a specific course or lesson).
- **Impact**: Medium. Notifications remain "read-only" with no action.
- **Workaround (MVP)**: Mark as read on tap and do nothing else.
- **Proposed change**: Include a `data: { type, resource_id, deep_link }` object in each notification.
- **Priority**: P1

---

## Gap 17 — No Endpoint to Fetch a Single Lesson's Schedule Window

- **Description**: Lessons may be time-bounded (scheduled), but the trainee app has no endpoint to fetch "when does my next lesson start?" in a trainee-scoped way.
- **Impact**: Medium. Blocks a potential "Upcoming Lessons" home widget.
- **Workaround**: Omit in MVP. Revisit with Phase 3.
- **Proposed endpoint**: `GET /lesson-schedule/my-upcoming`.
- **Priority**: P2

---

## Backend Action Items — Summary Table

| # | Item | Priority | Owner (backend) | Blocking phase |
|---|------|----------|-----------------|----------------|
| 3 | Document `LoginDto` + login response | P0 | Auth | Phase 1 |
| 5 | Publish `ChangePasswordDto` + `POST /auth/change-password` | P0 | Auth | **OPEN** — `/auth/reset-first-login` expects email/password, not password change |
| 14 | Publish `NotificationDto` | P0 | Notifications | Phase 1 |
| 4 | Publish `CreateCourseJoinRequestDto` | P0 | Course Join | Phase 2 ✅ Implemented with `{ course_id }` |
| 2 | Add trainee-eligible course filter | P1 | Course | Phase 2 |
| 6 | Device token registration | P1 | Notifications | Phase 2 |
| 10 | Avatar upload endpoint | P1 | Trainee | Phase 2 |
| 11 | Change password endpoint | P1 | Auth | Phase 2 |
| 12 | Forgot password endpoint | P1 | Auth | Phase 2 |
| 13 | Trainee-scoped exams endpoint | P1 | Exam | Phase 3 |
| 16 | Notification deep-link metadata | P1 | Notifications | Phase 2 |
| 1 | Withdraw / cancel endpoints | P1 | Course Join | Phase 2 |
| 7 | Lesson attachments | P1 | Course Lesson | Phase 2 |
| 8 | Role-based ACL on lesson-schedule | P2 | Lesson Schedule | Phase 3 |
| 9 | Recommended courses | P2 | Course | Phase 3 |
| 15 | Clarify progress envelope | P2 | Lesson Progress | Phase 2 |
| 17 | My upcoming schedule | P2 | Lesson Schedule | Phase 3 |

---

## Recommended Resolution Workflow

1. Share this document with the backend team.
2. Triage P0 items with backend lead before Phase 1 kickoff.
3. Any P0 that cannot be resolved becomes a documented assumption in `src/types/` and `api-mapping.md`.
4. Re-evaluate gaps after each swagger release.
