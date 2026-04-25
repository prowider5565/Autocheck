import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { getVisibleCourses } from '../../app/helpers';
import type { Role } from '../../types';
import { ProfilePanel } from './ProfilePanel';

export function DashboardLayout({ appState }: { appState: AppState }) {
  const { currentUser, currentProfile } = appState;
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!currentUser || !currentProfile) {
    return null;
  }

  const roleCopy: Record<Role, string> = {
    admin: 'Admin tools are postponed while the homework flow is being built out.',
    teacher: 'Courses you own, homeworks you publish, and student attempts you review.',
    student: 'Courses you can browse, homework prompts you open, and feedback you track.',
  };

  const visibleCourses = useMemo(
    () => getVisibleCourses(currentUser, appState.courses),
    [appState.courses, currentUser],
  );

  async function handleLogout() {
    setLogoutBusy(true);

    try {
      await appState.logout();
      navigate('/login');
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <Link className="brand" to="/dashboard/courses">
            <span className="brand__eyebrow">Autocheck</span>
            <strong>Homework Review Hub</strong>
          </Link>
          <nav className="sidebar__nav">
            <button
              aria-expanded={coursesOpen}
              className={
                coursesOpen
                  ? 'sidebar__toggle sidebar__toggle--open'
                  : 'sidebar__toggle'
              }
              onClick={() => setCoursesOpen((value) => !value)}
              type="button"
            >
              <span className="sidebar__toggle-label">
                <strong>My courses</strong>
              </span>
              <span
                className={
                  coursesOpen
                    ? 'sidebar__chevron sidebar__chevron--open'
                    : 'sidebar__chevron'
                }
              >
                ▾
              </span>
            </button>
            <div
              className={
                coursesOpen
                  ? 'sidebar__submenu sidebar__submenu--open'
                  : 'sidebar__submenu'
              }
            >
              <NavLink
                className={({ isActive }) =>
                  isActive && location.pathname === '/dashboard/courses'
                    ? 'sidebar__link sidebar__link--active'
                    : 'sidebar__link'
                }
                end
                to="/dashboard/courses"
              >
                All courses
              </NavLink>
              {visibleCourses.map((course) => (
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? 'sidebar__link sidebar__link--active sidebar__link--child'
                      : 'sidebar__link sidebar__link--child'
                  }
                  key={course.id}
                  to={`/dashboard/courses/${course.id}`}
                >
                  {course.title}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__user-summary">
            <p className="sidebar__role">{currentUser.role}</p>
            <strong>{currentProfile.fullName}</strong>
            <p>{roleCopy[currentUser.role]}</p>
            {currentProfile.role === 'teacher' ? (
              <small>Evaluation mode: {currentProfile.evaluationMode}</small>
            ) : null}
          </div>

          <div className="profile-dock">
            <button
              aria-expanded={profileMenuOpen}
              className="profile-dock__trigger"
              onClick={() => setProfileMenuOpen((value) => !value)}
              type="button"
            >
              <span className="profile-dock__avatar">
                {currentProfile.fullName
                  .split(' ')
                  .map((part) => part[0] ?? '')
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="profile-dock__meta">
                <strong>Profile</strong>
                <small>Account actions</small>
              </span>
              <span
                className={
                  profileMenuOpen
                    ? 'sidebar__chevron sidebar__chevron--open'
                    : 'sidebar__chevron'
                }
              >
                ▾
              </span>
            </button>

            <div
              className={
                profileMenuOpen
                  ? 'profile-dock__menu profile-dock__menu--open'
                  : 'profile-dock__menu'
              }
            >
              <button
                className="profile-dock__item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                type="button"
              >
                Edit
              </button>
              <button
                className="profile-dock__item"
                disabled={logoutBusy}
                onClick={() => {
                  setProfileMenuOpen(false);
                  void handleLogout();
                }}
                type="button"
              >
                {logoutBusy ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>

      {profileModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div aria-modal="true" className="modal-card modal-card--profile" role="dialog">
            <div className="panel__header panel__header--split">
              <div>
                <h2>Edit profile</h2>
                <p>Update your account details and evaluation preferences here.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setProfileModalOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <ProfilePanel appState={appState} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
