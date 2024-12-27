import { SqlBuilder } from "@my-fat-senator/lib/prisma/sql.server";
import { PrismaClient } from "@prisma/client";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { Input } from "~/shared/forms/input";
import { Select } from "~/shared/forms/select";
import { Card, CardWidth } from "~/shared/layout/card";
import { PaginationBar } from "~/shared/table/pagination";

export const meta: MetaFunction = () => [{ title: "Votes" }];

export interface IVoteTableRow {
	id: number;
	session: string;
	sourceUrl: string;
	congressional_vote_id: string; 
	congressional_updated_at: Date;
	categoryTypeName: string; 
	chamberName: string; 
	congressionalSessionName: string; 
	requiresTypeName: string;
	resultTypeName: string;
	voteTypeName: string
}

export const loader = async ({request}: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const $top = Number(url.searchParams.get("$top")) || 10
  const $skip = Number(url.searchParams.get("$skip")) || 0

	const prisma = new PrismaClient();
	const sqlBuilder = new SqlBuilder(prisma);
	// Get lookups
	const lookups = {
		chambers: await prisma.chamber.findMany(),
		requiresTypes: await prisma.requiresType.findMany(),
		resultTypes: await prisma.resultType.findMany(),
		congressionalSessions: await prisma.congressionalSession.findMany(),
		voteTypes: await prisma.voteType.findMany(),
		categoryTypes: await prisma.categoryType.findMany()
	}

	const data = await sqlBuilder.executeRawUnsafe<IVoteTableRow>({
		fields: prisma.vote.fields,
		params: new Map([...url.searchParams]),
		select: ` 
			SELECT Vote.id, session, sourceUrl, congressional_vote_id, congressional_updated_at,
			CategoryType.name as categoryTypeName, 
			Chamber.name as chamberName, 
			CongressionalSession.name as congressionalSessionName, 
			RequiresType.name as requiresTypeName, 
			ResultType.name as resultTypeName, 
			VoteType.name as voteTypeName 
				`,
		from: `FROM Vote 
				JOIN CategoryType ON Vote.categoryId = CategoryType.id
				JOIN Chamber on Vote.chamberId = Chamber.id
				JOIN CongressionalSession on Vote.congressionalSessionId = CongressionalSession.id
				JOIN RequiresType on Vote.requiresTypeId = RequiresType.id
				JOIN ResultType on Vote.resultTypeId = ResultType.id
				JOIN VoteType on Vote.voteTypeId = VoteType.id`,
		orderBy: `ORDER BY Vote.congressional_vote_id ASC LIMIT ${$top} OFFSET ${$skip}`
	});
	return json({ data, lookups });
}

export default function Index() {
	const { data, lookups } = useLoaderData<typeof loader>();
	const votes = data.results;

	return (
			<Card 
				className="overflow-auto"
				title="Votes"
				width={CardWidth.Full}>
					<div className="grid grid-cols-5 gap-3 ">
						<div>
							<Form 
								id="VoteSearchForm" 
								method="GET" 
								action={`/votes`}
								>
									<Input 
										name="congressional_vote_id" 
										className="mb-5"
										placeholder="Bill Name">
									</Input>
									<Select
										name="chamberId"
										className="mb-5"
										placeholder="Chamber"
										options={lookups.chambers}></Select>
									<Select
										name="categoryTypeId"
										className="mb-5"
										placeholder="Category"
										options={lookups.categoryTypes}></Select>
									<Select
										name="requiresTypeId"
										className="mb-5"
										placeholder="Requires"
										options={lookups.requiresTypes}></Select>
									<Select
										name="resultTypeId"
										className="mb-5"
										placeholder="Result"
										options={lookups.resultTypes}></Select>
									<Select
										name="congressionalSessionId"
										className="mb-5"
										placeholder="Congressional Session"
										options={lookups.congressionalSessions}></Select>
									<Select
										name="voteTypeId"
										className="mb-5"
										placeholder="Vote Type"
										options={lookups.voteTypes}></Select>
								<div className="flex justify-between">
									<button 
										className="btn btn-sm" 
										type="submit">Submit</button>
									<button 
										className="btn btn-sm" 
										type="reset">Reset</button>
								</div>
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
							<PaginationBar total={data.count}></PaginationBar>
						</div>
					</div>
			</Card>
	);
}
