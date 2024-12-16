import { PropsWithChildren } from "react"

import { ModelRendererProps } from "../model-renderer-props"

export default function Drawer(props: PropsWithChildren<ModelRendererProps>) {

	return (
		<div className="drawer">
			<input id="my-drawer" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content p-5">
				{ props.children }
			</div>
			<div className="drawer-side">
				<label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
				<ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
					<li><a href="/votes">Votes</a></li>
				</ul>
			</div>
		</div>
	)
}