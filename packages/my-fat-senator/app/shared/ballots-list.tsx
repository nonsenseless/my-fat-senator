import { IMousePosition, BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useCallback, useEffect, useRef, useState, MouseEvent, memo } from 'react';

import { BallotPopup } from './ballot-popup';

interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	const canvasRef = useRef(null);
	const [maxWidth] = useState(1200);
	const [maxHeight] = useState(600);
	const [margin] = useState(30);
	const [tokensPerLine] = useState(5);
	const [baseRadius] = useState((maxWidth / tokensPerLine / 10))
	const start = useRef(0);
	const [selectedBallot, setSelectedBallot] = useState<BallotViewModel | null>(null);

	const ballots = useRef<BallotViewModel[]>([]);
	if (ballots.current.length === 0) {
		ballots.current = props.ballots.map((ballot, index) => {
		if (index === 1) {
			//console.log("Initializing ballot", index);
		}
		ballot.xVelocity = Math.floor(Math.random() * 5);
		ballot.yVelocity = Math.floor(Math.random() * 5);
		ballot.radius = baseRadius;

		const currentRow = Math.floor(index / tokensPerLine);
		const currentColumn = index % tokensPerLine;

		const cumulativeXMargin = margin + ballot.radius + (((ballot.radius * 4) + margin) * currentColumn);
		const cumulativeYMargin = 0 + ballot.radius + (2 * ballot.radius * currentRow);

		ballot.x = cumulativeXMargin;
		ballot.y = cumulativeYMargin;

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
	}
	)
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

	// Collision detection logic
	const detectAndHandleCollision = useCallback((ballotA: BallotViewModel, ballotB: BallotViewModel) => {
		const dx = ballotA.x - ballotB.x;
		const dy = ballotA.y - ballotB.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < ballotA.radius + ballotB.radius) {
			// Simple elastic collision: swap velocities
			const tempXVelocity = ballotA.xVelocity;
			const tempYVelocity = ballotA.yVelocity;

			ballotA.xVelocity = ballotB.xVelocity;
			ballotA.yVelocity = ballotB.yVelocity;

			ballotB.xVelocity = tempXVelocity;
			ballotB.yVelocity = tempYVelocity;

			// Adjust positions to prevent overlap
			const overlap = (ballotA.radius + ballotB.radius) - distance;
			const adjustmentFactor = overlap / distance / 2;

			ballotA.x += dx * adjustmentFactor;
			ballotA.y += dy * adjustmentFactor;

			ballotB.x -= dx * adjustmentFactor;
			ballotB.y -= dy * adjustmentFactor;
		}
	}, []);

	const render = useCallback((ctx: CanvasRenderingContext2D, ts: number) => {
		const now = ts;
		const elapsed = now - start.current;
	
		const fps = 30;
		const fpsInterval = 1000 / fps;

		if (elapsed > fpsInterval) {
			start.current = (now - (elapsed % fpsInterval));
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			
			let anyBallotSelected = false;
			ballots.current.forEach((ballot, i) => {
					if (ballot.rightEdge() >= maxWidth || ballot.leftEdge() <= 0) {
						ballot.xVelocity = -1 * ballot.xVelocity;
					}
					if (ballot.topEdge() >= maxHeight || ballot.bottomEdge() <= 0) {
						let excess = 0;
						if (ballot.topEdge() > maxHeight) {
							excess = ballot.topEdge() - maxHeight;
							ballot.x = ballot.x - excess;
						}

						if (ballot.bottomEdge() <= 0) {
							excess = ballot.bottomEdge();
							ballot.y = ballot.y - excess;
						}
						ballot.yVelocity = -1 * ballot.yVelocity;
					}

					// Check for collisions with other ballots
					for (let j = i + 1; j < ballots.current.length; j++) {
							detectAndHandleCollision(ballot, ballots.current[j]);
					}

					const selected = ballot.includesCoordinate(mousePosition.current.x, mousePosition.current.y)
					if (selected) {
						anyBallotSelected = true;
						setSelectedBallot(ballot);
					} else {
						ballot.x = ballot.x + ballot.xVelocity;
						ballot.y = ballot.y + ballot.yVelocity;
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
	}, [maxHeight, maxWidth, renderToken, image, detectAndHandleCollision]);

  useEffect(() => {
		console.log("useEffect");
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


	return (<div>
		<canvas ref={canvasRef} width={maxWidth} height={maxHeight} onMouseMove={handleMouseMove} />
		{ selectedBallot ? 
			<BallotPopup ballot={selectedBallot} /> : null }
		</div>)
}