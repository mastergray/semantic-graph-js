// Extreme Form Test
import SemanticGraph from "../src/index.js";

const graph = SemanticGraph.init({ debug: true });

graph
  // Fields
  .binding("email", { value: "" })
  .binding("firstName", { value: "" })
  .binding("lastName", { value: "" })
  .binding("age", { value: "" })
  .binding("country", { value: "" })
  .binding("zip", { value: "" })

  // Errors
  .binding("emailError", { value: null })
  .binding("firstNameError", { value: null })
  .binding("lastNameError", { value: null })
  .binding("ageError", { value: null })
  .binding("countryError", { value: null })
  .binding("zipError", { value: null })

  // Form valid flag
  .binding("formValid", { value: false });

graph
  .define("emailError", SemanticGraph.from(["email"], {
    as: ([v]) => v.includes("@") ? null : "Invalid email"
  }))
  .define("firstNameError", SemanticGraph.from(["firstName"], {
    as: ([v]) => v.length >= 2 ? null : "First name too short"
  }))
  .define("lastNameError", SemanticGraph.from(["lastName"], {
    as: ([v]) => v.length >= 2 ? null : "Last name too short"
  }))
  .define("ageError", SemanticGraph.from(["age"], {
    as: ([v]) => /^\d+$/.test(v) && +v >= 18 ? null : "Must be 18+"
  }))
  .define("countryError", SemanticGraph.from(["country"], {
    as: ([v]) => v.length >= 2 ? null : "Country required"
  }))
  .define("zipError", SemanticGraph.from(["zip", "country"], {
    as: ([zip, country]) => {
      if (country === "US") return /^\d{5}$/.test(zip) ? null : "US ZIP required";
      return zip.length > 0 ? null : "ZIP required";
    }
  }))
  .define("formValid", SemanticGraph.from([
    "emailError",
    "firstNameError",
    "lastNameError",
    "ageError",
    "countryError",
    "zipError"
  ], {
    as: ([e1, e2, e3, e4, e5, e6]) =>
      [e1, e2, e3, e4, e5, e6].every(v => v == null)
  }));

graph.effect(
  ["formValid", "email", "firstName", "lastName", "age", "country", "zip"],
  {
    when: ([v]) => v === true,
    run: ([_, email, firstName, lastName, age, country, zip]) =>
      console.log("SUBMIT:", { email, firstName, lastName, age, country, zip })
  }
);

// Test sequence
await graph.update("email", "");
await graph.update("firstName", "");
await graph.update("lastName", "");
await graph.update("age", "");
await graph.update("country", "");
await graph.update("zip", "");

await graph.update("firstName", "Alan");
await graph.update("lastName", "Turing");
await graph.update("email", "alan@ai.org");
await graph.update("age", "17");
await graph.update("country", "US");
await graph.update("zip", "abc");

await graph.update("age", "41");
await graph.update("zip", "12345");
