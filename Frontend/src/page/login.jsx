import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import API, { saveAuth } from '@/api/api';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordField from '@/components/auth/PasswordField';
export default function Login({ signup = false }) {
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const destination =
    typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.includes('\\') && !/login|signup|register/i.test(from) ? from : '/dashboard';
  if (user) return <Navigate to={destination} replace />;
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (signup && values.password !== values.confirmPassword) {
      setError('Your passwords do not match. Please check both fields.');
      return;
    }
    if (signup && new TextEncoder().encode(values.password).length > 72) {
      setError(
        'Your password is too long. Use at most 72 bytes; some characters use more than one.',
      );
      return;
    }
    delete values.confirmPassword;
    try {
      setLoading(true);
      values.email = values.email.trim().toLowerCase();
      const { data } = await API.post(signup ? '/auth/register' : '/auth/login', values);
      saveAuth(data.token, signup ? data.data : data.existingUser);
      navigate(destination, { replace: true });
    } catch (failure) {
      setError(failure.response?.data?.msg || failure.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout
      title={signup ? 'Create an account' : 'Welcome back'}
      description={
        signup
          ? 'Discover events and experiences near you.'
          : 'Sign in to your workspace and discover what comes next.'
      }
    >
      <form
        className="grid gap-3"
        onSubmit={submit}
      >
        {signup && (
          <>
            <div className="grid min-w-0 gap-1">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                placeholder="Your full name"
              />
            </div>
            <div className="grid min-w-0 gap-1">
              <label htmlFor="role">I'm joining as</label>
              <select
                id="role"
                name="role"
                aria-describedby="role-help"
                defaultValue={
                  params.get('role') === 'exhibitor' ? 'exhibitor' : 'attendee'
                }
              >
                <option value="attendee">Attendee</option>
                <option value="exhibitor">Exhibitor</option>
              </select>
              <p id="role-help" className="text-xs leading-5">
                Organizer accounts are managed by an administrator.
              </p>
            </div>
          </>
        )}
        <div className="grid min-w-0 gap-1">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <PasswordField newPassword={signup} />
        {signup ? (
          <>
            <PasswordField id="confirmPassword" label="Confirm password" newPassword />
            <p className="text-xs leading-5">
              Use 8–72 characters (maximum 72 bytes).
            </p>
          </>
        ) : (
          <Link
            className="justify-self-end py-1 text-sm font-medium"
            to="/forget"
          >
            Forgot password?
          </Link>
        )}
        {error && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          className="celebration-auth-submit inline-flex w-full items-center justify-center gap-3 px-5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                size={18}
              />{' '}
              Please wait…
            </>
          ) : (
            <>
              {signup ? 'Create your account' : 'Sign in'}
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="mt-4 text-center text-sm leading-6 [&_a]:font-semibold">
        {signup ? 'Already part of EventSphere?' : 'New to EventSphere?'}{' '}
        <Link to={signup ? '/login' : '/signup'} state={{ from: destination }}>
          {signup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </AuthLayout>
  );
}
