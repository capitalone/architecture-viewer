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

import Diagram from './diagram';
import ZoneLegend from './zoneLegend';

export default class DiagramArea extends Component {
    constructor(props) {
        super(props);
        // console.log(props);
    }

    render() {

        let dims = {};

        //this is a hack but it's ok
        if (this.props.stepData.length == 0 && window.self == window.top) {
            dims.width = 'calc(80vw - 30px)';
        } else if (this.props.stepData.length == 0 && window.self != window.top) {
            dims.width = 'calc(70vw - 30px)'
        } else {
            dims.width = 'calc(60vw - 30px)'
        }

        let diagramAreaStyle = {
            width: dims.width,
            height: 'calc(100% - 20px)',
            zIndex: '999'
        };

        let btnStyle = {
            position: 'absolute',
            left: '10px',
            top: '10px',
            zIndex: 1000
        };

        return <div style={diagramAreaStyle}>
            <Diagram
                graphData={this.props.graphData}
                stepData={this.props.stepData}
                curStep={this.props.curStep}
                updateSelectedNode={this.props.updateSelectedNode}
                zoneData={this.props.zoneData}
                dims={dims}
                ref={(d) => {this.diag = d; }}
            />
            <button style={btnStyle} onClick={() => {this.diag.renderDiagram();}}> redraw </button>
        </div>
    }
}

