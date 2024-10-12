import { PrismaClient } from "@prisma/client";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Card } from "~/shared/card";

export const meta: MetaFunction = () => [{ title: "Votes" }];

export interface IVoteDetailParameters {
	id: string; //Only a string because of the query string
}

export const loader = async({ params }: LoaderFunctionArgs) => {
	const $id = parseInt(params.id as string);
	const prisma = new PrismaClient();
	const vote = await prisma.vote.findFirst({
		where: {
			id: $id
		},
		select: {
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

	const voteDetail = {
		sourceUrl: vote?.sourceUrl,
		session: vote?.session,
		categoryName: vote?.category.name,
		chamberName: vote?.chamber.name,
		congressionalSessionName: vote?.congressionalSession.name,
		congressionalVoteId: vote?.congressional_vote_id, // TODO Probably better to pick a uniform casing rule
		requiresTypeName: vote?.requiresType.name,
		resultTypeName: vote?.resultType.name,
		voteTypeName: vote?.voteType.name,
	} as IVoteDetail;

	return json({vote: voteDetail});
}

export interface IVoteDetail {
	sourceUrl: string;
	session: string;
	categoryName: string;
	chamberName: string;
	congressionalSessionName: string;
	congressionalVoteId: string;
	requiresTypeName: string;
	resultTypeName: string;
	voteTypeName: string;
}

export default function VoteDetail() {
	const { vote } = useLoaderData<typeof loader>();

  return (
		<div className="container mx-auto">
			<div className="prose">
				<Card 
					title={`Vote ${vote.congressionalVoteId}`}
					actions={['Click me', 'No, Click Me']
						.map((text, index) => {
							return <button className='btn btn-primary' key={index}>{text}</button>
						})
					}>
					Hello World
				</Card>
			</div>
			<div>
			</div>
		</div>
  );
}
