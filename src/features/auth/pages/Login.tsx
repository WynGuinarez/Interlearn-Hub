import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/core/auth/AuthContext';

export function Login() {
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const redirectPath = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to access the dashboard.</p>
        <div className="mt-5 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground"
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
