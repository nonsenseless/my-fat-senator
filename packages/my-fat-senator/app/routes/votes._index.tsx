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

	const prisma = new PrismaClient();
	const votes = await prisma.vote.findMany({
		where: filter as Prisma.VoteWhereInput,
		select: {
			id: true,
			session: true,
			sourceUrl: true,
			congressional_vote_id: true,
			congressional_updated_at: true,
			category: {
				select: {
					name: true,
					slug: true
				}
			},
			chamber: {
				select: {
					name: true,
					slug: true
				}
			},
			congressionalSession: {
				select: {
					name: true,
					slug: true
				}
			},
			requiresType: {
				select: {
					name: true,
					slug: true
				}
			},
			resultType: {
				select: {
					name: true,
					slug: true
				}
			},
			voteType: {
				select: {
					name: true,
					slug: true
				}
			},
		}
	});

	const mapped = votes.map((vote) => ({
		id: vote.id,
		sourceUrl: vote.sourceUrl,
		session: vote.session,
		categoryName: vote.category.name,
		chamberName: vote.chamber.name,
		congressionalSessionName: vote.congressionalSession.name,
		congressionalVoteId:vote.congressional_vote_id,
		requiresTypeName: vote.requiresType.name,
		resultTypeName: vote.resultType.name,
		voteTypeName: vote.voteType.name,
	}));

	return json({ votes: mapped });
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
							<table className="table-auto table-zebra prose max-w-full">
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
											<td>{vote.congressionalVoteId}</td>
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
