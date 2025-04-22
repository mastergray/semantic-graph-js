import SemanticGraph from "../src/index.js";

const form = SemanticGraph.init({ debug: true });

form
  .binding("email", { value: "" })
  .binding("firstName", { value: "" })
  .binding("lastName", { value: "" })
  .binding("age", { value: "" })
  .binding("emailError", { value: null })
  .binding("firstNameError", { value: null })
  .binding("lastNameError", { value: null })
  .binding("ageError", { value: null })
  .binding("formValid", { value: false });

// Per-field validation
form.define("emailError", SemanticGraph.from(["email"], {
  as: ([email]) => email.includes("@") ? null : "Invalid email"
}));

form.define("firstNameError", SemanticGraph.from(["firstName"], {
  as: ([name]) => name.length > 0 ? null : "First name required"
}));

form.define("lastNameError", SemanticGraph.from(["lastName"], {
  as: ([name]) => name.length > 0 ? null : "Last name required"
}));

form.define("ageError", SemanticGraph.from(["age"], {
  as: ([age]) => /^\d+$/.test(age) ? null : "Age must be a number"
}));

// All fields must be valid
form.define("formValid", SemanticGraph.from([
  "emailError", "firstNameError", "lastNameError", "ageError"
], {
  as: ([e1, e2, e3, e4]) => [e1, e2, e3, e4].every(v => v == null)
}));

// Submission effect
form.effect(["formValid", "email", "firstName", "lastName", "age"], {
  when: ([isValid]) => isValid === true,
  run: ([_, email, firstName, lastName, age]) => {
    console.log("SUBMIT:", { email, firstName, lastName, age });
  }
});

// Test run
(async () => {
  console.log("--- Test 1: All empty ---");
  await form.update("email", "");
  await form.update("firstName", "");
  await form.update("lastName", "");
  await form.update("age", "");

  console.log("--- Test 2: Partial valid ---");
  await form.update("firstName", "Alan");
  await form.update("lastName", "Turing");

  console.log("--- Test 3: Fix email ---");
  await form.update("email", "alan@ai.org");

  console.log("--- Test 4: Fix age ---");
  await form.update("age", "41");
})();
