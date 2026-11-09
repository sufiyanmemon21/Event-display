import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { renderBookingPass } from "../presentation/bookingpass.js";
import Attendee from "../models/attendeemodel.js";

const passOptions = { issuer: "eventsphere-booking", audience: "eventsphere-entry" };

export async function issueBookingPass(req, res) {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(404).json({ msg: "Booking not found" });
  const booking = await Attendee.findOne({ _id: id, user: req.user._id }).populate("event", "title date location");
  if (!booking?.event) return res.status(404).json({ msg: "Booking not found" });
  if (booking.status !== "Confirmed") return res.status(409).json({ msg: "Only confirmed bookings have a pass" });

  const token = jwt.sign({}, process.env.JWT_SECRET, { ...passOptions, subject: id, algorithm: "HS256", noTimestamp: true });
  const url = new URL("/passes/verify", process.env.FRONTEND_URL || req.get("origin") || `${req.protocol}://${req.get("host")}`);
  url.hash = token;
  const qr = await QRCode.toBuffer(url.href, { width: 360, margin: 3, errorCorrectionLevel: "M" });

  res.set("Cache-Control", "no-store");
  if (req.query.format === "qr") return res.type("png").send(qr);

  const pdf = Buffer.from(await renderBookingPass({ booking, attendeeName: req.user.name, qr }));
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
  if (booking?.status !== "Confirmed" || !booking.event) {
    return res.status(404).json({ msg: "This booking pass is no longer valid" });
  }
  return res.json({ title: booking.event.title, ticketType: booking.ticketType });
}
