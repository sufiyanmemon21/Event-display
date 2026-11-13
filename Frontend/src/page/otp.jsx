import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import API from "@/api/api";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  clearRecovery,
  postponeResend,
  readRecovery,
  recoveryButton,
  recoveryError,
  recoveryLink,
  requestRecoveryCode,
} from "@/components/auth/recovery";
import EllipsisLoader from "@/components/EllipsisLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const codeLength = 6;
const emptyCode = Array(codeLength).fill("");

function maskEmail(email) {
  const [name, domain] = email.split("@");
  return name.slice(0, 1) + "•••@" + domain;
}

function countdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  return String(minutes).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

export default function Otp() {
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(readRecovery);
  const [digits, setDigits] = useState(emptyCode);
  const [now, setNow] = useState(Date.now);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const inputs = useRef([]);
  const seconds = Math.max(0, Math.ceil(((recovery?.resendAt ?? 0) - now) / 1000));
  const countingDown = seconds > 0;
  const code = digits.join("");

  useEffect(() => {
    if (!countingDown) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [countingDown]);

  function focusDigit(index) {
    inputs.current[index]?.focus();
    inputs.current[index]?.select();
  }

  function enterDigits(value, index) {
    const typed = value.replace(/\D/g, "");
    if (value && !typed) return;
    const start = typed.length >= codeLength ? 0 : index;
    const next = [...digits];
    const replacement = typed ? typed.slice(0, codeLength - start).split("") : [""];
    next.splice(start, replacement.length, ...replacement);
    setDigits(next);
    setError("");
    if (typed) focusDigit(Math.min(start + typed.length, codeLength - 1));
  }

  function handleKeyDown(event, index) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      enterDigits("", index - 1);
      focusDigit(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) focusDigit(index - 1);
    if (event.key === "ArrowRight" && index < codeLength - 1) focusDigit(index + 1);
  }

  async function handleVerify(event) {
    event.preventDefault();
    if (pending || code.length !== codeLength) return;
    setPending("verify");
    setError("");

    try {
      const { data } = await API.post("/forget/verify-otp", { email: recovery.email, otp: code });
      clearRecovery();
      navigate("/dashboard/reset", { replace: true, state: { token: data.token } });
    } catch (error) {
      setError(error.response?.data?.msg || "Unable to verify the code. Please try again.");
    } finally {
      setPending("");
    }
  }

  async function handleResend() {
    if (pending || Date.now() < recovery.resendAt) return;
    setPending("resend");
    setError("");
    setResent(false);

    try {
      setRecovery(await requestRecoveryCode(recovery.email));
      setNow(Date.now());
      setDigits(emptyCode);
      setResent(true);
    } catch (error) {
      const { msg, retryAfterMs } = error.response?.data ?? {};
      if (Number.isFinite(retryAfterMs)) {
        setRecovery(postponeResend(recovery, retryAfterMs));
        setNow(Date.now());
      }
      setError(msg || "Unable to request another code. Please try again.");
    } finally {
      setPending("");
    }
  }

  if (!recovery?.email) return <Navigate to="/forget" replace />;

  return (
    <AuthLayout
      title="Verify your email"
      description={"A code was requested for " + maskEmail(recovery.email) + ". Check your inbox."}
    >
      <form onSubmit={handleVerify} className="grid gap-4">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium">Verification code</legend>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
            {digits.map((digit, index) => (
              <Input
                key={index}
                ref={(input) => { inputs.current[index] = input; }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={"Digit " + (index + 1) + " of " + codeLength}
                className="min-h-12 px-0! text-center text-lg! font-semibold tabular-nums"
                value={digit}
                disabled={Boolean(pending)}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onChange={(event) => enterDigits(event.target.value, index)}
                onPaste={(event) => {
                  event.preventDefault();
                  enterDigits(event.clipboardData.getData("text"), index);
                }}
              />
            ))}
          </div>
        </fieldset>
        {error && <p className={recoveryError} role="alert">{error}</p>}
        <Button type="submit" variant="account-primary" className={recoveryButton} disabled={Boolean(pending) || code.length !== codeLength}>
          {pending === "verify" ? <EllipsisLoader scope="inline" label="Verifying code" /> : "Verify OTP"}
        </Button>
      </form>

      <div className="mt-4 grid justify-items-center gap-2 text-sm">
        {resent && <p role="status">A new code was requested.</p>}
        <button
          type="button"
          disabled={countingDown || Boolean(pending)}
          onClick={handleResend}
          className="min-h-8 rounded-sm px-2 font-semibold text-[var(--account-accent-hover)] underline-offset-4 enabled:hover:underline enabled:active:text-[var(--account-ink)] disabled:cursor-not-allowed disabled:font-medium disabled:text-[var(--account-copy)]"
        >
          {pending === "resend" ? "Requesting code…" : countingDown ? "Resend code in " + countdown(seconds) : "Resend OTP"}
        </button>
        <Link to="/forget" className={recoveryLink}>Change email</Link>
      </div>
    </AuthLayout>
  );
}
