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
	"shadow-xl"
}

interface Props extends ModelRendererProps {
	title?: string;
	actions?: React.ReactNode[] // TODO Should we default to ReactElement or is a more HTML-y approach available?
	bgBase?: CardBackgroundBase;
	width?: CardWidth;
	shadow?: CardShadow;
	className?: string;
}

export const Card: React.FC<Props> = ({ title, children, actions, className, bgBase="bg-base-100", width="w-96", shadow='shadow-xl' }) => {
	return (
		<div className={`card ${bgBase} ${width} ${shadow} ${className}`}>
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