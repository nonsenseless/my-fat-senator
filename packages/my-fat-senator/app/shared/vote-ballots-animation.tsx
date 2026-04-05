import { IMousePosition, BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useCallback, useEffect, useMemo, useRef, useState, MouseEvent } from 'react';

import { BallotPopup } from './ballot-popup';

interface VoteBallotsAnimationProps {
	ballotChoiceType: string;
	ballots: BallotViewModel[];
	totalPopulation: number;
	width: number;
	height: number;
}

function formatLabel(slug: string): string {
	return slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function forceDirectedPile(ballots: BallotViewModel[], maxWidth: number, maxHeight: number, gravity = 1) {
	const startingXVelocity = 0;
	const startingYVelocity = gravity;
	const velocityScalingFactor = 0.1;
	const buffer = 2;

	ballots.forEach(b => {
		// Start at random horizontal position, top of canvas
		b.x = (Math.random() * (maxWidth - 2 * b.radius)) + b.radius;
		b.y = b.radius;
		b.vy = 0;
	});

	function step() {
		ballots.forEach((a, idx) => {
			let dy = startingYVelocity;
			let dx = startingXVelocity;

			ballots.forEach((b, jdx) => {
				if (idx === jdx) {
					return;
				}

				const dist = Math.hypot(a.x - b.x, a.y - b.y);
				const minDist = a.radius + b.radius + buffer;
				if (dist < minDist && dist > 0) {
					const angle = Math.atan2(a.y - b.y, a.x - b.x);
					const force = (minDist - dist) * 0.5;
					dx += Math.cos(angle) * force;
					dy += Math.sin(angle) * force;
				}
			});

			// Apply forces to velocity
			a.vx = (a.vx + dx * 0.1) * 0.95; // Add damping (0.95 = 5% friction)
			a.vy = (a.vy + dy * 0.1) * 0.95; // More damping for vertical movement

			// Prevent falling below the canvas
			if (a.bottomEdge() + a.vy > maxHeight) {
				a.y = maxHeight - a.radius;
				a.vy = Math.max(-1, a.vy * -0.3);
			} else {
				a.vy += dy * velocityScalingFactor;
				a.y += a.vy;
			}

			// Prevent moving outside horizontally
			if (a.leftEdge() < 0) {
				a.x = a.radius;
			}
			if (a.rightEdge() > maxWidth) {
				a.x = maxWidth - a.radius;
			}

			a.x += dx * velocityScalingFactor;

			if (Math.abs(a.vx) < 0.1) { a.vx = 0; }
			if (Math.abs(a.vy) < 0.1) { a.vy = 0; }
		});
	}

	return step;
}

export const VoteBallotsAnimation: React.FC<VoteBallotsAnimationProps> = (props) => {
	const canvasRef = useRef(null);
	const pileStepRef = useRef<() => void>();
	const ballots = useRef<BallotViewModel[]>([]);
	const images = useRef<Map<number, HTMLImageElement>>(new Map());
	const fallbackImage = useRef<HTMLImageElement | null>(null);
	const mousePosition = useRef<IMousePosition>({x: 0, y: 0});
	const canvasBoundsRef = useRef<DOMRect | null>(null);
	const start = useRef(0);
	const [selectedBallot, setSelectedBallot] = useState<BallotViewModel | null>(null);

	// Pure derivation: compute ballot radii and bind edge/hit-test helpers.
	// Stored in a ref in the effect below so the animation loop always sees
	// up-to-date values without triggering additional renders.
	const configuredBallots = useMemo(() => {
		const maxRadius = Math.min(props.width, props.height) * 0.55;
		return props.ballots.map((ballot) => {
			const statePopulation = ballot.stateCensus?.population ?? 0;
			const scalingFactor = statePopulation / props.totalPopulation;
			const minRadius = 5;
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
			return ballot;
		});
	}, [props.ballots, props.totalPopulation, props.width, props.height]);

	const handleMouseMove = useCallback((event: MouseEvent) => {
		const canvas = event.currentTarget as HTMLCanvasElement;
		const canvasBounds = canvas.getBoundingClientRect();
		canvasBoundsRef.current = canvasBounds;
		mousePosition.current.x = event.clientX - canvasBounds.left;
		mousePosition.current.y = event.clientY - canvasBounds.top;
	}, []);

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

	const render = useCallback((ctx: CanvasRenderingContext2D, ts: number | null): number => {
		const now = ts ?? 0;
		const elapsed = now - start.current;
		const fps = 30;
		const fpsInterval = 1000 / fps;

		if (elapsed > fpsInterval) {
			start.current = now - (elapsed % fpsInterval);

			if (pileStepRef.current) {
				pileStepRef.current();
			}

			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
			if (!anyBallotSelected) {
				setSelectedBallot(null);
			}
		}

		return window.requestAnimationFrame((timestamp) => render(ctx, timestamp));
	}, [renderToken, images]);

	useEffect(() => {
		// Commit the memoized ballot configuration to the ref and re-seed the
		// physics simulation. Runs whenever canvas dimensions or ballot data change.
		start.current = 0;
		ballots.current = configuredBallots;
		pileStepRef.current = forceDirectedPile(ballots.current, props.width, props.height);

		// Load per-legislator portrait images into the lookup map.
		images.current.clear();
		fallbackImage.current = new Image();
		fallbackImage.current.src = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
		ballots.current.forEach((ballot) => {
			const imageUrl = ballot.legislator.depiction?.imageUrl;
			if (!imageUrl) { return; }
			const img = new Image();
			img.src = imageUrl;
			images.current.set(ballot.legislator.id, img);
		});

		const canvas = canvasRef.current as HTMLCanvasElement | null;
		if (canvas == null) { return; }
		const ctx = canvas.getContext('2d');
		if (ctx == null) { return; }

		const animationFrameId = render(ctx, null);
		return () => {
			window.cancelAnimationFrame(animationFrameId);
		};
	}, [configuredBallots, render, props.width, props.height]);

	return (
		<div className='relative flex flex-col items-center'>
			<h3 className="text-sm font-semibold uppercase tracking-wide">
				{formatLabel(props.ballotChoiceType)}
			</h3>
			<canvas
				ref={canvasRef}
				width={props.width}
				height={props.height}
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
