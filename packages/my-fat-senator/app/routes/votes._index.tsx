import { SqlBuilder } from "@my-fat-senator/lib";
import { PrismaClient } from "@prisma/client";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";

import { Card, CardWidth } from "~/shared/card";

export const meta: MetaFunction = () => [{ title: "Votes" }];

export interface QueryPaging {
	page: number;
	pageSize: number;
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
	const votes = await SqlBuilder.executeRawUnsafe({
		db: prisma,
		fields: prisma.vote.fields,
		params: new Map([...new URLSearchParams(params)]),
		query: ` 
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
				`
	});

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
							<Form id="VoteSearchForm" method="GET" action={`/votes`} >
								<label className="form-control mb-5">
									<span className="sr-only">Bill Name</span>
									<input 
										type="text" 
										onChange={(e) => submit(e.currentTarget.form)}
										value={searchParams.get("congressional_vote_id") || undefined} // TODO is there any practical reason to treat undefined and null as different?
										name="congressional_vote_id" 
										placeholder="Bill Name" 
										className="input input-primary input-bordered"/>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Chamber</span>
									<select 
										name="chamberId" 
										onChange={(e) => submit(e.currentTarget.form)}
										className="select select-primary w-full max-w-xs">
											<option disabled selected>Chamber</option>
											{	
											lookups.chambers.map((chamber) => {
												return <option 
													key={chamber.id} 
													value={chamber.id} 
													selected={searchParams.get("chamberId") != null}
													>{chamber.name}</option>
											})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Category</span>
									<select 
										onChange={(e) => submit(e.currentTarget.form)}
										name="categoryId" 
										className="select select-primary w-full max-w-xs">
										<option disabled selected>Category</option>
										{lookups.categoryTypes.map((category) => {
											return <option 
												key={category.id} 
												value={category.id}
												selected={searchParams.get("categoryId") != null}
												>{category.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Requires</span>
									<select 
										onChange={(e) => submit(e.currentTarget.form)}
										name="requiresTypeId" 
										className="select select-primary w-full max-w-xs">
										<option disabled selected>Requires</option>
										{lookups.requiresTypes.map((requiresType) => {
											return <option 
												key={requiresType.id} 
												value={requiresType.id}
												selected={searchParams.get("requiresTypeId") != null}
												>{requiresType.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Result Type</span>
									<select 
										onChange={(e) => submit(e.currentTarget.form)}
										name="resultTypeId" 
										className="select select-primary w-full max-w-xs">
										<option disabled selected>Result Type</option>
										{lookups.resultTypes.map((resultType) => {
											return <option 
												key={resultType.id} 
												value={resultType.id}
												selected={searchParams.get("resultTypeId") != null}
												>{resultType.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Session</span>
									<select 
										onChange={(e) => submit(e.currentTarget.form)}
										name="congressionalSessionId" 
										className="select select-primary w-full max-w-xs">
										<option disabled selected>Type</option>
										{lookups.congressionalSessions.map((congressionalSession) => {
											return <option 
												key={congressionalSession.id} 
												value={congressionalSession.id}
												selected={searchParams.get("congressionalSessionId") != null}
												>{congressionalSession.name}</option>
										})}
									</select>
								</label>
								<label className="form-control mb-5">
									<span className="sr-only">Vote Type</span>
									<select 
										onChange={(e) => submit(e.currentTarget.form)}
										name="voteTypeId" 
										className="select select-primary w-full max-w-xs">
										<option disabled selected>Vote Type</option>
										{lookups.voteTypes.map((voteType) => {
											return <option key={voteType.id} value={voteType.id}>{voteType.name}</option>
										})}
									</select>
								</label>
								
								<div className="flex justify-between">
									<button className="btn btn-sm" type="submit">Submit</button>
									<button className="btn btn-sm" type="button">Reset</button>
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
