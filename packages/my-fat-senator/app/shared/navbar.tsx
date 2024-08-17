
export default function Navbar() {

	return (
		<div className="navbar bg-base-100">
			<div className="flex-1">
				<span className="btn btn-ghost text-xl">My Fat Senators</span>
			</div>
			<div className="flex-none gap-2">
				<div className="form-control">
					<input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
				</div>
			</div>
		</div>
	)
}