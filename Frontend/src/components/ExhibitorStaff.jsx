import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
export default function ExhibitorStaff({
  exhibitorId,
  canEdit
}) {
  const [staff, setStaff] = useState([]);
  const [savedStaff, setSavedStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const dirty = JSON.stringify(staff) !== JSON.stringify(savedStaff);
  useEffect(() => {
    const controller = new AbortController();
    async function loadStaff() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get(`/exhibitors/staff/${exhibitorId}`, {
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        setStaff(response.data.staff);
        setSavedStaff(response.data.staff);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to load staff.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadStaff();
    return () => controller.abort();
  }, [exhibitorId, refresh]);
  function changeMember(index, field, value) {
    setStaff(previous => previous.map((member, position) => position === index ? {
      ...member,
      [field]: value
    } : member));
  }
  function removeMember(index) {
    setStaff(previous => previous.filter((_, position) => position !== index));
  }
  async function handleSave(event) {
    event.preventDefault();
    if (!canEdit || loading || saving || !dirty) return;
    const members = staff.map(member => ({
      name: member.name.trim(),
      duty: member.duty.trim()
    }));
    if (members.some(member => !member.name || !member.duty)) {
      toast.error("Enter a name and duty for each staff member.");
      return;
    }
    setSaving(true);
    try {
      const response = await API.put(`/exhibitors/staff/${exhibitorId}`, {
        staff: members
      });
      setStaff(response.data.staff);
      setSavedStaff(response.data.staff);
      toast.success(response.data.msg);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to save staff.");
    } finally {
      setSaving(false);
    }
  }
  return <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">Event Staff</h3>

        <Button type="button" variant="outline" disabled={loading || saving || dirty} onClick={() => setRefresh(previous => previous + 1)}>
          Refresh Staff
        </Button>
      </div>

      {loading ? <EllipsisLoader label="Loading staff" /> : error ? <p className="text-sm text-destructive" role="alert">
          {error}
        </p> : canEdit ? <form onSubmit={handleSave} className="space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            {staff.length === 0 && <p className="text-sm text-muted-foreground">
                No staff members added.
              </p>}

            {staff.map((member, index) => <div key={index} className="space-y-4 rounded-xl border bg-card p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`staff-name-${exhibitorId}-${index}`}>
                      Staff Name
                    </Label>
                    <Input id={`staff-name-${exhibitorId}-${index}`} value={member.name} onChange={event => changeMember(index, "name", event.target.value)} maxLength={80} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`staff-duty-${exhibitorId}-${index}`}>
                      Duty
                    </Label>
                    <Input id={`staff-duty-${exhibitorId}-${index}`} value={member.duty} onChange={event => changeMember(index, "duty", event.target.value)} placeholder="Reception, Sales, Booth Setup..." maxLength={100} required />
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={() => removeMember(index)}>
                  Remove Member {index + 1}
                </Button>
              </div>)}

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" disabled={staff.length >= 20} onClick={() => setStaff(previous => [...previous, {
            name: "",
            duty: ""
          }])}>
                Add Staff
              </Button>

              <Button type="submit" disabled={!dirty}>
                {saving ? "Saving..." : "Save Staff"}
              </Button>

              {dirty && <Button type="button" variant="outline" onClick={() => setStaff(savedStaff)}>
                  Discard Changes
                </Button>}
            </div>
          </fieldset>

          <p className="text-sm text-muted-foreground">
            Up to 20 members. Additions, edits and removals take
            effect after Save Staff.
          </p>

          {dirty && <p className="text-sm" role="status">
              You have unsaved staff changes.
            </p>}
        </form> : staff.length === 0 ? <p className="text-sm text-muted-foreground">
          No staff members added.
        </p> : <ul className="divide-y">
          {staff.map((member, index) => <li key={index} className="space-y-1 py-3">
              <p className="break-words font-medium">{member.name}</p>
              <p className="break-words text-sm text-muted-foreground">
                {member.duty}
              </p>
            </li>)}
        </ul>}
    </div>;
}
