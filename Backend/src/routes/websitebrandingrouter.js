import express from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import WebsiteBranding from "../models/websitebrandingmodel.js";
import { authenticate, authorize } from "../middleware/authmiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1, fields: 0 } }).single("logo");
const metadata = logo => ({ hasLogo: Boolean(logo?.version), filename: logo?.filename || "", version: logo?.version || "" });
router.get("/logo", async (req, res) => {
  const logo = await WebsiteBranding.findById("website");
  res.set("Cache-Control", "no-store").json(metadata(logo));
});
router.get("/logo/image", async (req, res) => {
  const logo = await WebsiteBranding.findById("website").select("+data");
  res.set("Cache-Control", "no-store");
  if (!logo?.data?.length) return res.sendStatus(404);
  return res.set("X-Content-Type-Options", "nosniff").type("image/webp").send(Buffer.from(logo.data));
});
router.put("/logo", authenticate, authorize("admin"), (req, res, next) => {
  upload(req, res, error => error ? res.status(400).json({ msg: "Choose one logo image up to 1 MB." }) : next());
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "Choose a logo image." });
  let data;
  try {
    const image = sharp(req.file.buffer, { limitInputPixels: 24000000 });
    const info = await image.metadata();
    if (!["jpeg", "png", "webp", "heif"].includes(info.format) || (info.pages || 1) > 1) throw new Error("Invalid image");
    data = await image.rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
  } catch {
    return res.status(400).json({ msg: "Choose a valid, non-animated PNG, JPEG, WebP, or AVIF logo." });
  }
  const logo = await WebsiteBranding.findByIdAndUpdate("website", { $set: {
    data, filename: req.file.originalname.slice(0, 255), version: randomUUID(),
  } }, { upsert: true, new: true, runValidators: true });
  res.set("Cache-Control", "no-store").json(metadata(logo));
});
router.delete("/logo", authenticate, authorize("admin"), async (req, res) => {
  await WebsiteBranding.deleteOne({ _id: "website" });
  res.set("Cache-Control", "no-store").json(metadata(null));
});
export default router;
