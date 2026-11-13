import { publishUpdate } from "../services/liveupdates.js";
import mongoose from "mongoose";
import Event from "../models/eventmodel.js";
import User from "../models/authmodel.js";
import { canReviewEvent, publicEventFilter } from "../services/eventworkflow.js";
import { isPastEvent, sortEventsUpcomingFirst } from "../services/eventdates.js";

export async function getReviewers(req, res) {
  const reviewers = await User.find({ role: "exhibitor" }).select("name email").sort({ name: 1 });
  res.json({ reviewers });
}

export async function getWorkspaceEvents(req, res) {
  const filter = req.user.role === "admin" ? {}
    : req.user.role === "organizer" ? { organizer: req.user._id }
    : { $or: [publicEventFilter, { reviewExhibitor: req.user._id }] };
  const events = await Event.find(filter).populate("organizer", "name").populate("reviewExhibitor", "name").sort({ date: 1 });
  res.set("Cache-Control", "no-store").json({ events: sortEventsUpcomingFirst(events) });
}

export async function reviewEvent(req, res) {
  const { id } = req.params;
  const { status, updatedAt } = req.body || {};
  if (!mongoose.isObjectIdOrHexString(id) || !["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ msg: "Choose a valid event and review decision." });
  }
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ msg: "Event not found." });
  if (!canReviewEvent(req.user, event)) return res.status(403).json({ msg: "Only the assigned exhibitor can review Events; only an Admin can review Expos." });
  if (event.approvalStatus && event.approvalStatus !== "Pending") return res.status(409).json({ msg: "This listing has already been reviewed." });
  if (status === "Approved" && isPastEvent(event.date)) return res.status(400).json({ msg: "A past event cannot be approved." });
  if (!updatedAt || new Date(updatedAt).getTime() !== event.updatedAt.getTime()) return res.status(409).json({ msg: "The listing changed. Reload it before reviewing." });
  const updated = await Event.findOneAndUpdate(
    { _id: id, updatedAt: event.updatedAt, reviewExhibitor: event.reviewExhibitor },
    { $set: { approvalStatus: status, reviewedBy: req.user._id, reviewedAt: new Date() }, $inc: { __v: 1 } },
    { new: true, runValidators: true },
  );
  if (!updated) return res.status(409).json({ msg: "The listing changed. Reload and try again." });
  publishUpdate();
  res.json({ event: updated });
}
