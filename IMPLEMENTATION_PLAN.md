# Autocheck V1 Implementation Plan

## Summary

This plan defines the current v1 implementation target for Autocheck: a web application where teachers create course homeworks, students submit assignment attempts for those homeworks, and Gemini evaluates those submissions asynchronously. The near-term goal is to support authentication, role-based dashboards, course browsing, homework creation/editing, assignment submission tracking, and evaluation status handling with PostgreSQL-backed persistence.

This plan is intentionally aligned to the current decisions locked during implementation:

- `frontend/` is a Vite React app with a dashboard shell already taking shape.
- `backend/` is a NestJS app with PostgreSQL TypeORM configuration and an existing `users` module.
- Backend domain split for this phase must be:
  - `users`
  - `courses`
  - `homeworks`
  - `assignments`
  - `evaluation`
- Enrollment management is postponed for now.
- Admin management is postponed for now.

## Product Decisions

### Roles

- `teacher`
  - Owns courses assigned to them.
  - Creates and edits homeworks inside their own courses.
  - Can see assignment attempts for homeworks in their own courses.
  - Can confirm or adjust evaluation results when review is required.
- `student`
  - Can sign up themselves.
  - Can see all courses for now.
  - Can open homeworks, submit assignment attempts, and view only their own results.

### Academic Structure

- No `school` management in v1.
- No `lesson` entity in v1.
- No enrollment feature in this phase.
- Data hierarchy is:
  - `course`
  - `homework`
  - `assignment` (student submission attempt)
  - `evaluation`

### Homework vs Assignment

This distinction is now locked:

- `homework`
  - Teacher-created object inside a course.
  - Represents the task or prompt students should respond to.
  - For the current phase, homework contains only:
    - `courseId`
    - `description`
- `assignment`
  - Student submission record for a homework.
  - Tracks attempts, uploaded content, extracted text, status, and grading result.

In other words:

- teachers create `homeworks`
- students create `assignments`

### Homework Behavior

- Homeworks are attached directly to courses.
- Teachers can create a homework by selecting a course and entering a description.
- Teachers can edit only the homework description in the current phase.
- Moving a homework to another course is out of scope for now.

### Assignment Behavior

- Each student may create up to `3` assignment attempts per homework.
- Students must wait until the latest attempt is no longer under evaluation before submitting another attempt.
- The final displayed result for a homework is based on the latest graded assignment attempt.

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
  - homework description created by the teacher
  - student submission text content
- Gemini output must contain:
  - numeric score in range `0-10`
  - feedback limited to `60 words` maximum
- Evaluation modes may exist in the system design, but homework creation in the current UI phase requires only `description`.

### Assignment Statuses

- `processing`
  - Gemini is currently evaluating the latest assignment attempt.
- `review_pending`
  - Gemini finished and teacher review is required.
- `graded`
  - Final score and feedback are available.
- No failed state exists in v1.

### Auth Behavior

- Authentication methods:
  - email/password
  - Google sign-in
- Only `sign up` and `login` are in v1 scope.
- Public self-sign-up is allowed for:
  - `student`
  - `teacher`
- Admin creation and management are postponed for now.

### Dashboard Navigation

- The app shell uses:
  - left sidebar
  - right content area
- Sidebar contains one top-level item in v1: `My courses`
- `My courses` is a dropdown:
  - collapsed by default
  - expands to reveal course items
- Clicking a course item should keep the sidebar visible and render the course detail page on the right side of the layout.

## Backend Implementation Plan

### Core Modules

Use domain-oriented Nest modules:

- `users`
- `courses`
- `homeworks`
- `assignments`
- `evaluation`

Keep `AppModule` as the composition root and register all active modules there.

### Entities and Relationships

The backend should target this model:

- `User`
  - id
  - email
  - password hash
  - full name
  - role: `teacher | student`
  - auth provider metadata as needed for email/password and Google login
  - createdAt and updatedAt
- `Course`
  - id
  - title
  - description optional
  - teacherId required
  - timestamps
- `Homework`
  - id
  - courseId
  - description
  - timestamps
- `Assignment`
  - id
  - homeworkId
  - studentId
  - attemptNumber
  - sourceType: `text | image | txt_file`
  - originalText nullable for direct text input
  - extractedText required after normalization
  - filePath nullable for uploaded image / txt file
  - status: `processing | review_pending | graded`
  - timestamps
  - unique constraint on `homeworkId + studentId + attemptNumber`
- `Evaluation`
  - id
  - assignmentId
  - geminiScore nullable until returned
  - geminiFeedback nullable until returned
  - finalScore nullable until finalized
  - finalFeedback nullable until finalized
  - teacherEdited boolean
  - confirmedByTeacherId nullable
  - finalizedAt nullable
  - timestamps

Relationship rules:

- one teacher owns many courses
- one course has many homeworks
- one homework has many assignment attempts from many students
- one assignment has one evaluation record

### Authorization Rules

- teacher:
  - can access only own courses
  - can create and edit only own homeworks
  - can view assignment attempts only for own course homeworks
- student:
  - can read all courses for now
  - can read homework lists in visible courses
  - can create only their own assignment attempts
  - can read only their own assignments and grades

## API Surface

Define REST APIs grouped by domain.

### Auth / Users

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

### Courses

- `GET /courses`
  - teacher: only teacher-owned courses
  - student: all courses
- `GET /courses/:id`
  - visible only if role is allowed to access that course

### Homeworks

- `GET /courses/:courseId/homeworks`
  - teacher sees homeworks in owned courses
  - student sees homeworks in visible courses
- `POST /courses/:courseId/homeworks`
  - teacher only for owned courses
  - request body for now:
    - `description`
- `PATCH /homeworks/:id`
  - teacher only for owned courses
  - editable field for now:
    - `description`
- `GET /homeworks/:id`
  - role-aware visibility

### Assignments

- `GET /homeworks/:homeworkId/assignments/me`
  - student view of their own assignment attempts for one homework
- `POST /homeworks/:homeworkId/assignments`
  - student submits a new assignment attempt
  - reject if 3 attempts already used
  - reject if latest attempt is not yet finalized
- `GET /courses/:courseId/assignments`
  - teacher view of assignment attempts across owned course
- `GET /assignments/:id`
  - student own assignment attempt or teacher-owned course assignment attempt

### Evaluation

- `PATCH /evaluations/:assignmentId/confirm`
  - teacher confirms review-required evaluation
  - payload may override score and feedback
  - only allowed for teacher-owned course assignments in `review_pending`

## Submission Normalization Flow

Every assignment submission should be normalized into text before Gemini evaluation:

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

## Async Evaluation Flow

Use backend-managed asynchronous processing after assignment creation.

Decision locked for v1:

- frontend should use polling to refresh statuses after submission
- no WebSockets or SSE in v1

Flow:

1. Student creates an assignment attempt.
2. Backend validates attempt count and previous attempt completion.
3. Backend stores the assignment with `processing`.
4. Backend normalizes submission text.
5. Backend creates an evaluation record.
6. Backend triggers async Gemini evaluation after request completes.
7. Gemini response is parsed and validated.
8. Backend writes evaluation results and updates assignment status.

Implementation constraint:

- the submit API must return quickly after persistence, without waiting for Gemini completion

## Validation and Business Rules

- unique user email
- course must always reference exactly one teacher
- teachers can operate only inside owned courses
- homework creation is teacher-only
- homework editing is description-only for now
- max attempts per homework per student is `3`
- next attempt is blocked until previous attempt leaves `processing` or `review_pending`
- only the assignment owner can view student-side attempt history
- only the course owner can review teacher-side assignment history
- feedback limit is `60 words`

## Frontend Implementation Plan

### Route Structure

Use a role-aware route layout:

- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/courses`
- `/dashboard/courses/:courseId`
- `/dashboard/courses/:courseId/homeworks/:homeworkId`

### App Shell

Build one shared dashboard shell:

- persistent left sidebar
- right-side content area
- sidebar remains visible while course detail pages render on the right

Sidebar content:

- logo / product label
- `My courses` top-level dropdown
- collapsed by default
- expanded state shows course links
- user identity block

### Course Views

Student course list:

- show all courses in grid layout for now
- each course card may show:
  - course title
  - teacher name
  - homework count if available

Teacher course list:

- show only teacher-owned courses
- each course card may show:
  - homework count
  - pending review count

### Course Detail Views

Student course detail:

- list homeworks in that course
- each homework row/card should show:
  - description
  - attempt usage such as `1/3`
  - latest status
  - latest score when graded

Teacher course detail:

- list homeworks in that course
- show one `Add new homework` button
- clicking the button opens a modal popup
- modal fields for now:
  - selected course
  - description
- each homework row should include an edit action
- edit flow updates only the description
- page should provide an entry point to see assignment attempts per homework

### Homework Creation UX

- homework creation starts from a single add button
- modal popup allows:
  - course selection
  - homework description input
  - create action
- after creation:
  - refresh homework list
  - close modal
  - keep user in the dashboard layout

### Assignment Views

Student homework detail:

- show homework description
- show student assignment attempt history
- allow creating a new assignment attempt when allowed
- show attempt statuses and latest graded result

Teacher homework detail:

- show all assignment attempts for that homework
- allow review/confirmation flow where applicable

## Immediate Phase Scope

This is the implementation slice to build next:

1. Add backend `courses`, `homeworks`, and `assignments` modules.
2. Add course listing API with role-aware behavior:
   - student gets all courses
   - teacher gets owned courses
3. Add homework creation and edit APIs.
4. Replace mock homework creation on the frontend with real API calls.
5. Add the sidebar dropdown behavior for `My courses`.
6. Keep the course detail page rendered inside the shared dashboard layout.
