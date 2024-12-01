import React from 'react';

import { ModelRendererProps } from './model-renderer-props';

interface Props extends ModelRendererProps {
	title?: string;
	actions?: React.ReactNode[] // TODO Should we default to ReactElement or is a more HTML-y approach available?
	bgBase?: number;
	width?: string;
	shadow?: string;
}

export const Card: React.FC<Props> = ({ title, children, actions, bgBase=100, width=96, shadow='xl' }) => {
	console.log(bgBase, width);
	return (
		<div className={`card bg-base-${bgBase} w-${width} shadow-${shadow}`}>
			<div className="card-body">
				<h2 className="card-title">{title}</h2>
				<p>{children}</p>
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