import EllipseLoader from "@/components/EllipseLoader";
import { useConfirmation } from "@/hooks/useConfirmation";
import { PageHeading } from "@/components/workspace";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
function safeWebsite(value) {
  try {
    const url = new URL(value);
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) {
      return url.href;
    }
  } catch {
    return "";
  }
  return "";
}
function CompanyLogo({
  exhibitorId,
  companyName
}) {
  const [failed, setFailed] = useState(false);
  const baseURL = API.defaults.baseURL.replace(/\/+$/, "");
  const logoURL = `${baseURL}/exhibitor-files/${exhibitorId}/logo`;
  if (failed) {
    return <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted text-xl font-semibold">
        {companyName?.trim().charAt(0).toUpperCase() || "E"}
      </div>;
  }
  return <img src={logoURL} alt={`${companyName} logo`} loading="lazy" onError={() => setFailed(true)} className="h-16 w-16 shrink-0 rounded-md border bg-white object-contain p-2" />;
}
export default function ExhibitorSearch() {
  const confirm = useConfirmation();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    category: ""
  });
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visitedIds, setVisitedIds] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [visitError, setVisitError] = useState("");
  const [savingVisitId, setSavingVisitId] = useState("");
  const [visitRefresh, setVisitRefresh] = useState(0);
  const isAttendee = localStorage.getItem("userRole") === "attendee";
  useEffect(() => {
    const controller = new AbortController();
    async function searchProfiles() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/exhibitors/search", {
          params: filters,
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setExhibitors(response.data.exhibitors);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to search exhibitors.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    searchProfiles();
    return () => controller.abort();
  }, [filters]);
  useEffect(() => {
    if (!isAttendee) return;
    const controller = new AbortController();
    async function loadVisits() {
      setLoadingVisits(true);
      setVisitError("");
      try {
        const [visitResponse, registrationResponse] = await Promise.all([API.get("/booths/visits/mine", {
          signal: controller.signal
        }), API.get("/attendees/all", {
          signal: controller.signal
        })]);
        if (controller.signal.aborted) return;
        setVisitedIds(visitResponse.data.visits.map(visit => visit.exhibitor?._id || visit.exhibitor));
        setRegisteredEventIds(registrationResponse.data.attendees.map(item => item.event?._id || item.event).filter(Boolean));
      } catch (err) {
        if (!controller.signal.aborted) {
          setVisitError(err.response?.data?.msg || "Unable to load your visit status.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingVisits(false);
      }
    }
    loadVisits();
    return () => controller.abort();
  }, [isAttendee, visitRefresh]);
  function handleSearch(event) {
    event.preventDefault();
    setFilters({
      keyword: keyword.trim(),
      category: category.trim()
    });
  }
  function clearSearch() {
    setKeyword("");
    setCategory("");
    setFilters({
      keyword: "",
      category: ""
    });
  }
  async function handleVisit(item) {
    const eventId = item.event?._id || item.event;
    if (!isAttendee || savingVisitId || loadingVisits || visitError || visitedIds.includes(item._id) || !registeredEventIds.includes(eventId) || !item.boothNumber) {
      return;
    }
    if (!(await confirm(`Confirm that you visited ${item.companyName} at booth ${item.boothNumber}?`))) {
      return;
    }
    setSavingVisitId(item._id);
    try {
      const response = await API.post("/booths/visit", {
        exhibitorId: item._id
      });
      setVisitedIds(previous => previous.includes(item._id) ? previous : [...previous, item._id]);
      toast.success(response.data.msg);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to record booth visit.");
    } finally {
      setSavingVisitId("");
    }
  }
  return <div className="w-full space-y-6">
      <PageHeading title="Discover exhibitors" description="Find companies and plan the connections that matter to you." />

      <form onSubmit={handleSearch} className="grid items-end gap-4 rounded-2xl border bg-card p-5 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exhibitor-keyword">Search</Label>
            <Input id="exhibitor-keyword" placeholder="Company, products or services..." value={keyword} onChange={event => setKeyword(event.target.value)} maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exhibitor-category">Category</Label>
            <Input id="exhibitor-category" placeholder="Catering, Technology..." value={category} onChange={event => setCategory(event.target.value)} maxLength={100} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || Boolean(savingVisitId)}>
            Search
          </Button>

          <Button type="button" variant="outline" onClick={clearSearch} disabled={loading || Boolean(savingVisitId)}>
            Clear
          </Button>
        </div>
      </form>

      {isAttendee && <div className="space-y-3 rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            After visiting an exhibitor booth, mark it as visited.
            Each exhibitor visit is recorded once for your account.
          </p>

          <Button variant="outline" disabled={loadingVisits || Boolean(savingVisitId)} onClick={() => setVisitRefresh(previous => previous + 1)}>
            {loadingVisits ? <EllipseLoader inline /> : "Refresh Visit Status"}
          </Button>

          {visitError && <p role="alert" className="text-sm text-destructive">
              {visitError}
            </p>}
        </div>}

      {loading ? <EllipseLoader label="Loading exhibitors" /> : error ? <div className="space-y-3">
          <p role="alert">{error}</p>
          <Button variant="outline" onClick={() => setFilters({
        ...filters
      })}>
            Try Again
          </Button>
        </div> : exhibitors.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">No exhibitors found.</p> : <>
          <p className="text-sm text-muted-foreground">
            Showing up to 100 approved profiles.
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {exhibitors.map(item => {
          const website = safeWebsite(item.website);
          const eventId = item.event?._id || item.event;
          const visited = visitedIds.includes(item._id);
          const registered = registeredEventIds.includes(eventId);
          return <Card key={item._id}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-4">
                      <CompanyLogo exhibitorId={item._id} companyName={item.companyName} />

                      <h2 className="min-w-0 break-words text-lg font-semibold">
                        {item.companyName}
                      </h2>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    {item.products && <p className="whitespace-pre-wrap break-words text-sm">
                        Products / Services: {item.products}
                      </p>}

                    <div className="grid gap-x-6 gap-y-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                      <p>Category: {item.category || "Not provided"}</p>
                      <p>Event: {item.event?.title || "Unavailable"}</p>
                      <p>Booth: {item.boothNumber || "Not assigned"}</p>
                      <p>Status: {item.status}</p>
                    </div>

                    {item.contactEmail && <a href={`mailto:${item.contactEmail}`} className="block break-all text-sm underline underline-offset-4">
                        {item.contactEmail}
                      </a>}

                    {item.phone && <p className="text-sm">Phone: {item.phone}</p>}

                    {website && <a href={website} target="_blank" rel="noopener noreferrer" className="block text-sm underline underline-offset-4">
                        Visit Website
                      </a>}

                    {isAttendee && <div className="space-y-2 border-t pt-3">
                        <Button variant={visited ? "outline" : "default"} onClick={() => handleVisit(item)} disabled={visited || loadingVisits || Boolean(visitError) || Boolean(savingVisitId) || !registered || !item.boothNumber}>
                          {visited ? "Visited" : savingVisitId === item._id ? "Saving..." : "Mark as Visited"}
                        </Button>

                        {!visited && !loadingVisits && !visitError && <p className="text-xs text-muted-foreground">
                            {!registered ? "Register for this event to record a visit." : !item.boothNumber ? "A booth has not been assigned yet." : "Confirm only after visiting this booth."}
                          </p>}
                      </div>}
                  </CardContent>
                </Card>;
        })}
          </div>
        </>}
    </div>;
}
