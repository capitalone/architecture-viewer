const fs     = require("fs");
const path   = require("path");
const parser = require("../utils/parser");

const parseFile = (filename) => {
    return fs.readFileSync(filename, "ascii")
        .toString()
        .split("\n");
}

describe("file processor", () => {
    it("should create an empty structure given an empty file", () => {
        const empty = {
            title: "",
            graphData: {
                nodes: [],
                edges: []
            },
            stepData: [],
            zoneData: []
        };

        const filename = path.join(__dirname, "testfiles/empty.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data).toEqual(empty);
    });

    /*
        THE PARTICIPANT FEATURE
    */
    it("should create nodes given only participants (without aliases)",() => {
        const expected = [
            {
                data: {
                    id: "A",
                    fname: "A",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "B",
                    fname: "B",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "C",
                    fname: "C",
                    zone: "#FBDCD6"
                }
            }
        ];

        const filename = path.join(__dirname, "testfiles/unaliased_participants.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.nodes).toEqual(expected);


    });
    it("should create nodes given only participants (with aliases)", () => {
        const expected = [
            {
                data: {
                    id: "A",
                    fname: "A",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "B",
                    fname: "B B B",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "C",
                    fname: "C",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "D",
                    fname: "D D D",
                    zone: "#FBDCD6"
                }
            },
        ];

        const filename = path.join(__dirname, "testfiles/aliased_participants.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.nodes).toEqual(expected);

    });
    it("should support participant creation through 'participant' and 'actor'", () => {
        const expected = [
            {
                data: {
                    id: "A",
                    fname: "A",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "B",
                    fname: "B B B",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "C",
                    fname: "C",
                    zone: "#FBDCD6"
                }
            }
        ];

        const filename = path.join(__dirname, "testfiles/participant_decl.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.nodes).toEqual(expected);
    });

    it("should support applying zones to participants", () => {

        const expectedNodes = [
            {
                data: {
                    id: "A",
                    fname: "A",
                    zone: "#111",
                    parent: "zoneA"
                }
            },
            {
                data: {
                    id: "B",
                    fname: "BBB",
                    zone: "#222",
                    parent: "zoneB"
                }
            },
            {
                data: {
                    id: "C",
                    fname: "C",
                    zone: "#FBDCD6"
                }
            },
            {
                data: {
                    id: "zoneA",
                    zone: "#353535",
                }
            },
            {
                data: {
                    id: "zoneB",
                    zone: "#434343",
                }
            },
        ]

        const filename = path.join(__dirname, "testfiles/zoned_participants.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.nodes).toEqual(expectedNodes);
    })

    /*
        THE STEPS FEATURE
    */
    it("should create nodes, edges, stepData given unaliased participants and steps", () => {
        const expectedEdges = [
            {
                data: {
                    id: "e0",
                    source: "A",
                    target: "B"
                }
            },
            {
                data: {
                    id: "e1",
                    source: "B",
                    target: "C"
                }
            }
        ];

        const expectedSteps = [
            {
                id: "0",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB",
                note: ""
            },
            {
                id: "1",
                type: "single",
                nodes: ["B", "C"],
                steps: [],
                description: "BC",
                note: ""
            },
        ];

        const filename = path.join(__dirname, "testfiles/steps_unaliased.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.edges).toEqual(expectedEdges);
        expect(data.stepData).toEqual(expectedSteps);
    });

    it("should create nodes, edges, stepData given aliased participants and steps", () => {
        const expectedEdges = [
            {
                data: {
                    id: "e0",
                    source: "A",
                    target: "B"
                }
            },
            {
                data: {
                    id: "e1",
                    source: "B",
                    target: "C"
                }
            }
        ];

        const expectedSteps = [
            {
                id: "0",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB",
                note: ""
            },
            {
                id: "1",
                type: "single",
                nodes: ["B", "C"],
                steps: [],
                description: "BC",
                note: ""
            },
        ];

        const filename = path.join(__dirname, "testfiles/steps_aliased.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.edges).toEqual(expectedEdges);
        expect(data.stepData).toEqual(expectedSteps);
    })

    it("should create nodes, edges, stepData given mixed participants and steps", () => {
        const expectedEdges = [
            {
                data: {
                    id: "e0",
                    source: "A",
                    target: "B"
                }
            },
            {
                data: {
                    id: "e1",
                    source: "B",
                    target: "C"
                }
            }
        ];

        const expectedSteps = [
            {
                id: "0",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB",
                note: ""
            },
            {
                id: "1",
                type: "single",
                nodes: ["B", "C"],
                steps: [],
                description: "BC",
                note: ""
            },
        ];

        const filename = path.join(__dirname, "testfiles/steps_mixed.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.edges).toEqual(expectedEdges);
        expect(data.stepData).toEqual(expectedSteps);
    })

    it("should support all styles of step arrows", () => {
        const expectedEdges = [
            {
                data: {
                    id: "e0",
                    source: "A",
                    target: "B"
                }
            }
        ];

        const expectedSteps = [
            {
                id: "0",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB1",
                note: ""
            },
            {
                id: "1",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB2",
                note: ""
            },
            {
                id: "2",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB3",
                note: ""
            },
            {
                id: "3",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB4",
                note: ""
            },
            {
                id: "4",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB5",
                note: ""
            },
            {
                id: "5",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB6",
                note: ""
            },
            {
                id: "6",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB7",
                note: ""
            },
            {
                id: "7",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB8",
                note: ""
            },
            {
                id: "8",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB9",
                note: ""
            },
            {
                id: "9",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB10",
                note: ""
            },
            {
                id: "10",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB11",
                note: ""
            },
        ];

        const filename = path.join(__dirname, "testfiles/steps_steptest.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.edges).toEqual(expectedEdges);
        expect(data.stepData).toEqual(expectedSteps);
    });

    /*
        THE GROUPING FEATURE
    */
    it("should support the 'loop <message>' group keyword", () => {

        const expectedSteps = [
            {
                id: "g0",
                type: "group",
                groupName: "loop",
                nodes: [],
                steps: [
                    {
                        id: "0",
                        type: "single",
                        nodes: [
                            "A",
                            "B"
                        ],
                        steps: [],
                        description: "AB",
                        note: ""
                    },
                    {
                        id: "g1",
                        type: "group",
                        groupName: "loop",
                        nodes: [],
                        steps: [
                            {
                                id: "1",
                                type: "single",
                                nodes: [
                                    "B",
                                    "C"
                                ],
                                steps: [],
                                description: "BC",
                                note: ""
                            }
                        ],
                        description: "testloop2",
                        note: "loop note testloop2"
                    }
                ],
                description: "testloop1",
                note: "loop note testloop1"
            }
        ];

        const filename = path.join(__dirname, "testfiles/steps_loop.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.stepData).toEqual(expectedSteps);
    });

    it("should support the 'group <text>' group keyword", () => {
        const expectedSteps = [
            {
                id: "g0",
                type: "group",
                groupName: "group",
                nodes: [],
                steps: [
                    {
                        id: "0",
                        type: "single",
                        nodes: [
                            "A",
                            "B"
                        ],
                        steps: [],
                        description: "AB",
                        note: ""
                    },
                    {
                        id: "g1",
                        type: "group",
                        groupName: "group",
                        nodes: [],
                        steps: [
                            {
                                id: "1",
                                type: "single",
                                nodes: [
                                    "B",
                                    "C"
                                ],
                                steps: [],
                                description: "BC",
                                note: ""
                            }
                        ],
                        description: "testgroup2",
                        note: "group note testgroup2"
                    }
                ],
                description: "testgroup1",
                note: "group note testgroup1"
            }
        ];

        const filename = path.join(__dirname, "testfiles/steps_group.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.stepData).toEqual(expectedSteps);
    });

    it("should support mixed groups", () => {
        const expectedSteps = [
            {
                id: "g0",
                type: "group",
                groupName: "group",
                nodes: [],
                steps: [
                    {
                        id: "0",
                        type: "single",
                        nodes: [
                            "A",
                            "B"
                        ],
                        steps: [],
                        description: "AB",
                        note: ""
                    },
                    {
                        id: "g1",
                        type: "group",
                        groupName: "loop",
                        nodes: [],
                        steps: [
                            {
                                id: "1",
                                type: "single",
                                nodes: [
                                    "B",
                                    "C"
                                ],
                                steps: [],
                                description: "BC",
                                note: ""
                            }
                        ],
                        description: "testloop2",
                        note: "loop note testloop2"
                    }
                ],
                description: "testgroup1",
                note: "group note testgroup1"
            }
        ];

        const filename = path.join(__dirname, "testfiles/steps_group_mixed.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.stepData).toEqual(expectedSteps);
    });

    /*
        THE NOTES FEATURE
    */
    it("should support single line notes", () => {
        const expectedSteps = [
            {
                id: "0",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB",
                note: "AB note"
            },
            {
                id: "1",
                type: "single",
                nodes: ["A", "C"],
                steps: [],
                description: "AC",
                note: "AC note"
            },
        ];

        const filename = path.join(__dirname, "testfiles/notes_singleline.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.stepData).toEqual(expectedSteps);
    });

    it("should support multiline notes", () => {
        const expectedSteps = [
            {
                id: "0",
                type: "single",
                nodes: ["A", "B"],
                steps: [],
                description: "AB",
                note: "AB note"
            },
            {
                id: "1",
                type: "single",
                nodes: ["A", "C"],
                steps: [],
                description: "AC",
                note: "AC line 1\n\nAC line 2"
            },
        ];

        const filename = path.join(__dirname, "testfiles/notes_multiline.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.stepData).toEqual(expectedSteps);
    });

    /*
        THE DIVIDERS FEATURE
    */
    it("should support dividers and treat them like groups", () => {

        const expectedSteps = [
            {
                id: 'g0',
                type: 'group',
                groupName: 'group',
                nodes: [],
                steps: [
                    {
                        id: '0',
                        type: 'single',
                        nodes: ["A", "B"],
                        steps: [],
                        description: "AB",
                        note: ""
                    },
                    {
                        id: '1',
                        type: 'single',
                        nodes: ["A", "C"],
                        steps: [],
                        description: "AC",
                        note: ""
                    }
                ],
                description: 'As only',
                note: ''
            },
            {
                id: 'g1',
                type: "group",
                groupName: 'group',
                nodes: [],
                steps: [
                    {
                        id: '2',
                        type: 'single',
                        nodes: ["B", "A"],
                        steps: [],
                        description: "BA",
                        note: ""
                    },
                    {
                        id: '3',
                        type: 'single',
                        nodes: ["B", "C"],
                        steps: [],
                        description: "BC",
                        note: ""
                    }
                ],
                description: 'Bs only',
                note: ''
            },
            {
                id: 'g2',
                type: "group",
                groupName: 'group',
                nodes: [],
                steps: [
                    {
                        id: '4',
                        type: 'single',
                        nodes: ["C", "A"],
                        steps: [],
                        description: "CA",
                        note: ""
                    },
                    {
                        id: '5',
                        type: 'single',
                        nodes: ["C", "B"],
                        steps: [],
                        description: "CB",
                        note: ""
                    }
                ],
                description: 'Cs only',
                note: ''
            },
        ];

        const filename = path.join(__dirname, "testfiles/dividers.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.stepData).toEqual(expectedSteps);
        // console.log(data.stepData[0]);
    });

    /*
        THE PARTICIPANT INFO FEATURE
    */
    it("should add an info property on a node if a note is created for the participant", () => {
        const filename = path.join(__dirname, "testfiles/participant_info.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        const expectedNode = {
            data: {
                id: "A",
                fname: "A",
                zone: "#FBDCD6",
                info: "this is some info on A<br/> newlines idk"
            }
        }

        expect(data.graphData.nodes).toContainEqual(expectedNode);
    })


    /* 
        ONE-OFF TESTS
    */

    // supporting this case because plantUML behaves the same way
    it("should generate a participant if one isn't declared", () => {
        const filename = path.join(__dirname, "testfiles/undeclaredparticipant.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        expect(data.graphData.nodes).toContainEqual({
            data: {
                id: 'TSYS',
                fname: 'TSYS',
                zone: '#FBDCD6'
            }
        });
    })

    it("should allow the same name in quotes per participant", () => {
        const filename = path.join(__dirname, "testfiles/doubled_names.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        const expectedEdges = [
            {
                data: {
                    id: 'e0',
                    source: 'A',
                    target: 'B'
                }
            },
            {
                data: {
                    id: 'e1',
                    source: 'A',
                    target: 'C'
                }
            }
        ]

        expect(data.graphData.edges).toEqual(expectedEdges);
    })

    it("should generate supernodes in a sane way", () => {
        const filename = path.join(__dirname, "testfiles/supernodes.adoc");
        const contents = parseFile(filename);
        const data = parser.parseContents(contents);

        const expectedZone = {
            data: {
                id: "blue!",
                zone: "#93d4ff"
            }
        }

        expect(data.graphData.nodes).toContainEqual(expectedZone);
    })
});