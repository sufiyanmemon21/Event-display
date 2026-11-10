import mongoose from "mongoose";

const schema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  booth: { type: mongoose.Schema.Types.ObjectId, ref: "Booth", required: true },
}, { timestamps: true });

export default mongoose.model("BoothHold", schema);
