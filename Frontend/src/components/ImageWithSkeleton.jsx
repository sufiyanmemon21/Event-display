import { useCallback, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

function ImageFrame({
  src,
  fallbackSrc,
  fallback,
  alt = "",
  className,
  imageClassName,
  width,
  height,
  style,
  loading,
  fetchPriority,
  onError,
  ...props
}) {
  const [status, setStatus] = useState(src ? "loading" : "failed");
  const [useFallback, setUseFallback] = useState(false);
  const source = useFallback ? fallbackSrc : src;

  const checkCachedImage = useCallback((image) => {
    if (image?.complete && image.naturalWidth) setStatus("loaded");
  }, []);

  return (
    <span
      {...props}
      className={cn("eventsphere-image relative isolate block", className)}
      data-image-state={status}
      style={width && height ? { aspectRatio: width + " / " + height, ...style } : style}
    >
      {status === "loading" && (
        <span aria-hidden="true" className="eventsphere-image-placeholder absolute inset-0 rounded-[inherit] motion-safe:animate-pulse" />
      )}
      {status === "failed" ? (
        <span
          className="eventsphere-image-placeholder absolute inset-0 grid place-items-center rounded-[inherit]"
          role={alt ? "img" : undefined}
          aria-label={alt ? alt + " unavailable" : undefined}
          aria-hidden={alt ? undefined : true}
        >
          {fallback ?? <ImageOff className="size-5 opacity-65" aria-hidden="true" />}
        </span>
      ) : (
        <img
          key={source}
          ref={checkCachedImage}
          src={source}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={(event) => {
            if (!useFallback && fallbackSrc && fallbackSrc !== src) {
              setUseFallback(true);
            } else {
              setStatus("failed");
              onError?.(event);
            }
          }}
          className={cn("eventsphere-image-content", imageClassName)}
        />
      )}
    </span>
  );
}

export default function ImageWithSkeleton(props) {
  return <ImageFrame key={props.src} {...props} />;
}
