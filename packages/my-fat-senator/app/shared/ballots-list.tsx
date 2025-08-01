import { IMousePosition, BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';

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
		// Calculate population-based scaling
		const populations = props.ballots.map(b => b.population || 0);
		const maxPopulation = Math.max(...populations);
		const minPopulation = Math.min(...populations.filter(p => p > 0));
		
		// Use logarithmic scaling to prevent extreme size differences
		const scaleFactor = (maxWidth / tokensPerLine / 10) / Math.log(maxPopulation + 1);
		
		ballots.current = props.ballots.map((ballot, index) => {
			// Calculate scaled radius based on population
			const population = ballot.population || minPopulation;
			const scaledRadius = Math.max(baseRadius * 0.5, Math.log(population + 1) * scaleFactor);
			
			ballot.radius = baseRadius; // Keep original radius for compatibility
			ballot.scaledRadius = scaledRadius;

			// Use a more sophisticated layout algorithm for variable sizes
			const currentRow = Math.floor(index / tokensPerLine);
			const currentColumn = index % tokensPerLine;

			// Calculate position accounting for variable sizes
			let cumulativeXMargin = margin;
			for (let i = 0; i < currentColumn; i++) {
				const prevBallot = ballots.current[i + (currentRow * tokensPerLine)];
				if (prevBallot) {
					cumulativeXMargin += prevBallot.scaledRadius * 2 + margin;
				}
			}
			
			let cumulativeYMargin = margin;
			for (let i = 0; i < currentRow; i++) {
				const prevRowBallot = ballots.current[i * tokensPerLine];
				if (prevRowBallot) {
					cumulativeYMargin += prevRowBallot.scaledRadius * 2 + margin;
				}
			}

			ballot.x = cumulativeXMargin + ballot.scaledRadius;
			ballot.y = cumulativeYMargin + ballot.scaledRadius;

			ballot.includesCoordinate = (x: number, y: number) => {
				return ballot.x + ballot.scaledRadius > x &&
					ballot.x - ballot.scaledRadius < x &&
					ballot.y + ballot.scaledRadius > y &&
					ballot.y - ballot.scaledRadius < y;
			}

			ballot.bottomEdge = () => {
				return (ballot.y + ballot.scaledRadius);
			}
			ballot.topEdge = () => {
				return (ballot.y - ballot.scaledRadius);
			}
			ballot.rightEdge = () => {
				return (ballot.x + ballot.scaledRadius)
			}
			ballot.leftEdge = () => {
				return (ballot.x - ballot.scaledRadius)
			}
			return ballot;
		})
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
			const dx = ballot.x - ballot.scaledRadius;
			const dy = ballot.y - ballot.scaledRadius;
			ctx.save();
			ctx.beginPath();
			ctx.arc(ballot.x, ballot.y, ballot.scaledRadius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(image, dx, dy, ballot.scaledRadius * 2, ballot.scaledRadius * 2);

			ctx.restore();
	}, [])

	const render = useCallback((ctx: CanvasRenderingContext2D, ts: number): number => {
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
				animationFrameId = render(ctx, 0);
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