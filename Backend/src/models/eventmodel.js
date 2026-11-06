import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  listingType: {
    type: String,
    enum: ["event", "expo"]
  },
  hasImage: { type: Boolean, default: false },
  coverData: { type: Buffer, select: false },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_document, result) {
      delete result.coverData;
      return result;
    }
  }
});

export default mongoose.model("Event", eventSchema);
