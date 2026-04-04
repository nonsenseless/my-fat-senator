import { IMousePosition, BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';

import { BallotPopup } from './ballot-popup';

// Simulation state layered on top of BallotViewModel; local to this component.
type ScaleBallot = BallotViewModel & { landed: boolean; side: 'nay' | 'yea' };

interface NayYeaScaleProps {
	nayBallots: BallotViewModel[];
	yeaBallots: BallotViewModel[];
	height: number;
	totalPopulation: number;
	maxTiltDegrees?: number;
}

const BEAM_Y_RATIO = 0.85;
const PLANK_HEIGHT = 10;
const FULCRUM_WIDTH = 30;
const FULCRUM_HEIGHT = 20;
const PEDESTAL_WIDTH = 10;
const PEDESTAL_HEIGHT = 10;

function configureScaleBallots(
	nayBallots: BallotViewModel[],
	yeaBallots: BallotViewModel[],
	totalPopulation: number,
	width: number,
	height: number
): ScaleBallot[] {
	const maxRadius = Math.min(width / 2, height) * 0.55;
	const minRadius = 5;

	const configure = (ballot: BallotViewModel, side: 'nay' | 'yea'): ScaleBallot => {
		const statePopulation = ballot.stateCensus?.population ?? 0;
		const scalingFactor = statePopulation / totalPopulation;
		ballot.radius = minRadius + scalingFactor * (maxRadius - minRadius);
		ballot.includesCoordinate = (x: number, y: number) => {
			return ballot.x + ballot.radius > x &&
				ballot.x - ballot.radius < x &&
				ballot.y + ballot.radius > y &&
				ballot.y - ballot.radius < y;
		};
		ballot.bottomEdge = () => ballot.y + ballot.radius;
		ballot.topEdge = () => ballot.y - ballot.radius;
		ballot.rightEdge = () => ballot.x + ballot.radius;
		ballot.leftEdge = () => ballot.x - ballot.radius;
		const sb = ballot as ScaleBallot;
		sb.landed = false;
		sb.side = side;
		return sb;
	};

	return [
		...nayBallots.map(b => configure(b, 'nay')),
		...yeaBallots.map(b => configure(b, 'yea')),
	];
}

// Updates radii in-place when canvas dimensions change without reseeding positions.
function updateBallotRadii(
	ballots: ScaleBallot[],
	width: number,
	height: number,
	totalPopulation: number
): void {
	const maxRadius = Math.min(width / 2, height) * 0.55;
	const minRadius = 5;
	ballots.forEach(b => {
		const pop = b.stateCensus?.population ?? 0;
		b.radius = minRadius + (pop / totalPopulation) * (maxRadius - minRadius);
	});
}

function scalePhysicsStep(
	ballots: ScaleBallot[],
	maxWidth: number,
	beamYAtX: (x: number) => number,
	reseed = true,
	gravity = 1
): () => void {
	const halfWidth = maxWidth / 2;
	const velocityScalingFactor = 0.1;
	const buffer = 2;

	if (reseed) {
		ballots.forEach(b => {
			const xOffset = b.side === 'nay' ? 0 : halfWidth;
			b.x = xOffset + (Math.random() * (halfWidth - 2 * b.radius)) + b.radius;
			b.y = b.radius;
			b.vx = 0;
			b.vy = 0;
			b.landed = false;
		});
	}

	return function step() {
		ballots.forEach((a, idx) => {
			if (a.landed) { return; }

			let dy = gravity;
			let dx = 0;

			ballots.forEach((b, jdx) => {
				if (idx === jdx) { return; }
				const dist = Math.hypot(a.x - b.x, a.y - b.y);
				const minDist = a.radius + b.radius + buffer;
				if (dist < minDist && dist > 0) {
					const angle = Math.atan2(a.y - b.y, a.x - b.x);
					const force = (minDist - dist) * 0.5;
					dx += Math.cos(angle) * force;
					dy += Math.sin(angle) * force;
				}
			});

			a.vx = (a.vx + dx * 0.1) * 0.95;
			a.vy = (a.vy + dy * 0.1) * 0.95;

			const floor = beamYAtX(a.x);
			if (a.bottomEdge() + a.vy > floor) {
				a.y = floor - a.radius;
				a.vy = Math.max(-1, a.vy * -0.3);
				if (Math.abs(a.vy) < 0.5) {
					a.vy = 0;
					a.vx = 0;
					a.landed = true;
				}
			} else {
				a.vy += dy * velocityScalingFactor;
				a.y += a.vy;
			}

			const leftBound = a.side === 'nay' ? 0 : halfWidth;
			const rightBound = a.side === 'nay' ? halfWidth : maxWidth;

			if (a.leftEdge() < leftBound) { a.x = leftBound + a.radius; }
			if (a.rightEdge() > rightBound) { a.x = rightBound - a.radius; }
			a.x += dx * velocityScalingFactor;

			if (Math.abs(a.vx) < 0.1) { a.vx = 0; }
			if (Math.abs(a.vy) < 0.1) { a.vy = 0; }
		});

		// Re-pin landed ballots to current beam surface as it shifts.
		ballots.forEach(a => {
			if (a.landed) {
				a.y = beamYAtX(a.x) - a.radius;
			}
		});
	};
}

export const NayYeaScale: React.FC<NayYeaScaleProps> = (props) => {
	// Always-current mirrors of props, readable inside stable callbacks.
	const heightRef = useRef(props.height);
	heightRef.current = props.height;
	const totalPopulationRef = useRef(props.totalPopulation);
	totalPopulationRef.current = props.totalPopulation;
	const maxTiltDegreesRef = useRef(props.maxTiltDegrees ?? 30);
	maxTiltDegreesRef.current = props.maxTiltDegrees ?? 30;
	const nayBallotsRef = useRef(props.nayBallots);
	nayBallotsRef.current = props.nayBallots;
	const yeaBallotsRef = useRef(props.yeaBallots);
	yeaBallotsRef.current = props.yeaBallots;

	// DOM refs
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Dimension refs — written by ResizeObserver, read by render callbacks.
	const canvasWidthRef = useRef(0);
	const pivotXRef = useRef(0);

	// Simulation refs
	const ballots = useRef<ScaleBallot[]>([]);
	const physicsStepRef = useRef<(() => void) | undefined>(undefined);
	const beamAngleRef = useRef(0);
	const targetAngleRef = useRef(0);
	const start = useRef(0);

	// Image refs
	const images = useRef<Map<number, HTMLImageElement>>(new Map());
	const fallbackImage = useRef<HTMLImageElement | null>(null);

	// Interaction refs
	const mousePosition = useRef<IMousePosition>({ x: 0, y: 0 });
	const canvasBoundsRef = useRef<DOMRect | null>(null);

	const [selectedBallot, setSelectedBallot] = useState<BallotViewModel | null>(null);

	// Stable — reads pivot from refs so it always reflects the latest dimensions.
	const beamYAtX = useCallback((x: number): number => {
		const pivotY = heightRef.current * BEAM_Y_RATIO;
		return pivotY + (x - pivotXRef.current) * Math.tan(beamAngleRef.current);
	}, []);

	const loadImages = useCallback((configured: ScaleBallot[]) => {
		images.current.clear();
		fallbackImage.current = new Image();
		fallbackImage.current.src = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
		configured.forEach(ballot => {
			const imageUrl = ballot.legislator.depiction?.imageUrl;
			if (!imageUrl) { return; }
			const img = new Image();
			img.src = imageUrl;
			images.current.set(ballot.legislator.id, img);
		});
	}, []);

	const handleMouseMove = useCallback((event: MouseEvent) => {
		const canvas = event.currentTarget as HTMLCanvasElement;
		const canvasBounds = canvas.getBoundingClientRect();
		canvasBoundsRef.current = canvasBounds;
		mousePosition.current.x = event.clientX - canvasBounds.left;
		mousePosition.current.y = event.clientY - canvasBounds.top;
	}, []);

	// Stable — all reads from refs.
	const renderToken = useCallback((
		ctx: CanvasRenderingContext2D,
		ballot: BallotViewModel,
		image: HTMLImageElement
	) => {
		const dx = ballot.x - ballot.radius;
		const dy = ballot.y - ballot.radius;
		ctx.save();
		ctx.beginPath();
		ctx.arc(ballot.x, ballot.y, ballot.radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(image, dx, dy, ballot.radius * 2, ballot.radius * 2);
		ctx.restore();
	}, []);

	// Stable — reads beam state and dimensions from refs.
	const renderBeam = useCallback((ctx: CanvasRenderingContext2D) => {
		const angle = beamAngleRef.current;
		const pX = pivotXRef.current;
		const pY = heightRef.current * BEAM_Y_RATIO;
		const cW = canvasWidthRef.current;

		// Dividing line between Nay and Yea
		ctx.save();
		ctx.strokeStyle = 'rgba(0,0,0,0.15)';
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(pX, 0);
		ctx.lineTo(pX, pY);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();

		// Plank
		ctx.save();
		ctx.translate(pX, pY);
		ctx.rotate(angle);
		ctx.fillStyle = '#8B6914';
		ctx.fillRect(-cW / 2, -PLANK_HEIGHT / 2, cW, PLANK_HEIGHT);
		ctx.restore();

		// Fulcrum triangle
		ctx.beginPath();
		ctx.moveTo(pX, pY + PLANK_HEIGHT / 2);
		ctx.lineTo(pX - FULCRUM_WIDTH / 2, pY + PLANK_HEIGHT / 2 + FULCRUM_HEIGHT);
		ctx.lineTo(pX + FULCRUM_WIDTH / 2, pY + PLANK_HEIGHT / 2 + FULCRUM_HEIGHT);
		ctx.closePath();
		ctx.fillStyle = '#5C4A1E';
		ctx.fill();

		// Pedestal
		ctx.fillStyle = '#5C4A1E';
		ctx.fillRect(
			pX - PEDESTAL_WIDTH / 2,
			pY + PLANK_HEIGHT / 2 + FULCRUM_HEIGHT,
			PEDESTAL_WIDTH,
			PEDESTAL_HEIGHT
		);
	}, []);

	// Stable — reads from refs, no prop captures.
	const updateTargetAngle = useCallback(() => {
		let nayWeight = 0;
		let yeaWeight = 0;
		ballots.current.forEach(b => {
			if (!b.landed) { return; }
			const pop = b.stateCensus?.population ?? 0;
			if (b.side === 'nay') { nayWeight += pop; }
			else { yeaWeight += pop; }
		});
		const totalWeight = nayWeight + yeaWeight;
		if (totalWeight === 0) {
			targetAngleRef.current = 0;
			return;
		}
		const weightDiff = (yeaWeight - nayWeight) / totalWeight;
		const maxTiltRadians = (maxTiltDegreesRef.current * Math.PI) / 180;
		targetAngleRef.current = weightDiff * maxTiltRadians;
	}, []);

	// Stable — all dependencies are themselves stable or read from refs.
	const render = useCallback((ctx: CanvasRenderingContext2D, ts: number | null): number => {
		// Skip frames while the canvas has no width yet.
		if (canvasWidthRef.current === 0) {
			return window.requestAnimationFrame((timestamp) => render(ctx, timestamp));
		}

		const now = ts ?? 0;
		const elapsed = now - start.current;
		const fps = 30;
		const fpsInterval = 1000 / fps;

		if (elapsed > fpsInterval) {
			start.current = now - (elapsed % fpsInterval);

			beamAngleRef.current += (targetAngleRef.current - beamAngleRef.current) * 0.05;

			if (physicsStepRef.current) { physicsStepRef.current(); }
			updateTargetAngle();

			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			renderBeam(ctx);

			let anyBallotSelected = false;
			ballots.current.forEach((ballot) => {
				const selected = ballot.includesCoordinate(mousePosition.current.x, mousePosition.current.y);
				if (selected) {
					anyBallotSelected = true;
					setSelectedBallot(ballot);
				}
				const img = images.current.get(ballot.legislator.id) ?? fallbackImage.current;
				if (img) { renderToken(ctx, ballot, img); }
			});

			if (!anyBallotSelected) { setSelectedBallot(null); }
		}

		return window.requestAnimationFrame((timestamp) => render(ctx, timestamp));
	}, [renderToken, renderBeam, updateTargetAngle]);

	// Effect 1: start animation loop once on mount.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) { return; }
		const ctx = canvas.getContext('2d');
		if (!ctx) { return; }
		const animationFrameId = render(ctx, null);
		return () => { window.cancelAnimationFrame(animationFrameId); };
	}, [render]);

	// Effect 2: ResizeObserver — updates canvas buffer width without restarting the
	// animation loop. On first measurement, seeds the simulation. On subsequent
	// measurements, updates radii and physics bounds in-place so positions are kept.
	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) { return; }

		const observer = new ResizeObserver((entries) => {
			const newWidth = Math.floor(entries[0].contentRect.width);
			if (newWidth === 0) { return; }

			const prevWidth = canvasWidthRef.current;
			canvasWidthRef.current = newWidth;
			pivotXRef.current = newWidth / 2;
			canvas.width = newWidth;

			if (prevWidth === 0) {
				// First measurement: configure and seed full simulation.
				const configured = configureScaleBallots(
					nayBallotsRef.current, yeaBallotsRef.current,
					totalPopulationRef.current, newWidth, heightRef.current
				);
				ballots.current = configured;
				beamAngleRef.current = 0;
				targetAngleRef.current = 0;
				start.current = 0;
				physicsStepRef.current = scalePhysicsStep(configured, newWidth, beamYAtX);
				loadImages(configured);
			} else {
				// Subsequent resize: update radii and physics bounds without reseeding.
				updateBallotRadii(ballots.current, newWidth, heightRef.current, totalPopulationRef.current);
				physicsStepRef.current = scalePhysicsStep(ballots.current, newWidth, beamYAtX, false);
			}
		});

		observer.observe(container);
		return () => { observer.disconnect(); };
	}, [beamYAtX, loadImages]);

	// Effect 3: re-seed simulation when ballot data or height changes.
	useEffect(() => {
		if (canvasWidthRef.current === 0) { return; }
		const configured = configureScaleBallots(
			props.nayBallots, props.yeaBallots,
			props.totalPopulation, canvasWidthRef.current, props.height
		);
		ballots.current = configured;
		beamAngleRef.current = 0;
		targetAngleRef.current = 0;
		start.current = 0;
		physicsStepRef.current = scalePhysicsStep(configured, canvasWidthRef.current, beamYAtX);
		loadImages(configured);
	}, [props.nayBallots, props.yeaBallots, props.totalPopulation, props.height, beamYAtX, loadImages]);

	return (
		<div ref={containerRef} className="relative flex flex-1 flex-col">
			<div className="flex w-full">
				<h3 className="flex-1 text-center text-sm font-semibold uppercase tracking-wide">Nay</h3>
				<h3 className="flex-1 text-center text-sm font-semibold uppercase tracking-wide">Yea</h3>
			</div>
			<canvas
				ref={canvasRef}
				height={props.height}
				style={{ display: 'block', width: '100%' }}
				onMouseMove={handleMouseMove}
			/>
			{selectedBallot ? (
				<BallotPopup
					ballot={selectedBallot}
					viewportX={(canvasBoundsRef.current?.left ?? 0) + selectedBallot.x}
					viewportY={(canvasBoundsRef.current?.top ?? 0) + selectedBallot.y}
				/>
			) : null}
		</div>
	);
};
