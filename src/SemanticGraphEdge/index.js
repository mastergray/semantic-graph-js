// Dependencies:
import SemanticGraphNode from "../SemanticGraphNode/index.js"; // For ensuring a value is a node:

// Determines where, when, and how values are propagated through the graph:
// NOTE: An edge is a directed, constraint-guarded semantic projection from a fixed set of input nodes to zero or more output nodes.
// NOTE: All propagation is rooted in state and must pass through a defined transformation.
export default class SemanticGraphEdge {

    // Static symbol used by debugging for "naming" no output nodes:
    static NO_OUTPUT_NODE = Symbol("NO_OUTPUT_NODE");

    // Instance fields:
    inputNodes = [];    // Where values come from
    outputNodes = [];   // Where values go

    // CONSTRUCTOR :: [NODE], [NODE]|VOID, (*, EDGE -> PROMISE(BOOL))|VOID, (*, EDGE -> PROMISE(*))|VOID, BOOL|VOID -> this
    constructor(inputNodes, outputNodes = [], constraint, transform, debug) {

        // Ensure a non-empty array is provided for input nodes:
        if (!Array.isArray(inputNodes) || inputNodes.length === 0) {
            throw new Error("No non-empty array of input nodes provided for this edge");
        }
        
        // Ensure each input node is actually a NODE:
        for (const inputNode of inputNodes) {
            this.propagateFrom(inputNode);
        }

        // Ensure each output node is actually a NODE:
        for (const outputNode of outputNodes) {
            this.propagateTo(outputNode);
        }
        
        // Determines if value should be propagated:
        this.constraint = typeof(constraint) === "function"     
            ? constraint 
            : async (value, edge) => true

        // How to compute the value we intend to propagate:
        this.transform = typeof(transform) === "function"
            ? transform
            : async (value, edge) => value
        
        // Determines if debug messaging is shown whenever a successful broadcast is sent:
        this.debug = debug === true ? true : false;

    }

    /**
     * 
     *  Instance Methods 
     * 
     */

    // :: VOID -> PROMISE(this)
    // Determines if incoming value meets constraint, and if it does propagates transformed value to all output nodes:
    async propagate() {

        // Get input and ouput nodes by node, name, and value:
        const inputNodes = this.getInputNodes();
        const outputNodes = this.getOutputNodes();
        
        // Check if constraint is met before propagating value to stored ouput nodes:
        if (await this.constraint(inputNodes.values, this) === false) {
            if (this.debug === true) {
                console.log(`NO PROPAGATION`, {
                    "from": inputNodes.names,
                    "to":  outputNodes.names,
                    "value":inputNodes.values
                });
            }
            return this;
        }

        // Compute transform to propagate:
        // NOTE: Transform maybe a side-effect when there are no node to propagate to:
        const outputValue = await this.transform(inputNodes.values, this);

        // If there are no node to propagate to - we can return to caller:
        if (this.outputNodes.length === 0 ) {
            if (this.debug == true) {
                console.log("PROPAGATE", {
                    "from":inputNodes.names, 
                    "to":outputNodes.names, 
                    "value":outputValue
                });
            }
            return this;
        } 

        // Propagate transformed value to every stored output node:
        for (const outputNode of this.outputNodes) {
            if (this.debug === true) {
                console.log("PROPAGATE", {
                    "from":inputNodes.names,
                    "to":outputNode.name, 
                    "value":outputValue
                })
            }
            await outputNode.update(outputValue);
        }   

        return this;
    
    }

    // :: NODE -> this
    // Adds ouput node to propagate value "to":
    propagateTo(node) {
        SemanticGraphNode.check(node);
        this.outputNodes.push(node);
        return this;
    }

    // Adds input node to propagate value "from":
    propagateFrom(node) {
        SemanticGraphNode.check(node);
        node.addEdge(this);
        this.inputNodes.push(node);
        return this;
    }

    // :: VOID -> {nodes:[NODE], names:[STRING], values:[*]}
    // Returns instances, names, and values of all input nodes:
    getInputNodes() {
       return  SemanticGraphEdge.getNodes(this.inputNodes);
    }

    // :: VOID -> {nodes:[NODE|VOID], names:[STRING|SYMBOL], values:[*|VOID]}
    // Returns the names for all output nodes this edge propagates values to:
    getOutputNodes() {
        return this.outputNodes.length > 0
            ?  SemanticGraphEdge.getNodes(this.outputNodes)
            : {"nodes": [], "names":[SemanticGraphEdge.NO_OUTPUT_NODE], "values":[]}
    }

    /**
     * 
     *  Static Methods 
     * 
     */

    // Static Factory Method :: {input:[NODE], output:[NODE]|VOID, constraint:(*, EDGE -> PROMISE(BOOL))|VOID, transform:(*, EDGE -> PROMISE(*))|VOID, debug:BOOL|VOID} -> semanticGraphEdge
    static init({input, output, constraint, transform, debug}) {
        return new SemanticGraphEdge(input, output, constraint, transform, debug);
    }

    // :: * -> *
    // Returns value if value is an EDGE, otherwise throw an error:
    static check(value) {
        if (value instanceof SemanticGraphEdge) {
            return value;
        }
        throw new Error("Value is not an EDGE");
    }

    // :: [NODE] -> {nodes:[NODE], names:[STRING], values:[*]}
    // Returns the node, node name, and node value for the given array of nodes:
    // NOTE: Return result is frozen to prevent mutability:
    static getNodes(nodes) {
        const result = nodes.reduce((result, node) => {
            result.nodes.push(node)
            result.names.push(node.name)
            result.values.push(node.value);
            return result;
        },  { "nodes":[], "names":[],"values":[]});
        return Object.freeze(result);
    }

}