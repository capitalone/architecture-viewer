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

import Key from './key';

export default class ZoneLegend extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        let zoneLegendStyle = {
            display: 'flex',
            flexDirection: 'column',
            // justifyContent: 'space-around',
            flexWrap: 'wrap',
            position: 'absolute',
            bottom: '15px',
            left: '20px',
            width: '200px',
            height: '160px'
        }

        if (this.props.keys.length <= 0) {
            zoneLegendStyle.display = 'none';
        }

        let keys = this.props.keys.map(key => {
            return <Key name={key.name} color={key.color}></Key>
        })

        return (
            <div id="zone-legend" style={zoneLegendStyle} className="sub-container-border">
                { keys }
            </div>
        )
    }
}