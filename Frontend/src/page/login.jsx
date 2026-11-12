import { validSignupEmail, validSignupPassword } from "@/lib/signupValidation";
import EllipsisLoader from "@/components/EllipsisLoader";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import API, { saveAuth } from "@/api/api";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
function accountDestination(account, returnTo) {
  const booking = returnTo && /^\/book\/?(?:[?#]|$)/i.test(returnTo);
  return (
    (booking && account.role !== "attendee" ? null : returnTo) ||
    (account.role === "attendee" ? "/" : "/dashboard")
  );
}

export default function Login({ signup = false }) {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "exhibitor" ? "exhibitor" : "attendee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const returnTo =
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !from.includes("\\") &&
    !/login|signup|register/i.test(from)
      ? from
      : null;
  if (user) return <Navigate to={accountDestination(user, returnTo)} replace />;
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (signup) {
      if (!values.name || values.name.trim().length < 2 || values.name.trim().length > 80) {
        setError("Enter your full name using 2–80 characters."); return;
      }
      if (values.role === "exhibitor" && (!values.companyName || values.companyName.trim().length < 2 || values.companyName.trim().length > 150)) {
        setError("Enter your company name using 2–150 characters."); return;
      }
      if (!validSignupEmail(values.email)) {
        setError("Enter a valid email address, such as name@gmail.com. Do not use slashes, spaces, or a dot at the beginning or end."); return;
      }
      if (!validSignupPassword(values.password)) {
        setError("Use at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol. The maximum is 72 bytes."); return;
      }
    }
    if (signup && values.password !== values.confirmPassword) {
      setError("Your passwords do not match. Please check both fields.");
      return;
    }
    if (signup && new TextEncoder().encode(values.password).length > 72) {
      setError(
        "Your password is too long. Use at most 72 bytes; some characters use more than one.",
      );
      return;
    }
    delete values.confirmPassword;
    try {
      setLoading(true);
      values.email = values.email.trim().toLowerCase();
      const { data } = await API.post(
        signup ? "/auth/register" : "/auth/login",
        values,
      );
      const account = signup ? data.data : data.existingUser;
      saveAuth(data.token, account);
      navigate(accountDestination(account, returnTo), { replace: true });
    } catch (failure) {
      setError(
        failure.response?.data?.msg ||
          failure.message ||
          "Unable to connect to the server",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout
      photoBackground
      title={signup ? "Create an account" : "Welcome back"}
      description={
        signup
          ? "Discover events and experiences near you."
          : "Sign in to your workspace and discover what comes next."
      }
    >
      <form className="grid gap-3" onSubmit={submit} noValidate={signup}>
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
                value={role}
                onChange={event => { setRole(event.target.value); setError(""); }}
              >
                <option value="attendee">Attendee</option>
                <option value="exhibitor">Exhibitor</option>
              </select>
              <p
                id="role-help"
                className="text-xs leading-5 [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]"
              >
                Organizer accounts are managed by an administrator.
              </p>
            </div>
            {role === "exhibitor" && <div className="grid min-w-0 gap-1">
              <label htmlFor="companyName">Company name</label>
              <input id="companyName" name="companyName" autoComplete="organization" required minLength={2} maxLength={150} placeholder="Your company name" />
            </div>}
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
            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              newPassword
            />
            <p className="text-xs leading-5 [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
              Use at least 8 characters, including uppercase and lowercase letters, a number and a symbol (for example, @ or !). Maximum 72 bytes.
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
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800 [.workspace-form-body_fieldset_>_p&]:py-[14px]"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          className="celebration-auth-submit inline-flex w-full items-center justify-center gap-3 px-5 text-sm font-semibold
          transition disabled:cursor-wait disabled:opacity-60 min-h-[46px] rounded-[7px]
          [background:var(--account-accent)] text-[#fffaf6] hover:[background:var(--account-accent-hover)]"
          disabled={loading}
        >
          {loading ? (
            <>
              <EllipsisLoader
                scope="inline"
                label={signup ? "Creating your account" : "Signing in"}
              />
              Please wait…
            </>
          ) : (
            <>
              {signup ? "Create your account" : "Sign in"}
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="mt-4 text-center text-sm leading-6 [&_a]:font-semibold">
        {signup ? "Already part of EventSphere?" : "New to EventSphere?"}{" "}
        <Link to={signup ? "/login" : "/signup"} state={{ from: returnTo }}>
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </AuthLayout>
  );
}
