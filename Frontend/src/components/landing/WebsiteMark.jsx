import { Flower2 } from 'lucide-react';
import useWebsiteLogo from '@/hooks/useWebsiteLogo';

export default function WebsiteMark() {
  const logo = useWebsiteLogo();
  return logo
    ? <img className="celebration-brand-mark" src={logo} alt="" />
    : <Flower2 size={24} strokeWidth={1.5} aria-hidden="true" />;
}
