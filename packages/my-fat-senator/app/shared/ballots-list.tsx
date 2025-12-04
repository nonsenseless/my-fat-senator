import { IMousePosition, BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';

import { BallotPopup } from './ballot-popup';

interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
	totalPopulation: number;
}

function forceDirectedPile(ballots: BallotViewModel[], maxWidth: number, maxHeight: number, gravity = 1) {
	const startingXVelocity = 0;
	const startingYVelocity = gravity
	const velocityScalingFactor = 0.1;
	const buffer = 2;

	function detectCollision(a: BallotViewModel, b: BallotViewModel) {
		const dist = Math.hypot(a.x - b.x, a.y - b.y);
		const minDist = a.radius + b.radius + buffer;
		return (dist < minDist && dist > 0)
	}

	ballots.forEach(b => {
		// Start at random horizontal position, top of canvas
		b.x = (Math.random() * (maxWidth - 2 * b.radius)) + b.radius;
		b.y = b.radius;
		b.vy = 0;
	})

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
			})

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

			if (Math.abs(a.vx) < 0.1) a.vx = 0;
      if (Math.abs(a.vy) < 0.1) a.vy = 0;
		})
	}

	return step;
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	const canvasRef = useRef(null);
	const [maxWidth] = useState(600);
	const [maxHeight] = useState(600);
	const start = useRef(0);
	const [selectedBallot, setSelectedBallot] = useState<BallotViewModel | null>(null);
	const pileStepRef = useRef<() => void>();

	const ballots = useRef<BallotViewModel[]>([]);
	// Initial configuration of ballots
	if (ballots.current.length === 0) {
		ballots.current = props.ballots.map((ballot) => {

		// Find population for this ballot's state
    const statePopulation = ballot.stateCensus?.population ?? 0;
    const scalingFactor = statePopulation / props.totalPopulation;
    const minRadius = 5;
    const maxRadius = 330; // Chosen because Most Populous State Pop (CA) / Lease Populous = 66 * min radius
		
		ballot.radius = minRadius + scalingFactor * (maxRadius - minRadius);
		ballot.includesCoordinate = (x: number, y: number) => {
			return ballot.x + ballot.radius > x &&
				ballot.x - ballot.radius < x &&
				ballot.y + ballot.radius > y &&
				ballot.y - ballot.radius < y;
		}

		ballot.bottomEdge = () => {
			return (ballot.y + ballot.radius);
		}
		ballot.topEdge = () => {
			return (ballot.y - ballot.radius);
		}
		ballot.rightEdge = () => {
			return (ballot.x + ballot.radius)
		}
		ballot.leftEdge = () => {
			return (ballot.x - ballot.radius)
		}
		return ballot;
	})

	pileStepRef.current = forceDirectedPile(ballots.current, maxWidth, maxHeight);
}

	const image = useRef<HTMLImageElement | null>(null);
	const mousePosition = useRef<IMousePosition>({x: 0, y: 0});

	const handleMouseMove = useCallback((event: MouseEvent) => {
		const canvas = event.currentTarget as HTMLCanvasElement;
		const canvasBounds = canvas.getBoundingClientRect();

		mousePosition.current.x = event.clientX - canvasBounds.left;
		mousePosition.current.y = event.clientY - canvasBounds.top;
	}, [])

	const renderToken = useCallback((ctx: CanvasRenderingContext2D, 
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
	}, [])

	const render = useCallback((ctx: CanvasRenderingContext2D, ts: number) => {
		const now = ts;
		const elapsed = now - start.current;
	
		const fps = 30;
		const fpsInterval = 1000 / fps;

		if (elapsed > fpsInterval) {
			start.current = (now - (elapsed % fpsInterval));

			if (pileStepRef.current) {
				pileStepRef.current();
			}

			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			
			let anyBallotSelected = false;
			ballots.current.forEach((ballot) => {
					const selected = ballot.includesCoordinate(mousePosition.current.x, mousePosition.current.y)
					if (selected) {
						anyBallotSelected = true;
						setSelectedBallot(ballot);
					}
					renderToken(ctx, ballot, image.current!)
			})
			if (!anyBallotSelected) {
					setSelectedBallot(null);
			}
		}

		return window.requestAnimationFrame((timestamp) => {
			return render(ctx, timestamp);
	});
	}, [renderToken, image]);

  useEffect(() => {
			image.current = new Image();
			image.current.src = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

			const canvas = canvasRef.current as HTMLCanvasElement | null;
			if (canvas == null) {
				return;
			}
			const ctx = canvas.getContext('2d');
			if (ctx == null) {
				return;
			}

			let animationFrameId: number;
			if (canvas) {
				animationFrameId = render(ctx, null);
			}
			
			return () => {
				window.cancelAnimationFrame(animationFrameId); // TODO How confident are we that this animationFrameId is always the most recent one from inside the loop?
			}

  }, [render])


	return (<div className='relative'>
		<canvas ref={canvasRef} width={maxWidth} height={maxHeight} onMouseMove={handleMouseMove} />
		{ selectedBallot ? 
			<BallotPopup ballot={selectedBallot} /> : null }
		</div>)
}