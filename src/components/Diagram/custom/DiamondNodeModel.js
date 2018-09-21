import { NodeModel } from "storm-react-diagrams";
import { DiamondPortModel } from "./DiamondPortModel";

export const STAGE_TYPES = {
	STEM: 'stem',
	BRANCH: 'branch',
};

export class DiamondNodeModel extends NodeModel {
	constructor(nodeType) {
		super("diamond");
		this.nodeType = nodeType || STAGE_TYPES.STEM;
		this.addPort(new DiamondPortModel("top"));
		this.addPort(new DiamondPortModel("left"));
		this.addPort(new DiamondPortModel("bottom"));
		this.addPort(new DiamondPortModel("right"));
	}
}
