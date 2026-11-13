import EllipsisLoader from "@/components/EllipsisLoader";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  recoveryButton,
  recoveryError,
  recoveryLink,
  requestRecoveryCode,
} from "@/components/auth/recovery";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Forget() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await requestRecoveryCode(email.trim().toLowerCase());
      navigate("/dashboard/otp");
    } catch (error) {
      setError(error.response?.data?.msg || "Unable to request a code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Account recovery"
      description="Enter your email address to get a verification code."
    >
      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="reset-email">Email address</Label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            disabled={loading}
            required
          />
        </div>
        {error && <p className={recoveryError} role="alert">{error}</p>}
        <Button type="submit" disabled={loading} variant="account-primary" className={recoveryButton}>
          {loading ? <EllipsisLoader scope="inline" label="Requesting code" /> : "Send OTP"}
        </Button>
      </form>

      <Link to="/login" className={recoveryLink + " mt-4"}>Back to Login</Link>
    </AuthLayout>
  );
}
