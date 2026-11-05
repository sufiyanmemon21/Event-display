import AuthLayout from '@/components/auth/AuthLayout';
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import API, { clearAuth } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Reset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token") || "";
  const validToken = /^[a-f0-9]{64}$/.test(token);

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (
      password.length < 8 ||
      new TextEncoder().encode(password).length > 72 ||
      !/\S/.test(password)
    ) {
      setError(
        "Password must be at least 8 characters and at most 72 bytes."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/forget/resetPassword", {
        token,
        password,
      });

      clearAuth();
      toast.success(response.data.msg);
      navigate("/login", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.msg ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Account recovery" description="Securely recover your EventSphere account.">
      {!validToken ? (
        <>
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="alert">
            This reset link is invalid. Request a new link to continue.
          </p>
          <Link
            to="/forget"
            className="mt-4 block text-center text-sm font-medium text-[#247d78] underline-offset-4 hover:text-[#145e5c] hover:underline"
          >
            Request a reset link
          </Link>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="new-password">New password</Label>
              <div className="celebration-auth-password">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  disabled={loading}
                  aria-describedby="new-password-help"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p id="new-password-help" className="text-xs leading-5 text-[#556c74]">
                Use at least 8 characters.
              </p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="confirm-new-password">Confirm password</Label>
              <Input
                id="confirm-new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="celebration-auth-submit w-full text-sm font-semibold"
            >
              {loading ? "Updating..." : "Reset password"}
            </Button>
          </form>
          <Link
            to="/forget"
            className="mt-4 block text-center text-sm font-medium text-[#247d78] underline-offset-4 hover:text-[#145e5c] hover:underline"
          >
            Request a new link
          </Link>
        </>
      )}
      <Link
        to="/login"
        className="mt-4 block text-center text-sm font-medium text-[#247d78] underline-offset-4 hover:text-[#145e5c] hover:underline"
      >
        Back to login
      </Link>
    </AuthLayout>
  );
}
