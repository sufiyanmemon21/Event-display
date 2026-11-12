import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import Event from "../src/models/eventmodel.js";
import User from "../src/models/authmodel.js";
import Attendee from "../src/models/attendeemodel.js";
import Booth from "../src/models/boothmodel.js";
import Exhibitor from "../src/models/exhibitormodel.js";
import BoothHold from "../src/models/boothholdmodel.js";
import { createEvent, updateEvent } from "../src/controllers/eventcontroller.js";
import { reviewEvent } from "../src/controllers/eventreviewcontroller.js";
import { registerAttendee, updateBookingStatus, getAttendees } from "../src/controllers/attendeecontroller.js";
import { checkInBookingPass } from "../src/controllers/bookingpasscontroller.js";
import { claimBooth, releaseBooth } from "../src/services/boothholds.js";
import { canReviewEvent, isPublished } from "../src/services/eventworkflow.js";

const id = "507f1f77bcf86cd799439011";
const reviewer = { _id: "507f1f77bcf86cd799439012", role: "exhibitor" };
const admin = { _id: "507f1f77bcf86cd799439013", role: "admin" };
const listing = { _id: id, title: "Wedding", description: "Wedding celebration", location: "Karachi", category: "Wedding", listingType: "event", date: "2099-11-12", reviewExhibitor: reviewer._id };
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, set() { return this; }, json(body) { this.body = body; return this; } };
}
const query = value => ({ select: () => query(value), populate: () => query(value), sort: async () => value, session: async () => value, then: (resolve, reject) => Promise.resolve(value).then(resolve, reject) });

test("new Events need an assigned exhibitor, start pending, and preserve covers on edits", async t => {
  t.mock.method(User, "exists", async () => true);
  t.mock.method(Event, "create", async value => value);
  let res = response();
  await createEvent({ body: { ...listing, reviewExhibitor: "" }, user: admin }, res);
  assert.equal(res.code, 400);
  res = response();
  await createEvent({ body: listing, user: admin }, res);
  assert.equal(res.code, 201);
  assert.equal(res.body.event.approvalStatus, "Pending");
  assert.equal(res.body.event.reviewExhibitor, reviewer._id);
  assert.equal(isPublished(res.body.event), false);
  res = response();
  await createEvent({ body: { ...listing, date: "2000-01-01" }, user: admin }, res);
  assert.equal(res.code, 400);
  res = response();
  await createEvent({ body: { ...listing, date: "2099-02-31" }, user: admin }, res);
  assert.equal(res.code, 400);
  res = response();
  await createEvent({ body: { ...listing, listingType: "expo" }, user: { ...reviewer, role: "organizer" } }, res);
  assert.equal(res.code, 403);
  const existing = { ...listing, date: new Date(listing.date), organizer: admin._id, hasImage: true, coverData: Buffer.from("existing cover"), approvalStatus: "Approved", async save() {} };
  t.mock.method(Event, "findById", async () => existing);
  res = response();
  await updateEvent({ params: { id }, body: listing, user: admin }, res);
  assert.equal(res.code, 200);
  assert.equal(existing.coverData.toString(), "existing cover");
  assert.equal(existing.approvalStatus, "Pending");
});

test("review authority and stale listing protection", async t => {
  assert.equal(canReviewEvent(admin, listing), false);
  assert.equal(canReviewEvent(reviewer, listing), true);
  assert.equal(canReviewEvent({ ...reviewer, _id: id }, listing), false);
  assert.equal(canReviewEvent(reviewer, { ...listing, listingType: "expo" }), false);
  assert.equal(canReviewEvent(admin, { ...listing, listingType: "expo" }), true);
  const event = { ...listing, approvalStatus: "Pending", updatedAt: new Date(), date: new Date(listing.date) };
  t.mock.method(Event, "findById", async () => event);
  t.mock.method(Event, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter.reviewExhibitor, reviewer._id);
    return { ...event, ...update.$set };
  });
  let res = response();
  await reviewEvent({ params: { id }, body: { status: "Approved", updatedAt: event.updatedAt }, user: admin }, res);
  assert.equal(res.code, 403);
  res = response();
  await reviewEvent({ params: { id }, body: { status: "Approved", updatedAt: "2000-01-01" }, user: reviewer }, res);
  assert.equal(res.code, 409);
  res = response();
  await reviewEvent({ params: { id }, body: { status: "Approved", updatedAt: event.updatedAt }, user: reviewer }, res);
  assert.equal(res.body.event.approvalStatus, "Approved");
});

test("bookings start pending and only the assigned reviewer can approve", async t => {
  const event = { ...listing, approvalStatus: "Approved" };
  t.mock.method(Event, "findById", async () => event);
  t.mock.method(Attendee, "init", async () => {});
  t.mock.method(Attendee, "exists", async () => false);
  t.mock.method(Attendee, "create", async value => value);
  let res = response();
  await registerAttendee({ body: { event: id }, user: { _id: id } }, res);
  assert.equal(res.body.registration.status, "Pending");
  event.approvalStatus = "Pending";
  res = response();
  await registerAttendee({ body: { event: id }, user: { _id: id } }, res);
  assert.equal(res.code, 409);
  event.approvalStatus = "Approved";
  event.date = new Date("2000-01-01");
  res = response();
  await registerAttendee({ body: { event: id }, user: { _id: id } }, res);
  assert.equal(res.code, 201);
  t.mock.method(Attendee, "findById", () => query({ event, status: "Pending" }));
  t.mock.method(Attendee, "findOneAndUpdate", async (_, update) => update.$set);
  res = response();
  await updateBookingStatus({ params: { id }, body: { status: "Confirmed" }, user: admin }, res);
  assert.equal(res.code, 403);
  res = response();
  await updateBookingStatus({ params: { id }, body: { status: "Confirmed" }, user: reviewer }, res);
  assert.equal(res.body.status, "Confirmed");
  event.listingType = "expo";
  res = response();
  await registerAttendee({ body: { event: id }, user: { _id: id } }, res);
  assert.equal(res.code, 409);
  t.mock.method(Event, "find", filter => { assert.deepEqual(filter, { reviewExhibitor: reviewer._id }); return query([{ _id: id }]); });
  t.mock.method(Attendee, "find", filter => { assert.deepEqual(filter, { $and: [{ event: { $in: [id] } }, { event: admin._id }] }); return query([]); });
  res = response();
  await getAttendees({ user: reviewer, query: { event: admin._id } }, res);
  assert.deepEqual(res.body.attendees, []);
});

test("QR check-in rejects invalid, unconfirmed, unauthorized and wrong-date tickets; repeat scans are idempotent", async t => {
  process.env.JWT_SECRET = "isolated-checkin-test-secret";
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: id, issuer: "eventsphere-booking", audience: "eventsphere-entry", algorithm: "HS256" });
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map(part => [part.type, part.value]));
  const booking = { status: "Confirmed", event: { ...listing, date: new Date(`${parts.year}-${parts.month}-${parts.day}`) } };
  t.mock.method(Attendee, "findById", () => query(booking));
  let writes = 0;
  t.mock.method(Attendee, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter.checkedInAt, null);
    assert.deepEqual(filter.$or, [{ status: "Confirmed" }, { status: { $exists: false } }]);
    if (booking.checkedInAt) return null;
    writes++;
    Object.assign(booking, update.$set);
    return booking;
  });
  const scan = async (user = reviewer, pass = token) => { const res = response(); await checkInBookingPass({ user, body: { token: pass } }, res); return res; };
  assert.equal((await scan(reviewer, "bad")).code, 400);
  assert.equal((await scan(admin)).code, 403);
  booking.status = "Pending";
  assert.equal((await scan()).code, 409);
  booking.status = "Confirmed";
  const date = booking.event.date;
  booking.event.date = new Date("2099-11-12");
  assert.equal((await scan()).code, 409);
  booking.event.date = date;
  assert.equal((await scan()).body.alreadyCheckedIn, false);
  assert.equal((await scan()).body.alreadyCheckedIn, true);
  assert.equal(writes, 1);
  booking.status = "Cancelled";
  assert.equal((await scan()).code, 409);
});

test("booth holds allow one reservation per exhibitor per Expo", async t => {
  const expoA = "507f1f77bcf86cd799439021";
  const expoB = "507f1f77bcf86cd799439022";
  const applicationA = { _id: "507f1f77bcf86cd799439031", boothNumber: "", event: expoA };
  const applicationB = { _id: "507f1f77bcf86cd799439032", boothNumber: "", event: expoB };
  const applications = [applicationA, applicationB];
  t.mock.method(Exhibitor, "find", filter =>
    query(applications.filter(item => item.event === filter.event)),
  );
  t.mock.method(Booth, "exists", filter =>
    query([...holds.values()].some(hold => filter.reservedBy.$in.includes(hold.applicationId))),
  );
  const holds = new Map();
  t.mock.method(BoothHold, "create", async ([hold]) => {
    const key = `${hold.user}:${hold.event}`;
    if (holds.has(key)) throw Object.assign(new Error("Duplicate hold"), { code: 11000 });
    holds.set(key, { ...hold, applicationId: applications.find(item => item.event === hold.event)?._id });
  });
  t.mock.method(BoothHold, "deleteOne", filter => ({
    session: async () => {
      const key = `${filter.user}:${filter.event}`;
      if (holds.get(key)?.booth === filter.booth) holds.delete(key);
    },
  }));
  await claimBooth(reviewer._id, "booth-b1", expoB, {});
  assert.equal(holds.size, 1);
  await releaseBooth(reviewer._id, "booth-b1", expoB, {});
  const concurrent = await Promise.allSettled([
    claimBooth(reviewer._id, "booth-b2", expoB, {}),
    claimBooth(reviewer._id, "booth-b3", expoB, {}),
  ]);
  assert.equal(concurrent.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(concurrent.filter(result => result.status === "rejected").length, 1);
  await claimBooth(reviewer._id, "booth-a1", expoA, {});
  assert.equal(holds.size, 2);
  await assert.rejects(claimBooth(reviewer._id, "booth-a2", expoA, {}), { status: 409 });
  await releaseBooth(reviewer._id, "wrong-booth", expoB, {});
  assert.equal(holds.size, 2);
  await releaseBooth(reviewer._id, holds.get(`${reviewer._id}:${expoB}`).booth, expoB, {});
  assert.equal(holds.size, 1);
});


test("exhibitors create regular Events but cannot create Expos", async t => {
  let writes = 0;
  t.mock.method(Event, "create", async value => { writes++; return value; });
  let res = response();
  await createEvent({ body: { ...listing, reviewExhibitor: admin._id }, user: reviewer }, res);
  assert.equal(res.code, 201);
  assert.equal(res.body.event.organizer, reviewer._id);
  assert.equal(res.body.event.reviewExhibitor, reviewer._id);
  assert.equal(res.body.event.approvalStatus, "Pending");
  res = response();
  await createEvent({ body: { ...listing, listingType: "expo" }, user: reviewer }, res);
  assert.equal(res.code, 403);
  assert.equal(writes, 1);
});
