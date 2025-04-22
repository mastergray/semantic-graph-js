// Dependencies:
import SemanticGraphNode from "./SemanticGraphNode/index.js";
import SemanticGraphEdge from "./SemanticGraphEdge/index.js";
import { SemanticGraphFromProjection } from "./SemanticGraphProjection/index.js";

// Reactive value propagation using graph-like structure:
export default class SemanticGraph {
    
    // CONSTRUCTOR :: MAP<STRING, NODE>|VOID, BOOL|VOID -> this;
    constructor(nodes, debug) {
        this.nodes = nodes ?? new Map();   // Stores nodes by node name
        this.debug = debug;                // Determines if debugging is enabled
    }

    /**
     * 
     *  Instance Methods 
     * 
     */

    // :: STRING, {value:*, constraint:(*, NODE -> PROMISE(BOOL))|VOID, merge:(*, NODE -> PROMISE(*))} -> this
    // Adds named node to graph:
    binding(name, {value, constraint, merge, debug}) {

        // Ensure name is unqiue for graph:
        // TODO: Probably should have a SemanticGraphError:
        if (this.nodes.has(name)) {
            throw new Error(`NODE ${name} already exists for this graph`);
        }

        // Initialize and store node:
        const node = new SemanticGraphNode(name, value, [], constraint, merge, debug ?? this.debug);
        this.nodes.set(name, node);

        return this;

    }

    // :: STRING -> NODE
    // Returns node by name, otherwise throws an error:
    getNode(name) {
        const node = this.nodes.get(name);
        if (node !== undefined) {
            return node;
        }
        throw new Error(`No "${name}" NODE Found`);
    }

    // :: STRING, PROJECT|[PROJECTION] -> this
    // Defines a node's value in terms of reusable projections that describe its semantic dependencies.:
    // NOTE: This idea here is to "define" a node by where, how and when it gets values from other nodes:
    define(name, projections) {
        const target = this.getNode(name);
        const list = Array.isArray(projections) ? projections : [projections];
        
        for (const p of list) {
            if (!p.applyTo) throw new Error("Expected projection object with applyTo()");
            const edges = p.applyTo(this);
            for (const edge of edges) edge.propagateTo(target);
        }
        
        return this;
    }
      
    // :: STRING, * -> PROMISE(this)
    // Updates given node with given value:
    async update(name, value) {
        const node = this.getNode(name);
        await node.update(value);
        return this;
    }

    // :: STRING -> this;
    // "Forces" propagation of node if stored value of node still passes constraint:
    async force(name) {
        const node = this.getNode(name);
        await node.force();
        return this;
    }

    // :: [STRING], {run:([*], EDGE -> PROMISE(VOID)), when:([*], EDGE -> PROMISE(BOOL))} -> this
    // Creates an edge with no input that "run" the given function "when" some condition is met:
    effect(inputNodes, {run, when}) {
        SemanticGraphEdge.init({
            "input": inputNodes.map((node) => this.getNode(node)),
            "transform":run,
            "constraint":when,
            "debug":this.debug,
        });
        return this;
    }
      
    /**
     * 
     *  Static Methods
     *  
     */

    // Static Factory Method :: {nodes:MAP|VOID, debug:BOOL|VOID} -> semanticGraph
    static init(config) {
        config = config ?? {}
        const {nodes, debug} = config
        return new SemanticGraph(nodes, debug);
    }

    // :: [STRING], MAP -> [OBJECT]
    // Returns all entries from the given map for the given array of names:
    static lookupByName(names, map) {
        return names.reduce((result, name) => {
            const entry = map.get(name);
            if (entry !== undefined) {
                result.push(entry);
            }
            return result;
        }, []);
    }

    // :: [STRING], [{as:([*], EDGE -> PROMISE(*))|VOID, when:([*], EDGE -> PROMISE(BOOL))|VOID}]|RULE -> PROJECTION
    // Returns an array of edges for the given input nodes and their "projections":
    static from(inputNodes, rules) {
        if (!Array.isArray(rules)) rules = [rules];
        return new SemanticGraphFromProjection(inputNodes, rules);
    }

}