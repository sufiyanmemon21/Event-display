import "dotenv/config";
import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import bcrypt from "bcrypt";
import { waitUntil } from "@vercel/functions";
import User from "../models/authmodel.js";
import sendEmail from "../configs/mailerconfig.js";
import recoveryEmail from "../presentation/recoveryemail.js";

const otpLifetime = 10 * 60_000;
const resendCooldown = 60_000;
const maxAttempts = 5;
const clearRecovery = {
  recoveryOtp: "",
  recoveryGrant: "",
  passwordResetToken: "",
  passwordResetExpires: "",
  passwordResetRequestedAt: "",
};
const invalidCode = "That code is invalid, expired, or has reached its attempt limit.";
const invalidGrant = "Your reset session has expired. Request a new code.";

function normalizeEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function hashOtp(email, otp) {
  return createHmac("sha256", process.env.RECOVERY_OTP_SECRET || process.env.JWT_SECRET)
    .update(JSON.stringify(["eventsphere-password-recovery", email, otp]))
    .digest("hex");
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function deliverOtp(email, otp, hash) {
  try {
    const { subject, html, text } = recoveryEmail(otp);
    await sendEmail(email, subject, html, text);
  } catch {
    console.error("Password recovery email delivery failed");
    // Preserve the cooldown and invalidate only this issuance.
    await User.updateOne(
      { email, "recoveryOtp.hash": hash },
      { $unset: { "recoveryOtp.hash": "" } }
    ).catch(() => console.error("Password recovery cleanup failed"));
  }
}

async function requestOtp(req, res) {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ msg: "Enter a valid email address." });

  if (!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim() ||
      !(process.env.RECOVERY_OTP_SECRET || process.env.JWT_SECRET)) {
    return res.status(503).json({ msg: "Password recovery is temporarily unavailable." });
  }

  const now = Date.now();
  let otp = String(randomInt(1_000_000)).padStart(6, "0");
  let hash = hashOtp(email, otp);
  const eligible = { email, "recoveryOtp.resendAt": { $not: { $gt: new Date(now) } } };
  const previous = await User.findOne(eligible).select("recoveryOtp.hash").lean();
  // A resend must change the code even if the random draw repeats.
  if (previous?.recoveryOtp?.hash === hash) {
    otp = String((Number(otp) + randomInt(1, 1_000_000)) % 1_000_000).padStart(6, "0");
    hash = hashOtp(email, otp);
  }

  const issued = await User.updateOne(
    {
      ...eligible,
      "recoveryOtp.hash": previous?.recoveryOtp?.hash ?? null,
    },
    {
      $set: {
        recoveryOtp: {
          hash,
          expiresAt: new Date(now + otpLifetime),
          resendAt: new Date(now + resendCooldown),
          attempts: 0,
        },
      },
      $unset: {
        passwordResetToken: "",
        passwordResetExpires: "",
        passwordResetRequestedAt: "",
      },
    }
  );

  if (issued.modifiedCount) {
    const delivery = deliverOtp(email, otp, hash);
    if (process.env.VERCEL === "1") waitUntil(delivery);
  }

  return res.json({ retryAfterMs: resendCooldown });
}

async function verifyOtp(req, res) {
  const email = normalizeEmail(req.body?.email);
  const otp = req.body?.otp;
  if (!email || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ msg: "Enter the six-digit code." });
  }

  const activeOtp = {
    email,
    "recoveryOtp.expiresAt": { $gt: new Date() },
    "recoveryOtp.attempts": { $lt: maxAttempts },
  };
  const hash = hashOtp(email, otp);
  const token = randomBytes(32).toString("hex");
  const verified = await User.updateOne(
    { ...activeOtp, "recoveryOtp.hash": hash },
    {
      $set: {
        recoveryGrant: { hash: hashToken(token), expiresAt: new Date(Date.now() + otpLifetime) },
      },
      // Keep the last hash only to prevent a resend from reusing that code.
      $unset: {
        "recoveryOtp.expiresAt": "",
        "recoveryOtp.attempts": "",
      },
    }
  );

  if (!verified.modifiedCount) {
    await User.updateOne(
      { ...activeOtp, "recoveryOtp.hash": { $exists: true, $ne: hash } },
      { $inc: { "recoveryOtp.attempts": 1 } }
    );
    return res.status(400).json({ msg: invalidCode });
  }

  return res.json({ token });
}

async function resetPassword(req, res) {
  const { token, password, confirmPassword } = req.body || {};
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({ msg: invalidGrant });
  }

  if (typeof password !== "string" || password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72 || !/\S/.test(password)) {
    return res.status(400).json({ msg: "Use at least 8 characters and at most 72 bytes." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match." });
  }

  const grant = { "recoveryGrant.hash": hashToken(token) };
  if (!(await User.exists({ ...grant, "recoveryGrant.expiresAt": { $gt: new Date() } }))) {
    return res.status(400).json({ msg: invalidGrant });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const updated = await User.updateOne(
    { ...grant, "recoveryGrant.expiresAt": { $gt: new Date() } },
    {
      $set: { password: hashedPassword },
      $inc: { tokenVersion: 1 },
      $unset: clearRecovery,
    }
  );

  if (!updated.modifiedCount) return res.status(400).json({ msg: invalidGrant });

  return res.json({ msg: "Your password has been updated." });
}

export { normalizeEmail, requestOtp, verifyOtp, resetPassword };
