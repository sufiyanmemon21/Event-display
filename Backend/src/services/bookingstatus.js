// Confirmed and missing statuses belong to tickets issued before approval controls.
export function isApprovedBooking(status) {
  return status === "Approved" || status === "Confirmed" || status == null;
}

export const approvedBookingFilter = {
  $or: [{ status: { $in: ["Approved", "Confirmed"] } }, { status: { $exists: false } }],
};
