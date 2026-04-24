import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/core/auth/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}