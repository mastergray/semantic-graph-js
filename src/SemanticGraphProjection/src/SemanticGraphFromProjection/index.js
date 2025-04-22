// Dependencies
import SemanticGraphProjection from "../index.js";                     // Base class we are extending
import SemanticGraphEdge from "../../../SemanticGraphEdge/index.js";   // For creating new graph edges

// Defines a local semantic relationship from input nodes to a target node using declarative transformation rules.
export default class SemanticGraphFromProjection extends SemanticGraphProjection {

    // CONSTRUCTOR :: [STRING], [{as: (*, EDGE) -> PROMISE(*))|VOID, when: (*, EDGE -> PROMISE(BOOL))|VOID}] -> this    
    constructor(inputNames, rules) {

        super();
        this.inputNames = inputNames;
        this.rules = rules;
        
        // Ensure "rules" are provided as an array:
        if (!Array.isArray(this.rules)){
            throw new Error("Projection rules must be an array");
        }

        // Ensure input node names are provided as an array:
        if (!Array.isArray(this.inputNames)) {
            throw new Error("Projection inputs must be an array of node names");
        }
        

    }

    /**
     * 
     *  Instance Methods 
     * 
     */

    // @Override :: GRAPH -> [EDGE]
    // Applies this projection to a graph, returning one edge per rule
    applyTo(graph) {
        const input = this.inputNames.map(name => graph.getNode(name));
        const debug = graph.debug;
        return this.rules.map(({ as, when }) => new SemanticGraphEdge(input, [], when, as, debug));
    }
    
}
