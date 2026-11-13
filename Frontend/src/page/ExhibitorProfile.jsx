import { ProfileSkeleton } from "@/components/LoadingSkeletons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Pencil, RefreshCw } from "lucide-react";
import API from "@/api/api";
import useAuth from "@/hooks/useAuth";
import ExhibitorProfileForm from "@/components/ExhibitorProfileForm";
import ExhibitorFiles, { LogoPreview } from "@/components/ExhibitorFiles";
import { PageHeading } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ExhibitorProfile() {
  const user = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const { data } = await API.get("/exhibitors/all", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setProfiles(data.exhibitors || []);
        setError("");
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure.response?.data?.msg || "Unable to load company profiles.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [refresh]);

  function reload() {
    setLoading(true);
    setRefresh((value) => value + 1);
  }

  const profile =
    profiles.find((item) => item._id === selectedId) || profiles[0];
  return (
    <div className="space-y-6">
      <PageHeading
        title="Profile"
        description="Manage your company details and the profiles attached to your event applications."
      >
        <Button variant="outline" disabled={loading} onClick={reload}>
          <RefreshCw size={16} /> Refresh profile
        </Button>
      </PageHeading>
      {loading && !profile && (
        <ProfileSkeleton label="Loading company profiles" />
      )}
      {!loading && error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {!loading && !error && !profile && (
        <Card>
          <CardContent className="space-y-3">
            <p>Create an exhibitor application to set up a company profile.</p>
            <Button asChild>
              <Link to="/exhibitors">Go to registration</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      {profile && (
        <Card>
          <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b border-border">
            <CardTitle className="text-xl">Company profile</CardTitle>
            <Button disabled={loading} onClick={() => setEditing(true)}>
              <Pencil size={16} /> Edit profile
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <LogoPreview
                key={`${profile._id}-${refresh}`}
                exhibitorId={profile._id}
                fallback={
                  <div className="grid size-20 shrink-0 place-items-center rounded-xl border bg-muted text-primary [.workspace-form-body_fieldset_>_p&]:py-[14px]">
                    <Building2 size={27} aria-label="No company logo" />
                  </div>
                }
              />
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold">
                  {profile.companyName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.category}
                </p>
              </div>
            </div>
            <dl className="grid gap-4 rounded-xl border bg-muted/40 p-4 sm:grid-cols-3 [.workspace-form-body_fieldset_>_p&]:py-[14px]">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                  Email
                </dt>
                <dd className="break-all">
                  {profile.contactEmail || user?.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                  Phone
                </dt>
                <dd className="break-words">{profile.phone || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                  Website
                </dt>
                <dd className="break-all">{profile.website || "—"}</dd>
              </div>
            </dl>
            <section className="space-y-3">
              <h3 className="font-serif text-xl">Event profiles</h3>
              {profiles.map((item) => (
                <article
                  key={item._id}
                  className="space-y-2 rounded-xl border bg-muted/40 p-4 [.workspace-form-body_fieldset_>_p&]:py-[14px]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="break-words font-semibold">
                      {item.event?.title || item.companyName}
                    </h4>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  {item.products && (
                    <p className="break-words text-sm">
                      <strong>Products and services</strong> · {item.products}
                    </p>
                  )}
                  {item.description && (
                    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item._id !== profile._id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedId(item._id)}
                    >
                      Select profile
                    </Button>
                  )}
                </article>
              ))}
            </section>
            <section className="space-y-3">
              <h3 className="font-serif text-xl">Company files</h3>
              <ExhibitorFiles
                key={profile._id}
                exhibitorId={profile._id}
                canUpload
              />
            </section>
          </CardContent>
        </Card>
      )}
      {profile && (
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit company profile</DialogTitle>
              <DialogDescription>
                Update the profile for{" "}
                {profile.event?.title || profile.companyName}.
              </DialogDescription>
            </DialogHeader>
            <ExhibitorProfileForm
              key={profile._id}
              profile={profile}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                reload();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
