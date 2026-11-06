import { useEffect, useState } from "react";
import { PageHeading } from "@/components/workspace";
import { IntegrationNotice } from "@/components/integration-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useWebsiteLogo, { saveWebsiteLogo } from "@/hooks/useWebsiteLogo";
import useWebsiteBanner, { readWebsiteBanner, saveWebsiteBanner } from "@/hooks/useWebsiteBanner";
const sections = [{
  id: "general",
  name: "General",
  description: "Identity and brand assets",
  fields: [["websiteName", "Website name"], ["tagline", "Tagline"], ["websiteLogo", "Website logo", "logo"], ["favicon", "Browser tab icon (Favicon)", "file"]]
}, {
  id: "banner",
  name: "Main banner",
  description: "Homepage banner content",
  fields: [["bannerTitle", "Banner title"], ["bannerDescription", "Banner description", "textarea"], ["bannerButton", "Button text"], ["bannerImage", "Banner image", "file"]]
}, {
  id: "about",
  name: "About section",
  description: "Your public introduction",
  fields: [["aboutTitle", "About title"], ["aboutDescription", "About description", "textarea"], ["aboutImage", "About image", "file"]]
}, {
  id: "contact",
  name: "Contact information",
  description: "Public contact information",
  fields: [["contactEmail", "Email", "email"], ["contactPhone", "Phone", "tel"], ["address", "Address", "textarea"], ["officeHours", "Office hours"]]
}, {
  id: "social",
  name: "Social links",
  description: "Social media destinations",
  fields: [["facebook", "Facebook", "url"], ["instagram", "Instagram", "url"], ["linkedin", "LinkedIn", "url"], ["youtube", "YouTube", "url"], ["twitter", "X / Twitter", "url"]]
}, {
  id: "footer",
  name: "Footer",
  description: "Footer copy and legal notice",
  fields: [["footerDescription", "Footer description", "textarea"], ["copyright", "Copyright text"]]
}];
function AssetField({
  id,
  label,
  currentImage,
  onFileChange
}) {
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (selection) URL.revokeObjectURL(selection.url);
  }, [selection]);

  function choose(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (onFileChange && (!/^image\/(png|jpeg|webp|avif)$/.test(file.type) || file.size > 1024 * 1024)) {
      setError("Choose a PNG, JPEG, WebP, or AVIF image up to 1 MB.");
      return;
    }
    if (!file.type.startsWith("image/") && !(id === "setting-favicon" && /\.ico$/i.test(file.name))) {
      setError("Choose an image file to preview.");
      return;
    }
    setError("");
    setSelection({ name: file.name, url: URL.createObjectURL(file) });
    onFileChange?.(file);
  }
  return <div className="col-span-full space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type="file" accept={onFileChange ? "image/png,image/jpeg,image/webp,image/avif" : id === "setting-favicon" ? "image/*,.ico" : "image/*"} onChange={choose} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {selection && <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/40 p-3">
      <img src={selection.url} alt={`${label} preview`} className="max-h-32 max-w-full rounded-md border object-contain" />
      <div className="min-w-0 flex-1">
        <p className="break-all text-sm font-medium">{selection.name}</p>
        <p className="text-xs text-muted-foreground">Unsaved preview</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => { setSelection(null); onFileChange?.(null); }}>Remove preview</Button>
    </div>}
    {!selection && currentImage && <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">Current banner image</p>
      <img src={currentImage} alt="Current banner" className="max-h-36 max-w-full rounded-md object-contain" />
    </div>}
  </div>;
}
function WebsiteLogoField() {
  const logo = useWebsiteLogo();
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function choose(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setPreview("");
    if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type) || file.size > 1024 * 1024) {
      setNotice("Choose a PNG, JPEG, WebP, or AVIF image up to 1 MB.");
      return;
    }

    setLoading(true);
    setNotice("");
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setLoading(false);
    };
    reader.onerror = () => {
      setNotice("The image could not be read.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  function save(value) {
    try {
      saveWebsiteLogo(value);
      setPreview("");
      setNotice(value ? "Logo saved. It now appears on the public site in this browser." : "Default website logo restored.");
    } catch {
      setNotice("The browser could not save the logo. Check your storage settings.");
    }
  }

  return <div className="col-span-full space-y-3">
    <Label htmlFor="website-logo">Public website logo</Label>
    <p className="text-sm text-muted-foreground" id="website-logo-help">Choose a symbol and click Save logo to update the navbar and footer in this browser. PNG, JPEG, WebP, or AVIF up to 1 MB.</p>
    <Input id="website-logo" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-describedby="website-logo-help" disabled={loading} onChange={choose} />
    {(preview || logo) && <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{preview ? "New logo preview" : "Current logo"}</p>
      <img src={preview || logo} alt={preview ? "New logo preview" : "Current website logo"} className="max-h-24 max-w-full rounded border object-contain" />
    </div>}
    <div className="flex flex-wrap gap-2">
      <Button type="button" disabled={!preview || loading} onClick={() => save(preview)}>Save logo</Button>
      {logo && <Button type="button" variant="outline" disabled={loading} onClick={() => save("")}>Restore default logo</Button>}
    </div>
    {notice && <p role="status" className="text-sm">{notice}</p>}
  </div>;
}

export default function WebsiteSettings() {
  const savedBanner = useWebsiteBanner();
  const [values, setValues] = useState(readWebsiteBanner);
  const [revision, setRevision] = useState(0);
  const [bannerRevision, setBannerRevision] = useState(0);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerNotice, setBannerNotice] = useState("");

  function clearPreviews() {
    setValues(readWebsiteBanner());
    setBannerFile(null);
    setBannerNotice("");
    setRevision(value => value + 1);
  }

  async function saveBanner() {
    if (bannerSaving) return;
    setBannerSaving(true);
    setBannerNotice("");
    try {
      const bannerImage = bannerFile ? await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(bannerFile);
      }) : savedBanner.bannerImage || "";
      saveWebsiteBanner({
        bannerTitle: values.bannerTitle?.trim() || "",
        bannerDescription: values.bannerDescription?.trim() || "",
        bannerButton: values.bannerButton?.trim() || "",
        bannerImage,
      });
      setBannerFile(null);
      setBannerRevision(value => value + 1);
      setBannerNotice("Banner saved. Open the homepage to see it in this browser.");
    } catch {
      setBannerNotice("Unable to save the banner. Check browser storage or try a smaller image.");
    } finally {
      setBannerSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <PageHeading title="Website settings" description="Manage your public website branding, content, and contact information." />
      <IntegrationNotice title="Website previews">
        The logo and main banner can be saved in this browser. Other settings are previews.
      </IntegrationNotice>

      <form onSubmit={event => event.preventDefault()} className="space-y-5">
        {sections.map(section => (
          <Card key={section.id} aria-labelledby={`settings-${section.id}-title`} className="gap-4 border py-5 [--card-spacing:1rem] sm:[--card-spacing:1.5rem]">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle id={`settings-${section.id}-title`} className="text-xl">{section.name}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <fieldset key={revision} disabled={section.id === "banner" && bannerSaving} aria-labelledby={`settings-${section.id}-title`} className="grid min-w-0 gap-4 sm:grid-cols-2">
                {section.fields.map(([name, label, type = "text"]) => {
                  const id = `setting-${name}`;
                  if (type === "logo") return <WebsiteLogoField key={name} />;
                  if (name === "bannerImage") return <AssetField key={`${name}-${bannerRevision}`} id={id} label={label} currentImage={savedBanner.bannerImage} onFileChange={setBannerFile} />;
                  if (type === "file") return <AssetField key={name} id={id} label={label} />;

                  const multiline = type === "textarea";
                  const fullWidth = multiline || ["banner", "about", "footer"].includes(section.id) || name === "officeHours";
                  const props = {
                    id,
                    value: values[name] || "",
                    onChange: event => {
                      const value = event.target.value;
                      setValues(previous => ({ ...previous, [name]: value }));
                    },
                  };

                  return (
                    <div key={name} className={fullWidth ? "col-span-full min-w-0 space-y-2" : "min-w-0 space-y-2"}>
                      <Label htmlFor={id}>{label}</Label>
                      {multiline ? <Textarea {...props} rows={name === "address" ? 2 : 4} /> : <Input {...props} type={type} />}
                    </div>
                  );
                })}
              </fieldset>
              {section.id === "banner" && <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
                <Button type="button" disabled={bannerSaving} onClick={saveBanner}>{bannerSaving ? "Saving…" : "Save banner"}</Button>
                {bannerNotice && <p role="status" className="text-sm text-muted-foreground">{bannerNotice}</p>}
              </div>}
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Clearing previews keeps your saved logo and banner.</p>
          <Button type="button" variant="outline" disabled={bannerSaving} onClick={clearPreviews}>Clear unsaved previews</Button>
        </div>
      </form>
    </div>
  );
}
