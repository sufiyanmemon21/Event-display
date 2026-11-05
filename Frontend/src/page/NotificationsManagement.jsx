import { RecordBrowser } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/workspace";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const request = { running: false };
    async function loadNotifications() {
      if (request.running || controller.signal.aborted) return;
      request.running = true;
      try {
        const response = await API.get("/notifications/mine", {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount);
          setError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.response?.data?.msg || "Unable to load notifications.");
        }
      } finally {
        request.running = false;
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [reload]);
  function refreshNotifications() {
    setLoading(true);
    setReload(value => value + 1);
  }
  async function markAsRead(id) {
    if (savingId) return;
    setSavingId(id);
    try {
      await API.patch(`/notifications/${id}/read`);
      refreshNotifications();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to update notification.");
    } finally {
      setSavingId("");
    }
  }
  async function markAllAsRead() {
    if (savingId) return;
    setSavingId("all");
    try {
      await API.patch("/notifications/read-all");
      refreshNotifications();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to update notifications.");
    } finally {
      setSavingId("");
    }
  }
  return <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageHeading title="Activity inbox" description="Stay up to date with your event activity." />
          <p className="mt-1 text-sm text-muted-foreground">
            Unread: {unreadCount}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={refreshNotifications} disabled={loading || Boolean(savingId)}>
            Refresh
          </Button>

          <Button onClick={markAllAsRead} disabled={loading || Boolean(savingId) || unreadCount === 0}>
            {savingId === "all" ? "Updating..." : "Mark All as Read"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Latest 50 notifications. This page refreshes automatically
        every 30 seconds.
      </p>

      {error && <p role="alert" className="text-sm text-destructive">
          {error}
        </p>}

      {loading ? <p role="status">Loading notifications...</p> : notifications.length === 0 ? !error && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            No notifications yet.
          </p> : <RecordBrowser records={notifications.map(item => ({
      ...item,
      readStatus: item.read ? "Read" : "Unread"
    }))} label="notifications" statusKey="readStatus">{visible => <div className="space-y-4">
          {visible.map(notification => <Card key={notification._id} className={notification.read ? "opacity-75" : "border-l-4 border-l-primary"}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="break-words font-medium">
                    {notification.message}
                  </p>

                  <Badge variant={notification.read ? "outline" : "default"}>
                    {notification.read ? "Read" : "Unread"}
                  </Badge>
                </div>

                {notification.startTime && <p className="text-sm">
                    Session starts:{" "}
                    {new Date(notification.startTime).toLocaleString("en-GB")}
                  </p>}

                <p className="text-xs text-muted-foreground">
                  Received:{" "}
                  {new Date(notification.createdAt).toLocaleString("en-GB")}
                </p>

                {!notification.read && <Button variant="outline" onClick={() => markAsRead(notification._id)} disabled={Boolean(savingId)}>
                    {savingId === notification._id ? "Updating..." : "Mark as Read"}
                  </Button>}
              </CardContent>
            </Card>)}
        </div>}</RecordBrowser>}
    </div>;
}
