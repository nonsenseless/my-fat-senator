import React from 'react';

import { ModelRendererProps } from '../model-renderer-props';


export enum CardWidth {
	Full = "w-full",
	W96 = "w-96"
}

export enum CardBackgroundBase {
	"bg-base-100"
}

export enum CardShadow {
	XL = "shadow-xl",
	None = "shadow-none"
}

export enum CardBorder {
	None = "border-0",
	Two = "border-2",
}

interface Props extends ModelRendererProps {
	title?: string;
	actions?: React.ReactNode[] // TODO Should we default to ReactElement or is a more HTML-y approach available?
	bgBase?: CardBackgroundBase;
	width?: CardWidth;
	shadow?: CardShadow;
	border?: CardBorder;
	className?: string;
}

export const Card: React.FC<Props> = ({ title, children, actions, className="", bgBase="bg-base-100", width="w-96", shadow='shadow-xl', border='border-none' }) => {
	return (
		<div className={`card ${bgBase} ${width} ${shadow} ${className} ${border}`}>
			<div className="card-body">
				<h2 className="card-title">{title}</h2>
				<div>{children}</div>
				{
					actions?.length ?
						(<div className="card-actions justify-end">
							{actions}
						</div>) : null
				}
			</div>
		</div>
	)
}