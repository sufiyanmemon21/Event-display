import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CoverImageField({ existingImage, file, onChange }) {
  const input = useRef(null);
  const [preview, setPreview] = useState(null);
  const [failedSource, setFailedSource] = useState("");

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview({ file, url: reader.result });
    reader.readAsDataURL(file);
    return () => {
      reader.onload = null;
      reader.abort();
    };
  }, [file]);

  const source = file
    ? preview?.file === file
      ? preview.url
      : ""
    : existingImage;
  return (
    <div className="col-span-full space-y-2">
      <Label htmlFor="event-image-change">Cover image (optional)</Label>
      <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center [.workspace-form-body_fieldset_>_p&]:py-[14px]">
        <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background text-muted-foreground">
          {source && failedSource !== source ? (
            <ImageWithSkeleton
              src={source}
              alt={file ? "Selected cover preview" : "Current cover image"}
              className="h-full w-full object-cover"
              onError={() => setFailedSource(source)}
            />
          ) : (
            <ImageIcon className="size-8" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="break-all text-sm font-medium" aria-live="polite">
            {file?.name ||
              (existingImage
                ? "Current cover image"
                : "No cover image uploaded")}
          </p>
          <p className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
            {source && failedSource === source
              ? "Preview unavailable. You can choose another image."
              : file
                ? "This image will replace the cover after you save successfully."
                : existingImage
                  ? "Your current image will be kept unless you choose a replacement."
                  : "Add an optional cover for your listing."}
          </p>
          <input
            ref={input}
            id="event-image"
            className="hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) onChange(selected);
              event.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              id="event-image-change"
              type="button"
              variant="outline"
              size="sm"
              aria-describedby="event-image-help"
              onClick={() => input.current?.click()}
            >
              <Upload className="size-4" />
              {existingImage || file ? "Change Image" : "Choose Image"}
            </Button>
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
              >
                Cancel image change
              </Button>
            )}
          </div>
        </div>
      </div>
      <p
        id="event-image-help"
        className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]"
      >
        JPEG, PNG, WebP, or AVIF. Large photos are optimized automatically for
        the public listing.
      </p>
    </div>
  );
}
