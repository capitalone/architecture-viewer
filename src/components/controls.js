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
 
import { h, Component } from 'preact';
import validate from '../utils/dataValidator.js';
import { parseContents } from '../utils/parser.js';

export default class Controls extends Component {

    constructor(props) {
        super(props);
        this.decrementStep = this.decrementStep.bind(this);
        this.incrementStep = this.incrementStep.bind(this);
        this.firstStep = this.firstStep.bind(this);
        this.lastStep = this.lastStep.bind(this);
        this.handleKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    componentWillMount() {
        document.addEventListener("keydown", this.handleKeyboardShortcuts);
    }

    decrementStep() {
        const step = parseInt(this.props.curStep);
        if (step > 0) {
            this.props.updateStep(step - 1);
        }
    }

    incrementStep() {
        const step = parseInt(this.props.curStep);
        if (step < this.props.stepNum - 1) {
            this.props.updateStep(step + 1);
        }
    }

    firstStep() {
        let step = 0;
        this.props.updateStep(step);
    }

    lastStep() {
        let step = this.props.stepNum - 1;
        this.props.updateStep(step);
    }

    handleKeyboardShortcuts(event) {
		switch (event.keyCode) {
			case 37:
				//left arrow key
				this.decrementStep();
                break;
            case 38:
                //up arrow key
                this.decrementStep();
                break;
			case 39:
				//right arrow key
				this.incrementStep();
                break;
            case 40:
                //down arrow key
                this.incrementStep();
                break;
		}
	}

    updateData(evt) {
        const file = evt.target.files[0];

        const fileName = file.name.slice(0, -5);

        // Clear out the file input.  This is necessary to force a refresh of 
        // the file any time you select a file.  
        //
        // If you don't do this, then selecting a file with the same name will 
        // cache the first version, and not load the newest version.
        evt.target.value = '';

        var reader = new FileReader();

        reader.onload = (e) => {
            //would update the data here
            let empty_json = {
                title: '',
                graphData: {
                    nodes: [],
                    edges: []
                },
                stepData: [],
                zoneData: []
            };

            let json = {};
            try {

                let ext = file.name.substr(file.name.lastIndexOf('.') + 1);
                let validFileType = true;

                //TODO: REUSABLE FROM APP.JS
                if (ext == "json") {
                    json = JSON.parse(reader.result);
                } else if (ext == "adoc") {
                    json = parseContents(reader.result.split("\n"));
                } else {
                    validFileType = false;
                }
                
                json.title = json.title == "" ? fileName : json.title;
                //this is where a parser would come in and check if the structure is correct
                //the checker is very rough at this point
                const validatorResult = validate(json);
                console.log("valid?: ", validatorResult.valid);

                var error = false;

                if (!validFileType) {
                    json = empty_json;
                    console.log("invalid file type!");
                }
                else if (!validatorResult.valid) {
                    json = empty_json;
                    //TODO: RESERVE A SPOT ON THE SCREEN FOR ERRORS, put it in the TOC area
                    console.log(validatorResult.errors);
                }

            } catch (e) {
                console.error(e);
                console.error('json could not be parsed!');
                json = empty_json;
            }
            // console.log(json);
            this.props.updateData(json);
        }

        reader.readAsText(file);
    }

    render() {

        let controlsStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around'
        }

        let stepElems;

        //fix to be 1-started
        const pNum = 1;

        if (this.props.stepNum == 0) {
            stepElems = null;
        } else {
            let iframeCheck;
            if (window.self != window.top) {
                iframeCheck = "iframe-button-style";
            } else {
                iframeCheck = "";
            }
            stepElems = <div id="move-steps">
                    <button onClick={this.firstStep} className={iframeCheck}>{"<<"}</button>
                    <button onClick={this.decrementStep} className={iframeCheck}>{"<"}</button>
                    <span className="cur-step"> Step: {parseInt(this.props.curStep) + 1} </span>
                    <button onClick={this.incrementStep} className={iframeCheck}>{">"}</button>
                    <button onClick={this.lastStep} className={iframeCheck}>{">>"}</button>
                </div>;
        }

        return (
            <div id="controls" style={controlsStyle} className="sub-container-border">
                { stepElems }
                <div id="upload-plantuml">
                    open a PlantUML file: &nbsp; <br/>
                    <input type="file" onChange={this.updateData}/>
                </div>
            </div>
        )
    }
}
