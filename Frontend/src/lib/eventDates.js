const karachiDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isPastEvent(date, now = new Date()) {
  const eventDate = new Date(date);
  if (!date || !Number.isFinite(eventDate.getTime())) return false;
  const parts = Object.fromEntries(karachiDate.formatToParts(now).map(({ type, value }) => [type, value]));
  return eventDate.toISOString().slice(0, 10) < `${parts.year}-${parts.month}-${parts.day}`;
}
