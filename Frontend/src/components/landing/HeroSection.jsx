import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import birthdayImage from '@/assets/birthday.avif';

export default function HeroSection() {
  return (
    <section id="home" className="celebration-hero" aria-labelledby="celebration-title">
      <img className="celebration-hero-photo" src={birthdayImage} alt="Pink and ivory balloon décor around a birthday cake table" fetchPriority="high" />
      <div className="celebration-wrap celebration-hero-inner">
        <p className="celebration-kicker">EventSphere · Events & celebrations</p>
        <h1 id="celebration-title">Beautifully planned.<br /><em>Joyfully celebrated.</em></h1>
        <p>From intimate celebrations to full-scale expos, bring the people, setting, and details together in one place.</p>
        <Link className="celebration-button" to="/#inquire">Plan your event <ArrowUpRight size={16} /></Link>
      </div>
    </section>
  );
}
