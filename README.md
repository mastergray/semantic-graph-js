# semantic-graph

A declarative graph runtime for modeling semantics and meaning propagation—rather than just data or event flow.

---

## Overview

**semantic-graph** is a reactive graph system built around the idea of _meaningful projection_. Instead of just wiring values together, nodes in a `semantic-graph` are defined by semantic relationships—encoded as reusable projection rules. This enables precise modeling of logical structure, reactive state, and contextual interpretation.

---

## Key Concepts

### 🔹 Nodes
A **Node** holds a named value. It can:
- Receive updates (`update(name, value)`)
- Be defined in terms of other nodes (`define(name, projection)`)
- Be constrained (`binding(name, { constraint })`)
- Broadcast to other nodes through **Edges**

### 🔹 Edges
An **Edge** links one or more input nodes to an output node via a transform (called `as`) and an optional constraint (`when`). It carries semantic meaning: it expresses _how_ a value should be projected from other values.

### 🔹 Projections
A **Projection** describes how a node’s value is _defined_ in terms of others. This is the core unit of meaning.

Use `graph.from([...inputs], rules)` to create a projection. Rules are objects with `as` and optional `when` fields:
```js
{
  as: ([a, b]) => a + b,
  when: ([a, b]) => typeof a === 'number' && typeof b === 'number'
}
```

---

## What Makes It Semantic?

### 1. **Named Contextual Relationships**
Each node represents a named concept or variable. Projections define how a node's value is _interpreted_ in terms of other nodes—contextualizing its meaning.

### 2. **Declarative Meaning via Projection**
A node is not just "linked" to other nodes; it's **defined by rules** about how to compute its value. This rule expresses what the node _means_ in terms of others.

```js
graph.define("formValid", graph.from(
  ["emailError", "nameError"],
  {
    as: ([email, name]) => email == null && name == null
  }
));
```

This is a semantic declaration: "`formValid` is true _if and only if_ there are no errors."

### 3. **Constraints Embed Interpretability**
Each edge can specify `when` a projection is meaningful. These are semantic constraints—not just guards—which encode logic about valid contexts.

### 4. **Composable Meaning Layers**
Since projections are modular, layers of meaning can be built up. One node can depend on the semantic resolution of others, leading to nested or hierarchical interpretation.

### 5. **Modal and Epistemic Semantics**
The projection model generalizes to modal logic: nodes can represent possible states, beliefs, or knowledge. Constraints allow meaning to shift based on context, making `semantic-graph` suitable for reactive UI logic, interactive fiction, or truth-as-a-service.

---

## Usage Example

```js
import SemanticGraph from "semantic-graph";

const graph = SemanticGraph.init({ debug: true });

// Bind inputs
graph
  .binding("email", { value: "" })
  .binding("emailError")
  .binding("formValid");

// Email validation
graph.define("emailError", graph.from(["email"], {
  as: ([email]) => email.includes("@") ? null : "Invalid email"
}));

// Form validity: no error = valid
graph.define("formValid", graph.from(["emailError"], {
  as: ([error]) => error == null
}));

await graph.update("email", "foo@bar.com"); // formValid becomes true
```

---

## API Summary


## API Summary

| Method                        | Type     | Description                                                                                   |
|------------------------------|----------|-----------------------------------------------------------------------------------------------|
| `binding(name, { ... })`     | Instance | Creates a named node with optional value, merge function, and constraint.                    |
| `define(name, projections)`  | Instance | Defines a node’s value via projections (declarative dependencies).                           |
| `update(name, value)`        | Async    | Sends a new value into a node and triggers propagation.                                      |
| `force(name)`                | Async    | Forces propagation of a node’s current value, bypassing update checks.                      |
| `effect(inputs, { ... })`    | Instance | Runs a side effect when given inputs meet a constraint.                                      |
| `getNode(name)`              | Instance | Retrieves a node object from the graph.                                                      |
| `SemanticGraph.from(...)`    | Static   | Creates a projection from input nodes to a target. `rules` can be one or more `{ as, when }`. |
| `SemanticGraph.init(...)`    | Static   | Instantiates a graph with optional nodes and debug flag.                                     |
| `SemanticGraph.lookupByName` | Static   | Fetches node instances by name from a map (internal utility).                                |


---

## Status
Early alpha. Use for experimentation and advanced modeling only. Expect breaking changes.

---

## License
MIT


