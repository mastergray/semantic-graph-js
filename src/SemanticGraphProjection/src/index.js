// Defines a reusable semantic relation between nodes in a graph :
export default class SemanticGraphProjection {
  
    /**
     * 
     * "Abstract" Methods (methods intended to be overwritten by subclass)
     * 
     */

    // :: GRAPH -> [EDGE]
    // Applies the projection to a graph, returning the edges it defines:
    applyTo(graph) {
        throw new Error("apply() must be implemented by subclasses");
    }

}
