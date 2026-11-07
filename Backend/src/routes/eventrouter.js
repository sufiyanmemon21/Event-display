import express from "express";
import multer from "multer";
import {
  createEvent,
  getEvents,
  getEvent,
  getEventCover,
  updateEvent,
  deleteEvent,
} from "../controllers/eventcontroller.js";
import {
  authenticate,
  authorize,
} from "../middleware/authmiddleware.js";

const eventRouter = express.Router();
const coverUpload = multer({
  limits: { fileSize: 3 * 1024 * 1024, files: 1, fields: 8, fieldSize: 20_000 }
}).single("image");

function uploadCover(req, res, next) {
  coverUpload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400)
        .json({ msg: error.code === "LIMIT_FILE_SIZE" ? "The prepared cover image is too large to upload." : "The cover upload could not be processed." });
    }
    return next(error);
  });
}

eventRouter.get("/all", getEvents);
eventRouter.get("/:id/image", getEventCover);
eventRouter.get("/:id", getEvent);

eventRouter.post(
  "/create",
  authenticate,
  authorize("admin", "organizer"),
  uploadCover,
  createEvent
);

eventRouter.put(
  "/update/:id",
  authenticate,
  authorize("admin", "organizer"),
  uploadCover,
  updateEvent
);

eventRouter.delete(
  "/delete/:id",
  authenticate,
  authorize("admin", "organizer"),
  deleteEvent
);

export default eventRouter;
