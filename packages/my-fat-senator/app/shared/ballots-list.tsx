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
	const [start, setStart] = useState<number>(0);

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

	const render = useCallback((ctx: CanvasRenderingContext2D) => {
		ballots.forEach((b, index, array) => {
			const ballot = array[index];
			if (ballot.x > maxWidth || ballot.x < 0) {
				ballot.xVelocity = -1 * ballot.xVelocity;
			}
			if (ballot.y > maxHeight || ballot.y < 0) {
				ballot.yVelocity = -1 * ballot.yVelocity;
			}

			Canvaser.renderToken(ctx, ballot)

			ballot.x += ballot.xVelocity;
			ballot.y += ballot.yVelocity;
		})

		return window.requestAnimationFrame((timestamp) => {
			 const elapsed = (timestamp - start!) / 1000;
			 console.log(elapsed);
			 if (Math.floor(elapsed) % 1000 == 0){
			 	setStart(timestamp);
			 }
			return render(ctx);
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
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [canvasRef, ballots, render])

	return <canvas ref={canvasRef} width={maxWidth} height={maxHeight}/>
}