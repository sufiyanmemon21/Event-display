import { useConfirmation } from "@/hooks/useConfirmation";
import { PageHeading } from "@/components/workspace";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSelect from "@/components/workspace-select";
import { useEffect, useRef, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
function mergeMessages(previous, incoming) {
  const messages = new Map();
  for (const message of [...previous, ...incoming]) {
    messages.set(message._id, message);
  }
  return [...messages.values()].sort((first, second) => first._id.localeCompare(second._id));
}
function Conversation({
  thread,
  userId,
  onSent,
  sending,
  setSending,
  compact
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [before, setBefore] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const firstPageLoaded = useRef(false);
  const path = `/messages/thread/${thread.eventId}/${thread.participantId}`;
  useEffect(() => {
    const controller = new AbortController();
    const poll = { timer: undefined, stopped: false };
    async function loadMessages() {
      try {
        const response = await API.get(path, {
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        setMessages(previous => mergeMessages(previous, response.data.messages));
        if (!firstPageLoaded.current) {
          setBefore(response.data.nextBefore);
          firstPageLoaded.current = true;
        }
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.msg || "Unable to refresh messages. Trying again shortly.");
        if ([401, 403, 404].includes(err.response?.status)) {
          poll.stopped = true;
          setMessages([]);
          setBefore(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          if (!poll.stopped) {
            poll.timer = window.setTimeout(loadMessages, 10000);
          }
        }
      }
    }
    loadMessages();
    return () => {
      controller.abort();
      window.clearTimeout(poll.timer);
    };
  }, [path, refresh]);
  async function loadOlder() {
    if (!before || loadingOlder || loading || sending || error) return;
    setLoadingOlder(true);
    try {
      const response = await API.get(path, {
        params: {
          before
        }
      });
      setMessages(previous => mergeMessages(previous, response.data.messages));
      setBefore(response.data.nextBefore);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  }
  async function handleSend(event) {
    event.preventDefault();
    if (!text.trim() || sending || loading || error) return;
    setSending(true);
    try {
      const response = await API.post(path, {
        text: text.trim()
      });
      setMessages(previous => mergeMessages(previous, [response.data.message]));
      setText("");
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Message could not be confirmed. Check the conversation before sending again.");
    } finally {
      setSending(false);
    }
  }
  return <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="break-words">
              {thread.title}
            </CardTitle>
            <p className="break-words text-sm text-muted-foreground">
              {thread.person}
            </p>
          </div>

          <Button variant="outline" disabled={loading || sending || loadingOlder} onClick={() => setRefresh(previous => previous + 1)}>
            Refresh Messages
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <p role="alert" className="text-sm text-destructive">
            {error}
          </p>}

        {loading ? <p role="status">Loading messages...</p> : <>
            {before && <Button variant="outline" onClick={loadOlder} disabled={loadingOlder || sending || Boolean(error)}>
                {loadingOlder ? "Loading..." : "Load Older Messages"}
              </Button>}

            <div className={`${compact ? "max-h-64" : "max-h-[450px]"} space-y-3 overflow-y-auto rounded-md border p-3`}>
              {messages.length === 0 ? <p className="text-sm text-muted-foreground">
                  {error ? "Messages are currently unavailable." : "No messages yet. Send the first message below."}
                </p> : messages.map(message => {
            const mine = (message.sender?._id || message.sender) === userId;
            return <div key={message._id} className={`max-w-[90%] rounded-md border p-3 ${mine ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted"}`}>
                      <p className="text-xs font-semibold">
                        {mine ? "You" : message.sender?.name || "User"}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {message.text}
                      </p>
                      <p className="mt-2 text-xs">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>;
          })}
            </div>
          </>}

        <form onSubmit={handleSend} className="space-y-3">
          <Label htmlFor="message-text">Message</Label>
          <Textarea id="message-text" value={text} onChange={event => setText(event.target.value)} maxLength={2000} rows={3} disabled={sending || loading || Boolean(error)} placeholder="Write your message..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {text.length}/2000
            </p>
            <Button type="submit" disabled={sending || loading || Boolean(error) || !text.trim()}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>;
}
export default function Messages({ compact = false }) {
  const confirm = useConfirmation();
  const [conversations, setConversations] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const managesInbox = role === "organizer" || role === "admin";
  useEffect(() => {
    const controller = new AbortController();
    const poll = { timer: undefined, stopped: false };
    async function loadInbox() {
      try {
        const [inboxResponse, participationResponse] = await Promise.all([API.get("/messages/conversations", {
          signal: controller.signal
        }), managesInbox ? Promise.resolve(null) : API.get(role === "attendee" ? "/attendees/all" : "/exhibitors/all", {
          signal: controller.signal
        })]);
        if (controller.signal.aborted) return;
        setConversations(inboxResponse.data.conversations);
        const records = managesInbox ? [] : role === "attendee" ? participationResponse.data.attendees : participationResponse.data.exhibitors;
        const eventMap = new Map();
        for (const record of records) {
          if (record.event?._id) {
            eventMap.set(record.event._id, record.event);
          }
        }
        setEvents([...eventMap.values()]);
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.msg || "Unable to refresh inbox. Trying again shortly.");
        if ([401, 403].includes(err.response?.status)) {
          poll.stopped = true;
          setConversations([]);
          setEvents([]);
          setThread(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          if (!poll.stopped) {
            poll.timer = window.setTimeout(loadInbox, 15000);
          }
        }
      }
    }
    loadInbox();
    return () => {
      controller.abort();
      window.clearTimeout(poll.timer);
    };
  }, [role, managesInbox, refresh]);
  async function selectThread(nextThread) {
    if (sending) return;
    const sameConversation = thread?.eventId === nextThread.eventId && thread?.participantId === nextThread.participantId;
    if (thread && !sameConversation && !(await confirm("Open another conversation? Any unsent draft in this conversation will be cleared."))) {
      return;
    }
    setThread(nextThread);
  }
  function openEvent(event) {
    event.preventDefault();
    const selected = events.find(item => item._id === eventId);
    if (!selected) return;
    selectThread({
      eventId: selected._id,
      participantId: userId,
      title: selected.title,
      person: "Event Organizer"
    });
  }
  function openConversation(item) {
    selectThread({
      eventId: item.event._id,
      participantId: item.participant._id,
      title: item.event.title,
      person: managesInbox ? item.participant.name : "Event Organizer"
    });
  }
  async function backToInbox() {
    if (!sending && await confirm("Return to the inbox? Any unsent draft will be cleared.")) setThread(null);
  }
  return <div className={compact ? "w-full space-y-3" : "w-full space-y-6"}>
      {compact && thread && <Button type="button" variant="outline" size="sm" disabled={sending} onClick={backToInbox}>Back to inbox</Button>}
      {(!compact || !thread) && (
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!compact && (
        <div className="space-y-1">
          <PageHeading title="Messages" description="Keep event conversations together in one place." />
          <p className="text-sm text-muted-foreground">
            Messages update automatically while this page is open.
          </p>
        </div>
        )}

        <Button variant="outline" disabled={loading || sending} onClick={() => setRefresh(previous => previous + 1)}>
          Refresh Inbox
        </Button>
      </div>
      )}

      {error && <p role="alert" className="text-sm text-destructive">
          {error}
        </p>}

      {!managesInbox && (!compact || !thread) && <Card>
          <CardHeader>
            <CardTitle>Contact Event Organizer</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={openEvent} className="space-y-3">
              <Label htmlFor="message-event">Your Event</Label>
              <WorkspaceSelect id="message-event" value={eventId} onChange={event => setEventId(event.target.value)} disabled={loading || sending || Boolean(error)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                <option value="">Select an event</option>
                {events.map(event => <option key={event._id} value={event._id}>
                    {event.title}
                  </option>)}
              </WorkspaceSelect>

              <Button type="submit" disabled={!eventId || loading || sending || Boolean(error)}>
                Open Conversation
              </Button>

              {!loading && !error && events.length === 0 && <p className="text-sm text-muted-foreground">
                  Register for an event or submit an exhibitor application
                  before contacting its organizer.
                </p>}
            </form>
          </CardContent>
        </Card>}

      <div className={compact ? "grid gap-3" : "grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"}>
        {(!compact || !thread) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {loading ? <p role="status">Loading inbox...</p> : conversations.length === 0 ? <p className="text-sm text-muted-foreground">
                {error ? "Inbox is currently unavailable." : managesInbox ? "Participant messages will appear here." : "No conversations yet."}
              </p> : conversations.map(item => {
            const active = thread?.eventId === item.event._id && thread?.participantId === item.participant._id;
            return <Button variant="ghost" key={`${item.event._id}-${item.participant._id}`} type="button" disabled={sending} onClick={() => openConversation(item)} aria-pressed={active} className={`h-auto w-full flex-col items-start space-y-1 rounded-xl border p-4 text-left disabled:opacity-50 ${active ? "bg-muted" : "hover:bg-muted"}`}>
                    <p className="break-words text-sm font-semibold">
                      {item.event.title}
                    </p>
                    <p className="break-words text-sm">
                      {managesInbox ? item.participant.name : "Organizer"}
                    </p>
                    <p className="line-clamp-2 break-words text-xs text-muted-foreground">
                      {item.lastMessage}
                    </p>
                  </Button>;
          })}
          </CardContent>
        </Card>
        )}

        {thread ? <Conversation key={`${thread.eventId}-${thread.participantId}`} thread={thread} userId={userId} sending={sending} setSending={setSending} compact={compact} onSent={() => setRefresh(previous => previous + 1)} /> : !compact && <p className="grid min-h-[480px] place-content-center rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            Open a conversation to view or send messages.
          </p>}
      </div>
    </div>;
}
