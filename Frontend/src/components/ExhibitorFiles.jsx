import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
async function getErrorMessage(error, fallback) {
  let data = error.response?.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      return fallback;
    }
  }
  return data?.msg || data?.error || fallback;
}
function LogoPreview({
  exhibitorId
}) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const logo = { url: "" };
    async function loadLogo() {
      try {
        const response = await API.get(`/exhibitor-files/${exhibitorId}/private-logo`, {
          responseType: "blob",
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        logo.url = URL.createObjectURL(response.data);
        setUrl(logo.url);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    loadLogo();
    return () => {
      controller.abort();
      if (logo.url) {
        URL.revokeObjectURL(logo.url);
      }
    };
  }, [exhibitorId]);
  if (failed) {
    return <p className="text-sm text-muted-foreground">
        Logo preview unavailable. Try Refresh Files.
      </p>;
  }
  if (!url) {
    return <p className="text-sm" role="status">
        Loading logo...
      </p>;
  }
  return <img src={url} alt="Company logo" className="h-24 w-24 rounded-md border object-contain p-2" />;
}
function CompanyFiles({
  exhibitorId,
  canUpload
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function loadFiles() {
      try {
        const response = await API.get(`/exhibitor-files/${exhibitorId}`, {
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        setFiles(response.data.files);
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = await getErrorMessage(err, "Unable to load company files.");
        if (!controller.signal.aborted) {
          setError(message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadFiles();
    return () => controller.abort();
  }, [exhibitorId, refresh]);
  function refreshFiles() {
    setLoading(true);
    setError("");
    setRefresh(previous => previous + 1);
  }
  async function handleUpload(event, kind) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file || busy || loading || error || !canUpload) return;
    const limit = kind === "logo" ? 2 : 5;
    const allowedTypes = kind === "logo" ? ["image/jpeg", "image/png"] : ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(kind === "logo" ? "Please select a JPG or PNG image." : "Please select a PDF document.");
      return;
    }
    if (file.size > limit * 1024 * 1024) {
      toast.error(`File must be ${limit} MB or smaller.`);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setBusy(kind);
    try {
      await API.post(`/exhibitor-files/${exhibitorId}/${kind}`, formData, {
        headers: {
          "Content-Type": undefined
        },
        timeout: 60000
      });
      toast.success(kind === "logo" ? "Company logo uploaded." : "Document uploaded.");
      refreshFiles();
    } catch (err) {
      toast.error(await getErrorMessage(err, "Unable to upload file."));
    } finally {
      setBusy("");
    }
  }
  async function handleDownload() {
    if (busy || loading || error) return;
    setBusy("download");
    try {
      const response = await API.get(`/exhibitor-files/${exhibitorId}/document`, {
        responseType: "blob",
        timeout: 60000
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "application-document.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error(await getErrorMessage(err, "Unable to download document."));
    } finally {
      setBusy("");
    }
  }
  const hasLogo = files.some(file => file.kind === "logo");
  const hasDocument = files.some(file => file.kind === "document");
  return <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">Company Files</h3>

        <Button type="button" variant="outline" onClick={refreshFiles} disabled={loading || Boolean(busy)}>
          Refresh Files
        </Button>
      </div>

      {loading ? <p className="text-sm" role="status">
          Loading files...
        </p> : error ? <p className="text-sm text-destructive" role="alert">
          {error}
        </p> : <>
          {hasLogo ? <LogoPreview exhibitorId={exhibitorId} /> : <p className="text-sm text-muted-foreground">
              No company logo uploaded.
            </p>}

          {hasDocument ? <Button type="button" variant="outline" onClick={handleDownload} disabled={Boolean(busy)}>
              {busy === "download" ? "Downloading..." : "Download PDF"}
            </Button> : <p className="text-sm text-muted-foreground">
              No PDF document uploaded.
            </p>}
        </>}

      {canUpload && <fieldset disabled={loading || Boolean(busy) || Boolean(error)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`logo-${exhibitorId}`} className="block text-sm font-medium">
              Company Logo — JPG or PNG, maximum 2 MB
            </Label>

            <Input id={`logo-${exhibitorId}`} type="file" accept="image/jpeg,image/png" onChange={event => handleUpload(event, "logo")} className="block w-full text-sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`document-${exhibitorId}`} className="block text-sm font-medium">
              Application Document — PDF, maximum 5 MB
            </Label>

            <Input id={`document-${exhibitorId}`} type="file" accept="application/pdf" onChange={event => handleUpload(event, "document")} className="block w-full text-sm" />
          </div>

          <p className="text-sm text-muted-foreground">
            Selecting a file uploads it immediately and replaces the
            previous file of the same type. Approved company logos
            can appear publicly. Documents are available to you and
            authorized organizers or administrators.
          </p>
        </fieldset>}

      {(busy === "logo" || busy === "document") && <p className="text-sm" role="status">
          Uploading file...
        </p>}
    </div>;
}
export default function ExhibitorFiles({
  exhibitorId,
  canUpload = false
}) {
  return <CompanyFiles key={exhibitorId} exhibitorId={exhibitorId} canUpload={canUpload} />;
}
