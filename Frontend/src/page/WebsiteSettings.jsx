import { useState } from "react";
import { PageHeading } from "@/components/workspace";
import { IntegrationNotice, UnavailableAction } from "@/components/integration-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
const sections = [{
  id: "general",
  name: "General",
  description: "Identity and brand assets",
  fields: [["websiteName", "Website name"], ["tagline", "Tagline"], ["logo", "Website logo", "file"], ["favicon", "Favicon", "file"]]
}, {
  id: "banner",
  name: "Main banner",
  description: "Homepage banner content",
  fields: [["bannerTitle", "Banner title"], ["bannerDescription", "Banner description", "textarea"], ["bannerButton", "Button text"], ["bannerImage", "Banner image", "file"]]
}, {
  id: "about",
  name: "About",
  description: "Your public introduction",
  fields: [["aboutTitle", "About title"], ["aboutDescription", "About description", "textarea"], ["aboutImage", "About image", "file"]]
}, {
  id: "contact",
  name: "Contact",
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
  label
}) {
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  async function choose(e) {
    const file = e.target.files?.[0];
    setFileName(file?.name || "");
    if (!file || !file.type.startsWith("image/")) {
      setPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }
  return <div className="col-span-full space-y-3 rounded-xl border border-dashed bg-muted/20 p-4"><Label htmlFor={id}>{label}</Label><Input id={id} type="file" accept="image/*,.ico" onChange={choose} /><Button type="button" variant="outline" disabled>Delete stored image unavailable</Button>{fileName && <p className="text-xs text-muted-foreground">Local preview only: {fileName}. Nothing has been uploaded.</p>}{preview && <div className="flex flex-wrap items-center gap-4"><img src={preview} alt={`${label} local preview`} className="max-h-36 max-w-full rounded-lg border object-contain" /><Button type="button" variant="outline" onClick={() => {
        setPreview("");
        setFileName("");
        const input = document.getElementById(id);
        if (input) input.value = "";
      }}>Remove local selection</Button></div>}</div>;
}
export default function WebsiteSettings() {
  const [values, setValues] = useState({});
  const [revision, setRevision] = useState(0);
  return <div className="space-y-6"><PageHeading title="Website settings" description="Prepare your brand, content, and public contact details." /><IntegrationNotice>No settings read/write API or asset-storage integration exists. These fields are an unsaved preview; they do not load or change the public website. Save and stored-image deletion are unavailable until backend integration is implemented.</IntegrationNotice><Tabs defaultValue="general" className="gap-6 lg:flex-row"><TabsList className="h-auto group-data-horizontal/tabs:h-auto w-full flex-wrap justify-start gap-1 lg:w-52 lg:shrink-0 lg:flex-col lg:items-stretch">{sections.map(section => <TabsTrigger key={section.id} value={section.id} className="justify-start px-4 py-3">{section.name}</TabsTrigger>)}</TabsList><div className="min-w-0 flex-1">{sections.map(section => <TabsContent key={section.id} value={section.id}><Card><CardHeader><CardTitle>{section.name} settings</CardTitle><CardDescription>{section.description} · unsaved preview</CardDescription></CardHeader><CardContent><form onSubmit={e => e.preventDefault()} className="space-y-6"><fieldset className="grid gap-5 sm:grid-cols-2" key={revision}>{section.fields.map(([name, label, type = "text"]) => type === "file" ? <AssetField key={name} id={`setting-${name}`} label={label} /> : <div key={name} className={`space-y-2 ${type === "textarea" ? "col-span-full" : ""}`}><Label htmlFor={`setting-${name}`}>{label}</Label>{type === "textarea" ? <Textarea id={`setting-${name}`} rows={4} value={values[name] || ""} onChange={e => setValues(previous => ({
                      ...previous,
                      [name]: e.target.value
                    }))} /> : <Input id={`setting-${name}`} type={type} value={values[name] || ""} onChange={e => setValues(previous => ({
                      ...previous,
                      [name]: e.target.value
                    }))} />}</div>)}</fieldset><div className="flex flex-wrap justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => {
                    setValues({});
                    setRevision(v => v + 1);
                  }}>Clear unsaved preview</Button><UnavailableAction>Save unavailable</UnavailableAction></div></form></CardContent></Card></TabsContent>)}</div></Tabs></div>;
}
