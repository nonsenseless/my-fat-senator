import { IMousePosition, BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';

import { BallotPopup } from './ballot-popup';

interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
	totalPopulation: number;
}

function forceDirectedPacking(ballots: BallotViewModel[], maxWidth: number, maxHeight: number, iterations = 300) {
  // Initialize positions randomly within bounds
  ballots.forEach(b => {
    b.x = Math.random() * (maxWidth - 2 * b.radius) + b.radius;
    b.y = Math.random() * (maxHeight - 2 * b.radius) + b.radius;
  });

  for (let iter = 0; iter < iterations; iter++) {
    ballots.forEach((a, i) => {
      let dx = 0, dy = 0;

      // Repulsion from other ballots
      ballots.forEach((b, j) => {
        if (i === j) return;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const minDist = a.radius + b.radius + 2;
        if (dist < minDist && dist > 0) {
          const angle = Math.atan2(a.y - b.y, a.x - b.x);
          const force = (minDist - dist) * 0.5;
          dx += Math.cos(angle) * force;
          dy += Math.sin(angle) * force;
        }
      });

      // Attraction to stay inside canvas
      if (a.x - a.radius < 0) dx += (0 - (a.x - a.radius));
      if (a.x + a.radius > maxWidth) dx -= ((a.x + a.radius) - maxWidth);
      if (a.y - a.radius < 0) dy += (0 - (a.y - a.radius));
      if (a.y + a.radius > maxHeight) dy -= ((a.y + a.radius) - maxHeight);

      // Update position
      a.x += dx * 0.1;
      a.y += dy * 0.1;
    });
  }
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

	forceDirectedPacking(ballots.current, maxWidth, maxHeight);
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
	}, [maxHeight, maxWidth, renderToken, image]);

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