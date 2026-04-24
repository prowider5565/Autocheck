import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import type { Role } from '../../types';

export function DashboardLayout({ appState }: { appState: AppState }) {
  const { currentUser, currentProfile } = appState;
  const navigate = useNavigate();
  const [logoutBusy, setLogoutBusy] = useState(false);

  if (!currentUser || !currentProfile) {
    return null;
  }

  const roleCopy: Record<Role, string> = {
    admin: 'System management with course ownership controls.',
    teacher: 'Courses you own, assignments you manage, reviews you confirm.',
    student: 'Courses you joined, assignments you submit, feedback you track.',
  };

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
            <NavLink
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
              to="/dashboard/courses"
            >
              My courses
            </NavLink>
          </nav>
        </div>

        <div className="sidebar__user">
          <p className="sidebar__role">{currentUser.role}</p>
          <strong>{currentProfile.fullName}</strong>
          <p>{roleCopy[currentUser.role]}</p>
          {currentProfile.role === 'teacher' ? (
            <small>Evaluation mode: {currentProfile.evaluationMode}</small>
          ) : null}
          <button
            className="ghost-button"
            disabled={logoutBusy}
            onClick={() => {
              void handleLogout();
            }}
            type="button"
          >
            {logoutBusy ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
