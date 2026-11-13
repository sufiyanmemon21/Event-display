import API from "@/api/api";

const recoveryKey = "eventsphere-recovery";

export const recoveryButton =
  "w-full min-h-[46px] rounded-[7px] text-sm font-semibold";
export const recoveryError =
  "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800";
export const recoveryLink = "block text-center text-sm font-medium";

export function readRecovery() {
  try {
    return JSON.parse(sessionStorage.getItem(recoveryKey));
  } catch {
    return null;
  }
}

export function clearRecovery() {
  sessionStorage.removeItem(recoveryKey);
}

export async function requestRecoveryCode(email) {
  const previous = readRecovery();
  if (previous?.email === email && previous.resendAt > Date.now()) return previous;

  const { data } = await API.post("/forget/request-otp", { email });
  const recovery = { email, resendAt: Date.now() + data.retryAfterMs };
  sessionStorage.setItem(recoveryKey, JSON.stringify(recovery));
  return recovery;
}

export function postponeResend(recovery, retryAfterMs) {
  const updated = { ...recovery, resendAt: Date.now() + retryAfterMs };
  sessionStorage.setItem(recoveryKey, JSON.stringify(updated));
  return updated;
}
