import * as React from "react";

import {
	DiagramEngine,
	DiagramModel,
	DefaultNodeModel,
	DiagramWidget
} from "storm-react-diagrams";

// import the custom models
import { DiamondNodeModel, STAGE_TYPES } from "./custom/DiamondNodeModel";
import { DiamondNodeFactory } from "./custom/DiamondNodeFactory";
import { SimplePortFactory } from "./custom/SimplePortFactory";
import { DiamondPortModel } from "./custom/DiamondPortModel";
import * as beautify from "json-beautify";

export const DiagramContext = React.createContext();

const DIRECTIONS = {
	TOP: 'top',
	BOTTOM: 'bottom',
	LEFT: 'left',
	RIGHT: 'right',
};

/**
 * @Author Dylan Vorster
 */
export default class extends React.Component {
	constructor(props) {
		super(props);
		//1) setup the diagram engine
		this.engine = new DiagramEngine();
		this.model = new DiagramModel();

		this.model.offsetX = window.innerWidth / 2;

		this.engine.installDefaultFactories();

		// register some other factories as well
		this.engine.registerPortFactory(new SimplePortFactory("diamond", config => new DiamondPortModel()));
		this.engine.registerNodeFactory(new DiamondNodeFactory());

		//3-A) create a default node
		const startNode = new DefaultNodeModel("Start stage", "rgb(0,192,255)");
		const startPort = startNode.addOutPort("Out");
		startNode.setPosition(0, 20);

		//3-B) create our new custom node
		const node2 = new DiamondNodeModel(STAGE_TYPES.STEM);
		node2.setPosition(0, 100);

		const endNode = new DefaultNodeModel("End stage", "red");
		const endPort = endNode.addInPort("In");
		endNode.setPosition(0, window.innerHeight - 60);

		//3-C) link the 2 nodes together
		const startLink = startPort.link(node2.getPort("top"));
		const endLink = endPort.link(node2.getPort("bottom"));

		//4) add the models to the root graph
		this.model.addAll(startNode, node2, endNode, startLink, endLink);

		//5) load model into engine
		// this.model.setLocked(true);
		this.starNode = startNode;
		this.endNode = endNode;
		this.endPort = endPort;
		this.startLink = startLink;
		this.endLink = endLink;

		// this.model.setLocked(true);
		this.engine.setDiagramModel(this.model);
	}

	seralizeThis = () => {
		console.warn(this.model.serializeDiagram());
	}

	addNewNode = (direction, parentNode) => {
		const isLateral = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
		const isHierarchial = direction === DIRECTIONS.TOP || direction === DIRECTIONS.BOTTOM;
		const fromStem = isHierarchial && parentNode.nodeType === STAGE_TYPES.STEM;

		const newNode = fromStem ?
			new DiamondNodeModel(STAGE_TYPES.STEM) :
			new DiamondNodeModel(STAGE_TYPES.BRANCH);

		// position node
		if (isLateral) {
			newNode.setPosition(parentNode.x + (direction === DIRECTIONS.LEFT ? -250 : 250), parentNode.y + 30);
		} else if (isHierarchial) {
			newNode.setPosition(parentNode.x, parentNode.y + 100);
		}

		// add new node
		this.model.addNode(newNode);
		this.forceUpdate();

		setTimeout(() => {
			const parentPort = parentNode.getPort(direction);
			const newPort =  isLateral ?
				newNode.getPort(direction === DIRECTIONS.LEFT ? DIRECTIONS.RIGHT  : DIRECTIONS.LEFT ) :
				newNode.getPort(DIRECTIONS.TOP);
			const newLinkModel = newPort.createLinkModel();

			newLinkModel.setSourcePort(parentPort);
			newLinkModel.setTargetPort(newPort);

			if (
				isHierarchial &&
				newNode.nodeType === STAGE_TYPES.STEM &&
				parentNode.nodeType === STAGE_TYPES.STEM
			) {
				this.model.removeLink(this.endLink);
				this.endLink = this.endPort.link(newNode.getPort(DIRECTIONS.BOTTOM));
				this.model.addLink(this.endLink);
			}

			this.model.addLink(newLinkModel);
			this.forceUpdate();
		},0);
		this.seralizeThis();
	}

	render() {
		//6) render the diagram!
		return (
			<DiagramContext.Provider value={{ addNewNode: this.addNewNode, model: this.model }}>
				<DiagramWidget
					className="srd-demo-canvas"
					diagramEngine={this.engine}
					allowLooseLinks={false}
				/>
			</DiagramContext.Provider>
		);
	}

};
