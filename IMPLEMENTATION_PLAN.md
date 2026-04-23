# Autocheck V1 Implementation Plan

## Summary

This plan defines the first production-oriented version of Autocheck: a web application where teachers create course assignments, students submit homework attempts, Gemini evaluates submissions asynchronously, and admins manage users, courses, and enrollments. The implementation should cover authentication, role-based dashboards, assignment and submission workflows, async evaluation states, PostgreSQL-backed persistence, and local seed data.

This plan is intentionally decision-complete for implementation against the current repo shape:

- `frontend/` is currently a Vite React app with starter content.
- `backend/` is currently a NestJS app with PostgreSQL TypeORM configuration, a minimal `User` entity, and placeholder `users` / `homework` modules.
- You will later provide the DBML schema; implementation should align to that schema when coding begins, but the product behavior below is already fixed.

## Product Decisions

### Roles

- `admin`
  - Root access within v1 admin scope.
  - Can create and edit teachers, students, courses, and enrollments.
  - Must assign exactly one teacher to each course.
- `teacher`
  - Owns courses assigned to them.
  - Creates and edits assignments inside their courses.
  - Can see all attempts for assignments in their courses.
  - In partial evaluation mode, can edit both Gemini score and feedback before confirming.
- `student`
  - Can sign up themselves.
  - Can see only their own enrolled courses, assignments, attempts, and results.
  - Can submit homework attempts up to the allowed limit.

### Academic Structure

- No `school` management in v1.
- No `lesson` entity in v1.
- Data hierarchy is:
  - `course`
  - `assignment` (same meaning as homework)
  - `submission attempt`
  - `evaluation result`
- Each course has exactly one teacher.
- A student may be enrolled in many courses across different teachers.
- A teacher may own many courses.

### Assignment / Homework Behavior

- Assignments are attached directly to courses.
- Assignment and homework are the same entity in product language.
- Each assignment supports up to `3` attempts per student.
- Students must wait until the previous attempt is no longer under evaluation before submitting the next attempt.
- The final displayed grade for an assignment is the latest graded attempt.
- Teachers are allowed to edit assignments even after students have already submitted attempts.

### Submission Types

- Student submission input types in v1:
  - direct text entry
  - image upload
  - `.txt` file upload
- Images must be stored as uploaded files.
- OCR must use `tesseract.js`.
- OCR output text must be persisted alongside the original uploaded file reference.

### Evaluation Behavior

- Gemini input must contain:
  - assignment instructions created by the teacher
  - student submission text content
- Gemini output must contain:
  - numeric score in range `0-10`
  - feedback limited to `60 words` maximum
- Evaluation modes:
  - `automatic`
    - Gemini output becomes the final grade immediately after processing completes.
  - `partial`
    - Gemini produces a draft result.
    - Teacher reviews and may edit both score and feedback.
    - Final grade is set only when teacher confirms.

### Submission Statuses

- `processing`
  - Gemini is currently evaluating the latest submission.
- `review_pending`
  - Gemini finished, and teacher review is required because the assignment uses partial evaluation.
- `graded`
  - Final score and feedback are available, either automatically from Gemini or after teacher confirmation.
- No failed state exists in v1.

### Auth Behavior

- Authentication methods:
  - email/password
  - Google sign-in
- Only `sign up` and `login` are in v1 scope.
- If a Google-authenticated user has no existing account:
  - redirect to sign-up page
  - prefill email
  - no moderation or approval flow
- Assumption locked for v1:
  - public self-sign-up is allowed for `student` and `teacher`
  - `admin` accounts are not publicly self-created and should be seeded or created by existing admin workflows

### Dashboard Navigation

- The app shell uses:
  - left sidebar
  - right content area
- Sidebar contains only one item in v1: `My courses`
- `My courses` behavior depends on role:
  - student: enrolled courses
  - teacher: owned courses
  - admin: manageable course list

### UI Design Direction

- Use a minimal SaaS design pattern.
- Design principles:
  - clean layout with strong spacing and simple hierarchy
  - calm neutral surfaces with 1 accent color family
  - strong table / card readability
  - restrained motion and no ornamental academic styling
  - dashboard-first interaction model

## Backend Implementation Plan

### Core Modules

Replace the placeholder backend shape with domain-oriented Nest modules:

- `auth`
- `users`
- `courses`
- `assignments`
- `submissions`
- `admin`
- `evaluation`
- shared upload / storage support

Keep `AppModule` as the composition root and register all modules there.

### Entities and Relationships

The exact final schema should follow the DBML you provide later, but implementation should target this domain model:

- `User`
  - id
  - email
  - password hash nullable for Google-only accounts if needed
  - full name
  - role: `admin | teacher | student`
  - auth provider metadata sufficient for email/password and Google login
  - createdAt and updatedAt
- `Course`
  - id
  - title
  - description optional
  - teacherId required
  - timestamps
- `Enrollment`
  - id
  - courseId
  - studentId
  - timestamps
  - unique constraint on `courseId + studentId`
- `Assignment`
  - id
  - courseId
  - title
  - instructions
  - evaluationMode: `automatic | partial`
  - maxAttempts default `3`
  - timestamps
- `Submission`
  - id
  - assignmentId
  - studentId
  - attemptNumber
  - sourceType: `text | image | txt_file`
  - originalText nullable for direct text input
  - extractedText required after normalization
  - filePath nullable for uploaded image / txt file
  - status: `processing | review_pending | graded`
  - timestamps
  - unique constraint on `assignmentId + studentId + attemptNumber`
- `Evaluation`
  - id
  - submissionId
  - geminiScore nullable until returned
  - geminiFeedback nullable until returned
  - finalScore nullable until finalized
  - finalFeedback nullable until finalized
  - teacherEdited boolean
  - confirmedByTeacherId nullable
  - finalizedAt nullable
  - timestamps

Important relationship rules:

- one teacher per course
- many students per course through enrollments
- many assignments per course
- many submissions per assignment per student, capped at 3
- one evaluation record per submission

### Auth and Authorization

Implement auth with clear separation between authentication and role enforcement:

- email/password registration and login endpoints
- Google sign-in flow endpoint pair
- password hashing with a secure one-way algorithm
- JWT-based session auth for frontend API access
- route guards for authenticated requests
- role guards for admin / teacher / student access control

Required auth behavior:

- email must be unique across all users
- Google login should locate a user by email or provider identity
- if Google email is not found, frontend is redirected to sign-up with that email prefilled
- public sign-up should not allow creation of admin accounts

Authorization rules:

- admin:
  - full access to admin CRUD and course/enrollment management
- teacher:
  - only own courses, assignments, course-level submissions, and pending reviews
- student:
  - only own enrollments, assignments in enrolled courses, own submissions, own grades

### API Surface

Define REST APIs grouped by domain. Final DTO names can vary, but behavior must match.

- `POST /auth/signup`
  - create student or teacher account only
- `POST /auth/login`
  - email/password login
- `GET /auth/google/start`
  - begin Google auth
- `GET /auth/google/callback`
  - handle Google auth outcome
- `GET /auth/me`
  - current authenticated user and role

- `GET /courses`
  - role-aware:
    - admin: all courses
    - teacher: owned courses
    - student: enrolled courses
- `POST /courses`
  - admin only
- `PATCH /courses/:id`
  - admin only
- `GET /courses/:id`
  - visible only if role is allowed to access that course

- `POST /enrollments`
  - admin only
- `PATCH /enrollments/:id`
  - admin only if editable fields are present in schema
- `DELETE /enrollments/:id`
  - admin only

- `GET /courses/:courseId/assignments`
  - teacher sees owned course assignments
  - student sees assignments in enrolled courses
- `POST /courses/:courseId/assignments`
  - teacher only for owned courses
- `PATCH /assignments/:id`
  - teacher only for owned courses
- `GET /assignments/:id`
  - role-aware visibility

- `GET /assignments/:assignmentId/submissions/me`
  - student view of own attempts for one assignment
- `POST /assignments/:assignmentId/submissions`
  - student submits a new attempt
  - reject if not enrolled
  - reject if 3 attempts already used
  - reject if latest attempt is not yet finalized
- `GET /courses/:courseId/submissions`
  - teacher view of submissions across owned course
- `GET /submissions/:id`
  - student own submission, teacher owned-course submission, admin optional if needed for management

- `PATCH /evaluations/:submissionId/confirm`
  - teacher confirms partial evaluation
  - payload may override score and feedback
  - only allowed for owned course and `review_pending` submission

- `GET /admin/users`
  - admin filtered list of teachers and students
- `POST /admin/users`
  - admin create teacher or student
- `PATCH /admin/users/:id`
  - admin edit teacher or student

### Submission Normalization Flow

Every submission should be normalized into text before Gemini evaluation:

- direct text input
  - save raw text as submission content
  - extracted text equals raw text
- txt file
  - upload file
  - parse file contents into extracted text
  - keep file reference
- image file
  - upload file
  - run OCR with `tesseract.js`
  - persist extracted text
  - keep file reference

Store uploads locally in v1.

Implementation notes:

- use a dedicated uploads directory under backend runtime storage
- persist only relative file paths in DB
- validate file type and reasonable size limits
- reject empty extracted text

### Async Evaluation Flow

Use backend-managed asynchronous processing after submission creation.

Decision locked for v1:

- frontend should use polling to refresh statuses after submission
- no WebSockets or SSE in v1

Flow:

1. Student creates submission attempt.
2. Backend validates enrollment, attempt count, and previous attempt completion.
3. Backend stores submission with `processing`.
4. Backend normalizes submission text.
5. Backend creates evaluation record.
6. Backend triggers async Gemini evaluation after request completes.
7. Gemini response is parsed and validated.
8. If assignment mode is `automatic`:
   - write Gemini score/feedback into both Gemini and final fields
   - mark submission `graded`
9. If assignment mode is `partial`:
   - store Gemini score/feedback
   - leave final fields empty until teacher confirmation
   - mark submission `review_pending`

Implementation constraint:

- the submit API must return quickly after persistence, without waiting for Gemini completion
- use Nest scheduling / queue-like service abstraction, but keep v1 simple enough to run in a single backend instance
- encapsulate Gemini calls behind an evaluation provider service so Gemini-specific code is isolated

### Gemini Integration Contract

Gemini integration should be designed behind an internal service abstraction:

- input:
  - assignment title if useful
  - assignment instructions
  - normalized student submission text
- output contract:
  - score integer or decimal constrained to `0-10`
  - feedback no longer than `60 words`

Backend responsibilities:

- construct a strict prompt that enforces the output contract
- reject / normalize malformed model responses
- trim or reject feedback exceeding the agreed word limit
- keep provider-specific env vars in backend `.env`

### Validation and Business Rules

- unique user email
- no public admin signup
- course must always reference exactly one teacher
- students can submit only to assignments in courses where they are enrolled
- teacher can only operate inside owned courses
- max attempts per assignment per student is `3`
- next attempt blocked until previous attempt leaves `processing` or `review_pending`
- latest graded attempt is the displayed final result
- only teacher can confirm partial evaluations
- feedback limit is `60 words`

### Seed / Dummy Data

Add a seed mechanism to populate local development data in PostgreSQL.

Seed dataset should include:

- 1 admin user
- at least 3 teachers
- at least 8 students
- at least 4 courses
- valid enrollments across multiple teachers
- assignments in both `automatic` and `partial` modes
- submissions covering:
  - processing
  - review_pending
  - graded
  - multiple attempts

Seed goals:

- allow frontend dashboard demos for all roles
- cover all main states without manual setup
- use readable fake names and course titles

Implementation preference:

- add a dedicated npm script for seeding
- seed should be repeatable and idempotent enough for local development expectations

## Frontend Implementation Plan

### Frontend Stack Shape

Build on the existing Vite React app and replace the starter screen completely.

Recommended additions when coding begins:

- routing for auth and dashboard flows
- lightweight state/data fetching layer
- form validation utilities
- role-aware page protection

### Route Structure

Use a simple role-aware route layout:

- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/courses`
- `/dashboard/courses/:courseId`
- `/dashboard/courses/:courseId/assignments/:assignmentId`
- admin management routes may live under `/dashboard/courses` and role-conditioned detail actions if you want to keep the one-item sidebar rule

Because the sidebar has only `My courses`, all deeper views should be entered from the main content area rather than extra sidebar items.

### App Shell

Build one shared dashboard shell:

- fixed or sticky left sidebar
- top area with role/user summary and logout
- main content panel on the right
- responsive collapse for mobile widths

Sidebar content:

- logo / product label
- `My courses`
- user identity block at bottom or top

### Auth Screens

Create two polished minimal SaaS pages:

- login
- sign up

Required UX:

- email/password forms
- Google sign-in button
- role choice on sign-up only for student / teacher
- if redirected from Google with unknown email:
  - email field prefilled
  - user completes remaining required fields

### Role-Based Course Views

Student course list:

- enrolled courses only
- each course card or row should show:
  - course title
  - teacher name
  - assignment counts or recent activity if available

Teacher course list:

- owned courses only
- each course should surface:
  - assignment count
  - pending review count
  - student count if available

Admin course list:

- all courses
- should support create and edit actions from the main panel
- teacher assignment must be part of course creation and editing

### Course Detail Views

Student course detail:

- list assignments in that course
- each assignment row/card should show:
  - assignment title
  - evaluation mode
  - attempt usage such as `1/3`
  - latest status
  - latest score when graded

Teacher course detail:

- list assignments in that course
- create assignment action
- edit assignment action
- entry point to see submissions per assignment

Admin course detail:

- management-focused course summary
- enrollment editing access

### Assignment Detail / Submission UX

Student assignment detail:

- show assignment instructions
- show evaluation mode
- show attempts list
- allow new attempt only when rules permit
- submission form accepts:
  - text
  - image
  - txt file

Submit flow:

1. Student opens submission form or modal.
2. Student submits attempt.
3. Form closes immediately on successful API response.
4. UI redirects or returns to assignment attempts list inside the current course context.
5. New attempt appears with `processing`.
6. Frontend polls for status changes until status becomes `review_pending` or `graded`.

Teacher assignment/submission review:

- see all student attempts for assignment
- see each attempt’s extracted text, original file when present, Gemini result, final result, and status
- if status is `review_pending`, show editable score and feedback form
- confirm action finalizes evaluation and changes status to `graded`

### Admin Management UI

Admin management is in scope even with the one-item sidebar rule, so place these actions inside the main dashboard area:

- create/edit students
- create/edit teachers
- create/edit courses
- create/edit enrollments

Recommended pattern:

- segmented tabs or top-level in-content switches within the main panel
- keep the sidebar unchanged

### Design System Direction

Minimal SaaS implementation choices:

- typography:
  - clean sans serif with strong legibility
- colors:
  - neutral surfaces
  - one restrained accent tone
  - clear semantic colors for `processing`, `review_pending`, `graded`
- components:
  - compact sidebar
  - soft cards
  - simple bordered tables
  - clear status badges
  - focused forms with minimal decoration

Avoid:

- chalkboard, notebook, campus, or overly academic visual metaphors
- heavy gradients and playful illustration clutter

## Testing and Acceptance Criteria

### Backend Tests

Add unit and e2e coverage for the core rules:

- auth:
  - signup creates student/teacher only
  - login succeeds with correct credentials
  - duplicate email is rejected
  - admin public signup is rejected
- authorization:
  - student cannot access teacher/admin actions
  - teacher cannot edit another teacher’s course
  - student cannot submit outside enrolled course
- course and enrollment:
  - course requires teacher assignment
  - duplicate enrollment is rejected
- submissions:
  - first attempt succeeds
  - fourth attempt is rejected
  - next attempt is blocked while previous is `processing`
  - next attempt is blocked while previous is `review_pending`
  - next attempt allowed after previous is `graded`
- evaluation:
  - automatic mode moves from `processing` to `graded`
  - partial mode moves from `processing` to `review_pending`
  - teacher confirmation moves `review_pending` to `graded`
  - teacher can edit both score and feedback before confirmation
  - latest graded attempt is returned as final result

### Frontend Scenarios

- login and sign-up pages render and validate correctly
- Google unknown-user redirect lands on sign-up with prefilled email
- sidebar renders only `My courses`
- student sees only enrolled courses
- teacher sees only owned courses
- admin sees manageable course list and admin actions
- student can submit text, image, and txt file homework
- submission success returns to assignment attempts view
- `processing` status is visible immediately after submit
- polling updates UI to `review_pending` or `graded`
- teacher can confirm partial evaluation from review UI
- latest graded attempt is visually surfaced as final result

## Environment and Configuration Changes

Backend `.env` should eventually support:

- Postgres connection values
- JWT secret and expiry settings
- Google OAuth client configuration
- Gemini API key and model configuration
- uploads directory configuration if needed

Keep the existing PostgreSQL factory approach and extend it instead of replacing it.

## Assumptions Locked For V1

- Public self-sign-up is allowed for students and teachers only.
- Admin accounts are not created via the public sign-up page.
- Uploads are stored locally on the backend server filesystem.
- Frontend status refresh uses polling rather than SSE or WebSockets.
- OCR uses `tesseract.js` as requested.
- No lesson entity, no school management, no approval workflows, no plagiarism checks, and no failed submission status in v1.
