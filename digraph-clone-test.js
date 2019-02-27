const arccore = require("@encapsule/arccore");

var response = arccore.graph.directed.create({
    name: "Source Digraph",
    description: "This is a graph that we will clone.",
    vlist: [
        { u: "apple", p: "Edible skin" },
        { u: "orange", p: "Inedible skin" }
    ],
    elist: [
        { e: { u: "apple", v: "orange" }, p: "Not the same" }
    ]
});
if (response.error) {
    throw new Error(response.error);
}
var sourceDigraph = response.result;

// Clone via serialize/deserialize
response = arccore.graph.directed.create(sourceDigraph.toJSON());
if (response.error) {
    throw new Error(response.error);
}
var cloneDigraph1 = response.result;

// Clone via arccore.util.clone
var cloneDigraph2 = arccore.util.clone(sourceDigraph);

// Compare contents of the source and clone 1 digraphs. We expect them to be the same.
if (sourceDigraph.stringify() !== cloneDigraph1.stringify()) {
    console.log("! Source digraph JSON is not equal to clone 1 digraph JSON.");
} else {
    console.log("> Clone 1 digraph JSON reads as expected.");
}

// Compare contents of the source and clone 2 digraphs. We expect them to be the same.
if (sourceDigraph.stringify() !== cloneDigraph2.stringify()) {
    console.log("! Source digraph JSON is not equal to clone 2 digraph JSON.");
} else {
    console.log("> Clone 2 digraph JSON reads as expected.");
}

// What's not 100% clear is what happens when we mutate the containers. Specifically,
// client code could subsequently mutate the source, or derived clone in a number of
// different ways: CRUD operation on vertex/edge properties, topological updates
// (vertex & edge add/remove operations).
//
// So the questions I've come up with so far are:
// - How best to affect a deep copy of a DirectedGraph instance.
// - Is it useful to have deep copy for topology and shallow (i.e. shared) copy for vertex/edge properties?
// - What exactly does arccore.util.clone and arccore.util.deepcopy do? Do they act as we expect? How about for DirectedGraph?

// Let's assume that clone 1 is a true deep copy meaning that we can change both its properties and topology without any impact on the source or other test clone.

// Update a vertex property on the clone 1
cloneDigraph1.setVertexProperty({ u: "apple", p: "apple property updated specifically on clone 1" });

if (sourceDigraph.getVertexProperty("apple") === cloneDigraph1.getVertexProperty("apple")) {
    console.log("! Update to clone 1 vertex property reflected back to source digraph.");
} else {
    console.log("> Update of clone 1 vertex property did not update source digraph.");
}

cloneDigraph1.addEdge({ e: { u: "apple", v: "mango" }, p: "Better together..." });

if (sourceDigraph.isEdge({ u: "apple", v: "mango"})) {
    console.log("! Edge added to clone 1 reflected back to source digraph.");
} else {
    console.log("> Edge added to clone 1 did not update source digraph.");
}

// clone 2
cloneDigraph2.setVertexProperty({ u: "apple", p: "apple property updated specifically on clone 1" });

if (sourceDigraph.getVertexProperty("apple") === cloneDigraph2.getVertexProperty("apple")) {
    console.log("! Update to clone 2 vertex property reflected back to source digraph.");
} else {
    console.log("> Update of clone 2 vertex property did not update source digraph.");
}

cloneDigraph2.addEdge({ e: { u: "apple", v: "mango" }, p: "Better together..." });

if (sourceDigraph.isEdge({ u: "apple", v: "mango"})) {
    console.log("! Edge added to clone 2 reflected back to source digraph.");
} else {
    console.log("> Edge added to clone 2 did not update source digraph.");
}

console.log("----------------------------------------------------------------");
console.log("Conclusions:");
console.log("- Deep copy by calling toJSON on source digraph passing the resultant object to arccore.graph.directed.create.");
console.log("- DO NOT use arccore.util.clone until this funciton is tested and documented. And, do not use its alias arccore.util.deepCopy because it's a lie in v0.1.3 apparently.");


