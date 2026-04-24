import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { Faculty } from '@/features/faculty/pages/Faculty';
import { Students } from '@/features/students/pages/Students';
import { Subjects } from '@/features/subjects/pages/Subjects';
import { Payroll } from '@/features/payroll/pages/Payroll';
import { Records } from '@/features/records/pages/Records';
import { Login } from '@/features/auth/pages/Login';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'subjects', Component: Subjects },
      { path: 'payroll', Component: Payroll },
      { path: 'records', Component: Records },
      { path: 'faculty', Component: Faculty },
      { path: 'students', Component: Students },
    ],
  },
]);
