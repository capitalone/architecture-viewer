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
 
import Ajv from 'ajv';

const ajv = new Ajv();

ajv.addFormat("hexcolor", /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i);

const dataSchema = {
    properties: {
        title: { type: "string" },
        graphData: {
            type: "object",
            properties: {
                nodes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            data: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    zone: { type: "string", format: "hexcolor" }
                                },
                                required: ["id", "zone"]
                            }
                        },
                        required: ["data"]
                    }
                },
                edges: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            data: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    source: { type: "string" },
                                    target: { type: "string" }
                                },
                                required: ["id", "source", "target"]
                            }
                        },
                        required: ["data"]
                    }
                }
            },
            required: ["nodes", "edges"]
        },
        stepData: {
            type: "array",
            minItems: 0,
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    type: {
                        type: "string",
                        pattern: "(single|group)"
                    },
                    nodes: {
                        type: "array",
                        items: { type: "string" }
                    },
                    steps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                type: { type: "string" },
                                nodes: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                steps: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            type: { type: "string" },
                                            nodes: {
                                                type: "array",
                                                items: { type: "string" }
                                            },
                                            steps: {
                                                type: "array",
                                            },
                                            description: { type: "string" }
                                        },
                                        required: ["id", "nodes", "description"]
                                    }
                                },
                                description: { type: "string" }
                            },
                            required: ["id", "nodes", "description"]
                        }
                    },
                    description: { type: "string" }
                },
                required: ["id", "type", "nodes", "steps", "description"]
            }

        }
        // zoneData: {
        //     type: "array",
        //     items: {
        //         type: "object",
        //         properties: {
        //             name: { type: "string" },
        //             color: { type: "string", format: "hexcolor" }
        //         },
        //         required: ["name", "color"]
        //     }
        // }
    },
    required: ["title", "graphData", "stepData"/*, "zoneData"*/]
}

const validator = ajv.compile(dataSchema);
// const stepValidator = ajv.compile(stepSchema); // <- this isn't needed until we want infinite layers

export default function (json) {
    //the result object
    const res = {};
    res.errors = [];

    /*
        set the validity/error state based on structure
    */
    res.valid = validator(json);
    if (validator.errors != null) {
        res.errors.push(...validator.errors);
        return res;
    }
    

    /*
        set the validity/error state based on object property values
    */

    // ===== RULE: there should be distinct ids per declared nodes =====
    let declaredParticipantsSet = new Set();
    let declaredParticipantsArr = [];
    for (let node of json.graphData.nodes) {
        declaredParticipantsSet.add(node.data.id);
        declaredParticipantsArr.push(node.data.id);
    }

    let edgeParticipantsSet = new Set();
    for (let edge of json.graphData.edges) {
        edgeParticipantsSet.add(edge.data.source);
        edgeParticipantsSet.add(edge.data.target);
    }

    let distinctNodeIds = declaredParticipantsArr.length === declaredParticipantsSet.size;

    if (!distinctNodeIds) {
        res.errors.push({
            keyword: "participants",
            message: "you have a duplicate node ID"
        })
    }

    // ===== RULE: Declared nodes should be a superset of edge nodes ===== 
    let nodesAreSupersetOfEdges = true;
    let missingParticipant = "";

    for (let p of edgeParticipantsSet) {
        if (!declaredParticipantsSet.has(p)) {
            missingParticipant = p;
            nodesAreSupersetOfEdges = false;
        }
    }

    if (!nodesAreSupersetOfEdges) {
        res.errors.push({
            keyword: "participants",
            message: "there is an missing participant in your nodes, or an extra misspelled participant",
            offender: missingParticipant
        })
    }

    // ===== RULE: If a step isn't a single, then it must have at least one step in `steps` =====

    let invalidStepFound = false;
    let invalidStep = null;

    const validateStepType = (step) => {
        if (step.type === "single") {
            if (step.steps.length === 0) {
                return true;
            } else {
                if (!invalidStepFound) {
                    invalidStep = step;
                    invalidStepFound = true;
                }
                return false;
            }
        } else {
            if (step.steps.length > 0 && step.steps.map(validateStepType).every(x => x)) {
                return true;
            } else {
                if (!invalidStepFound) {
                    invalidStep = step;
                    invalidStepFound = true;
                }
                return false;
            }
        }
    }

    let stepsValid = json.stepData.map(validateStepType).every(x => x);

    if (!stepsValid) {
        res.errors.push({
            keyword: "step_type",
            message: "one of the steps is not valid",
            offender: invalidStep,
        })
    }

    // ===== RULE: Steps must have distinct ids =====

    const jsonStepData = {
        stepNum: 0,
        distinctIDs: new Set(),
        stepNodes: new Set()
    };

    let foundNonDistinctStep = false;
    let nonDistinctStep = null;

    const getStepData = (stepData, step) => {

        if (stepData.distinctIDs.has(step.id)) {
            if (!foundNonDistinctStep) {
                nonDistinctStep = step;
                foundNonDistinctStep = true;
            }
        }

        if (step.type === "single") {

            return Object.assign(stepData, {
                stepNum: stepData.stepNum + 1,
                distinctIDs: stepData.distinctIDs.add(step.id),
                stepNodes: stepData.stepNodes.add(...step.nodes)
            });
        } else {
            // return stepSum + step.steps.reduce(getStepNum, );
            return Object.assign(stepData, step.steps.reduce(getStepData, stepData));
        }
    }

    let {stepNum, distinctIDs, stepNodes} = json.stepData.reduce(getStepData, jsonStepData);

    const stepIDsValid = stepNum === distinctIDs.size;
    if (!stepIDsValid) {
        res.errors.push({
            keyword: "step_ids",
            message: "not all steps have distinct IDs",
            offender: nonDistinctStep
        })
    }

    // ===== RULE: Steps must only refer to declared nodes =====

    let stepNodesValid = true;
    let foundNonexistentNode = false;
    let nonexistentNode = null;

    for (let node of stepNodes) {
        if (!declaredParticipantsSet.has(node)) {
            stepNodesValid = false;
            if (!foundNonexistentNode) {
                nonexistentNode = node;
                foundNonexistentNode = true;
            }
        }
    }

    if (!stepNodesValid) {
        res.errors.push({
            keyword: "step_nodes",
            message: "some steps refer to nodes that don't exist",
            offender: nonexistentNode
        })
    }

    // ===== RULE: If the step type is 'group', the step must have a nonempty groupName =====
    let groupStepsValid = true;
    let foundInvalidGroupStep = false;
    let invalidGroupStep = null;

    for (let step of json.stepData) {
        if (step.type === "group" && (step.groupName == undefined || step.groupName == null || step.groupName == "")) {
            groupStepsValid = false;
            if (!foundInvalidGroupStep) {
                invalidGroupStep = step;
                foundInvalidGroupStep = true;
            }
        } 
    }

    if (!groupStepsValid) {
        res.errors.push({
            keyword: "group_step_nodes",
            message: "one or more group steps don't have a group name",
            offender: invalidGroupStep
        })
    }

    return res;
}