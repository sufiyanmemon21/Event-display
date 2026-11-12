import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  booth: { type: mongoose.Schema.Types.ObjectId, ref: "Booth", required: true },
}, { timestamps: true });

schema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $type: "objectId" },
      event: { $type: "objectId" },
    },
  },
);

export default mongoose.model("BoothHold", schema);
