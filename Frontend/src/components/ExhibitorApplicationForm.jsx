import { useId, useState } from "react";
import API from "@/api/api";
import EllipsisLoader from "@/components/EllipsisLoader";
import WorkspaceSelect from "@/components/workspace-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

export default function ExhibitorApplicationForm({
  events,
  expo,
  disabled,
  onBusyChange,
  onSaved,
  onConflict,
}) {
  const id = useId();
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const eventId = expo?._id ?? selectedEvent;

  async function submit(event) {
    event.preventDefault();
    if (disabled || saving || !eventId) return;
    if (!companyName.trim() || !category.trim() || !description.trim()) {
      setError("Enter a company name, category and description.");
      return;
    }
    setError("");
    setSaving(true);
    onBusyChange?.(true);
    try {
      const { data } = await API.post("/exhibitors/register", {
        companyName: companyName.trim(),
        category: category.trim(),
        description: description.trim(),
        event: eventId,
      });
      toast.success(data.msg);
      await onSaved(data.exhibitor);
    } catch (requestError) {
      setError(
        requestError.response?.data?.msg || "Unable to submit application.",
      );
      if (requestError.response?.status === 409 && onConflict) {
        toast.error(
          requestError.response.data?.msg ||
            "An application already exists for this expo.",
        );
        onConflict();
      }
    } finally {
      setSaving(false);
      onBusyChange?.(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {expo && (
        <p className="text-sm text-muted-foreground">
          Apply for a booth at {expo.title}. After approval, you can reserve an
          available booth here.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <fieldset
        disabled={disabled || saving}
        className={expo ? "grid gap-4 sm:grid-cols-2" : "workspace-field-grid"}
      >
        <div className="space-y-2">
          <Label htmlFor={id + "-company-name"}>Company Name</Label>
          <Input
            id={id + "-company-name"}
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            maxLength={150}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={id + "-company-category"}>Category</Label>
          <Input
            id={id + "-company-category"}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className={expo ? "space-y-2 sm:col-span-2" : "space-y-2"}>
          <Label htmlFor={id + "-company-description"}>
            Company Description
          </Label>
          <Textarea
            id={id + "-company-description"}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>

        {!expo && (
          <div className="space-y-2">
            <Label htmlFor={id + "-application-event"}>Event</Label>
            <WorkspaceSelect
              id={id + "-application-event"}
              value={eventId}
              onChange={(event) => setSelectedEvent(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </WorkspaceSelect>
          </div>
        )}

        <Button
          type="submit"
          className={expo ? "justify-self-start sm:col-span-2" : undefined}
          disabled={!eventId}
        >
          {saving && (
            <EllipsisLoader scope="inline" label="Submitting application" />
          )}{" "}
          Submit Application
        </Button>
      </fieldset>
      {!expo && events.length === 0 && !disabled && (
        <p className="text-sm text-muted-foreground">
          No events are available yet.
        </p>
      )}
    </form>
  );
}
