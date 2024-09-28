import { PrismaClient } from '@prisma/client';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
export const loader = async () => {
	const prisma = new PrismaClient();
	const voteTypes = await prisma.voteType.findMany(); 

	return json({ voteTypes });
};

export default function VoteTypeIndex() {
	const { voteTypes } = useLoaderData<typeof loader>();
	const list = voteTypes.map(voteType => <tr key={voteType.id}>
		<td>{voteType.name}</td>
		<td>{voteType.slug}</td>
		<td>{voteType.reviewed}</td>
	</tr>)

	return (
		<div className="container">
			<div className="prose">
				<h1>Vote Types</h1>
				<table className="table table-sm table-zebra">
					<thead>
						<tr>
							<th>Name</th>
							<th>Slug</th>
							<th>Reviewed</th>
						</tr>
					</thead>
					<tbody>
						{list}
					</tbody>
				</table>

			</div>
		</div>
		
	)
}