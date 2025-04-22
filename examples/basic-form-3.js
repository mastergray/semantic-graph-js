import SemanticGraph from "../src/index.js";

const form = SemanticGraph.init({ debug: true });

form
  .binding("email", { value: "" })
  .binding("password", { value: "" })
  .binding("form", {
    value: {},
    merge: async ([email, password]) => ({ email, password })
  })
  .binding("formSent", { value: false });

// Propagate email/password into `form`
form.define("form", [
  SemanticGraph.from(["email", "password"], [
    { as: async ([email, password]) => [email, password] }
  ])
]);

// Trigger `formSent` only when form is valid
form.effect(["email", "password"], {
  when: async ([email, password]) => email.length > 0 && password.length >= 8,
  run: async () => {
    const formData = form.getNode("form").value;
    console.log("SUBMIT:", formData);
    await form.update("formSent", true);
  }
});

(async () => {
  console.log("--- Test 1: Empty values ---");
  await form.update("email", "");
  await form.update("password", "");
  
  console.log("--- Test 2: Only email ---");
  await form.update("email", "a@b.com");

  console.log("--- Test 3: Valid email + password ---");
  await form.update("password", "12345678");
  console.log("formSent =", form.getNode("formSent").value);

  console.log("--- Test 4: Revert password to invalid ---");
  await form.update("password", "123");
  console.log("formSent =", form.getNode("formSent").value);

  console.log("--- Test 5: Re-validate and trigger again ---");
  await form.update("formSent", false); // Reset manually
  await form.update("password", "12345678");
  console.log("formSent =", form.getNode("formSent").value);
})();
