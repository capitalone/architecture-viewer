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

import Controls from './controls';
import TableOfContents from './tableOfContents';
import Info     from './info';


export default class InfoArea extends Component {

    render() {

        let width;

        if (this.props.stepData.length == 0 && window.self == window.top) {
            width = 'calc(20% - 30px)'
        } else if (this.props.stepData.length == 0 && window.self != window.top) {
            width = 'calc(30% - 30px)';
        } else {
            width = 'calc(40% - 30px)'
        }

        let infoAreaStyle = {
            width: width,
            height: 'calc(100% - 20px)',
            zIndex: '999',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around'
        }

        const countSteps = (sum, step) => {
            if (step.type == "single") {
                return sum + 1;
            } else if (step.type == "group") {
                return step.steps.reduce(countSteps, sum);
            }
        }

        let stepNum = this.props.stepData.reduce(countSteps, 0);

        return (
            <div id="infoArea" style={infoAreaStyle} className="container-border">
                <Info flowTitle={this.props.flowTitle}></Info>
                <TableOfContents updateStep={this.props.updateStep}
                                 stepData={this.props.stepData}
                                 curStep={this.props.curStep}
                                 selectedNode={this.props.selectedNode}></TableOfContents>
                
                <Controls curStep={this.props.curStep} 
                          stepNum={stepNum}
                          updateStep={this.props.updateStep}
                          updateData={this.props.updateData}></Controls>
            </div>
        )
    }
}

/*<div id="info" className="sub-container-border">info</div>*/