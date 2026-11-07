import mongoose from "mongoose";
import Attendee from "../models/attendeemodel.js";
import Event from "../models/eventmodel.js";
import { publishUpdate } from "../services/liveupdates.js";
import { isPastEvent } from "../services/eventdates.js";

async function registerAttendee(req, res) {
  try {
    const { event, ticketType = "Standard", phone, guestCount, details } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(event)) {
      return res.status(400).json({
        msg: "Select a valid event",
      });
    }

    if (!["Standard", "VIP", "Regular"].includes(ticketType)) {
      return res.status(400).json({
        msg: "Select a valid ticket type",
      });
    }

    if (phone !== undefined && (typeof phone !== "string" || !/^[+0-9(). -]{5,32}$/.test(phone.trim()) || !/\d/.test(phone))) {
      return res.status(400).json({ msg: "Enter a valid phone number." });
    }
    if (guestCount !== undefined && (!Number.isSafeInteger(guestCount) || guestCount < 1)) {
      return res.status(400).json({ msg: "Enter a positive whole number of guests." });
    }
    if (details !== undefined && (typeof details !== "string" || details.length > 2000)) {
      return res.status(400).json({ msg: "Additional details must be 2,000 characters or fewer." });
    }

    const selectedEvent = await Event.findById(event);

    if (!selectedEvent) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (isPastEvent(selectedEvent.date)) {
      return res.status(409).json({ msg: "Bookings are closed for past events." });
    }

    await Attendee.init();

    const existing = await Attendee.exists({
      user: req.user._id,
      event,
    });

    if (existing) {
      return res.status(409).json({
        msg: "You are already registered for this event",
      });
    }

    const registration = await Attendee.create({
      user: req.user._id,
      event,
      ticketType,
      phone,
      guestCount,
      details,
      status: "Pending",
    });

    return res.status(201).json({
      msg: "Booking requested. The organizer will review it.",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        msg: "You are already registered for this event",
      });
    }

    console.error("Attendee registration failed:", error.message);

    return res.status(500).json({
      msg: "Unable to register for event",
    });
  }
}

async function getAttendees(req, res) {
  try {
    let filter = {};

    if (req.user.role === "attendee") {
      filter.user = req.user._id;
    } else if (req.user.role === "organizer") {
      const events = await Event.find({
        organizer: req.user._id,
      }).select("_id");

      filter.event = {
        $in: events.map((event) => event._id),
      };
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        msg: "You do not have access to attendee registrations",
      });
    }

    const attendees = await Attendee.find(filter)
      .populate("user", "name email")
      .populate("event", "title date location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ attendees });
  } catch {
    return res.status(500).json({
      msg: "Unable to load registrations",
    });
  }
}

const bookingTransitions = {
  Pending: ["Confirmed", "Rejected", "Cancelled"],
  Confirmed: ["Cancelled"],
};

async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const status = req.body?.status;
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ msg: "Invalid booking ID" });

  const booking = await Attendee.findById(id).populate("event", "organizer");
  if (!booking?.event) return res.status(404).json({ msg: "Booking not found" });
  if (req.user.role !== "admin" && !booking.event.organizer.equals(req.user._id)) {
    return res.status(403).json({ msg: "You can only manage bookings for your own events" });
  }
  if (!bookingTransitions[booking.status]?.includes(status)) {
    return res.status(409).json({ msg: "That status change is no longer available" });
  }

  const previous = booking.status === "Confirmed"
    ? { $or: [{ status: "Confirmed" }, { status: { $exists: false } }] }
    : { status: booking.status };
  const updated = await Attendee.findOneAndUpdate({ _id: id, ...previous }, { $set: { status } }, { new: true });
  if (!updated) return res.status(409).json({ msg: "Booking changed. Refresh and try again." });
  publishUpdate();
  return res.json({ status: updated.status });
}

export { registerAttendee, getAttendees, updateBookingStatus };
