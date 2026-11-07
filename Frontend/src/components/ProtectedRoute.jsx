import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import API, { saveAuth } from "@/api/api";
import { Button } from "@/components/ui/button";

function readToken() {
  return localStorage.getItem("token");
}

function subscribeToAuth(callback) {
  window.addEventListener("auth-changed", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("auth-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const token = useSyncExternalStore(subscribeToAuth, readToken);
  const [retry, setRetry] = useState(0);
  const [check, setCheck] = useState({
    token: "",
    attempt: -1,
    status: "loading",
    role: "",
  });

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function checkAccount() {
      try {
        const response = await API.get("/auth/me", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const user = response.data.user;

        if (!user?._id || !user.role) {
          throw new Error("Invalid account response");
        }

        saveAuth(token, user);
        setCheck({
          token,
          attempt: retry,
          status: "success",
          role: user.role,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setCheck({
          token,
          attempt: retry,
          status:
            error.response?.status === 401
              ? "unauthorized"
              : "error",
          role: "",
        });
      }
    }

    checkAccount();

    return () => controller.abort();
  }, [token, retry]);

  const currentCheck =
    check.token === token && check.attempt === retry;

  if (
    !token ||
    (currentCheck && check.status === "unauthorized")
  ) {
    return (
      <Navigate
        to="/dashboard/login"
        replace
        state={{
          from: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  if (!currentCheck) {
    return (
      <p className="p-6 text-center" role="status">
        Loading...
      </p>
    );
  }

  if (check.status === "error") {
    return (
      <div className="space-y-4 p-6 text-center">
        <p role="alert">
          Unable to verify your account. Please try again.
        </p>

        <Button
          variant="outline"
          onClick={() => setRetry((previous) => previous + 1)}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(check.role)) {
    return (
      <div className="space-y-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Access Restricted</h1>

        <p className="text-muted-foreground">
          Your account does not have access to this page.
        </p>

        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return <Outlet />;
}