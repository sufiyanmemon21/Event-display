import BoothHold from "../models/boothholdmodel.js";
import Booth from "../models/boothmodel.js";
import Exhibitor from "../models/exhibitormodel.js";

export async function claimBooth(userId, boothId, session) {
  const applications = await Exhibitor.find({ contactPerson: userId }).select("_id boothNumber").session(session);
  const existing = await Booth.exists({
    reservedBy: { $in: applications.map(item => item._id) },
    status: { $ne: "Available" },
  }).session(session);
  if (existing || applications.some(item => item.boothNumber)) {
    const error = new Error("Only one active booth is allowed. Cancel your current booth before booking another expo.");
    error.status = 409;
    throw error;
  }
  await BoothHold.create([{ _id: userId, booth: boothId }], { session });
}

export async function releaseBooth(userId, boothId, session) {
  await BoothHold.deleteOne({ _id: userId, booth: boothId }).session(session);
}
