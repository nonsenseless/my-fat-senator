import { Utilities } from "@my-fat-senator/lib/services/utlilities"
import { Link, useSearchParams } from "@remix-run/react"

// This component borrowed wholesale from https://www.jacobparis.com/content/remix-pagination
export function PaginationBar({
	total,
}: {
	total: number
}) {
	const [searchParams] = useSearchParams()
	const maxPages = 7
	const midpoint = Math.floor(maxPages / 2)

	const $skip = Number(searchParams.get("$skip")) || 0
	const $top = Number(searchParams.get("$top")) || 10
	const currentPage = Math.floor($skip / $top) + 1
	const totalPages = Math.ceil(total / $top)

	const canPageBackwards = $skip > 0
	const canPageForwards = ($skip + $top) < total
	const pageNumbers = [] as number[]

	if (totalPages <= maxPages) {
		for (let i = 1; i <= totalPages; i++) {
			pageNumbers.push(i)
		}
	} else {
		let startPage = currentPage - midpoint
		let endPage = currentPage + midpoint
		if (startPage < 1) {
			endPage += Math.abs(startPage) + 1
			startPage = 1
		}
		if (endPage > totalPages) {
			startPage -= endPage - totalPages
			endPage = totalPages
		}
		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i)
		}
	}

	return (
		<div className="flex items-center gap-1 w-full">

			<div>
				<button className="mr-1.5"
					disabled={!canPageBackwards}
				>
					<Link
						to={{
							search: Utilities.setSearchParamsString(searchParams, {
								$skip: 0,
							}),
						}}
						preventScrollReset
						prefetch="intent"
						className="text-neutral-600"
					>
						<span className="sr-only"> First page</span>
						&lt;&lt;
					</Link>
				</button>
				<button
					disabled={!canPageBackwards}
				>
					<Link
						to={{
							search: Utilities.setSearchParamsString(searchParams, {
								$skip: Math.max($skip - $top, 0),
							}),
						}}
						preventScrollReset
						prefetch="intent"
						className="text-neutral-600"
					>
						<span className="sr-only"> Previous page</span>
						&lt;
					</Link>
				</button>
			</div>

			{pageNumbers.map((pageNumber) => {
				const pageSkip = (pageNumber - 1) * $top
				const isCurrentPage = pageNumber === currentPage
				if (isCurrentPage) {
					return (
						<button
							key={`${pageNumber}-active`}
							className="grid min-w-[2rem] place-items-center bg-neutral-200 text-sm text-black"
						>
							<div>
								<span className="sr-only">
									Page {pageNumber}
								</span>
								<span>{pageNumber}</span>
							</div>
						</button>
					)
				} else {
					return (
						<button
							key={pageNumber}
						>
							<Link
								to={{
									search: Utilities.setSearchParamsString(
										searchParams,
										{
											$skip: pageSkip,
										},
									),
								}}
								preventScrollReset
								prefetch="intent"
								className="min-w-[2rem] font-normal text-neutral-600"
							>
								{pageNumber}
							</Link>
						</button>
					)
				}
			})}
			<div>
				<button className='mr-1.5'
					disabled={!canPageForwards}
				>
					<Link
						to={{
							search: Utilities.setSearchParamsString(searchParams, {
								$skip: $skip + $top,
							}),
						}}
						preventScrollReset
						prefetch="intent"
						className="text-neutral-600"
					>
						<span className="sr-only"> Next page</span>
						&gt;
					</Link>
				</button>
				<button
					disabled={!canPageForwards}
				>
					<Link
						to={{
							search: Utilities.setSearchParamsString(searchParams, {
								$skip: (totalPages - 1) * $top,
							}),
						}}
						preventScrollReset
						prefetch="intent"
						className="text-neutral-600"
					>
						<span className="sr-only"> Last page</span>
						&gt;&gt;
					</Link>
				</button>
			</div>

			<span>{total} records</span>
		</div>
	)
}
