import { passVerificationUrl } from "../services/passurl.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { renderBookingPass } from "../presentation/bookingpass.js";
import Attendee from "../models/attendeemodel.js";
import { canReviewEvent } from "../services/eventworkflow.js";
import { isApprovedBooking, approvedBookingFilter } from "../services/bookingstatus.js";

const passOptions = { issuer: "eventsphere-booking", audience: "eventsphere-entry" };

export async function issueBookingPass(req, res) {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(404).json({ msg: "Booking not found" });
  const booking = await Attendee.findOne({ _id: id, user: req.user._id }).populate("event", "title date location");
  if (!booking?.event) return res.status(404).json({ msg: "Booking not found" });
  if (!isApprovedBooking(booking.status)) return res.status(409).json({ msg: "Only approved bookings have a pass" });

  const token = jwt.sign({}, process.env.JWT_SECRET, { ...passOptions, subject: id, jwtid: id, algorithm: "HS256", noTimestamp: true });
  const url = passVerificationUrl(token);
  const qr = await QRCode.toBuffer(url.href, { width: 360, margin: 3, errorCorrectionLevel: "M" });

  res.set("Cache-Control", "no-store");
  if (req.query.format === "qr") return res.type("png").send(qr);

  const pdf = Buffer.from(await renderBookingPass({ booking, attendeeName: req.user.name, qr, website: url.hostname }));
  return res.type("pdf").attachment(`eventsphere-pass-${id}.pdf`).send(pdf);
}

export async function verifyBookingPass(req, res) {
  res.set("Cache-Control", "no-store");
  let id;
  try {
    const payload = jwt.verify(req.body?.token, process.env.JWT_SECRET, { ...passOptions, algorithms: ["HS256"] });
    id = payload.sub;
    if (!mongoose.isObjectIdOrHexString(id)) throw new Error("Invalid ID");
  } catch {
    return res.status(400).json({ msg: "This QR pass is invalid" });
  }

  const booking = await Attendee.findById(id).populate("event", "title");
  if (!booking?.event || !isApprovedBooking(booking.status)) {
    return res.status(404).json({ msg: "This booking pass is no longer valid" });
  }
  return res.json({ title: booking.event.title, ticketType: booking.ticketType, checkedInAt: booking.checkedInAt || null });
}

export async function checkInBookingPass(req, res) {
  res.set("Cache-Control", "no-store");
  let id;
  try {
    const payload = jwt.verify(req.body?.token, process.env.JWT_SECRET, { ...passOptions, algorithms: ["HS256"] });
    id = payload.sub;
    if (!mongoose.isObjectIdOrHexString(id)) throw new Error("Invalid ID");
  } catch {
    return res.status(400).json({ msg: "This QR pass is invalid." });
  }
  const booking = await Attendee.findById(id).populate("event");
  if (!booking?.event || !isApprovedBooking(booking.status)) return res.status(409).json({ msg: "Only an approved ticket can check in." });
  if (!canReviewEvent(req.user, booking.event)) return res.status(403).json({ msg: "You are not authorized to check in attendees for this event." });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (booking.event.date.toISOString().slice(0, 10) !== today) return res.status(409).json({ msg: "Check-in is available on the event date only (Pakistan time)." });
  const updated = await Attendee.findOneAndUpdate(
    { _id: id, ...approvedBookingFilter, checkedInAt: null },
    { $set: { checkedInAt: new Date(), checkedInBy: req.user._id } },
    { new: true },
  );
  if (!updated) {
    const latest = await Attendee.findById(id);
    if (!latest || !isApprovedBooking(latest.status)) return res.status(409).json({ msg: "This ticket is no longer approved." });
    return res.json({ title: booking.event.title, checkedInAt: latest.checkedInAt, alreadyCheckedIn: true });
  }
  return res.json({ title: booking.event.title, checkedInAt: updated.checkedInAt, alreadyCheckedIn: false });
}
