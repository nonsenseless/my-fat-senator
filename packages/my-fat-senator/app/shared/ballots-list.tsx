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
		imgSrc = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
	) => {
		const img = new Image();
		img.onload = function() {
				const dx = ballot.x - ballot.radius;
				const dy = ballot.y - ballot.radius;
				ctx.save();
				ctx.beginPath();
				ctx.arc(ballot.x, ballot.y, ballot.radius, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(img, dx, dy, ballot.radius * 2, ballot.radius * 2);

				ctx.restore();
		};

		img.src = imgSrc;
	}
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	const canvasRef = useRef(null);
	const [maxWidth] = useState(1200);
	const [maxHeight] = useState(1200);
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
	}))

	const render = useCallback((ctx: CanvasRenderingContext2D, timestamp: number) => {
		const now = timestamp;
		const elapsed = now - start;
		
		const fps = 30;
		const fpsInterval = 1000 / fps;
		if (elapsed > fpsInterval) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			setStart(now - (elapsed % fpsInterval)); // https://jsfiddle.net/chicagogrooves/nRpVD/2/; resets start to interval marker

			ballots.map((b, index, array) => {
				const ballot = array[index];
				if (ballot.x > maxWidth || ballot.x < 0) {
					ballot.xVelocity = -1 * ballot.xVelocity;
				}
				if (ballot.y > maxHeight || ballot.y < 0) {
					ballot.yVelocity = -1 * ballot.yVelocity;
				}
	
				ballot.x += ballot.xVelocity;
				ballot.y += ballot.yVelocity;
	
				Canvaser.renderToken(ctx, ballot)
	
				return ballot;
			})
		}


		return window.requestAnimationFrame((timestamp) => {
			return render(ctx, timestamp);
	});
	}, [ballots, start, maxHeight, maxWidth]);

  useEffect(() => {
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
			animationFrameId = render(ctx);
		}
    
    return () => {
      window.cancelAnimationFrame(animationFrameId); // TODO How confident are we that this animationFrameId is always the most recent one from inside the loop?
    }
  }, [canvasRef, ballots, render])

	return <canvas ref={canvasRef} width={maxWidth} height={maxHeight}/>
}