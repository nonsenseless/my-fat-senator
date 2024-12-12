import { Prisma, PrismaClient } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";

import "ag-grid-community/styles/ag-grid.css";
import { Card, CardWidth } from "~/shared/card";

export const meta: MetaFunction = () => [{ title: "Votes" }];

export interface QueryPaging {
	page: number;
	pageSize: number;
}

export interface VoteQueryFilter {
	congressional_vote_id_like?: string;
	chamberId?: string;
	resultTypeId?: string;
	requiresTypeId?: string;
	categoryId?: string;
	voteTypeId?: string;
}

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
	const prisma = new PrismaClient();
	// Get lookups
	const lookups = {
		chambers: await prisma.chamber.findMany(),
		requiresTypes: await prisma.requiresType.findMany(),
		resultTypes: await prisma.resultType.findMany(),
		congressionalSessions: await prisma.congressionalSession.findMany(),
		voteTypes: await prisma.voteType.findMany(),
		categoryTypes: await prisma.categoryType.findMany()
	}
	// Process search form
	const params = new URL(request.url).searchParams;
	let whereClause = Prisma.empty;
	if (params.size > 0) {
		const clauses = [];

		let param = params.get("congressional_vote_id");
		if (param){
			param = `%${param}%`
			clauses.push(Prisma.sql`Vote.congressional_vote_id LIKE ${param}`)
		} 
		const whitelist = [
			"voteTypeId", "chamberId", "requiresTypeId", "resultTypeId", "congressionalSessionId"
		]
		whitelist.forEach((field) => {
			param = params.get(field);
			if (param) {
				clauses.push(
					Prisma.join([
						Prisma.raw(`Vote.${field} = `), Prisma.sql`${param}`
					], " ")
				)
			}
		})
		if (clauses.length > 0) {
			whereClause = Prisma.join([Prisma.sql`WHERE`, Prisma.join([...clauses], " AND ")], " ");
		}
	}

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
				${whereClause}
				`;
	const votes = await prisma.$queryRaw(query);

	return json({ votes, lookups });
}

export default function Index() {
	const submit = useSubmit();
	const { votes, lookups } = useLoaderData<typeof loader>();
	const [ searchParams ] = useSearchParams();

	return (
		<div >
			<Card 
				className="overflow-auto max-height-under-navbar"
				title="Votes"
				width={CardWidth["w-full"]}>
					<div className="grid grid-cols-5 gap-3 ">
						<div>
							<Form 
								id="VoteSearchForm" 
								method="GET" 
								action={`/votes`}
								onChange={(e) => submit(e.currentTarget)}
								>
								<label className="form-control mb-5">
									<span className="sr-only">Bill Name</span>
									<input 
										type="text" 
										defaultValue={searchParams.get("congressional_vote_id") || undefined} // TODO is there any practical reason to treat undefined and null as different?
										value=""
										
										name="congressional_vote_id" 
										placeholder="Bill Name" 
										className="input input-primary input-bordered"/>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Chamber</span>
									<select 
									defaultValue="0"
										value={searchParams.get("chamberId") || undefined}
										name="chamberId" 
										className="select select-primary w-full max-w-xs">
											<option value="0" disabled>Chamber</option>
											{	
											lookups.chambers.map((chamber) => {
												return <option 
													key={chamber.id} 
													value={chamber.id} 
													>{chamber.name}</option>
											})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Category</span>
									<select
									defaultValue={0}
									value={searchParams.get("categoryId") || undefined}
									name="categoryId" 
									className="select select-primary w-full max-w-xs">
										<option value={0} disabled>Category</option>
										{lookups.categoryTypes.map((category) => {
											return <option 
												key={category.id} 
												value={category.id}
												>{category.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Requires</span>
									<select 
										name="requiresTypeId" 
										defaultValue={0}
										value={searchParams.get("requiresTypeId") || undefined}
										className="select select-primary w-full max-w-xs">
										<option value={0} disabled>Requires</option>
										{lookups.requiresTypes.map((requiresType) => {
											return <option 
												key={requiresType.id} 
												value={requiresType.id}
												>{requiresType.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Result Type</span>
									<select 
										name="resultTypeId" 
										defaultValue={0}
										value={searchParams.get("resultTypeId") || undefined}
										className="select select-primary w-full max-w-xs">
										<option value={0} disabled>Result Type</option>
										{lookups.resultTypes.map((resultType) => {
											return <option 
												key={resultType.id} 
												value={resultType.id}
												>{resultType.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Session</span>
									<select 
									name="congressionalSessionId" 
									defaultValue={0}
									value={searchParams.get("congressionalSessionId") || undefined}
									className="select select-primary w-full max-w-xs">
										<option value={0} disabled>Type</option>
										{lookups.congressionalSessions.map((congressionalSession) => {
											return <option 
												key={congressionalSession.id} 
												value={congressionalSession.id}
												>{congressionalSession.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Vote Type</span>
									<select 
									name="voteTypeId" 
									defaultValue={0}
									value={searchParams.get("voteTypeId") || undefined}
									className="select select-primary w-full max-w-xs"
									>
										<option value={0} 
										
										disabled>Vote Type</option>
										{lookups.voteTypes.map((voteType) => {
											return <option key={voteType.id} value={voteType.id}>{voteType.name}</option>
										})}
									</select>
								</label>
								
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
						</div>
					</div>
			</Card>
		</div>
	);
}
