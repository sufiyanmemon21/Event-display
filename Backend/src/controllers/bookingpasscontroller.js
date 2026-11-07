import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Attendee from "../models/attendeemodel.js";

const passOptions = { issuer: "eventsphere-booking", audience: "eventsphere-entry" };

function printable(font, text) {
  return Array.from(String(text), (char) => {
    try {
      font.encodeText(char);
      return char;
    } catch {
      return "?";
    }
  }).join("");
}

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

  const document = await PDFDocument.create();
  const page = document.addPage([460, 580]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const heading = await document.embedFont(StandardFonts.HelveticaBold);
  const image = await document.embedPng(qr);
  const ink = rgb(0.26, 0.16, 0.13);
  page.drawRectangle({ x: 0, y: 0, width: 460, height: 580, color: rgb(1, 0.97, 0.93) });
  const draw = (value, y, size = 12, face = font) => page.drawText(printable(face, value), {
    x: 34, y, size, font: face, color: ink, maxWidth: 392, lineHeight: size + 4,
  });

  draw("EVENTSPHERE  /  CONFIRMED ENTRY PASS", 533, 12, heading);
  draw(booking.event.title, 492, 21, heading);
  draw(`Attendee: ${req.user.name}`, 400);
  draw(`Ticket: ${booking.ticketType}`, 375);
  draw(new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(booking.event.date), 352);
  draw(booking.event.location, 329);
  page.drawImage(image, { x: 122, y: 73, width: 216, height: 216 });
  draw(`Booking reference: ${id}`, 44);
  const pdf = Buffer.from(await document.save());
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
