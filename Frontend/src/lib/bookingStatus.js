export function bookingStatus(status) {
  return !status || status === "Confirmed" ? "Approved" : status;
}
