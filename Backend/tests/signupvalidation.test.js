import test from "node:test";
import assert from "node:assert/strict";
import { validSignupEmail, validSignupPassword } from "../src/services/signupvalidation.js";
import { validSignupEmail as frontendEmail, validSignupPassword as frontendPassword } from "../../Frontend/src/lib/signupValidation.js";

test("signup rejects malformed emails and accepts ordinary provider addresses", () => {
  for (const validate of [validSignupEmail, frontendEmail]) {
    for (const email of ["./test@gmail.com", ".test@gmail.com", "test.@gmail.com", "test..name@gmail.com", "test@gmail", "test @gmail.com", "test@-example.com", ""]) assert.equal(validate(email), false, email);
    for (const email of ["test@gmail.com", "first.last@example.com", "person+events@company.co.uk"]) assert.equal(validate(email), true, email);
  }
});

test("signup passwords require length and every requested character type", () => {
  for (const validate of [validSignupPassword, frontendPassword]) {
    for (const password of ["Ab1!", "lowercase1!", "UPPERCASE1!", "NoNumbers!", "NoSymbols123", "Password1 ", "Aa1!" + "x".repeat(69)]) assert.equal(validate(password), false);
    assert.equal(validate("Password1!"), true);
    assert.equal(validate("Aa1!" + "x".repeat(68)), true);
  }
});
