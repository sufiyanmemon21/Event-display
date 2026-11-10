import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketType: {
      type: String,
      enum: ["Standard", "VIP", "Regular"],
      default: "Standard",
    },
    phone: { type: String, trim: true, maxlength: 32 },
    guestCount: { type: Number, min: 1, validate: Number.isSafeInteger },
    details: { type: String, trim: true, maxlength: 2000 },
    checkedInAt: Date,
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected", "Cancelled"],
      default: "Confirmed",
    },
  },
  { timestamps: true }
);

attendeeSchema.index(
  { user: 1, event: 1 },
  { unique: true }
);

export default mongoose.model("Attendee", attendeeSchema);
