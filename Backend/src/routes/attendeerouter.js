import express from "express";
import {
  registerAttendee,
  getAttendees,
  updateBookingStatus,
} from "../controllers/attendeecontroller.js";
import { issueBookingPass, verifyBookingPass } from "../controllers/bookingpasscontroller.js";
import {
  authenticate,
  authorize,
} from "../middleware/authmiddleware.js";

const attendeeRouter = express.Router();

attendeeRouter.post("/passes/verify", verifyBookingPass);
attendeeRouter.get("/:id/pass", authenticate, authorize("attendee"), issueBookingPass);
attendeeRouter.patch("/:id/status", authenticate, authorize("admin", "organizer"), updateBookingStatus);

attendeeRouter.post(
  "/register",
  authenticate,
  authorize("attendee"),
  registerAttendee
);

attendeeRouter.get(
  "/all",
  authenticate,
  authorize("admin", "organizer", "attendee"),
  getAttendees
);

export default attendeeRouter;
