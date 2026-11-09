import mongoose from "mongoose";
const schema = new mongoose.Schema({
  _id: { type: String, default: "website" },
  data: { type: Buffer, select: false },
  filename: String,
  version: String,
}, { timestamps: true });
export default mongoose.model("WebsiteBranding", schema);
