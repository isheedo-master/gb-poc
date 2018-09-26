import * as React from "react";
import { PortWidget } from "storm-react-diagrams";
import { truncate } from 'lodash';

import { DiagramContext } from '../index';

/**
 * @author Dylan Vorster
 */
export class DiamonNodeWidget extends React.Component {
	static defaultProps = {
		size: 120,
		node: null
	};

	constructor(props) {
		super(props);
		this.state = {};
	}

	toggleBottomMenu = () => {
		if (this.state[this.props.node.id]) {
			this.setState({
				[this.props.node.id]: !this.state[this.props.node.id],
			})
		} else {
			this.setState({
				[this.props.node.id]: true,
			})
		}

	}

	render() {
		return (
			<DiagramContext.Consumer>
				{contextData => {
					return (
						<section>
							<div
								className={"diamond-node"}
								style={{
									position: "relative",
									width: this.props.size,
									height: 50,
								}}
							>
								<svg
									width={this.props.size}
									height={50}
									title={this.props.node.id}
									dangerouslySetInnerHTML={{
										__html:
											`
											<g id="Layer_1">
											</g>
											<g id="Layer_2">
												<rect
													fill="#1dc1c1"
													stroke="#000"
													stroke-width="4"
													x="0"
													y="0"
													width="${this.props.size}"
													height="${50}"
												/>
												<text
													fill="#000000"
													stroke="#000"
													stroke-width="0"
													x="14.875"
													y="30"
													font-size="14"
													font-family="Helvetica, Arial, sans-serif"
													text-anchor="start"
													stroke-dasharray="none"
													title={${this.props.node.id}}
												>
													Stage ${truncate(this.props.node.id, {
														'length': 8,
														'separator': ' '
													})}
												</text>
											</g>
										`
									}}
								/>
								<div
									style={{
										position: "absolute",
										zIndex: 10,
										top: this.props.size / 2 - 8,
										left: -8
									}}
								>
									{/* <PortWidget name="left" node={this.props.node} /> */}
									{/* <button onClick={() => contextData.addNewNode('left', this.props.node)}>+</button> */}
								</div>
								<div
									style={{
										position: "absolute",
										zIndex: 10,
										left: this.props.size / 2 - 8,
										top: -8
									}}
								>
									<PortWidget name="top" node={this.props.node} />
								</div>
								<div
									style={{
										position: "absolute",
										zIndex: 10,
										left: this.props.size - 8,
										top: this.props.size / 2 - 8
									}}
								>
									{/* <PortWidget name="right" node={this.props.node} /> */}
									{/* <button onClick={() => contextData.addNewNode('right', this.props.node)}>+</button> */}
								</div>
								<div
									style={{
										position: "absolute",
										zIndex: 10,
										left: this.props.size / 2 - 8,
										top: 42,
									}}
								>
									<PortWidget name="bottom" node={this.props.node} />
									{!this.props.node.hasChildren && (
										<button onClick={() => this.toggleBottomMenu()}>+</button>
									)}
									{this.state[this.props.node.id] && (
										<div style={{
											display: 'flex',
											position: 'absolute',
											right: '-50%',
											transform: 'translateX(50%)',
											width: 150,
										}}>
											<button
												onClick={() => {
													contextData.addNewNode(this.props.node)
													this.toggleBottomMenu();
												}}
											>
												Add a stage
											</button>
											<button
												onClick={() => {
													contextData.addFork(this.props.node)
													this.toggleBottomMenu();
												}}
											>
												Add a fork
											</button>
										</div>
									)}
								</div>
							</div>
						</section>
					);
				}}
			</DiagramContext.Consumer>
		);
	}
}

export default DiamonNodeWidget;
