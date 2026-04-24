# Trainee Mobile App — API Mapping

Complete mapping between mobile screens and backend endpoints documented in `swagger.json`.

- **Base URL**: defined in `src/constants/index.ts` → currently `https://api.tcms-iraq.com`
- **Auth scheme**: Bearer JWT (`Authorization: Bearer <token>`)
- **Response envelope (observed)**: `{ status: boolean, data: <payload> }`
- **Pagination params (where applicable)**: `page`, `pageItemsCount`, `search`

Legend:
- **Auth**: whether the endpoint requires the Bearer token (all authenticated routes do).
- **Trigger**: what user action or lifecycle event invokes the call.
- **Cache**: how the client should retain/invalidate the response in MVP.

---

## Master Screen → Endpoint Matrix

| Screen | Endpoint | Method | Auth | Trigger | Response used for | Cache |
|--------|----------|--------|------|---------|-------------------|-------|
| Splash | `/auth/get-profile` | GET | Yes | App start (if token present) | Validate token, detect first-login | Memory only |
| Login | `/auth/login` | POST | No | Submit form | Receive token + role | Token → secure-store |
| Login | `/auth/get-profile` | GET | Yes | Immediately after login | Detect first-login flag | Memory |
| Reset First Login | `/auth/reset-first-login` | POST | Yes | Submit new password | Unblock navigation to home | — |
| Home | `/auth/get-profile` | GET | Yes | Tab focus | Greeting, avatar | 5 min TTL |
| Home | `/lesson-progress/my-courses` | GET | Yes | Tab focus | Enrolled courses preview | 2 min TTL |
| Home | `/notification/unread-count` | GET | Yes | Tab focus + poll | Bell badge | 30 s poll |
| Available Courses | `/course/get-all-courses` | GET | Yes | Tab mount, search, page | Browseable list | Page-cache, 5 min TTL |
| Available Courses | `/course-join-request/get-my-join-requests` | GET | Yes | Tab mount | Annotate cards with request status | 2 min TTL |
| My Courses | `/lesson-progress/my-courses` | GET | Yes | Tab mount + pull-to-refresh | Active + completed list | 2 min TTL |
| Profile | `/auth/get-profile` | GET | Yes | Tab mount | Display identity | 5 min TTL |
| Profile (Phase 2) | `/trainee/get-one-trainee` | GET | Yes | Tab mount | Full trainee record | 5 min TTL |
| Profile (Phase 2) | `/trainee/update-trainee` | PUT | Yes | Save changes | Persist updates | Invalidate profile |
| Notifications | `/notification/my-notifications` | GET | Yes | Screen mount + pagination | Render list | Page cache |
| Notifications | `/notification/{id}/mark-as-read` | POST | Yes | Tap item | Update read state | Invalidate unread-count |
| Notifications | `/notification/mark-all-as-read` | POST | Yes | Tap action | Clear badge | Invalidate list + unread-count |
| Course Details | `/course/get-course` | GET | Yes | Screen mount | Overview | 5 min TTL |
| Course Details | `/course/get-course-lectures-and-lessons` | GET | Yes | Screen mount | Curriculum tree | 5 min TTL |
| Course Details | `/course/get-training-centers-by-course` | GET | Yes | Screen mount | Training center section | 10 min TTL |
| Course Details | `/course-join-request/get-course-join-status` | GET | Yes | Screen mount | CTA state | 1 min TTL |
| Course Details | `/lesson-progress/course/{courseId}` | GET | Yes | Screen mount (if enrolled) | Progress bars | 2 min TTL |
| Course Details | `/course-join-request/create-course-join-request` | POST | Yes | Tap "Request to Join" | Submit request | Invalidate status + my-join-requests |
| Lecture Details | `/course-lecture/get-lecture` | GET | Yes | Screen mount | Lecture + lessons | 5 min TTL |
| Lecture Details | `/course-lecture/get-all-lectures-by-course` | GET | Yes | Alt. screen mount | All lectures | 5 min TTL |
| Lesson Viewer | `/course-lesson/get-lesson` | GET | Yes | Screen mount | Lesson content | 5 min TTL |
| Lesson Viewer | `/lesson-progress/lesson/{lessonId}` | GET | Yes | Screen mount | Last-position seed | 1 min TTL |
| Lesson Viewer (Phase 2) | `/lesson-progress/update` | POST | Yes | Heartbeat + on exit | Persist progress | Invalidate course/lecture progress |
| Training Center | `/training-center/get-training-center` | GET | Yes | Screen mount | Center info | 10 min TTL |
| Training Center | `/training-center/get-all-notes-bt-training-center` | GET | Yes | Screen mount | Notes list | 5 min TTL |
| Training Center | `/training-center/get-note` | GET | Yes | Tap note | Note detail | Memory |
| Join Requests | `/course-join-request/get-my-join-requests` | GET | Yes | Screen mount + refresh | Status list | 1 min TTL |
| Join Requests (P3) | `/course-join-request/generate-qr/{requestId}` | GET | Yes | Tap QR button | Render QR image | — |
| Global | `/auth/logout` | POST | Yes | Profile → Logout | Server-side cleanup | Clear store |

---

## Module-by-Module Detail

### Auth Module

#### `POST /auth/login`
- **Request**: `LoginDto` — fields not enumerated in schema beyond `email`, `password` (inferred from existing `src/services/authService.ts`).
- **Response**: Not documented (empty `200` in swagger). Observed shape: `{ status: true, data: { token: string, role: string } }`. **Confirm with backend.**
- **Errors**: 401 → wrong credentials; 422 → validation.
- **Client action on success**: store token in `expo-secure-store`, then call `get-profile`.

#### `POST /auth/logout`
- **Request**: none (Bearer token identifies session).
- **Response**: `201` success.
- **Client action**: always clear local session regardless of response (best-effort server cleanup).

#### `GET /auth/get-profile`
- **Request**: Bearer token in header.
- **Response**: `UserProfile` — fields per existing `src/types/` and `AGENTS.md`:
  - `id`, `email`, `role`, `first_name`, `second_name`, `third_name`, `fourth_name`, `nickname`, `gender`, `birth_date`, `training_center`, `state`, `image_url`, `is_first_login`
- **Client action**: hydrate `AuthContext`, gate first-login flow.

#### `POST /auth/reset-first-login`
- **Request body**: `ResetFirstLoginDto` — schema not in `swagger.json` excerpt. **Action**: inspect live or ask backend. Likely `{ new_password, confirm_password }`.
- **Response**: success marker; `is_first_login` becomes `false`.

---

### Course Module

#### `GET /course/get-all-courses`
- **Query params**: `page` (1-based), `pageItemsCount`, `search` (by course name).
- **Response**: paginated list of courses.
- **Course shape (inferred)**: `{ id, name, description, start_date, end_date, status, category_id, image_url, ...}` — align with `src/types/course.ts`.

#### `GET /course/get-course`
- **Query**: `id`.
- **Response**: single course with nested metadata.

#### `GET /course/get-course-lectures-and-lessons`
- **Query**: `id` (course id).
- **Response**: ordered lectures with nested lessons.

#### `GET /course/get-training-centers-by-course`
- **Query**: `id` (course id).
- **Response**: list of training centers associated with the course.

> Not used by trainee: `create-course`, `update-course`, `delete-course*`, `approve-course`, `pending-course`, `update-expired-courses`, `get-courses-ending-soon` (admin surfaces).

---

### Course Lecture / Lesson Modules

#### `GET /course-lecture/get-lecture`
- **Query**: `id`.
- **Response**: lecture detail with ordered lessons.

#### `GET /course-lecture/get-all-lectures-by-course`
- **Query**: `course_id`.
- **Response**: flat list of lectures.

#### `GET /course-lesson/get-lesson`
- **Query**: `id`.
- **Response**: lesson detail. Video URL (if any) + text content + duration.

> Not used by trainee: `create-lecture`, `update-lecture`, `delete-lecture`, `create-lesson`, `update-lesson`, `delete-lesson`.

---

### Course Join Request Module

#### `GET /course-join-request/get-my-join-requests`
- **Query**: pagination optional.
- **Response**: list of requests with `course_id`, `status` (enum), `created_at`, `course` summary.

#### `GET /course-join-request/get-course-join-status`
- **Query**: `course_id`.
- **Response**: current request status for the current trainee on that course.

#### `POST /course-join-request/create-course-join-request`
- **Request body**: DTO not in schema excerpt. Likely `{ course_id, notes? }`. **Action**: confirm with backend.
- **Response**: created request record.

#### `GET /course-join-request/generate-qr/{requestId}`
- **Response**: QR payload or image URL used for on-site admin approval.
- **Mobile scope**: Phase 3.

> Not used by trainee: `get-all-course-join-requests` (admin), `get-course-join-request` (admin by id), `update-course-join-request`, `accept-by-qr/{token}` (admin-side QR scanner), `delete-course-join-request`.

---

### Lesson Progress Module

#### `POST /lesson-progress/update`
- **Request body**: `UpdateLessonProgressDto`
  - `lesson_id` (required)
  - `watched_seconds`, `last_position`, `is_completed`, `video_duration`, `page_duration_number`
- **Response**: `LessonProgressResponseDto`
- **Client cadence**: update every 10 seconds during playback + on pause + on unmount.

#### `GET /lesson-progress/lesson/{lessonId}`
- **Response**: `LessonProgressResponseDto`
- **Use**: resume playback position.

#### `GET /lesson-progress/lecture/{lectureId}`
- **Response**: `LectureProgressResponseDto` with aggregate progress and nested lesson progress.

#### `GET /lesson-progress/course/{courseId}`
- **Response**: `CourseProgressResponseDto` with course-level aggregate + nested lectures.

#### `GET /lesson-progress/my-courses`
- **Response**: `CourseProgressResponseDto[]` — the trainee's enrolled courses.
- **This is the primary source for the "My Courses" tab.**

---

### Notification Module

#### `GET /notification/my-notifications`
- **Query**: pagination.
- **Response**: list of notifications. Schema not in swagger excerpt — **confirm with backend**. Expected fields: `id`, `title`, `body`, `type`, `is_read`, `created_at`, `data` (deep link hint).

#### `GET /notification/unread-count`
- **Response**: `{ status, data: { count: number } }` — verify live.

#### `POST /notification/{id}/mark-as-read`
- **Response**: success.

#### `POST /notification/mark-all-as-read`
- **Response**: success.

> Not used by trainee: `POST /notification` (create), `GET /notification/{id}` (admin-side), the generic `GET /notification` (admin list).

---

### Trainee Module

#### `GET /trainee/get-one-trainee`
- **Query**: `id` — should match current user; authorization may block other IDs.
- **Response**: full trainee record including associations.

#### `PUT /trainee/update-trainee`
- **Request body**: `UpdateTraineeDto` — requires `image_url` per schema. **Mobile caveat**: updating with multipart/form-data; verify whether partial updates are allowed without re-uploading image.

#### `GET /trainee/get-trainee-exams`
- **Response**: exams assigned to the trainee. **Used in Phase 3.**

> Not used by trainee: `create-trainee`, `create-many-trainees`, `get-all-trainees`, `delete-trainee*`, `add-trainee-to-course`.

---

### Training Center Module

#### `GET /training-center/get-all-training-centers`
- **Use**: informational lookup in Available Courses filter (Phase 2).

#### `GET /training-center/get-training-center`
- **Query**: `id`.
- **Response**: center detail.

#### `GET /training-center/get-all-notes-bt-training-center`
- **Query**: `training_center_id`.
- **Response**: list of notes.

#### `GET /training-center/get-note`
- **Query**: `id`.
- **Response**: note detail.

> Not used by trainee: training center CRUD, employees, rooms, manager history, detailed report, statistics, camera-snapshot, and all `delete-*` / `create-*` endpoints.

---

### Exam Module (Phase 3)

Endpoints of interest for trainee exam flow:
- `GET /exam/get-exam?id=`
- `GET /exam/get-exam-questions?exam_id=`
- `POST /exam/start-exam` — body `StartExamDto { exam_id, password? }`
- `POST /exam/submit-exam` — body `SubmitExamDto { attempt_id, answers: [{ question_id, selected_choice_id }] }`
- `GET /exam/get-user-exam-attempts`
- `GET /exam/get-exam-attempt`

> Not used by trainee: create/update/delete exams, exam participants management, stats, room availability.

---

### Quiz Module (Phase 3)

- `GET /quiz/get-quiz`
- `POST /quiz/answer-quiz` — body `AnswerQuizDto`

---

### Report Module (Phase 3)

- `GET /report/get-report`
- `POST /report/answer-report` — body `AnswerReportDto`

---

### Lesson Schedule Module (Phase 3)

- `GET /lesson-schedule/get-by-lesson` — if authorization allows trainee read
- `GET /lesson-schedule/trainee-attendance-history`

---

## Request Headers Standard

```
Authorization: Bearer <token>
Content-Type: application/json            # for JSON bodies
Content-Type: multipart/form-data         # for trainee update with image
Accept: application/json
Accept-Language: ar                        # hint for server-side localization
```

---

## Error Handling Convention

| Status | Meaning | Client behavior |
|--------|---------|-----------------|
| 400 / 422 | Validation | Show field-level or toast error |
| 401 | Unauthenticated | Clear token, redirect to login, toast "Session expired" |
| 403 | Forbidden | Toast "Not authorized" |
| 404 | Not found | Empty state or "Resource unavailable" |
| 409 | Conflict (e.g., duplicate join request) | Toast specific message |
| 429 | Rate limited | Back-off + retry |
| 5xx | Server error | Retry banner, allow manual retry |

---

## Cache & Invalidation Matrix

| Resource | Invalidated by |
|----------|----------------|
| `profile` | `login`, `logout`, `update-trainee`, `reset-first-login` |
| `my-courses` | `create-course-join-request` approval (via notification refresh) |
| `my-join-requests` | `create-course-join-request` |
| `course-join-status` for course X | `create-course-join-request` targeting X |
| `unread-count` | `mark-as-read`, `mark-all-as-read`, focus on Notifications |
| `notifications list` | `mark-as-read`, `mark-all-as-read`, pull-to-refresh |
| `course/{id}` curriculum | manual refresh only in MVP |
| `lesson-progress/course/{id}` | `lesson-progress/update` mutations |

---

## Confirmations Required Before Implementation

1. Exact response body of `POST /auth/login` (swagger shows empty `200`).
2. Exact body shape of `POST /auth/reset-first-login` (no DTO in visible schemas).
3. Exact body shape of `POST /course-join-request/create-course-join-request` (no DTO in visible schemas).
4. Shape of `/notification/my-notifications` items (not in schemas).
5. Confirm whether `PUT /trainee/update-trainee` supports partial body without re-upload of `image_url`.
6. Trainee authorization scope for `/lesson-schedule/*` and `/training-center/get-note`.
