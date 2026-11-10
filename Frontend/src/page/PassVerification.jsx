import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import PublicPageShell from "@/components/landing/PublicPageShell";
import API from "@/api/api";

export default function PassVerification() {
  const { hash, pathname } = useLocation();
  const user = useAuth();
  const staff = ["admin", "exhibitor"].includes(user?.role);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    API.post(
      staff ? "/attendees/passes/check-in" : "/attendees/passes/verify",
      { token: hash.slice(1) },
      { signal: controller.signal },
    )
      .then(({ data }) => {
        if (!controller.signal.aborted) setResult({ hash, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({
            hash,
            error:
              error.response?.data?.msg ||
              "Unable to verify this pass. Try again.",
          });
      });
    return () => controller.abort();
  }, [hash, staff]);

  const current = result?.hash === hash ? result : null;

  return (
    <PublicPageShell>
      <main className="mx-auto min-h-[60vh] max-w-xl px-4 pb-12">
        <section className="space-y-4 rounded-xl border border-[#e2c9bd] bg-[var(--public-paper)] p-6 [.workspace-form-body_fieldset_>_p&]:py-[14px]">
          <h1 className="font-serif text-3xl">EventSphere pass verification</h1>
          {!current ? (
            <EllipsisLoader label="Checking pass" />
          ) : current.error ? (
            <p role="alert" className="text-red-800">
              {current.error}
            </p>
          ) : (
            <div role="status">
              <p className="font-semibold text-green-800">
                {staff ? (current.data.alreadyCheckedIn ? "Already checked in" : "Attendance checked in") : "Valid confirmed booking"}
              </p>
              <p>
                {current.data.title}{current.data.ticketType && ` · ${current.data.ticketType}`}
              </p>
              {current.data.checkedInAt && <p>Checked in: {new Date(current.data.checkedInAt).toLocaleString()}</p>}
              {!staff && <p className="mt-4 text-sm">An authorized reviewer must scan this pass to record attendance.{!user && <> <Link className="underline" to="/login" state={{ from: pathname + hash }}>Staff sign in</Link></>}</p>}
            </div>
          )}
        </section>
      </main>
    </PublicPageShell>
  );
}
