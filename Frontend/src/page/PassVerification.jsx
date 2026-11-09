import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PublicPageShell from "@/components/landing/PublicPageShell";
import API from "@/api/api";

export default function PassVerification() {
  const { hash } = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    API.post(
      "/attendees/passes/verify",
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
  }, [hash]);

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
                Valid confirmed booking
              </p>
              <p>
                {current.data.title} · {current.data.ticketType}
              </p>
            </div>
          )}
        </section>
      </main>
    </PublicPageShell>
  );
}
