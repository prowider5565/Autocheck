import { useState, type FormEvent } from 'react';
import type { AppState } from '../../app/app-state';
import { initialSignupDraft } from '../../app/app-state';
import type { DraftSignup, User } from '../../types';

export function AdminManagement({ appState }: { appState: AppState }) {
  const teachers = appState.users.filter((user) => user.role === 'teacher');
  const students = appState.users.filter((user) => user.role === 'student');
  const [userDraft, setUserDraft] = useState<DraftSignup>(initialSignupDraft);
  const [courseDraft, setCourseDraft] = useState({
    title: '',
    description: '',
    teacherId: teachers[0]?.id ?? '',
  });

  function handleUserCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userDraft.fullName || !userDraft.email || !userDraft.password) {
      return;
    }

    appState.createAdminUser(userDraft);
    setUserDraft(initialSignupDraft);
  }

  function handleCourseCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!courseDraft.title || !courseDraft.teacherId) {
      return;
    }

    appState.createCourse(courseDraft);
    setCourseDraft({
      title: '',
      description: '',
      teacherId: teachers[0]?.id ?? '',
    });
  }

  return (
    <div className="admin-grid">
      <section className="panel">
        <div className="panel__header">
          <h2>Create teachers or students</h2>
          <p>Admin controls are kept inside the main courses panel to match the one-item sidebar rule.</p>
        </div>

        <form className="stack-form" onSubmit={handleUserCreate}>
          <label>
            Full name
            <input
              value={userDraft.fullName}
              onChange={(event) =>
                setUserDraft((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={userDraft.email}
              onChange={(event) =>
                setUserDraft((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Role
            <select
              value={userDraft.role}
              onChange={(event) =>
                setUserDraft((current) => ({
                  ...current,
                  role: event.target.value as DraftSignup['role'],
                }))
              }
            >
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </label>
          <label>
            Temporary password
            <input
              value={userDraft.password}
              onChange={(event) =>
                setUserDraft((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </label>
          <button className="primary-button" type="submit">
            Create user
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Teachers</h2>
          <p>Inline edits are local for now and ready to be connected to backend CRUD later.</p>
        </div>
        <EditableUserTable appState={appState} users={teachers} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Students</h2>
          <p>Admins can maintain student records and later pair this with enrollment APIs.</p>
        </div>
        <EditableUserTable appState={appState} users={students} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Create a course</h2>
          <p>Every course must have exactly one teacher assigned.</p>
        </div>
        <form className="stack-form" onSubmit={handleCourseCreate}>
          <label>
            Title
            <input
              value={courseDraft.title}
              onChange={(event) =>
                setCourseDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={courseDraft.description}
              onChange={(event) =>
                setCourseDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Teacher
            <select
              value={courseDraft.teacherId}
              onChange={(event) =>
                setCourseDraft((current) => ({
                  ...current,
                  teacherId: event.target.value,
                }))
              }
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit">
            Create course
          </button>
        </form>
      </section>

      <section className="panel panel--span-2">
        <div className="panel__header">
          <h2>Courses and enrollments</h2>
          <p>Edit titles, switch teachers, and manage which students belong to each course.</p>
        </div>
        <EditableCoursesTable appState={appState} />
      </section>
    </div>
  );
}

function EditableUserTable({
  appState,
  users,
}: {
  appState: AppState;
  users: User[];
}) {
  return (
    <div className="editable-list">
      {users.map((user) => (
        <div className="editable-row" key={user.id}>
          <input
            value={user.fullName}
            onChange={(event) =>
              appState.updateUser(user.id, { fullName: event.target.value })
            }
          />
          <input
            value={user.email}
            onChange={(event) =>
              appState.updateUser(user.id, { email: event.target.value })
            }
          />
          <span className={`pill pill--${user.role}`}>{user.role}</span>
        </div>
      ))}
    </div>
  );
}

function EditableCoursesTable({ appState }: { appState: AppState }) {
  const teachers = appState.users.filter((user) => user.role === 'teacher');
  const students = appState.users.filter((user) => user.role === 'student');

  return (
    <div className="course-admin-list">
      {appState.courses.map((course) => (
        <div className="course-admin-card" key={course.id}>
          <div className="course-admin-card__header">
            <input
              value={course.title}
              onChange={(event) =>
                appState.updateCourse(course.id, { title: event.target.value })
              }
            />
            <select
              value={course.teacherId}
              onChange={(event) =>
                appState.updateCourse(course.id, { teacherId: event.target.value })
              }
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            value={course.description}
            onChange={(event) =>
              appState.updateCourse(course.id, {
                description: event.target.value,
              })
            }
          />

          <div className="enrollment-pills">
            {students.map((student) => {
              const enrolled = course.studentIds.includes(student.id);

              return (
                <button
                  className={
                    enrolled
                      ? 'enrollment-pill enrollment-pill--active'
                      : 'enrollment-pill'
                  }
                  key={student.id}
                  onClick={() => appState.toggleEnrollment(course.id, student.id)}
                  type="button"
                >
                  {student.fullName}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
