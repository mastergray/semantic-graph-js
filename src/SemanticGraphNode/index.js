// Dependencies:
import SemanticGraphEdge from "../SemanticGraphEdge/index.js";

// Stores values that can be propagated through the graph:
export default class SemanticGraphNode {

    // Static field for denoting propagation as "forced":
    static FORCED = Symbol("FORCED_PROPAGATION");
    
    // CONSTRUCTOR :: STRING, *, [EDGE], (*, NODE -> PROMISE(BOOL))|VOID, (*, NODE -> PROMISE(*))|VOID, BOOL|VOID -> this
    constructor(name, value, edges, constraint, merge, debug) {

        // Name of node:
        this.name = name;                                       
        
        // Value stored by node:
        this.value = value;     

        // Edges connected to this node:
        this.edges = edges ?? [];                              
        
        // Only propagates value if TRUE
        this.constraint = typeof(constraint) === "function"   
            ? constraint
            : async (value, node) => true

        // How value is updated:
        this.merge = typeof(merge) === "function"              
            ? merge 
            : async (value, node) => value
        
        // Determines if debug messaging should be enabled:
        this.debug = debug === true ? true : false;      

    }

    /**
     * 
     *  Instance Methods 
     * 
     */

    // :: * ->  PROMISE(this)
    // "Updates" value of this node and propagate it to any connected edge if the merged value meets the stored constraint:
    // NOTE: Merged value is always stored so that "partial information" can be collected by a node for eventual propagation
    async update(value) {

        // Compute and store merged value:
        this.value = await this.merge(value, this);

        // Propagate updated value if constraint is met:
        return await this.propagate(this.value);

    }

    // :: semanticGraphEdge -> this
    // Connects new edge to node:
    addEdge(edge) {
        SemanticGraphEdge.check(edge)
        this.edges.push(edge);
        return this;
    }

    // :: VOID -> PROMISE(this)
    // Propagates value if constraint is met:
    // NOTE: We "force" propagation with the given value, where if value is given we use the stored value of the node:
    async force() {

        // Since we are propagating the stored value and not updating any - we provide "FORCED PROPAGATION" for debugging purposes:
        await this.propagate(SemanticGraphNode.FORCED);

    }

    // :: *, BOOL|VOID -> PROMISE(this)
    // Defines how a node propagates it's value to it's edges:
    async propagate(value) {

        // Store info for debugging:
        const debugInfo = {
            "update":value,
            "merged":this.value
        }

         // Ensure merged value meets contraint before propagating:
         if (await this.constraint(this.value, this) === true) {

            // Show debug message if constraint is met and debugging is enabled:
            if (this.debug === true && value !== SemanticGraphNode.FORCED) {
                console.log(`NODE UPDATE (${this.name})`, debugInfo);
            }
            
            // Propagate value to it's edges:
            // NOTE: We do this sequentially to ensure propagation is perserving order:
            for (const edge of this.edges) {
                SemanticGraphEdge.check(edge)
                await edge.propagate(); 
            }

        } else {
            
            // Show debug message if constraint failed and debugging is enabled:
            if (this.debug === true && value !== SemanticGraphNode.FORCED) {
                console.log(`NO NODE UPDATE (${this.name})`, debugInfo)
            }

        }

        return this;

    }


    /**
     * 
     *  Static Methods
     * 
     */

    // :: {name:STRING, value:*, edges:[EDGE]|VOID, constraint:(*, NODE -> PROMISE(BOOL))|VOID, merge:(*, NODE -> PROMISE(*))|VOID, debug:BOOL|VOID} -> semanticGraphNode
    static init({name, value, edges, constraint, merge, debug}) {
        return new SemanticGraphNode(name, value, edges, constraint, merge, debug);
    }

    // * -> TRUE
    // Returns value if value is a semantic graph node - otherwise throw an error:
    static check(value) {
        if (value instanceof SemanticGraphNode) {
            return value;
        }
        throw new Error("Value is not a NODE");
    }

}