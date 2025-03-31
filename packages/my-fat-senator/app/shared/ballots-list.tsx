import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
}

export const Canvaser = class {

	static renderToken = (ctx: CanvasRenderingContext2D, 
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
	}
}

export const LogBallot = (ballot: BallotViewModel) => {
	console.log("X,Y: ", "(", ballot.x, ",", ballot.y, "), ", ballot.xVelocity, " - ", ballot.yVelocity);
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	const canvasRef = useRef(null);
	const [maxWidth] = useState(600);
	const [maxHeight] = useState(600);
	const [margin] = useState(30);
	const [tokensPerLine] = useState(5);
	const [baseRadius] = useState((maxWidth / tokensPerLine / 10))
	const [start, setStart] = useState(0);

	const [ballots, setBallots] = useState(props.ballots.map((ballot, index) => {
		ballot.xVelocity = Math.floor(Math.random() * 5);
		ballot.yVelocity = Math.floor(Math.random() * 5);
		ballot.radius = baseRadius;

		const currentRow = Math.floor(index / tokensPerLine);
		const currentColumn = index % tokensPerLine;

		// base left radius + ballot radius for default center + 
		const cumulativeXMargin = margin + ballot.radius + (((ballot.radius * 4) + margin) * currentColumn);
		const cumulativeYMargin = 0 + ballot.radius + (2 * ballot.radius * currentRow);

		ballot.x = cumulativeXMargin;
		ballot.y = cumulativeYMargin;
	
		return ballot;
	}
))
  const [isLoaded, setIsLoaded] = useState(false);
	const imageRef = useRef<HTMLImageElement | null>(null);

	useEffect(() => {
    const image = new Image();
    image.src = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
    image.onload = () => {
      setIsLoaded(true);
      imageRef.current = image;
    };
  }, []);


	const render = useCallback((ctx: CanvasRenderingContext2D, ts: number) => {
		const now = ts;
		const elapsed = now - start;
		
		const fps = 30;
		const fpsInterval = 1000 / fps;

		if (elapsed > fpsInterval) {
			setStart(now - (elapsed % fpsInterval)); // https://jsfiddle.net/chicagogrooves/nRpVD/2/; resets start to interval marker
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			setBallots(ballots.map((b) => {
				const ballot = {...b};
				const rightEdge = (ballot.x + ballot.radius);
				const leftEdge = (ballot.x - ballot.radius);
				if (rightEdge >= maxWidth || leftEdge <= 0) {
					ballot.xVelocity = -1 * ballot.xVelocity;
				}
				const bottomEdge = (ballot.y + ballot.radius);
				const topEdge = (ballot.y - ballot.radius);
				if (bottomEdge > maxHeight || topEdge < 0) {
					ballot.yVelocity = -1 * ballot.yVelocity;
				}
	
				ballot.x = ballot.x + ballot.xVelocity;
				ballot.y = ballot.y + ballot.yVelocity;
				return ballot;
			}))
			ballots.forEach((ballot) => {
				Canvaser.renderToken(ctx, ballot, imageRef.current!)
			})
		}

		return window.requestAnimationFrame((timestamp) => {
			return render(ctx, timestamp);
	});
	}, [ballots, start, maxHeight, maxWidth]);

  useEffect(() => {
		if (isLoaded) {
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
		}

  }, [canvasRef, render, isLoaded])

	return (<div>
			<div className="debug-panel">
			<table className="table-auto table-zebra prose w-full max-w-full">
				<thead>
					<tr>
						<th>Legislator</th>
						<th>Position (X, Y)</th>
						<th>Velocity (X, Y)</th>
					</tr>
				</thead>
				<tbody>
				{ballots.map((ballot) => {
					return <tr key={ballot.legislator.id}>
						<td>{ballot.legislator.id}</td>
						<td>{ballot.x}, {ballot.y}</td>
						<td>{ballot.xVelocity}, {ballot.yVelocity}</td>
					</tr>
				})}
				</tbody>
			</table>
			</div>
			<canvas className='border-solid border' ref={canvasRef} width={maxWidth} height={maxHeight}/>
		</div>)
}