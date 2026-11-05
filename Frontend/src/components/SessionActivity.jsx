import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

function SessionActivityPanel({ session }) {
  const [now, setNow] = useState(() => Date.now());
  const [activity, setActivity] = useState({
    registered: false,
    bookmarked: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const startTime = new Date(session.startTime).getTime();
  const hasStarted = !Number.isFinite(startTime) || now >= startTime;

  useEffect(() => {
    if (!Number.isFinite(startTime)) return;

    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);

      if (timestamp >= startTime) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        const response = await API.get(
          `/sessions/${session._id}/activity`,
          { signal: controller.signal }
        );

        if (!controller.signal.aborted) {
          setActivity(response.data.activity);
          setError("");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.msg ||
              "Unable to load your session registration."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => controller.abort();
  }, [session._id, retry]);

  async function handleAction(action) {
    if (saving || loading || error) return;

    const enabled =
      action === "register"
        ? !activity.registered
        : !activity.bookmarked;

    setSaving(true);

    try {
      const response = await API.put(
        `/sessions/${session._id}/activity`,
        { action, enabled }
      );

      setActivity(response.data.activity);
      toast.success(response.data.msg);
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Unable to update session."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading your session details...
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm" role="alert">
          {error}
        </p>

        <Button
          variant="outline"
          onClick={() => {
            setLoading(true);
            setError("");
            setRetry((value) => value + 1);
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={activity.registered ? "outline" : "default"}
          onClick={() => handleAction("register")}
          disabled={saving || (hasStarted && !activity.registered)}
        >
          {activity.registered
            ? "Cancel Registration"
            : hasStarted
              ? "Registration Closed"
              : "Register for Session"}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleAction("bookmark")}
          disabled={saving}
        >
          {activity.bookmarked ? "Remove Bookmark" : "Bookmark"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground" role="status">
        {saving
          ? "Saving..."
          : `Registration: ${
              activity.registered ? "Registered" : "Not registered"
            } | Bookmark: ${
              activity.bookmarked ? "Saved" : "Not saved"
            }`}
      </p>
    </div>
  );
}

export default function SessionActivity({ session }) {
  return (
    <SessionActivityPanel
      key={session._id}
      session={session}
    />
  );
}