export function isExpo(event) {
  if (event.listingType) return event.listingType === "expo";
  const label = [event.category, event.title].join(" ");
  if (/\b(expos?|expositions?|exhibitions?|trade[\s-]+(shows?|fairs?))\b/i.test(label)) return true;
  return !/\b(birthdays?|weddings?|bridal|engagements?|concerts?|music|gigs?|part(y|ies)|showers?|festivals?|picnics?|celebrations?|receptions?)\b/i.test(label);
}

export function isPublished(event) {
  return !event.approvalStatus || event.approvalStatus === "Approved";
}

export function canReviewEvent(user, event) {
  return isExpo(event)
    ? user.role === "admin"
    : user.role === "exhibitor" && String(event.reviewExhibitor?._id || event.reviewExhibitor) === String(user._id);
}

export const publicEventFilter = {
  $or: [{ approvalStatus: "Approved" }, { approvalStatus: { $exists: false } }],
};
