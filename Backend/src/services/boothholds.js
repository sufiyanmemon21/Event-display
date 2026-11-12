import BoothHold from "../models/boothholdmodel.js";
import Booth from "../models/boothmodel.js";
import Exhibitor from "../models/exhibitormodel.js";

export async function claimBooth(userId, boothId, eventId, session) {
  const applications = await Exhibitor.find({
    contactPerson: userId,
    event: eventId,
  }).select("_id boothNumber").session(session);
  const existing = await Booth.exists({
    reservedBy: { $in: applications.map(item => item._id) },
    status: { $ne: "Available" },
  }).session(session);
  if (existing || applications.some(item => item.boothNumber)) {
    const error = new Error("You already have a booth for this expo.");
    error.status = 409;
    throw error;
  }
  await BoothHold.create([{ user: userId, event: eventId, booth: boothId }], { session });
}

export async function releaseBooth(userId, boothId, eventId, session) {
  await BoothHold.deleteOne({ user: userId, event: eventId, booth: boothId }).session(session);
}
