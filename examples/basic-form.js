import SemanticGraph from "../src/index.js";

const form = SemanticGraph.init({ debug: true });

form
  .binding("email", { value: "" })
  .binding("password", { value: "" });

form.effect(["email", "password"], {
  when: async ([email, password]) => email.length > 0 && password.length >= 8,
  run: async ([email, password]) => {
    console.log("SUBMIT:", { email, password });
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
})();
