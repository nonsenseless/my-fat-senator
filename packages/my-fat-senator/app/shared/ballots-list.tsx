import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	const canvasRef = useRef(null);
	const [maxWidth] = useState(600);
	const [maxHeight] = useState(600);
	const [margin] = useState(30);
	const [tokensPerLine] = useState(5);
	const [baseRadius] = useState((maxWidth / tokensPerLine / 10))
	const start = useRef(0);

	const ballots = useRef(props.ballots.map((ballot, index) => {
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

	const image = useRef<HTMLImageElement | null>(null);

	const renderToken = useCallback((ctx: CanvasRenderingContext2D, 
		ballot: BallotViewModel,
		image: HTMLImageElement
	) => {
			console.log("useCallback token: ", ballot.legislator.bioguideid)
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
			console.log("useCallback: ", start, ", ", now, ", ", elapsed, ", ", fpsInterval);
			start.current = (now - (elapsed % fpsInterval));
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			
			ballots.current.forEach((ballot) => {
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
					renderToken(ctx, ballot, image.current!)
			})
		}

		return window.requestAnimationFrame((timestamp) => {
			return render(ctx, timestamp);
	});
	}, [ballots, start, maxHeight, maxWidth, renderToken, image]);

  useEffect(() => {
		console.log("useEffect render")

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

  }, [image, render])

	return (<div>
			<canvas className='border-solid border' ref={canvasRef} width={maxWidth} height={maxHeight}/>
		</div>)
}