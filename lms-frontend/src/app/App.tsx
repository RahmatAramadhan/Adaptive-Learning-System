import React from 'react';
import { RouterProvider, createBrowserRouter, Outlet, Navigate } from 'react-router';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Questionnaire } from './pages/Questionnaire';
import { ProtectedLayout } from './components/ProtectedLayout';
import { StudentDashboard } from './pages/student/Dashboard';
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { CourseView } from './pages/student/CourseView';
import { TeacherCourseView } from './pages/teacher/CourseView';
import { LessonView } from './pages/student/LessonView';
import { TeacherLessonView } from './pages/teacher/LessonView';
import { EvaluationsList } from './pages/student/EvaluationsList';
import { TakeEvaluation } from './pages/student/TakeEvaluation';
import { StudentsList } from './pages/teacher/StudentsList';
import { AddCourse } from './pages/teacher/AddCourse';
import { AddEvaluation } from './pages/teacher/AddEvaluation';
import { EvaluationsManagement } from './pages/teacher/EvaluationsManagement';
import { EditEvaluation } from './pages/teacher/EditEvaluation';
import { StudentResultsReview } from './pages/teacher/StudentResultsReview';
import { ModulesManagement } from './pages/teacher/ModulesManagement';
import { Toaster } from 'sonner';

// ── Auth guard: redirect berdasarkan status login & role ──────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  // Siswa yang belum mengisi kuesioner diarahkan ke halaman kuesioner
  if (currentUser.role === 'siswa' && !currentUser.has_learning_style) {
    return <Navigate to="/questionnaire" replace />;
  }

  return <>{children}</>;
}

// ── Role guard: pastikan hanya role yang sesuai yang bisa akses ───────────────
function RoleGuard({ role, children }: { role: 'guru' | 'siswa'; children: React.ReactNode }) {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ── Root redirect berdasarkan role ────────────────────────────────────────────
function RootRedirect() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'siswa' && !currentUser.has_learning_style)
    return <Navigate to="/questionnaire" replace />;
  if (currentUser.role === 'guru')
    return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: RootRedirect },

      // Public
      { path: 'login',        Component: Login },
      { path: 'register',     Component: Register },
      { path: 'questionnaire', Component: QuestionnaireGuard },

      // Student
      {
        path: 'student',
        element: <AuthGuard><RoleGuard role="siswa"><ProtectedLayout /></RoleGuard></AuthGuard>,
        children: [
          { index: true,                              Component: StudentDashboard },
          { path: 'course/:id',                       Component: CourseView },
          { path: 'learn/:courseId/:moduleId',        Component: LessonView },
          { path: 'evaluations',                      Component: EvaluationsList },
          { path: 'evaluations/:evaluationId/take',   Component: TakeEvaluation },
          { path: 'courses',                          Component: StudentDashboard },
          { path: 'profile',                          element: <div className="p-8">Profile</div> },
        ],
      },

      // Teacher / Guru
      {
        path: 'teacher',
        element: <AuthGuard><RoleGuard role="guru"><ProtectedLayout /></RoleGuard></AuthGuard>,
        children: [
          { index: true,                                    Component: TeacherDashboard },
          { path: 'course/:id',                             Component: TeacherCourseView },
          { path: 'learn/:courseId/:moduleId',              Component: TeacherLessonView },
          { path: 'students',                               Component: StudentsList },
          { path: 'add-learning',                           Component: AddCourse },
          { path: 'add-learning/:id',                       Component: AddCourse },
          { path: 'modules',                                Component: ModulesManagement },
          { path: 'evaluations',                            Component: EvaluationsManagement },
          { path: 'evaluations/create',                     Component: AddEvaluation },
          { path: 'evaluations/:evaluationId/edit',         Component: EditEvaluation },
          { path: 'evaluations/:evaluationId/results',      Component: StudentResultsReview },
        ],
      },

      { path: '*', element: <div className="text-center p-10 text-slate-500">404 — Halaman tidak ditemukan</div> },
    ],
  },
]);

// Questionnaire hanya bisa diakses siswa yang belum mengisi
function QuestionnaireGuard() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.has_learning_style) return <Navigate to="/student" replace />;
  return <Questionnaire />;
}

function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </DataProvider>
    </AuthProvider>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
