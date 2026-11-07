import mongoose from "mongoose";
import Feedback from "../models/feedbackmodel.js";
import Event from "../models/eventmodel.js";

async function submitFeedback(req, res) {
  try {
    const { message, type, event, subject, rating } = req.body || {};
    if (subject !== undefined && (typeof subject !== "string" || subject.trim().length > 120)) {
      return res.status(400).json({ msg: "Subject must be at most 120 characters" });
    }
    if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ msg: "Choose a rating from 1 to 5" });
    }

    if (
      typeof message !== "string" ||
      message.trim().length < 5 ||
      message.trim().length > 3000
    ) {
      return res.status(400).json({
        msg: "Message must contain between 5 and 3000 characters",
      });
    }

    if (!["suggestion", "issue", "review"].includes(type)) {
      return res.status(400).json({
        msg: "Select a valid feedback type",
      });
    }

    let eventId = null;

    if (event !== undefined && event !== null && event !== "") {
      if (!mongoose.isObjectIdOrHexString(event)) {
        return res.status(400).json({ msg: "Invalid event" });
      }

      const exists = await Event.exists({ _id: event });

      if (!exists) {
        return res.status(404).json({ msg: "Event not found" });
      }

      eventId = event;
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      event: eventId,
      message: message.trim(),
      subject,
      rating,
      type,
    });

    return res.status(201).json({
      msg: "Feedback submitted successfully",
      feedback,
    });
  } catch {
    return res.status(500).json({
      msg: "Unable to submit feedback",
    });
  }
}

async function getPublicReviews(_req, res) {
  try {
    const records = await Feedback.find({ type: "review" })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name message rating")
      .lean();
    const reviews = records.map(({ _id, name, message, rating }) => ({
      _id,
      name: name.trim().split(/\s+/)[0],
      message,
      rating,
    }));
    return res.json({ reviews });
  } catch {
    return res.status(500).json({ msg: "Unable to load reviews" });
  }
}

async function getFeedbacks(req, res) {
  try {
    let filter = { user: req.user._id };

    if (req.user.role === "admin") {
      filter = {};
    } else if (req.user.role === "organizer") {
      const events = await Event.find({
        organizer: req.user._id,
      }).select("_id");

      filter = {
        $or: [
          { user: req.user._id },
          {
            event: {
              $in: events.map((event) => event._id),
            },
          },
        ],
      };
    }

    const feedbacks = await Feedback.find(filter)
      .populate("event", "title organizer")
      .sort({ createdAt: -1 });

    return res.status(200).json({ feedbacks });
  } catch {
    return res.status(500).json({
      msg: "Unable to load feedback",
    });
  }
}

async function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { status, reply } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ msg: "Invalid feedback ID" });
    }

    if (!["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    if (typeof reply !== "string" || reply.length > 2000) {
      return res.status(400).json({
        msg: "Reply must be at most 2000 characters",
      });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ msg: "Feedback not found" });
    }

    if (req.user.role !== "admin") {
      const event = feedback.event
        ? await Event.findById(feedback.event)
        : null;

      if (
        !event ||
        event.organizer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          msg: "You can only manage feedback for your own events",
        });
      }
    }

    feedback.status = status;
    feedback.reply = reply.trim();
    await feedback.save();

    return res.status(200).json({
      msg: "Feedback updated successfully",
    });
  } catch {
    return res.status(500).json({
      msg: "Unable to update feedback",
    });
  }
}

export { submitFeedback, getFeedbacks, updateFeedback, getPublicReviews };
