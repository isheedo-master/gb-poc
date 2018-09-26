import * as React from "react";

import {
	DiagramEngine,
	DiagramModel,
	DefaultNodeModel,
	DiagramWidget
} from "storm-react-diagrams";

import uuid from 'uuid/v4';
import { minBy, toArray, once, find, findLast } from 'lodash';

// import the custom models
import { DiamondNodeModel, STAGE_TYPES } from "./custom/DiamondNodeModel";
import { DiamondNodeFactory } from "./custom/DiamondNodeFactory";
import { SimplePortFactory } from "./custom/SimplePortFactory";
import { DiamondPortModel } from "./custom/DiamondPortModel";

export const DiagramContext = React.createContext();

const DIRECTIONS = {
	TOP: 'top',
	BOTTOM: 'bottom',
	LEFT: 'left',
	RIGHT: 'right',
};

export default class extends React.Component {
	constructor(props) {
		super(props);
		//1) setup the diagram engine
		this.engine = new DiagramEngine();
		this.model = new DiagramModel();

		this.engine.installDefaultFactories();
		// this.model.setOffsetX(200);
		// register some other factories as well
		this.engine.registerPortFactory(new SimplePortFactory("diamond", config => new DiamondPortModel()));
		this.engine.registerNodeFactory(new DiamondNodeFactory());

		//3-A) create a default node
		const startNode = new DefaultNodeModel("Start stage", "rgb(0,192,255)");
		const startPort = startNode.addOutPort("Out");
		startNode.setPosition(window.innerWidth / 2, 20);

		//3-B) create our new custom node
		const node2 = new DiamondNodeModel(STAGE_TYPES.STEM);
		node2.setPosition(window.innerWidth / 2 - 30, 100);

		const endNode = new DefaultNodeModel("End stage", "red");
		const endPort = endNode.addInPort("In");
		endNode.setPosition(window.innerWidth / 2, node2.y + 120);

		//3-C) link the 2 nodes together
		const startLink = startPort.link(node2.getPort("top"));
		const endLink = endPort.link(node2.getPort("bottom"));

		//4) add the models to the root graph
		this.model.addAll(startNode, node2, endNode, startLink, endLink);

		//5) load model into engine
		this.starNode = startNode;
		this.endNode = endNode;
		this.endPort = endPort;
		this.startLink = startLink;
		this.endLink = endLink;

		this.engine.setDiagramModel(this.model);
		// this.model.setLocked(true);
	}

	seralizeThis = () => {
		console.log(this.model.serializeDiagram());
	}

	scaleToFit = () => {
		this.engine.repaintCanvas();

		const extremeLeftNode = minBy(toArray(this.model.nodes), node => node.x);
		const extremeTopNode = minBy(toArray(this.model.nodes), node => node.y);

		const xFactor = this.engine.canvas.clientWidth / this.engine.canvas.scrollWidth;
		const yFactor = this.engine.canvas.clientHeight / this.engine.canvas.scrollHeight;
		const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

		this.model.setZoomLevel(this.model.getZoomLevel() * zoomFactor);
		this.model.setOffset(0, 0);
		this.engine.repaintCanvas();
	}

	addNewNode = parentNode => {
		const fromStem = parentNode.nodeType === STAGE_TYPES.STEM;

		// add node instance
		const newNode = fromStem ?
			new DiamondNodeModel(STAGE_TYPES.STEM) :
			new DiamondNodeModel(STAGE_TYPES.BRANCH);

		// position node
		newNode.setPosition(parentNode.x, parentNode.y + 120);

		// add new node to diagram model and re-render
		this.model.addNode(newNode);

		if (parentNode.forkId) {
			newNode.forkId = parentNode.forkId;

			const forkEnd = find(this.model.nodes, node => node.forkId === parentNode.forkId && node.forkEnd);
			const lastStem = findLast(this.model.nodes, node => node.nodeType === 'stem');
			forkEnd.setPosition(forkEnd.x, newNode.y + 120);
			this.endNode.setPosition(window.innerWidth / 2, lastStem.y + 120)
			console.warn(lastStem);
		} else {
			this.endNode.setPosition(window.innerWidth / 2, newNode.y + 120);
		}

		this.engine.repaintCanvas();

		// add a link to new node
		setTimeout(() => {
			// define ports for a new link
			const parentPort = parentNode.getPort(DIRECTIONS.BOTTOM);
			const newPort = newNode.getPort(DIRECTIONS.TOP);

			// add a new link model
			const newLinkModel = newPort.createLinkModel();

			// set link ports
			newLinkModel.setSourcePort(parentPort);
			newLinkModel.setTargetPort(newPort);

			if (
				newNode.nodeType === STAGE_TYPES.STEM &&
				parentNode.nodeType === STAGE_TYPES.STEM
			) {
				this.model.removeLink(this.endLink);
				this.endLink = this.endPort.link(newNode.getPort(DIRECTIONS.BOTTOM));
				this.model.addLink(this.endLink);
			}

			// Add new link to the model and re-render
			this.model.addLink(newLinkModel);
			parentNode.hasChildren = true;
			this.engine.repaintCanvas();
		},0);
		// this.seralizeThis();
	}

	addFork = parentNode => {
		const forkId = uuid();
		const parentPort = parentNode.getPort(DIRECTIONS.BOTTOM);

		// fork end node
		const forkEndNode = new DiamondNodeModel(STAGE_TYPES.STEM);
		forkEndNode.forkId = forkId;
		forkEndNode.forkEnd = true;
		const forkEndPortBottom = forkEndNode.getPort(DIRECTIONS.BOTTOM);

		// position node
		forkEndNode.setPosition(parentNode.x, parentNode.y + 240);
		this.endNode.setPosition(window.innerWidth / 2, forkEndNode.y + 120)

		// add new node to diagram model and re-render
		this.model.addNode(forkEndNode);

		// add lateral instances
		for (let count = 1; count < 3; count++) {
			// add node instance
			const newNode =  new DiamondNodeModel(STAGE_TYPES.BRANCH);
			newNode.forkId = forkId;
			// position node
			newNode.setPosition(parentNode.x + (count % 2 === 0 ? 80 : -80), parentNode.y + 120);

			// add new node to diagram model and re-render
			this.model.addNode(newNode);
			this.engine.repaintCanvas();

			setTimeout(() => {
				const newPortTop = newNode.getPort(DIRECTIONS.TOP);
				const newPortBottom = newNode.getPort(DIRECTIONS.BOTTOM);

				// add a new link model
				const newLinkModelTop = newPortTop.createLinkModel();
				const newLinkModelBottom = newPortBottom.createLinkModel();
				// set link ports
				newLinkModelTop.setSourcePort(parentPort);
				newLinkModelTop.setTargetPort(newPortTop);

				newLinkModelBottom.setSourcePort(newPortBottom);
				newLinkModelBottom.setTargetPort(forkEndPortBottom);

				// Add new link to the model and re-render
				this.model.addLink(newLinkModelTop);
				this.model.addLink(newLinkModelBottom);

				this.model.removeLink(this.endLink);
				this.endLink = this.endPort.link(forkEndPortBottom);
				this.model.addLink(this.endLink);

				parentNode.hasChildren = true;
				this.engine.repaintCanvas();
			}, 0);
		}
	}

	// addNewNode = (direction, parentNode) => {
	// 	const isLateral = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
	// 	const isHierarchial = direction === DIRECTIONS.TOP || direction === DIRECTIONS.BOTTOM;
	// 	const fromStem = isHierarchial && parentNode.nodeType === STAGE_TYPES.STEM;

	// 	const newNode = fromStem ?
	// 		new DiamondNodeModel(STAGE_TYPES.STEM) :
	// 		new DiamondNodeModel(STAGE_TYPES.BRANCH);

	// 	// position node
	// 	if (isLateral) {
	// 		newNode.setPosition(parentNode.x + (direction === DIRECTIONS.LEFT ? -150 : 150), parentNode.y + 50);
	// 	} else if (isHierarchial) {
	// 		newNode.setPosition(parentNode.x, parentNode.y + 120);
	// 	}

	// 	// add new node
	// 	this.model.addNode(newNode);
	// 	this.engine.repaintCanvas();

	// 	setTimeout(() => {
	// 		const parentPort = parentNode.getPort(direction);
	// 		const newPort =  isLateral ?
	// 			newNode.getPort(direction === DIRECTIONS.LEFT ? DIRECTIONS.RIGHT  : DIRECTIONS.LEFT ) :
	// 			newNode.getPort(DIRECTIONS.TOP);
	// 		const newLinkModel = newPort.createLinkModel();

	// 		newLinkModel.setSourcePort(parentPort);
	// 		newLinkModel.setTargetPort(newPort);

	// 		if (
	// 			isHierarchial &&
	// 			newNode.nodeType === STAGE_TYPES.STEM &&
	// 			parentNode.nodeType === STAGE_TYPES.STEM
	// 		) {
	// 			this.model.removeLink(this.endLink);
	// 			this.endLink = this.endPort.link(newNode.getPort(DIRECTIONS.BOTTOM));
	// 			this.model.addLink(this.endLink);
	// 		}

	// 		this.model.addLink(newLinkModel);
	// 		this.engine.repaintCanvas();
	// 	},0);
	// 	// this.seralizeThis();
	// }

	render() {
		//6) render the diagram!
		return (
			<DiagramContext.Provider
				value={{
					addNewNode: this.addNewNode,
					addFork: this.addFork
				}}
			>
				{/* <button onClick={() => this.engine.zoomToFit()}>&#128269;</button> */}
				<DiagramWidget
					className="srd-demo-canvas"
					diagramEngine={this.engine}
					maxNumberPointsPerLink={0}
					allowLooseLinks={false}
				/>
			</DiagramContext.Provider>
		);
	}

};
