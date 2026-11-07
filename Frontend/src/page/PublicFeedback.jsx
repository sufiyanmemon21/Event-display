import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Mail, MessageSquare, Send, Star, TriangleAlert, UserRound } from 'lucide-react';
import PublicPageShell from '@/components/landing/PublicPageShell';
import api from '@/api/api';
import useAuth from '@/hooks/useAuth';
import useExpos, { isExpo } from '@/hooks/useExpos';
import './celebration.css';

const types = [
  ['suggestion', 'Suggestion', Lightbulb],
  ['issue', 'Report an Issue', TriangleAlert],
  ['review', 'Public Review', MessageSquare],
];

export default function PublicFeedback() {
  const user = useAuth();
  const { items } = useExpos();
  const [type, setType] = useState('review');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Share Your Feedback — EventSphere';
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (saving || message.trim().length < 5) return;
    const fields = new FormData(event.currentTarget);
    setSaving(true);
    setError('');
    try {
      await api.post('/feedback/submit', {
        type,
        rating: rating || undefined,
        event: fields.get('expo'),
        subject: fields.get('subject').trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch (failure) {
      setError(failure.response?.data?.msg || 'Could not submit feedback. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicPageShell>
      <main className="public-feedback">
        <header>
          <span className="public-feedback-icon"><MessageSquare size={28} aria-hidden="true" /></span>
          <p className="public-feedback-kicker">Your feedback matters</p>
          <h1>Share Your <em>Feedback</em></h1>
          <p>Share a review, send a suggestion, or report an issue.</p>
        </header>
        {!user ? (
          <Link className="public-feedback-submit" to="/login" state={{ from: '/share-feedback' }}>Sign in to share feedback</Link>
        ) : sent ? (
          <div className="public-feedback-card" role="status">
            <p>{type === 'review' ? 'Your review was published.' : 'Thank you. Your feedback was submitted.'}</p>
            <Link className="public-feedback-submit" to={type === 'review' ? '/#reviews' : '/'}>{type === 'review' ? 'View Client Reviews' : 'Back to home'}</Link>
          </div>
        ) : (
          <form className="public-feedback-card" onSubmit={submit}>
            <fieldset disabled={saving}>
              <div className="public-feedback-identity">
                <label>Your Name<span><UserRound size={17} aria-hidden="true" /><input value={user.name || ''} readOnly /></span></label>
                <label>Email Address<span><Mail size={17} aria-hidden="true" /><input value={user.email || ''} readOnly /></span></label>
              </div>
              <fieldset>
                <legend>What would you like to share?</legend>
                <div className="public-feedback-options">
                  {types.map(([value, label, Icon]) => (
                    <label key={value}><input type="radio" name="feedback-type" checked={type === value} onChange={() => setType(value)} /><span><Icon size={16} aria-hidden="true" />{label}</span></label>
                  ))}
                </div>
                {type === 'review' && <small>Your first name, review, and rating will be public.</small>}
              </fieldset>
              <label>Select an Expo (optional)
                <select name="expo">
                  <option value="">Platform feedback / no specific expo</option>
                  {items.filter(isExpo).map((expo) => <option key={expo._id} value={expo._id}>{expo.title}</option>)}
                </select>
              </label>
              <label>Subject (optional)<input name="subject" maxLength={120} placeholder="e.g. Add a map of the venue" /></label>
              <fieldset>
                <legend>How was your experience? (optional)</legend>
                <div className="public-feedback-options public-feedback-ratings">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" aria-label={`Rate ${value} out of 5`} aria-pressed={rating === value} onClick={() => setRating(rating === value ? 0 : value)}>
                      <Star size={21} fill={rating >= value ? 'currentColor' : 'none'} aria-hidden="true" />{value}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>Your Message
                <textarea rows={6} minLength={5} maxLength={2000} required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us your idea or experience…" />
                <small className="public-feedback-count">{message.length}/2000</small>
              </label>
              {error && <p role="alert">{error}</p>}
              <button className="public-feedback-submit" type="submit" disabled={saving || message.trim().length < 5}>{saving ? 'Submitting…' : 'Submit Feedback'} <Send size={16} aria-hidden="true" /></button>
            </fieldset>
          </form>
        )}
        <Link to="/share-feedback" className="celebration-feedback-trigger" aria-current="page"><MessageSquare size={19} aria-hidden="true" /> Feedback</Link>
      </main>
    </PublicPageShell>
  );
}
