
interface NavbarProps {
	onToggleChrome?: () => void;
}

export default function Navbar({ onToggleChrome }: NavbarProps) {

	return (
		<nav className="navbar bg-primary text-primary-content navbar-bottom-margin">
			<div className="flex-1">
				<button className="btn btn-ghost text-xl text-primary-content">My Fat Senator</button>
			</div>
			<div className="flex-none gap-2">
				<button
					onClick={onToggleChrome}
					aria-label="Enter full screen"
					className="btn btn-ghost"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
						className="inline-block h-5 w-5">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
					</svg>
				</button>
				<label htmlFor="my-drawer" aria-label="open sidebar" className="btn btn-ghost drawer-button">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="inline-block h-6 w-6 stroke-current">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</label>
			</div>
		</nav>
	)
}
