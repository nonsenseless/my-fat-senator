export interface InteractiveElement {
	includesCoordinate: (x: number, y: number) => boolean;
	rightEdge: () => number;
	leftEdge: () => number;
	topEdge: () => number;
	bottomEdge: () => number;
	selected: boolean;
}