import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { passVerificationUrl } from "../src/services/passurl.js";

test("passes use the public website and reject local URL configuration", () => {
  assert.equal(passVerificationUrl("token", "").origin, "https://event-display-frontend.vercel.app");
  assert.equal(passVerificationUrl("token", "https://events.example.com").pathname, "/passes/verify");
  for (const url of ["http://localhost:5173", "https://localhost", "https://127.0.0.1", "https://user:password@example.com"]) assert.throws(() => passVerificationUrl("token", url));
});

test("each booking has a different signed pass ID", () => {
  const token = id => jwt.sign({}, "isolated-test-key", { subject: id, jwtid: id, algorithm: "HS256", noTimestamp: true });
  const first = passVerificationUrl(token("booking-one"), "");
  const second = passVerificationUrl(token("booking-two"), "");
  assert.notEqual(first.href, second.href);
  const payload = jwt.verify(first.hash.slice(1), "isolated-test-key", { algorithms: ["HS256"] });
  assert.equal(payload.sub, "booking-one");
  assert.equal(payload.jti, "booking-one");
});
