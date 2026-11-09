import { useConfirmation } from "@/hooks/useConfirmation";
import { useEffect, useRef, useState } from "react";
import { PageHeading } from "@/components/workspace";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWebsiteLogoState, refreshWebsiteLogo, saveWebsiteLogo } from "@/hooks/useWebsiteLogo";
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
  const logo = useWebsiteLogoState();
  const confirm = useConfirmation();
  const input = useRef(null);
  const [selection, setSelection] = useState(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => () => {
    if (selection) URL.revokeObjectURL(selection.url);
  }, [selection]);
  useEffect(() => { void refreshWebsiteLogo(); }, []);
  function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type) || file.size > 1024 * 1024) {
      setNotice("Choose a PNG, JPEG, WebP, or AVIF image up to 1 MB.");
      return;
    }
    setSelection({ file, url: URL.createObjectURL(file) });
    setNotice("");
  }
  async function save(remove = false) {
    if (saving) return;
    if (remove && !(await confirm("Delete the saved website logo and restore default branding?"))) return;
    setSaving(true);
    setNotice("");
    try {
      await saveWebsiteLogo(remove ? null : selection.file);
      setSelection(null);
      setNotice(remove ? "Default branding restored." : "Logo saved for all visitors.");
    } catch (error) {
      setNotice(error.response?.data?.msg || "Unable to save the logo. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return <div className="col-span-full space-y-3">
    <Label htmlFor="website-logo-change">Website logo</Label>
    <p className="text-sm text-muted-foreground" id="website-logo-help">PNG, JPEG, WebP, or AVIF up to 1 MB. Saved logos appear across the website and dashboard.</p>
    <input ref={input} id="website-logo" className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={saving} onChange={choose} />
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{selection ? "New logo preview — not saved" : logo.loading ? "Loading saved logo…" : logo.url ? "Current saved logo" : "Default EventSphere branding"}</p>
      {(selection || logo.url) ? <img src={selection?.url || logo.url} alt="Website logo preview" className="max-h-24 max-w-full object-contain" /> : <span className="font-serif text-2xl text-primary">EventSphere</span>}
      <p className="break-all text-xs text-muted-foreground">{selection?.file.name || logo.filename}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button id="website-logo-change" type="button" variant="outline" disabled={saving || logo.loading} aria-describedby="website-logo-help" onClick={() => input.current?.click()}>Change Logo</Button>
      {selection && <><Button type="button" disabled={saving} onClick={() => save()}>{saving ? "Saving…" : "Save Logo"}</Button><Button type="button" variant="ghost" disabled={saving} onClick={() => setSelection(null)}>Cancel change</Button></>}
      {logo.url && <Button type="button" variant="outline" disabled={saving} onClick={() => save(true)}>Delete Logo</Button>}
    </div>
    {logo.error && <div role="alert" className="text-sm text-destructive">{logo.error} <Button type="button" variant="link" onClick={refreshWebsiteLogo}>Retry</Button></div>}
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
      <PageHeading title="Website settings" description="Save your website logo for all visitors. Banner settings remain browser-specific; other fields are available to preview." />

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
