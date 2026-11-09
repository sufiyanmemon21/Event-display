import { Flower2 } from "lucide-react";
import useWebsiteLogo from "@/hooks/useWebsiteLogo";

export default function WebsiteMark() {
  const logo = useWebsiteLogo();
  return logo ? (
    <img
      className="celebration-brand-mark w-auto max-w-[64px] h-[34px] object-contain flex-none
          [.celebration-footer-brand_&]:max-w-[min(112px,_32vw)] [.celebration-footer-brand_&]:h-[42px]
          [.celebration-footer-brand_&]:p-[3px_5px] [.celebration-footer-brand_&]:rounded-[5px]
          [.celebration-footer-brand_&]:[background:var(--footer-cream)]"
      src={logo}
      alt=""
    />
  ) : (
    <Flower2 size={24} strokeWidth={1.5} aria-hidden="true" />
  );
}
