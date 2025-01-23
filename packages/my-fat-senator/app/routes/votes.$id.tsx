import { BallotChoiceType, Legislator, Party, PrismaClient, State } from "@prisma/client";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { BallotsList } from "~/shared/ballots-list";
import { Card, CardWidth } from "~/shared/layout/card";

export const meta: MetaFunction = () => [{ title: "Votes" }];

export interface IVoteDetailParameters {
	id: string; //Only a string because of the query string
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const $id = parseInt(params.id as string);

	const searchParams = new URL(request.url).searchParams;
	const where = searchParams.size ? {
		congressional_vote_id: searchParams.get('name')?.toString()
	} : {
		id: $id
	}

	const prisma = new PrismaClient();
	const vote = await prisma.vote.findFirst({
		where: where,
		select: {
			id: true,
			session: true,
			sourceUrl: true,
			congressional_vote_id: true,
			congressional_updated_at: true,
			updatedAt: true,
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

	const ballots = await prisma.ballot.findMany({
		where: {
			voteId: $id
		},
		include: {
			legislator: {
				include: {
					party: true,
					state: true
				}
			},
			ballotChoiceType: true,
		},
	});

	const voteDetail = {
		id: vote?.id,
		sourceUrl: vote?.sourceUrl,
		session: vote?.session,
		updatedAt: vote?.updatedAt,
		updatedAtFormatted: new Date(vote!.updatedAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}),
		categoryName: vote?.category.name,
		chamberName: vote?.chamber.name,
		congressionalSessionName: vote?.congressionalSession.name,
		congressionalVoteId: vote?.congressional_vote_id, // TODO Probably better to pick a uniform casing rule
		requiresTypeName: vote?.requiresType.name,
		resultTypeName: vote?.resultType.name,
		voteTypeName: vote?.voteType.name,
	} as IVoteDetail;

	return json({ vote: voteDetail, ballots });
}

export interface IVoteDetail {
	id: number;
	sourceUrl: string;
	updatedAt: Date;
	updatedAtFormatted: string;
	session: string;
	categoryName: string;
	chamberName: string;
	congressionalSessionName: string;
	congressionalVoteId: string;
	requiresTypeName: string;
	resultTypeName: string;
	voteTypeName: string;
}

export interface LegislatorViewModel extends Legislator {
	party: Party;
	state: State;
}

export interface BallotViewModel {
	ballotChoiceType: BallotChoiceType
	legislator: LegislatorViewModel;
}


export default function VoteDetail() {
	const { vote, ballots } = useLoaderData<typeof loader>();

	return (
		<div className="grid grid-cols-5 gap-3">
			<Card
				className="overflow-auto"
				title={`${vote.congressionalVoteId} - ${vote.chamberName} - ${vote.congressionalSessionName}`}
				width={CardWidth.Full}>
				<dl className='prose-sm'>
					<hr/>
					<dt><a href={vote.sourceUrl}>Source</a></dt>
					<dt>Type</dt>
					<dd>{vote.voteTypeName}</dd>
					<dt>Requires</dt>
					<dd>{vote.requiresTypeName}</dd>
					<dt>Result</dt>
					<dd>{vote.resultTypeName}</dd>
					<dt>Congressional Vote Id</dt>
					<dd>{vote.congressionalVoteId}</dd>
					<dt>Last Updated</dt>
					<dd>{vote.updatedAtFormatted}</dd>
				</dl>
			</Card>
			<Card
				className="col-span-4 overflow-auto"
				width={CardWidth.Full}>
				<div className="ballots flex justify-between">
					<BallotsList
						ballotChoiceType='Not Voting'
						ballots={ballots.filter((value) => value.ballotChoiceType.slug == 'not_voting')}></BallotsList>
					<BallotsList ballotChoiceType='Nay' ballots={
						ballots.filter((value) => value.ballotChoiceType.slug == 'nay')
					}></BallotsList>
					<BallotsList ballotChoiceType='Yea' ballots={
						ballots.filter((value) => value.ballotChoiceType.slug == 'yea')
					}></BallotsList>
					<BallotsList ballotChoiceType='Present' ballots={
						ballots.filter((value) => value.ballotChoiceType.slug == 'present')
					}></BallotsList>
				</div>
			</Card>
		</div>
	);
}
