/*
 * Copyright 2017 Capital One Services, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
// ===== Miscellaneous Utilities =====

const peek = (arr) => {
    return arr[arr.length - 1];
}

const empty = (arr) => {
    return arr.length === 0;
}

const hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
     ] : [0, 0, 0];
}

const componentToHex = (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const shadeColor = (color, percent) => {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

const convertColor = (c) => {
    if (c.length == 7) return c;
    return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
}

const tint = (c) => shadeColor(convertColor(c), .15);

// ===== REGEXES/STRINGS =====

//match the beginning of a plantuml diagram
const START_FLAG = "@startuml";

//match the end of a plantuml diagram
const END_FLAG = "@enduml";

//match the title of a plantUML diagram
const TITLE = /^title (\"?.+\"?)$/;

//match a line when a participant is declared
const PARTICIPANT = /^(participant|actor) ((\"?.+\"?) as (\w+)|\"?\w+\"?)\s*(<< \((.,\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\) (.+) >>)?$/;

const PARTICIPANT_INFO = /^\s*note over (\w+)\s*$/;

//match a line that looks roughly like this: "A -> B: description"
const STEP_FORWARD = /^\s*(\w+)\s*(->|-\\|-\/|->>|-\\\\|-\/\/|-->|--\\\\|--\/\/|-->>)\s*(\w+)\s*:\s*(.+)$/;

//match a line that looks roughly like this: "A <- B: description"
const STEP_BACKWARD = /^\s*(\w+)\s*(<-|\/-|\\-|<<-|\/\/\/\/-|\\\\-|<--|\/\/--|\\\\--|<<--)\s*(\w+)\s*:\s*(.+)$/;

//match a note on either side of a step. It looks like this: "note [left|right]: description"
const SINGLE_LINE_NOTE = /^\s*note (left|right|over (\w+)|left of (\w+)|right of (\w+)):\s*(.*)$/;

//matches the start of a note, looks like this: "note [left|right]"
const MULTI_LINE_NOTE_START = /^\s*note (left|right)$/;

//matches the content of a line of a note
const NOTE_LINE = /^(\s*)(.*)$/;

//matches the end of a note
const MULTI_LINE_NOTE_END = /^\s*end note$/;

// matches the start of a "loop" type of group
const LOOP_START = /^\s*loop (.+)$/;

// matches the start of a "group" type of group
const GROUP_START = /^\s*group (.+)$/;

// matches the end of both a loop AND a group
const GROUPING_END = /^\s*end( loop)?$/;

//matches the declaration of a divider
const DIVIDER = /^\s*==\s*(.+)\s*==$/;

//matches an alt (TODO: flesh this out into real support or parse it out)
const ALT = /^\s*alt.*$/;


// ===== FLAGS/CONSTANTS =====
const debug = false;

let processingUML = false;

//edge/step info
let edgeIndexCounter = 0;
let stepIndexCounter = 0;

//group/divider info
const NO_GROUPS = 0;
const GROUPS = 1;
const SECTIONS = 2;

let groupType = NO_GROUPS;
let groupStepStack = [];
let groupIndexCounter = 0;

let parsingDivider = false;

let processingParticipantInfo = false;
let participantProcessed = null;

//note info
let processingNote = false;
let noteContent = [];
let previousNoteStep = null;

//node/zone tracking
const nodeMap = {};
const zoneMap = {
    main: "#FBDCD6"
};

//TODO: flesh this out into real support or parse it out
let altCount = 0;


// ===== HELPER FUNCTIONS =====
const setProcessingFlag = (line) => {
    if (line === START_FLAG) {
        processingUML = true;
    } else if (line === END_FLAG) {
        processingUML = false;
    }
}

const detectTitle = (data, line) => {
    if (!TITLE.test(line)) return;

    const titleInfo = TITLE
        .exec(line)[1]
        .replace(/^"(.+)"$/, '$1');

    data.title = titleInfo;
}

const detectParticipant = (data, line) => {
    if (!PARTICIPANT.test(line)) return;

    const participantInfo = PARTICIPANT
        .exec(line)
        .slice(2);

    // no alias vs alias
    let officialName;
    let shortName;
    if (participantInfo[1] === undefined) {
        const name = participantInfo[0]
            .replace(/"/g, "")
            .replace(/\\n/g, " ");
        nodeMap[name] = name;
        officialName = name;
        shortName = name;
    } else {
        shortName = participantInfo[2];
        const longName = participantInfo[1]
            .replace(/"/g, "")
            .replace(/\\n/g, " ");

        nodeMap[shortName] = longName;
        // nodeMap[longName] = shortName;
        officialName = longName;
    }

    let zone;
    let zoneName = null;
    if (participantInfo[6] === undefined) {
        zone = zoneMap["main"];
    } else {
        zoneName = participantInfo[6];
        zoneMap[zoneName] = `#${participantInfo[5]}`;
        zone = zoneMap[zoneName];
    }

    let partial_data = {
        id: shortName,
        fname: officialName,
        zone: zone,
    }

    if (zoneName != null) {
        partial_data.parent = zoneName;
    }

    //insert node into data
    //TODO: support zones in the future
    data.graphData.nodes.push({
        data: partial_data
    })

}

const detectParticipantInfo = (data, line) => {
    if (!processingParticipantInfo) {
        if (PARTICIPANT_INFO.test(line)) {
            participantProcessed = PARTICIPANT_INFO.exec(line)[1];
            processingParticipantInfo = true;
        }
    } else {
        if (MULTI_LINE_NOTE_END.test(line)) {
            const participant = data.graphData.nodes.filter(n => {
                return n.data.id == participantProcessed;
            })[0];
            participant.data.info = noteContent.join(" ");
            participantProcessed = null;
            noteContent = [];
            processingParticipantInfo = false; 
        } else {
            if (!NOTE_LINE.test(line)) return;

            const parsed_line = NOTE_LINE.exec(line);
            noteContent.push(parsed_line[2]);
        }
    }
}

const detectStep = (data, line) => {
    if (!STEP_FORWARD.test(line) && !STEP_BACKWARD.test(line)) return;

    let stepInfo;
    let source;
    let target;
    let description;

    if (STEP_FORWARD.test(line)) {
        stepInfo = STEP_FORWARD.exec(line);
        source = stepInfo[1];
        if (nodeMap[source] == undefined) {
            nodeMap[stepInfo[1]] = stepInfo[1];
            source = stepInfo[1];
            data.graphData.nodes.push({
                data: {
                    id: stepInfo[1],
                    fname: stepInfo[1],
                    zone: zoneMap["main"]
                }
            })
        }

        target = stepInfo[3];
        if (nodeMap[target] == undefined) {
            nodeMap[stepInfo[3]] = stepInfo[3];
            target = stepInfo[3];
            data.graphData.nodes.push({
                data: {
                    id: stepInfo[3],
                    fname: stepInfo[3],
                    zone: zoneMap["main"]
                }
            })
        }

        description = stepInfo[4];

    } else {
        stepInfo = STEP_BACKWARD.exec(line);
        source = stepInfo[3];
        if (nodeMap[source] == undefined) {
            nodeMap[stepInfo[3]] = stepInfo[3];
            source = stepInfo[3];
            data.graphData.nodes.push({
                data: {
                    id: stepInfo[3],
                    fname: stepInfo[3],
                    zone: zoneMap["main"]
                }
            })
        }

        target = stepInfo[1];
        if (nodeMap[target] == undefined) {
            nodeMap[stepInfo[1]] = stepInfo[1];
            target = stepInfo[1];
            data.graphData.nodes.push({
                data: {
                    id: stepInfo[1],
                    fname: stepInfo[1],
                    zone: zoneMap["main"]
                }
            })
        }

        description = stepInfo[4];
    }

    const edgeExists = data.graphData.edges.some(edge => {
        const data = edge.data;
        const src = data.source;
        const tar = data.target;

        return (src == source && tar == target) || (src == target && tar == source);
    });

    if (!edgeExists) {
        data.graphData.edges.push({
            data: {
                id: "e" + edgeIndexCounter,
                source: source,
                target: target
            }
        });
        edgeIndexCounter += 1;
    }

    const step = {
        id: "" + stepIndexCounter,
        type: "single",
        nodes: [source, target],
        steps: [],
        description: description,
        note: ""
    };

    let prevStep;

    if (empty(groupStepStack)) {
        data.stepData.push(step);
        prevStep = peek(data.stepData);
    } else {
        const group = peek(groupStepStack);
        group.steps.push(step);
        prevStep = peek(group.steps);
    }

    previousNoteStep = prevStep;

    stepIndexCounter += 1;

}

const detectSingleLineNote = (data, line) => {
    if (!SINGLE_LINE_NOTE.test(line)) return;

    const regex_result = SINGLE_LINE_NOTE.exec(line);

    // depending on the regex, could be the second or 5th group
    const note = regex_result[2] || regex_result[5];

    // the note refers to a node
    if (regex_result[2] != undefined || regex_result[4] != undefined) {
        let node_id = regex_result[2] || regex_result[4];
        let noteNode = null;
        for (let i = 0; i < data.graphData.nodes.length; i++) {
            let node = data.graphData.nodes[i];
            if (node.data.id === node_id) {
                noteNode = node;
            }
        }
        noteNode.data.info = note;
    } 
    // the note refers to a step
    else {
        previousNoteStep.note = note;
        previousNoteStep = null;
    }
}

const detectMultiLineNote = (data, line) => {
    if (!processingNote) {
        if (MULTI_LINE_NOTE_START.test(line)) {
            processingNote = true;
        }
    } else {
        if (MULTI_LINE_NOTE_END.test(line)) {

            previousNoteStep.note = noteContent.join("\n");
            previousNoteStep = null;
            noteContent = [];
            processingNote = false;
            return;
        } else {
            if (!NOTE_LINE.test(line)) return;

            const parsed_line = NOTE_LINE.exec(line);
            noteContent.push(parsed_line[2]);
        }
    }
}

const detectLoop = (data, line) => {
    if (!LOOP_START.test(line)) return;

    const step = {
        id: "g" + groupIndexCounter,
        type: "group",
        groupName: "loop",
        nodes: [],
        steps: [],
        description: "",
        note: ""
    };

    const loopDescription = LOOP_START.exec(line)[1];
    step.description = loopDescription;

    groupStepStack.push(step);
    groupIndexCounter++;
}

const detectGroup = (data, line) => {
    if (!GROUP_START.test(line)) return;

    const step = {
        id: "g" + groupIndexCounter,
        type: "group",
        groupName: "group",
        nodes: [],
        steps: [],
        description: "",
        note: ""
    };

    const groupDescription = GROUP_START.exec(line)[1];
    step.description = groupDescription;

    groupStepStack.push(step);
    groupIndexCounter++;
}

const detectGroupEnd = (data, line) => {
    if (!GROUPING_END.test(line)) return;

    /* 
        introducing support for the "alt" syntax in PlantUML (basically if statements)
        TODO: flesh this out into real support or parse it out
        quick support for ALT
    */
    if (altCount > 0) {
        altCount--;
        return;
    }

    const finishedGroup = groupStepStack.pop();
    previousNoteStep = finishedGroup;
    let parent;
    if (empty(groupStepStack)) {
        parent = data.stepData;
        parent.push(finishedGroup);
    } else {
        parent = peek(groupStepStack);
        parent.steps.push(finishedGroup);
    }

}

const detectDivider = (data, line) => {
    if (!DIVIDER.test(line)) return;

    if (parsingDivider) {
        const finishedGroup = groupStepStack.pop();
        previousNoteStep = finishedGroup;
        let parent;
        if (empty(groupStepStack)) {
            parent = data.stepData;
            parent.push(finishedGroup);
        } else {
            parent = peek(groupStepStack);
            parent.steps.push(finishedGroup);
        }

    }
    const step = {
        id: "g" + groupIndexCounter,
        type: "group",
        groupName: "group",
        nodes: [],
        steps: [],
        description: "",
        note: ""
    };

    const groupDescription = DIVIDER.exec(line)[1].trim();
    step.description = groupDescription;

    groupStepStack.push(step);
    groupIndexCounter++;
    parsingDivider = true;

}

/* 
    introducing support for the "alt" syntax in PlantUML (basically if statements)
    TODO: flesh this out into real support or parse it out
    quick support for ALT
*/
const detectAlt = (data, line) => {
    if (!ALT.test(line)) return;
    altCount++;
}


const parseContents = (contents) => {
    //create a skeleton JSON
    const result = {
        title: "",
        graphData: {
            nodes: [],
            edges: []
        },
        stepData: [],
        zoneData: []
    }

    //loop through the file to populate JSON
    for (let line of contents) {
        setProcessingFlag(line);
        if (processingUML) {
            detectTitle(result, line);
            detectParticipant(result, line);
            detectParticipantInfo(result, line);
            detectStep(result, line);
            detectSingleLineNote(result, line);
            detectMultiLineNote(result, line);
            detectLoop(result, line);
            detectGroup(result, line);
            detectDivider(result, line);
            detectAlt(result, line);
            detectGroupEnd(result, line);
        }
    }

    //finish off last divider
    if (parsingDivider) {
        const finishedGroup = groupStepStack.pop();
        previousNoteStep = finishedGroup;
        let parent;
        if (empty(groupStepStack)) {
            parent = result.stepData;
            parent.push(finishedGroup);
        } else {
            parent = peek(groupStepStack);
            parent.steps.push(finishedGroup);
        }
    }

    //generate zone nodes
    for (let z of Object.keys(zoneMap)) {
        if (z != "main") {
            let tintedZone = tint(zoneMap[z]);
            result.graphData.nodes.push({
                data: {
                    id: z,
                    zone: tintedZone
                }
            })
        }
    }

    //TODO: cleanup so global scope is ok

    //edge/step info
    edgeIndexCounter = 0;
    stepIndexCounter = 0;

    groupType = NO_GROUPS;
    groupStepStack = [];
    groupIndexCounter = 0;

    parsingDivider = false;

    //note info
    processingNote = false;
    noteContent = [];
    previousNoteStep = null;

    //node/zone tracking
    for (var n in nodeMap) {
        delete nodeMap[n];
    }

    for (var z in zoneMap) {
        delete zoneMap[z];
    }
    zoneMap.main = "#FBDCD6";

    /* 
        introducing support for the "alt" syntax in PlantUML (basically if statements)
        TODO: flesh this out into real support or parse it out
        quick support for ALT
    */
    altCount = 0;

    return result;
}

module.exports = {
    utils: {
        detectParticipant
    },
    flags: {
        processingUML,
        nodeMap,
        zoneMap
    },
    parseContents,
}