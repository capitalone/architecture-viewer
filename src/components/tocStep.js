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
import info from '../assets/icons/info.png';

export default class TocStep extends Component {

    constructor(props) {
        super(props);
        this.setStep = this.setStep.bind(this);
        this.toggleToolTip = this.toggleToolTip.bind(this);
        this.state = {
            showToolTip: false
        };
    }

    componentDidUpdate() {
        // console.log(!elementInViewport(this.elem));

        function isElementInContainer(el, container) {

            var el_rect = el.getBoundingClientRect();
            // console.log(el_rect);

            var cont_rect = container.getBoundingClientRect();
            // console.log(cont_rect);

            return (
                el_rect.top >= cont_rect.top &&
                el_rect.bottom <= cont_rect.bottom
            );
        }

        if (this.props.matches && !isElementInContainer(this.elem, document.getElementById("table-of-contents"))) {
            this.elem.scrollIntoView(false);
        }
    }

    setStep() {
        this.props.updateStep(this.props.step.id);
    }

    toggleToolTip() {
        this.setState({
            showToolTip: !this.state.showToolTip
        });
    }

    render() {

        let classNames = [];
        if (this.props.matches) {
            classNames.push("current-step-toc");
        }
        if (!this.props.related && this.props.filterRelated) {
            classNames.push("unrelated-step-toc");
        }

        if (window.self != window.top) {
            classNames.push("iframe-list-style");
        }

        const hasToolTip = this.props.step.note != undefined && this.props.step.note != "";
        let toolTip = null;
        let toolTipText = null;
        // console.log(this.props.step);
        if (hasToolTip) {
            classNames.push("hasnote");
            toolTip = (
                <span className="to-left" onClick={this.toggleToolTip}> <img src={info}></img> </span>
            );
            toolTipText = (
                <div className="note" dangerouslySetInnerHTML={{__html:this.props.step.note.replace(/\\n/g, "<br/>")}}> </div>
            )
        }

        return <li
            ref={(elem) => { this.elem = elem }}
            className={classNames.join(' ')}
            onclick={this.setStep} >
            {toolTip}
            <span> {this.props.step.description} </span><br/>
            {this.state.showToolTip ? toolTipText : null}
        </li>
    }
}