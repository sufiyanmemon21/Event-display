import { isExpo } from "@/hooks/useExpos";
import EllipseLoader from "@/components/EllipseLoader";
import { useConfirmation } from "@/hooks/useConfirmation";
import { PageHeading } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import useLiveRefresh from '@/hooks/useLiveRefresh';
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
export default function FloorPlan() {
  const confirm = useConfirmation();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [booths, setBooths] = useState([]);
  const [layout, setLayout] = useState(null);
  const [savedLayout, setSavedLayout] = useState("");
  const [selectedBoothId, setSelectedBoothId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eventError, setEventError] = useState("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [eventRetry, setEventRetry] = useState(0);
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const busy = loading || saving;
  const dirty = Boolean(layout) && JSON.stringify(layout) !== savedLayout;
  const selectedEvent = events.find(event => event._id === eventId);
  const organizerId = selectedEvent?.organizer?._id || selectedEvent?.organizer;
  const canEdit = Boolean(selectedEvent) && (role === "admin" || role === "organizer" && organizerId === userId);
  useEffect(() => {
    const controller = new AbortController();
    async function loadEvents() {
      setLoadingEvents(true);
      setEventError("");
      try {
        const response = await API.get("/events/all", {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setEvents(response.data.events.filter(isExpo));
        }
      } catch {
        if (!controller.signal.aborted) {
          setEventError("Unable to load expos.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingEvents(false);
      }
    }
    loadEvents();
    return () => controller.abort();
  }, [eventRetry]);
  async function changeEvent(event) {
    const id = event.target.value;
    if (id === eventId || busy) return;
    if (dirty && !(await confirm("Discard unsaved floor plan changes?"))) {
      return;
    }
    setEventId(id);
    setLayout(null);
    setSavedLayout("");
    setBooths([]);
    setSelectedBoothId("");
    setError("");
    setConflict(false);
    if (id) void loadFloorPlan(id, { switching: true });
  }
  async function loadFloorPlan(id = eventId, { switching = false } = {}) {
    if (!id || busy) return;
    if (!switching && dirty && !(await confirm("Reload and discard unsaved floor plan changes?"))) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [layoutResponse, boothResponse] = await Promise.all([API.get(`/booths/layout/${id}`), API.get(`/booths/event/${id}`)]);
      const nextLayout = layoutResponse.data.layout;
      setLayout(nextLayout);
      setSavedLayout(JSON.stringify(nextLayout));
      setBooths(boothResponse.data.booths);
      setSelectedBoothId("");
      setConflict(false);
    } catch (err) {
      setLayout(null);
      setError(err.response?.data?.msg || "Unable to load floor plan.");
    } finally {
      setLoading(false);
    }
  }
  useLiveRefresh(() => {
    if (!busy && !dirty && layout) void loadFloorPlan();
  });
  function resizeGrid(field, value) {
    const size = Number(value);
    if (!Number.isInteger(size) || size < 1 || size > 20) return;
    const outsideGrid = layout.placements.some(item => field === "rows" ? item.row > size : item.column > size);
    if (outsideGrid) {
      toast.error("Move or remove booths outside the smaller grid first.");
      return;
    }
    setLayout(previous => ({
      ...previous,
      [field]: size
    }));
  }
  function placeBooth(row, column) {
    if (!canEdit || busy || conflict) return;
    if (!selectedBoothId) {
      toast.info("Select a booth first.");
      return;
    }
    const occupied = layout.placements.find(item => item.row === row && item.column === column);
    if (occupied && occupied.booth !== selectedBoothId) {
      toast.error("This cell already contains another booth.");
      return;
    }
    setLayout(previous => ({
      ...previous,
      placements: [...previous.placements.filter(item => item.booth !== selectedBoothId), {
        booth: selectedBoothId,
        row,
        column
      }]
    }));
  }
  function removeSelectedBooth() {
    setLayout(previous => ({
      ...previous,
      placements: previous.placements.filter(item => item.booth !== selectedBoothId)
    }));
  }
  async function saveFloorPlan() {
    if (!canEdit || busy || !dirty || conflict) return;
    setSaving(true);
    setError("");
    try {
      const response = await API.put(`/booths/layout/${eventId}`, layout);
      setLayout(response.data.layout);
      setSavedLayout(JSON.stringify(response.data.layout));
      toast.success(response.data.msg);
    } catch (err) {
      const message = err.response?.data?.msg || "Unable to save floor plan.";
      if (err.response?.status === 409) setConflict(true);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }
  const boothMap = new Map(booths.map(booth => [booth._id, booth]));
  const cellMap = new Map((layout?.placements || []).map(item => [`${item.row}:${item.column}`, item]));
  const placedIds = new Set((layout?.placements || []).map(item => item.booth));
  const unplacedBooths = booths.filter(booth => !placedIds.has(booth._id));
  return <div className="w-full space-y-6">
      <PageHeading title="Floor plan studio" description="Arrange your expo space and locate exhibitors." />

      <Card className="workspace-event-scope">
        <CardHeader>
          <CardTitle>Select an Expo</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {eventError ? <>
              <p role="alert">{eventError}</p>
              <Button variant="outline" onClick={() => setEventRetry(previous => previous + 1)}>
                Try Again
              </Button>
            </> : <>
              <Label htmlFor="floor-plan-event">Expo</Label>
              <WorkspaceSelect id="floor-plan-event" value={eventId} onChange={changeEvent} disabled={loadingEvents || busy} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">
                  Select an Expo
                </option>
                {events.map(event => <option key={event._id} value={event._id}>
                    {event.title}
                  </option>)}
              </WorkspaceSelect>
              {loadingEvents && <EllipseLoader inline label="Loading expos" />}
              {!loadingEvents && events.length === 0 && <p className="text-sm text-muted-foreground">No expos are available yet.</p>}

              <Button onClick={() => loadFloorPlan()} disabled={!eventId || loadingEvents || busy}>
                {loading ? <EllipseLoader inline /> : "Load / Reload Floor Plan"}
              </Button>
            </>}
        </CardContent>
      </Card>

      {error && <p role="alert" className="text-destructive">
          {error}
        </p>}

      {layout && !loading && <div className={canEdit ? "workspace-floor-studio" : "min-w-0"}>
          {canEdit && <Card className="workspace-floor-controls">
              <CardHeader>
                <CardTitle>Layout controls</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <fieldset disabled={busy || conflict} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="layout-rows">Rows</Label>
                      <Input id="layout-rows" type="number" min={1} max={20} value={layout.rows} onChange={event => resizeGrid("rows", event.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="layout-columns">Columns</Label>
                      <Input id="layout-columns" type="number" min={1} max={20} value={layout.columns} onChange={event => resizeGrid("columns", event.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="layout-booth">Booth to Place or Move</Label>
                    <WorkspaceSelect id="layout-booth" value={selectedBoothId} onChange={event => setSelectedBoothId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select a booth</option>
                      {booths.map(booth => <option key={booth._id} value={booth._id}>
                          {booth.boothNumber}
                          {placedIds.has(booth._id) ? " — Placed" : ""}
                        </option>)}
                    </WorkspaceSelect>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Select a booth, then click an empty cell. To move it,
                    click another empty cell. Removing it from the plan
                    does not delete the booth or cancel its reservation.
                  </p>

                  <div className="workspace-floor-actions">
                    <Button variant="outline" onClick={removeSelectedBooth} disabled={!placedIds.has(selectedBoothId)}>
                      Remove Selected Booth from Plan
                    </Button>

                    <Button onClick={saveFloorPlan} disabled={!dirty}>
                      {saving ? "Saving..." : "Save Floor Plan"}
                    </Button>

                    <Button variant="outline" disabled={!dirty} onClick={() => setLayout(JSON.parse(savedLayout))}>
                      Discard Changes
                    </Button>
                  </div>
                </fieldset>

                {dirty && <p className="text-sm" role="status">
                    Unsaved layout changes.
                  </p>}

                {conflict && <p className="text-sm text-destructive">
                    Reload the latest floor plan before editing again.
                  </p>}
              </CardContent>
            </Card>}

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>{selectedEvent?.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Green: Available · Red: Reserved · Empty: No booth placed
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {layout.revision === 0 && <p className="text-sm text-muted-foreground">
                  No saved floor plan yet.
                </p>}

              <div className="workspace-floor-canvas overflow-x-auto rounded-lg border p-3 sm:p-4">
                <div className="grid gap-2" style={{
              gridTemplateColumns: `repeat(${layout.columns}, 90px)`
            }}>
                  {Array.from({
                length: layout.rows * layout.columns
              }, (_, index) => {
                const row = Math.floor(index / layout.columns) + 1;
                const column = index % layout.columns + 1;
                const placement = cellMap.get(`${row}:${column}`);
                const booth = boothMap.get(placement?.booth);
                const available = booth?.status === "Available";
                return <Button variant="outline" key={`${row}:${column}`} type="button" disabled={!canEdit || busy || conflict} onClick={() => placeBooth(row, column)} aria-label={`Row ${row}, column ${column}: ${booth ? `Booth ${booth.boothNumber}, ${booth.status}` : placement ? "Unavailable booth" : "Empty"}`} title={booth?.reservedBy?.companyName || `Row ${row}, column ${column}`} className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-md border p-2 text-center text-xs ${booth ? available ? "border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200" : "border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200" : "border-dashed bg-muted/40"} ${booth && booth._id === selectedBoothId ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                          <span className="break-all font-semibold">
                            {booth?.boothNumber || (placement ? "Unavailable" : `${row}, ${column}`)}
                          </span>
                          {booth && <span>{booth.status}</span>}
                        </Button>;
              })}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Booths not placed:{" "}
                {unplacedBooths.length ? unplacedBooths.map(booth => booth.boothNumber).join(", ") : "None"}
              </p>
            </CardContent>
          </Card>
        </div>}
    </div>;
}
