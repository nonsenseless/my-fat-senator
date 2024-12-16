
export default function Navbar() {

	return (
		<nav className="navbar bg-base-100 navbar-bottom-margin">
			<div className="flex-1">
				<button className="btn btn-ghost text-xl">My Fat Senators</button>
			</div>
			<div className="flex-none gap-2">
				<div className="form-control">
					<label htmlFor="my-drawer" aria-label="open sidebar" className="btn drawer-button">
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
			</div>
		</nav>
	)
}