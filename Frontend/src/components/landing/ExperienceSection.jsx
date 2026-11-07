import { CalendarDays, Compass, Users, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import planningImage from '@/assets/last.avif';

export default function ExperienceSection() {
  const features = [
    [Compass, 'Personalized discovery', 'Find expos that match your interests.'],
    [CalendarDays, 'Thoughtful planning', 'Manage your expo details in one place.'],
    [ShieldCheck, 'Secure access', 'Dedicated tools for every account role.'],
    [Users, 'Meaningful connections', 'Bring organizers and communities together.'],
  ];
  return (
    <section id="about" className="bg-[#fffaf6] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
            One thoughtful platform
          </p>
          <h2 className="max-w-lg font-serif text-3xl font-semibold leading-tight text-[#321b1f] sm:text-4xl">
            Everything you need for a perfect event
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#756a64]">
            EventSphere brings event planning, exhibition discovery, and attendee
            coordination together so you can focus on the moments that matter.
          </p>
          <Link
            to="/service"
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#c6952d] px-5 text-xs font-semibold text-white transition hover:bg-[#a97818]"
          >
            Explore the platform <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-[#eadfd5] bg-white p-2 shadow-[0_14px_38px_rgba(54,27,25,0.09)]">
          <img
            src={planningImage}
            alt="A team working together to plan an event"
            loading="lazy"
            className="h-52 w-full rounded-[1.25rem] object-cover sm:h-64"
          />
          <div className="grid grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-3">
            {features.map(([Icon, title, description], index) => (
              <article
                key={title}
                className="rounded-xl bg-[#fbf6ef] p-3 sm:p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-[#bd8b2e]">
                  <Icon size={17} />
                  <span className="font-serif text-lg font-semibold">0{index + 1}</span>
                </div>
                <h3 className="text-xs font-semibold text-[#41262a] sm:text-sm">
                  {title}
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-[#756a64]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
