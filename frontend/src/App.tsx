import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAutocheckApp } from './app/use-autocheck-app';
import { SplashScreen } from './components/ui';
import { AssignmentDetailPage } from './features/assignments/AssignmentDetailPage';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { SignupPage } from './features/auth/SignupPage';
import { CourseDetailPage } from './features/courses/CourseDetailPage';
import { CoursesPage } from './features/courses/CoursesPage';
import { DashboardLayout } from './features/dashboard/DashboardLayout';

function AutocheckApp() {
  const appState = useAutocheckApp();

  if (!appState.authResolved) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage appState={appState} />} />
      <Route path="/signup" element={<SignupPage appState={appState} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            authResolved={appState.authResolved}
            currentUser={appState.currentUser}
          />
        }
      >
        <Route element={<DashboardLayout appState={appState} />}>
          <Route index element={<Navigate to="/dashboard/courses" replace />} />
          <Route path="courses" element={<CoursesPage appState={appState} />} />
          <Route
            path="courses/:courseId"
            element={<CourseDetailPage appState={appState} />}
          />
          <Route
            path="courses/:courseId/homeworks/:homeworkId"
            element={<AssignmentDetailPage appState={appState} />}
          />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={appState.currentUser ? '/dashboard/courses' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AutocheckApp />
    </BrowserRouter>
  );
}

export default App;
