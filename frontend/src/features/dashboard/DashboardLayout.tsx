import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { getActiveCourses, getArchivedCourses, getVisibleCourses } from '../../app/helpers';
import { ProfilePanel } from './ProfilePanel';

export function DashboardLayout({ appState }: { appState: AppState }) {
  const { currentUser, currentProfile } = appState;
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const visibleCourses = useMemo(
    () => (currentUser ? getVisibleCourses(currentUser, appState.courses) : []),
    [appState.courses, currentUser],
  );
  const activeCourses = useMemo(() => getActiveCourses(visibleCourses), [visibleCourses]);
  const archivedCourses = useMemo(() => getArchivedCourses(visibleCourses), [visibleCourses]);

  if (!currentUser || !currentProfile) {
    return null;
  }

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
            <strong>Uy Vazifalarini Tekshirish Markazi</strong>
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
                <strong>Mening kurslarim</strong>
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
                Barcha kurslar
              </NavLink>
              {activeCourses.map((course) => (
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
              {archivedCourses.length > 0 ? (
                <p className="sidebar__section-label">Arxiv</p>
              ) : null}
              {archivedCourses.map((course) => (
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
                <strong>Profil</strong>
                <small>Akkaunt amallari</small>
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
                <EditIcon />
                <span>Tahrirlash</span>
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
                <LogoutIcon />
                <span>{logoutBusy ? 'Chiqilmoqda...' : 'Chiqish'}</span>
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
                <h2>Profilni tahrirlash</h2>
                <p>Bu yerda akkaunt ma'lumotlari va baholash sozlamalarini yangilang.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setProfileModalOpen(false)}
                type="button"
              >
                Yopish
              </button>
            </div>
            <ProfilePanel appState={appState} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditIcon() {
  return (
    <span aria-hidden="true" className="profile-dock__item-icon">
      <svg viewBox="0 0 24 24">
        <path d="m4 20 4.2-1 8.6-8.6-3.2-3.2L5 15.8 4 20Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="m12.8 7.2 3.2 3.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M14.6 5.4 16 4a2.2 2.2 0 0 1 3.1 3.1l-1.4 1.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

function LogoutIcon() {
  return (
    <span aria-hidden="true" className="profile-dock__item-icon">
      <svg viewBox="0 0 24 24">
        <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M14 8.5 18 12l-4 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M9 12h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    </span>
  );
}
