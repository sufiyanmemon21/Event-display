import express from "express";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { ipKeyGenerator } from "express-rate-limit";
import RecoveryRate from "../models/recoveryratemodel.js";
import {
  normalizeEmail,
  requestOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/forgetcontroller.js";

const forgetrouter = express.Router();
const windowMs = 15 * 60_000;

function limitRequests(scope, limit, identify) {
  return async (req, res, next) => {
    const identity = identify(req);
    const secret = process.env.RECOVERY_OTP_SECRET || process.env.JWT_SECRET;
    if (!secret) return res.status(503).json({ msg: "Password recovery is temporarily unavailable." });
    if (!identity) return next();

    const windowEnd = (Math.floor(Date.now() / windowMs) + 1) * windowMs;
    const key = createHmac("sha256", secret)
      .update(JSON.stringify([scope, identity, windowEnd]))
      .digest("hex");

    const expiresAt = new Date(windowEnd);
    let record;
    try {
      record = await RecoveryRate.findOneAndUpdate(
        { _id: key },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
        { upsert: true, returnDocument: "after" }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      record = await RecoveryRate.findOneAndUpdate(
        { _id: key },
        { $inc: { count: 1 } },
        { returnDocument: "after" }
      );
    }

    if (record.count > limit) {
      const retryAfterMs = Math.max(0, windowEnd - Date.now());
      return res.set("Retry-After", String(Math.ceil(retryAfterMs / 1000))).status(429).json({
        msg: "Too many attempts. Try again later.",
        retryAfterMs,
      });
    }

    return next();
  };
}

function clientIp(req) {
  const forwarded = process.env.VERCEL === "1" && req.get("x-vercel-forwarded-for");
  return ipKeyGenerator(isIP(forwarded || "") ? forwarded : req.ip);
}

forgetrouter.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

forgetrouter.post(
  "/request-otp",
  limitRequests("request-ip", 20, clientIp),
  limitRequests("request-email", 5, (req) => normalizeEmail(req.body?.email)),
  requestOtp
);
forgetrouter.post("/verify-otp", limitRequests("verify-ip", 40, clientIp), verifyOtp);
forgetrouter.post("/resetPassword", limitRequests("reset-ip", 20, clientIp), resetPassword);

export default forgetrouter;
