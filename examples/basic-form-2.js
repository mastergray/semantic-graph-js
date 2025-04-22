import SemanticGraph from "../src/index.js";

// Initialize graph
const form = SemanticGraph.init({ debug: true });

// Bind raw fields
form
  .binding("email", { value: "" })
  .binding("password", { value: "" })

  // Form node to merge email + password
  .binding("form", {
    value: { email: "", password: "" },
    merge: async ([email, password]) => ({ email, password })
  })

  // Submission event (fires only if form is valid)
  .binding("formSent", { value: false });

// Projection: build form object from inputs
form.define("form", [
  SemanticGraph.from(["email", "password"], [
    {
      // Always propagate inputs to form
      as: async ([email, password]) => ({ email, password })
    }
  ])
]);

// Effect: submit only if valid
form.effect(["email", "password"], {
  when: async ([email, password]) =>
    email.length > 0 && password.length >= 8,
  run: async ([email, password]) => {
    const formData = { email, password };
    console.log("SUBMIT:", formData);
    await form.update("formSent", true);
  }
});


// Run test
(async () => {
  console.log("--- Test 1: Empty values ---");
  await form.update("email", "");
  await form.update("password", "");

  console.log("--- Test 2: Only email ---");
  await form.update("email", "a@b.com");

  console.log("--- Test 3: Valid email + password ---");
  await form.update("password", "12345678");

  const sent = form.getNode("formSent").value;
  console.log("formSent =", sent);
})();
