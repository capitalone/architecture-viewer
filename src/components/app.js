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
import { Router } from 'preact-router';

// import Header from './header';
// import Home from '../routes/home';
// import Profile from '../routes/profile';

import DiagramArea from './diagramArea';
import InfoArea from './infoArea'

import { parseContents } from './../utils/parser';

// import Home from 'async!./home';
// import Profile from 'async!./profile';



export default class App extends Component {
	// /** Gets fired when the route changes.
	//  *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	//  *	@param {string} event.url	The newly routed URL
	//  */
	// handleRoute = e => {
	// 	this.currentUrl = e.url;
	// };

	constructor(props) {
		super(props);
		this.fillProps = this.fillProps.bind(this);
		this.updateStep = this.updateStep.bind(this);
		this.updateData = this.updateData.bind(this);
		this.updateSelectedNode = this.updateSelectedNode.bind(this);
		this.state = {
			graphData: null,
			stepData: null,
			zoneData: null,
			curStep: 0,
			validJson: true,
			selectedNode: null
		};
	}

	componentDidMount() {
		this.fillProps();
	}

	/*
		sets selectedNode to null to clear out the greying out of
		unrelated steps
	*/
	updateStep(step_num) {
		this.setState(Object.assign(this.state, {
			curStep: step_num,
			selectedNode: null
		}))
	}

	updateSelectedNode(id) {
		this.setState(Object.assign(this.state, {
			selectedNode: id
		}))
	}

	updateData(data) {
		this.setState(Object.assign(this.state, {
			flowTitle: data.title,
			graphData: data.graphData,
			stepData: data.stepData,
			zoneData: data.zoneData,
			curStep: 0,
			selectedNode: null
		}));
	}

	getData() {
		const queryParams = new URLSearchParams(window.location.search);
		if (queryParams == undefined || queryParams == null || queryParams == "") {
			return fetch('assets/data.json')
				.then(res => res.json())
				.then(json => ({
					filename: "Wallet-Push Notifications-Subscription/Enrollment",
					data: json
				}))
				.catch(err => {
					alert(err);
				});
		} else {
			const url = queryParams.get('url');
			if (url == null) {
				return fetch('assets/data.json')
					.then(res => res.json())
					.then(json => ({
						filename: "Wallet-Push Notifications-Subscription/Enrollment",
						data: json
					}))
					.catch(err => {
						alert(err);
					});
			} else {
				let filename = url.substring(url.lastIndexOf('/') + 1);
				let ext = filename.substr(filename.lastIndexOf('.') + 1);
				if (ext == "adoc") {
					return fetch(url)
						.then((res) => {
							if (res.ok) {
								return res.text()
							} else {
								throw {
									errtype: "custom",
									errmsg: "There seems to be an error with the page. Click 'OK' to open the page in a new tab and confirm it is a valid URL"
								}
							}
						})
						.then(text => ({
							filename: filename,
							data: parseContents(text.split("\n"))
						}))
						.catch(err => {
							console.log(((typeof err) === "object"));
							console.log(err.errtype === "custom");
							if (((typeof err) === "object") && err.errtype === "custom") {
								if (confirm(err.errmsg)) {
									window.open(url);
								}
							} else {
								alert(err);
							}
						});
				} else if (ext == "json") {
					return fetch(url)
						.then(res => res.json())
						.then(json => ({
							filename: filename,
							data: json
						}))
						.catch(err => {
							alert(err);
						});
				} else {
					return fetch('assets/data.json')
						.then(res => res.json())
						.then(json => ({
							filename: "zones example",
							data: json
						}))
						.catch(err => {
							alert(err);
						});
				}

			}
		}
	}

	fillProps() {

		let that = this;

		this.getData()
			.then((result) => {

				// console.log(result);
				const data = result.data;
				// console.log(data);
				data.title = data.title == undefined || data.title == "" ? result.filename : data.title;

				that.setState(
					Object.assign(this.state, {
						graphData: data.graphData,
						stepData: data.stepData,
						// zoneData: data.zoneData,
						flowTitle: data.title
					})
				);
			})

	}

	render() {

		let repoUrl = window.location.href.replace("pages/", "");

		if (this.state.graphData && this.state.stepData) {
			return (
				<div id="container">
					<div id="app">
						<DiagramArea graphData={this.state.graphData}
							stepData={this.state.stepData}
							curStep={this.state.curStep}
							updateSelectedNode={this.updateSelectedNode}
							zoneData={this.state.zoneData}></DiagramArea>
						<InfoArea title={this.state.title}
							graphData={this.state.graphData}
							stepData={this.state.stepData}
							curStep={this.state.curStep}
							selectedNode={this.state.selectedNode}
							updateStep={this.updateStep}
							updateData={this.updateData}
							flowTitle={this.state.flowTitle}></InfoArea><br />
					</div>
					<div id="footer"> <a href={repoUrl}>{repoUrl}</a> </div>
				</div>
			);
		} else {
			return <div> Loading... </div>
		}
	}
}

/*<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Profile path="/profile/" user="me" />
					<Profile path="/profile/:user" />
				</Router>*/