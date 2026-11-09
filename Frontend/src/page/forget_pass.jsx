import EllipsisLoader from "@/components/EllipsisLoader";
import AuthLayout from "@/components/auth/AuthLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Forget() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post("/forget/verifyemail", {
        email: email.trim().toLowerCase(),
      });

      setMessage(response.data.msg);
    } catch (error) {
      setError(
        error.response?.data?.msg ||
          "Unable to request a reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Account recovery"
      description="Securely recover your EventSphere account."
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
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            disabled={loading}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="celebration-auth-submit w-full text-sm font-semibold min-h-[46px] rounded-[7px] [background:var(--account-accent)] text-[#fffaf6] hover:[background:var(--account-accent-hover)]"
        >
          {loading ? (
            <EllipsisLoader scope="inline" label="Sending reset link" />
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      {message && (
        <div className="mt-4 space-y-1 text-sm text-[#364f5b]" role="status">
          <p>{message}</p>
          <p className="text-xs leading-5 text-[#556c74] [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
            The link expires in 15 minutes. Wait at least one minute before
            requesting another.
          </p>
        </div>
      )}

      {error && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
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
