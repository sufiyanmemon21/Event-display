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

export function sortEventsUpcomingFirst(events, now = new Date()) {
  return [...events].sort((left, right) => {
    const group = Number(isPastEvent(left.date, now)) - Number(isPastEvent(right.date, now));
    if (group) return group;
    const leftDate = Date.parse(left.date);
    const rightDate = Date.parse(right.date);
    return (Number.isFinite(leftDate) ? leftDate : Infinity) -
      (Number.isFinite(rightDate) ? rightDate : Infinity) ||
      String(left.time || "").localeCompare(String(right.time || "")) ||
      String(left._id).localeCompare(String(right._id));
  });
}
