import * as React from "react";
import { DiamondNodeModel } from "./DiamondNodeModel";
import { PortWidget } from "storm-react-diagrams";

import { DiagramContext } from '../index';

/**
 * @author Dylan Vorster
 */
export class DiamonNodeWidget extends React.Component {
	static defaultProps = {
		size: 150,
		node: null
	};

	constructor(props) {
		super(props);
		this.state = {};
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
									height: 50
								}}
							>
								<svg
									width={this.props.size}
									height={50}
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
													width="150"
													height="50"
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
												>
													STAGE ${this.props.node.id}
												</text>
											</g>
										`
									}}
								/>
								<div
									style={{
										position: "absolute",
										zIndex: 10,
										top: 15,
										left: -8
									}}
								>
									<PortWidget name="left" node={this.props.node} />
									<button onClick={() => contextData.addNewNode('left', this.props.node)}>+</button>
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
										top: 15
									}}
								>
									<PortWidget name="right" node={this.props.node} />
									<button onClick={() => contextData.addNewNode('right', this.props.node)}>+</button>
								</div>
								<div
									style={{
										position: "absolute",
										zIndex: 10,
										left: this.props.size / 2 - 8,
										top: 40
									}}
								>
									<PortWidget name="bottom" node={this.props.node} />
									<button
										onClick={() => contextData.addNewNode('bottom', this.props.node)}>+</button>
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
