import { validSignupEmail } from "./signupValidation.js";

export function contactErrors(values) {
  const errors = {};
  const name = String(values.name || "").trim();
  if (name.length < 2 || name.length > 80 || !/\p{L}/u.test(name)) {
    errors.name = "Enter your name (2–80 characters, including letters).";
  }
  if (!validSignupEmail(values.email)) errors.email = "Enter a valid email address, such as name@example.com.";
  if (values.phone?.trim() && (!/^\+?[\d ()-]+$/.test(values.phone.trim()) ||
      values.phone.replace(/\D/g, "").length < 7 || values.phone.replace(/\D/g, "").length > 15)) {
    errors.phone = "Enter a phone number with 7–15 digits.";
  }
  for (const [field, min, max] of [["subject", 3, 150], ["message", 5, 2000]]) {
    if (field === "subject" && !(field in values)) continue;
    const value = String(values[field] || "").trim();
    if (value.length < min || value.length > max || !/[\p{L}\p{N}]/u.test(value)) {
      errors[field] = `Enter a meaningful ${field} (${min}–${max} characters).`;
    }
  }
  return errors;
}

export function validateContactForm(form) {
  const values = Object.fromEntries(new FormData(form));
  const errors = contactErrors(values);
  for (const field of ["name", "email", "phone", "subject", "message"]) {
    form.elements.namedItem(field)?.setCustomValidity(errors[field] || "");
  }
  return form.reportValidity();
}

export function clearContactValidity(event) {
  event.target.setCustomValidity?.("");
}
