import mongoose from "mongoose";

const recoveryOtpSchema = new mongoose.Schema(
  { hash: String, expiresAt: Date, resendAt: Date, attempts: Number },
  { _id: false }
);
const recoveryGrantSchema = new mongoose.Schema(
  { hash: String, expiresAt: Date },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    companyName: { type: String, trim: true, minlength: 2, maxlength: 150 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "exhibitor", "attendee"],
      default: "attendee",
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    recoveryOtp: { type: recoveryOtpSchema, select: false },
    recoveryGrant: { type: recoveryGrantSchema, select: false },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordResetRequestedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        delete result.password;
        delete result.tokenVersion;
        delete result.recoveryOtp;
        delete result.recoveryGrant;
        delete result.passwordResetToken;
        delete result.passwordResetExpires;
        delete result.passwordResetRequestedAt;
        delete result.__v;

        return result;
      },
    },
  }
);

userSchema.index({ "recoveryGrant.hash": 1 }, { sparse: true });

export default mongoose.model("User", userSchema);
