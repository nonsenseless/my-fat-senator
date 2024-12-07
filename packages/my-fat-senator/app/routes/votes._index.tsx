import { Prisma, PrismaClient } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import "ag-grid-community/styles/ag-grid.css";
import { Card, CardWidth } from "~/shared/card";

export const meta: MetaFunction = () => [{ title: "Votes" }];

type SearchFilter = Record<string, string>;


export async function action({
  request,
}: ActionFunctionArgs) {
	const formData = await request.formData();
	const filter: SearchFilter = {};

	for (const pair of formData.entries()) {
		filter[pair[0]] = pair[1] as string;
	}

	const params = new URLSearchParams(filter).toString()
  return redirect(`/votes?${params}`);
}

export const loader = async ({request}: LoaderFunctionArgs) => {
	const searchParams = new URL(request.url).searchParams;
	const filter: SearchFilter = {};
	searchParams.forEach((value, key) => {
		filter[key] = value;
	})

	filter["congressional_vote_id"] = `%${filter["congressional_vote_id"]}%`

	const prisma = new PrismaClient();
	const query = Prisma.sql`
			SELECT Vote.id, session, sourceUrl, congressional_vote_id, congressional_updated_at,
			CategoryType.name as categoryTypeName, 
			Chamber.name as chamberName, 
			CongressionalSession.name as congressionalSessionName, 
			RequiresType.name as requiresTypeName, 
			ResultType.name as resultTypeName, 
			VoteType.name as voteTypeName 
			FROM Vote 
				JOIN CategoryType ON Vote.categoryId = CategoryType.id
				JOIN Chamber on Vote.chamberId = Chamber.id
				JOIN CongressionalSession on Vote.congressionalSessionId = CongressionalSession.id
				JOIN RequiresType on Vote.requiresTypeId = RequiresType.id
				JOIN ResultType on Vote.resultTypeId = ResultType.id
				JOIN VoteType on Vote.voteTypeId = VoteType.id
				${filter["congressional_vote_id"] ? Prisma.join([Prisma.sql`WHERE Vote.congressional_vote_id LIKE `, Prisma.sql`${filter["congressional_vote_id"]}`, Prisma.sql``], "") : Prisma.empty}
				`;
	const votes = await prisma.$queryRaw(query);

	return json({ votes });
}

export default function Index() {
	const { votes } = useLoaderData<typeof loader>();

	return (
		<div >
			<Card 
				className="overflow-auto max-height-under-navbar"
				title="Votes"
				width={CardWidth["w-full"]}>
					<div className="grid grid-cols-5 gap-3 ">
						<div>
							<Form method="post" action={`/votes`}>
								<label className="form-control">
									<span className="sr-only">Bill Name</span>
									<input type="text" name="congressional_vote_id" placeholder="Bill Name" className="input input-bordered"/>
								</label>
								<button className="btn btn-sm" type="submit">Submit</button>
								<button className="btn btn-sm" type="button">Reset</button>
							</Form>
						</div>
						<div className="col-span-4">
							<table className="table-auto table-zebra prose w-full max-w-full">
								<thead>
									<tr>
										<th>Source</th>
										<th>Vote Id</th>
										<th>Session</th>
										<th>Chamber</th>
										<th>Type</th>
									</tr>
								</thead>
								<tbody>
									{votes.map((vote, index) =>
										<tr key={index} className="hover">
											<td><a href={`/votes/${vote.id}`}>View</a></td>
											<td>{vote.congressional_vote_id}</td>
											<td>{vote.session}</td>
											<td>{vote.chamberName}</td>
											<td>{vote.voteTypeName}</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
			</Card>
		</div>
	);
}
