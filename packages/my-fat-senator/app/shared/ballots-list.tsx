import React, { useEffect, useRef } from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

import { BallotsListItem } from './ballots-list-item';


interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
}

interface IToken {
	x1: number;
	x2: number;
	xVelocity: number;
	y1: number;
	y2: number;
	yVelocity: number;
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	const canvasRef = useRef(null);

  useEffect(() => {
    
		const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {


			const img = new Image();

			img.onload = function() {
					const radius = ctx.canvas.width / 4;
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.save();
					ctx.beginPath();
					ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.clip();
					ctx.drawImage(img, 0, 0, radius * 2, radius * 2);
					ctx.restore();
			};

			img.src = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
		}

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId: number;
    
    //Our draw came here
    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [props.ballots])

	return <canvas ref={canvasRef} width={200} height={400}/>
}