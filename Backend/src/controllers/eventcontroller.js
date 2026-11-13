
import { publishUpdate } from "../services/liveupdates.js";
import mongoose from "mongoose";
import sharp from "sharp";
import Event from "../models/eventmodel.js";
import Exhibitor from "../models/exhibitormodel.js";
import Attendee from "../models/attendeemodel.js";
import Booth from "../models/boothmodel.js";
import Session from "../models/sessionmodel.js";
import User from "../models/authmodel.js";
import { isExpo, isPublished, publicEventFilter } from "../services/eventworkflow.js";
import { isPastEvent, sortEventsUpcomingFirst } from "../services/eventdates.js";

async function readCover(req, res, data) {
  if (!req.file) return true;
  try {
    const image = sharp(req.file.buffer, { limitInputPixels: 24_000_000 });
    const { format } = await image.metadata();
    if (!["jpeg", "png", "webp", "heif"].includes(format)) throw new Error("Unsupported format");
    data.coverData = await image.rotate().resize({ width: 1600, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    data.hasImage = true;
    return true;
  } catch {
    res.status(400).json({ msg: "Choose a valid JPEG, PNG, WebP, or AVIF cover image" });
    return false;
  }
}

export async function getEventCover(req, res) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.sendStatus(404);
  const event = await Event.findById(req.params.id).select("+coverData");
  if (!event?.coverData?.length) return res.sendStatus(404);
  return res.set("Cache-Control", "public, no-cache").type("image/webp").send(Buffer.from(event.coverData));
}

function readEvent(body = {}) {
  const fields = ["title", "description", "location", "category"];
  const data = {};

  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return { error: "Please fill all fields" };
    }

    data[field] = body[field].trim();
  }

  if (
    data.title.length > 150 ||
    data.description.length > 5000 ||
    data.location.length > 200 ||
    data.category.length > 100
  ) {
    return { error: "One or more fields are too long" };
  }

  if (typeof body.date !== "string" || !body.date.trim()) {
    return { error: "Please enter an event date" };
  }

  const date = new Date(body.date);

  if (Number.isNaN(date.getTime()) || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(body.date) || date.toISOString().slice(0, 10) !== body.date) {
    return { error: "Please enter a valid date" };
  }

  data.date = date;
  for (const field of ["time", "endTime"]) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || !/^(?:|(?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) {
      return { error: "Please enter a valid event time" };
    }
    data[field] = value;
  }

  if (Object.hasOwn(body, "listingType")) {
    if (!["event", "expo"].includes(body.listingType)) {
      return { error: "Choose Event or Expo as the listing type" };
    }
    data.listingType = body.listingType;
  }

  return { data };
}

function canManage(user, event) {
  return (
    user.role === "admin" ||
    event.organizer.toString() === user._id.toString()
  );
}

async function createEvent(req, res) {
  try {
    const result = readEvent(req.body);

    if (result.error) {
      return res.status(400).json({ msg: result.error });
    }

    if (isPastEvent(result.data.date)) return res.status(400).json({ msg: "Choose today or a future date." });
    if (isExpo(result.data) && req.user.role !== "admin") return res.status(403).json({ msg: "Only an Admin can create Expos." });
    if (!isExpo(result.data) && req.user.role === "admin") {
      if (!mongoose.isObjectIdOrHexString(req.body.reviewExhibitor) || !await User.exists({ _id: req.body.reviewExhibitor, role: "exhibitor" })) {
        return res.status(400).json({ msg: "Assign an exhibitor to review this Event." });
      }
      result.data.reviewExhibitor = req.body.reviewExhibitor;
    }
    if (req.user.role === "exhibitor" && !isExpo(result.data)) result.data.reviewExhibitor = req.user._id;
    if (isExpo(result.data)) result.data.reviewExhibitor = undefined;
    result.data.approvalStatus = "Pending";
    if (!await readCover(req, res, result.data)) return;

    const event = await Event.create({
      ...result.data,
      organizer: req.user._id,
    });

    return res.status(201).json({
      msg: "Event created successfully",
      event,
    });
  } catch {
    return res.status(500).json({
      msg: "Unable to create event",
    });
  }
}

async function getEvents(req, res) {
  try {
    const events = await Event.find(publicEventFilter)
      .populate("organizer", "name companyName role")
      .populate("reviewExhibitor", "name companyName")
      .sort({ date: 1 });

    return res.status(200).json({ events: sortEventsUpcomingFirst(events) });
  } catch (error) {
    console.error("Get Events Error:", error);

    return res.status(500).json({
      msg: "Unable to load events",
    });
  }
}

async function getEvent(req, res) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ msg: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name companyName role"
    ).populate("reviewExhibitor", "name companyName");

    if (!event || !isPublished(event)) {
      return res.status(404).json({ msg: "Event not found" });
    }

    return res.status(200).json({ event });
  } catch {
    return res.status(500).json({
      msg: "Unable to load event",
    });
  }
}

async function updateEvent(req, res) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ msg: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (!canManage(req.user, event)) {
      return res.status(403).json({
        msg: "You can only edit your own events",
      });
    }

    const result = readEvent(req.body);

    if (result.error) {
      return res.status(400).json({ msg: result.error });
    }

    if (isPastEvent(result.data.date) && result.data.date.getTime() !== event.date.getTime()) return res.status(400).json({ msg: "Choose today or a future date." });
    if ((isExpo(event) || isExpo(result.data)) && req.user.role !== "admin") return res.status(403).json({ msg: "Only an Admin can update Expos." });
    if (req.user.role === "admin" && !isExpo(result.data)) {
      const reviewer = req.body.reviewExhibitor || event.reviewExhibitor;
      if (!mongoose.isObjectIdOrHexString(reviewer) || !await User.exists({ _id: reviewer, role: "exhibitor" })) return res.status(400).json({ msg: "Assign an exhibitor to review this Event." });
      result.data.reviewExhibitor = reviewer;
    }
    result.data.approvalStatus = "Pending";
    result.data.reviewedAt = undefined;
    result.data.reviewedBy = undefined;
    if (!await readCover(req, res, result.data)) return;

    Object.assign(event, result.data);
    await event.save();
    publishUpdate();

    return res.status(200).json({
      msg: "Event updated successfully",
      event,
    });
  } catch (error) {
    if (error.name === "VersionError") return res.status(409).json({ msg: "This event changed. Refresh before saving." });
    return res.status(500).json({
      msg: "Unable to update event",
    });
  }
}

async function deleteEvent(req, res) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ msg: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (!canManage(req.user, event)) {
      return res.status(403).json({
        msg: "You can only delete your own events",
      });
    }

    const relatedRecords = await Promise.all([
      Exhibitor.exists({ event: event._id }),
      Attendee.exists({ event: event._id }),
      Booth.exists({ event: event._id }),
      Session.exists({ event: event._id }),
    ]);

    if (relatedRecords.some(Boolean)) {
      return res.status(409).json({
        msg: "This event has registrations, booths or sessions. Remove those records before deleting it",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      msg: "Event deleted successfully",
    });
  } catch {
    return res.status(500).json({
      msg: "Unable to delete event",
    });
  }
}

export { createEvent, getEvents, getEvent, updateEvent, deleteEvent };

