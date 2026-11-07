import mongoose from "mongoose";
import "dotenv/config";

let connecting;

export default function database() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!connecting) {
    if (!process.env.MONGODB_URL?.trim()) {
      return Promise.reject(new Error("MONGODB_URL is missing"));
    }
    connecting = mongoose.connect(process.env.MONGODB_URL.trim(), {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }).finally(() => {
      connecting = undefined;
    });
  }
  return connecting;
}
