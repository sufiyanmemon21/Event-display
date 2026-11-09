import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import sharp from "sharp";

process.env.JWT_SECRET = "isolated-logo-test-secret-at-least-32-characters";
const { default: router } = await import("../src/routes/websitebrandingrouter.js");
const { default: Branding } = await import("../src/models/websitebrandingmodel.js");
const { default: User } = await import("../src/models/authmodel.js");
const { createToken } = await import("../src/middleware/authmiddleware.js");

test("website logo authorization, validation, persistence contract and deletion", async () => {
  let stored = null;
  const original = [Branding.findById, Branding.findByIdAndUpdate, Branding.deleteOne, User.findById];
  Branding.findById = () => Object.assign(Promise.resolve(stored), { select: async () => stored });
  Branding.findByIdAndUpdate = async (id, update) => { assert.equal(id, "website"); stored = update.$set; return stored; };
  Branding.deleteOne = async () => { stored = null; };
  const admin = { _id: "507f1f77bcf86cd799439011", role: "admin", tokenVersion: 0 };
  const attendee = { ...admin, _id: "507f1f77bcf86cd799439012", role: "attendee" };
  User.findById = async id => id === admin._id ? admin : attendee;
  const app = express();
  app.use("/website-settings", router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = "http://127.0.0.1:" + server.address().port + "/website-settings/logo";
  const auth = { Authorization: "Bearer " + createToken(admin) };
  try {
    assert.equal((await fetch(base).then(r => r.json())).hasLogo, false);
    assert.equal((await fetch(base, { method: "DELETE" })).status, 401);
    assert.equal((await fetch(base, { method: "DELETE", headers: { Authorization: "Bearer " + createToken(attendee) } })).status, 403);
    const upload = async (bytes, name) => {
      const body = new FormData();
      body.append("logo", new Blob([bytes], { type: "image/png" }), name);
      return fetch(base, { method: "PUT", headers: auth, body });
    };
    const png = await sharp({ create: { width: 10, height: 10, channels: 4, background: "#87584d" } }).png().toBuffer();
    let response = await upload(png, "brand.png");
    assert.equal(response.status, 200);
    const saved = await response.json();
    assert.equal(saved.filename, "brand.png");
    assert.equal(saved.hasLogo, true);
    assert.deepEqual(await fetch(base).then(r => r.json()), saved);
    response = await fetch(base + "/image?v=" + saved.version);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await sharp(Buffer.from(await response.arrayBuffer())).metadata()).format, "webp");
    assert.equal((await upload("invalid", "bad.png")).status, 400);
    assert.equal((await fetch(base).then(r => r.json())).version, saved.version);
    assert.equal((await upload(new Uint8Array(1024 * 1024 + 1), "large.png")).status, 400);
    response = await upload(png, "replacement.png");
    assert.notEqual((await response.json()).version, saved.version);
    assert.equal((await fetch(base, { method: "DELETE", headers: auth })).status, 200);
    assert.equal((await fetch(base).then(r => r.json())).hasLogo, false);
    assert.equal((await fetch(base + "/image")).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
    [Branding.findById, Branding.findByIdAndUpdate, Branding.deleteOne, User.findById] = original;
  }
});
