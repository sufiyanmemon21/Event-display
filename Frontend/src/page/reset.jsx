import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircleCheck, Eye, EyeOff } from "lucide-react";
import API, { clearAuth } from "@/api/api";
import AuthLayout from "@/components/auth/AuthLayout";
import { recoveryButton, recoveryError, recoveryLink } from "@/components/auth/recovery";
import EllipsisLoader from "@/components/EllipsisLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PasswordField({ id, label, value, onChange, loading }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="celebration-auth-password relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={8}
          disabled={loading}
          className="pe-12!"
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-[7px] text-[var(--account-copy)] enabled:hover:text-[var(--account-accent-hover)] enabled:active:text-[var(--account-ink)] disabled:cursor-not-allowed disabled:text-[var(--account-accent-disabled)]"
          onClick={() => setVisible(!visible)}
          aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
          disabled={loading}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default function Reset() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = state?.token;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    if (password.length < 8 || new TextEncoder().encode(password).length > 72 || !/\S/.test(password)) {
      setError("Use at least 8 characters and at most 72 bytes.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/forget/resetPassword", { token, password, confirmPassword });
      clearAuth();
      setPassword("");
      setConfirmPassword("");
      navigate("/dashboard/reset", { replace: true, state: { complete: true } });
    } catch (error) {
      setError(error.response?.data?.msg || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (state?.complete) {
    return (
      <AuthLayout title="Password updated" description="You can now sign in with your new password.">
        <CircleCheck size={34} className="mb-5 text-[var(--account-accent)]" aria-hidden="true" />
        <Button asChild variant="account-primary" className={recoveryButton}>
          <Link to="/login">Back to Login</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return (
      <AuthLayout title="Reset password" description="Request a verification code to continue.">
        <Link to="/forget" className={recoveryLink}>Request a code</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" description="Choose a new password with at least 8 characters.">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <PasswordField id="new-password" label="New password" value={password} onChange={setPassword} loading={loading} />
        <PasswordField id="confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} loading={loading} />
        {error && <p className={recoveryError} role="alert">{error}</p>}
        <Button type="submit" variant="account-primary" className={recoveryButton} disabled={loading}>
          {loading ? <EllipsisLoader scope="inline" label="Updating password" /> : "Reset Password"}
        </Button>
      </form>
      <Link to="/forget" className={recoveryLink + " mt-4"}>Request a new code</Link>
    </AuthLayout>
  );
}
