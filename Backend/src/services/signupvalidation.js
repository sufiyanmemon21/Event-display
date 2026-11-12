export function validSignupEmail(value) {
  if (typeof value !== "string") return false;
  const email = value.trim();
  if (email.length > 254) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length <= 64 && /^[a-zA-Z0-9_+-]+(?:[.][a-zA-Z0-9_+-]+)*$/.test(local) &&
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?[.])+[a-zA-Z]{2,63}$/.test(domain);
}

export function validSignupPassword(password) {
  return typeof password === "string" && password.length >= 8 &&
    new TextEncoder().encode(password).length <= 72 && /[A-Z]/.test(password) &&
    /[a-z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9\s]/.test(password);
}
