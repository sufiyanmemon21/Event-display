import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import Attendee from "../src/models/attendeemodel.js";
import Event from "../src/models/eventmodel.js";
import User from "../src/models/authmodel.js";
import Exhibitor from "../src/models/exhibitormodel.js";
import { updateBookingStatus } from "../src/controllers/attendeecontroller.js";
import { verifyBookingPass } from "../src/controllers/bookingpasscontroller.js";
import { getPublicProfile } from "../src/controllers/exhibitorprofilecontroller.js";
import { sortEventsUpcomingFirst } from "../src/services/eventdates.js";
import { publicEventFilter } from "../src/services/eventworkflow.js";
import { contactErrors } from "../../Frontend/src/lib/contactValidation.js";
import { bookingStatus } from "../../Frontend/src/lib/bookingStatus.js";

const id = "507f1f77bcf86cd799439011";
const admin = { _id: "507f1f77bcf86cd799439012", role: "admin" };
const query = value => Object.assign(Promise.resolve(value), { select: () => query(value), populate: () => query(value), sort: async () => value });
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, set() { return this; }, json(body) { this.body = body; return this; } });

test("admin can reverse decisions; rejection revokes new and legacy QR passes", async t => {
  process.env.JWT_SECRET = "isolated-booking-approval-test-secret";
  const booking = { _id: id, status: "Pending", event: { title: "Event", listingType: "event", approvalStatus: "Approved", date: new Date("2099-01-01") } };
  t.mock.method(Attendee, "findById", () => query(booking));
  t.mock.method(Attendee, "findOneAndUpdate", async (filter, update, options) => {
    assert.equal(options.runValidators, true);
    assert.ok(filter.status || filter.$or);
    Object.assign(booking, update.$set);
    return booking;
  });
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: id, issuer: "eventsphere-booking", audience: "eventsphere-entry", algorithm: "HS256" });
  for (const status of ["Approved", "Rejected", "Approved", "Cancelled", "Approved"]) {
    const res = response();
    await updateBookingStatus({ params: { id }, body: { status }, user: admin }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.status, status);
    const pass = response();
    await verifyBookingPass({ body: { token } }, pass);
    assert.equal(pass.code, status === "Approved" ? 200 : 404);
  }
  booking.status = "Confirmed";
  const legacy = response();
  await verifyBookingPass({ body: { token } }, legacy);
  assert.equal(legacy.code, 200);
  assert.equal(bookingStatus(booking.status), "Approved");
  const denied = response();
  await updateBookingStatus({ params: { id }, body: { status: "Rejected" }, user: { _id: id, role: "attendee" } }, denied);
  assert.equal(denied.code, 403);
  const invalid = response();
  await updateBookingStatus({ params: { id }, body: { status: "anything" }, user: admin }, invalid);
  assert.equal(invalid.code, 400);
  t.mock.method(Attendee, "findOneAndUpdate", async () => null);
  const stale = response();
  await updateBookingStatus({ params: { id }, body: { status: "Rejected" }, user: admin }, stale);
  assert.equal(stale.code, 409);
});

test("current Pakistan day and future events precede past events chronologically", () => {
  const events = [
    { _id: "old", date: "2026-11-11" },
    { _id: "later", date: "2026-11-15" },
    { _id: "today", date: "2026-11-13" },
    { _id: "tomorrow", date: "2026-11-14" },
    { _id: "yesterday", date: "2026-11-12" },
  ];
  const sorted = sortEventsUpcomingFirst(events, new Date("2026-11-12T20:00:00Z"));
  assert.deepEqual(sorted.map(event => event._id), ["today", "tomorrow", "later", "old", "yesterday"]);
  assert.equal(events[0]._id, "old");
});

test("contact and inquiry validation rejects punctuation, malformed email and phone", () => {
  const valid = { name: "Haris Ahmed", email: "haris@example.com", subject: "Wedding inquiry", message: "Please share wedding packages." };
  assert.deepEqual(contactErrors(valid), {});
  assert.deepEqual(contactErrors({ ...valid, name: "حارث احمد" }), {});
  for (const field of ["name", "email", "subject", "message", "phone"]) {
    assert.ok(contactErrors({ ...valid, [field]: "......." })[field]);
  }
  assert.ok(contactErrors({ ...valid, email: "name@site" }).email);
  assert.ok(contactErrors({ ...valid, email: "a..b@example.com" }).email);
  assert.ok(contactErrors({ ...valid, message: " ".repeat(20) }).message);
  assert.deepEqual(contactErrors({ name: valid.name, email: valid.email, message: valid.message }), {});
});

test("public exhibitor profile includes published managed events and only public company data", async t => {
  let selection;
  t.mock.method(User, "findOne", filter => {
    assert.equal(filter.role, "exhibitor");
    return { select(fields) { selection = fields; return Promise.resolve({ _id: id, name: "Exhibitor", companyName: "Company" }); } };
  });
  t.mock.method(Event, "find", filter => {
    assert.deepEqual(filter.$and[0], publicEventFilter);
    assert.deepEqual(filter.$and[1].$or, [{ reviewExhibitor: id }, { organizer: id }]);
    return query([{ _id: id, date: "2099-01-01" }]);
  });
  t.mock.method(Exhibitor, "find", filter => {
    assert.deepEqual(filter, { contactPerson: id, status: "Approved" });
    return query([{ _id: "published", event: { title: "Expo" } }, { _id: "hidden", event: null }]);
  });
  const res = response();
  await getPublicProfile({ params: { userId: id } }, res);
  assert.equal(selection, "name companyName");
  assert.equal(res.body.events.length, 1);
  assert.deepEqual(res.body.profiles.map(profile => profile._id), ["published"]);
  const invalid = response();
  await getPublicProfile({ params: { userId: "invalid" } }, invalid);
  assert.equal(invalid.code, 400);
});
