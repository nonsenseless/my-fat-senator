import { Ballot, PrismaClient } from "@prisma/client";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Card } from "~/shared/card";

export const meta: MetaFunction = () => [{ title: "Votes" }];

export interface IVoteDetailParameters {
	id: string; //Only a string because of the query string
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
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
		select: {
			id: true,
			vote: {
				select: {
					id: true
				}
			},
			ballotChoiceType: {
				select: {
					name: true,
					slug: true
				}
			},
			legislator: {
				select: {
					displayName: true,
					firstName: true,
					lastName: true,
					state: {
						select: {
							shortName: true,
							name: true
						}
					},
					party: {
						select: {
							name: true,
							slug: true
						}
					}
				}
			}
		}
	});

	const voteDetail = {
		sourceUrl: vote?.sourceUrl,
		session: vote?.session,
		updatedAt: vote?.updatedAt,
		categoryName: vote?.category.name,
		chamberName: vote?.chamber.name,
		congressionalSessionName: vote?.congressionalSession.name,
		congressionalVoteId: vote?.congressional_vote_id, // TODO Probably better to pick a uniform casing rule
		requiresTypeName: vote?.requiresType.name,
		resultTypeName: vote?.resultType.name,
		voteTypeName: vote?.voteType.name,
	} as IVoteDetail;

	return json({ vote: voteDetail, ballots: ballots });
}

export interface IVoteDetail {
	sourceUrl: string;
	updatedAt: Date;
	session: string;
	ballots: Ballot[];
	categoryName: string;
	chamberName: string;
	congressionalSessionName: string;
	congressionalVoteId: string;
	requiresTypeName: string;
	resultTypeName: string;
	voteTypeName: string;
}

export default function VoteDetail() {
	const { vote, ballots } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto">

			<Card
				title={`${vote.congressionalVoteId} - ${vote.chamberName} - ${vote.congressionalSessionName}`} width='full'>
				<div className="metadata">
					<div>
						<span><a href={vote.sourceUrl}>Source</a></span>
					</div>
					<div>
						<span>Type</span> {vote.voteTypeName}
					</div>
					<div>
						<span>Requires</span> {vote.requiresTypeName}
					</div>
					<div>
						<span>Result</span> {vote.resultTypeName}
					</div>
					<div>
						<span>Congressional Vote Id</span> {vote.congressionalVoteId}
					</div>
					<div>
						<span>Last Updated:</span> {new Date(vote.updatedAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</div>
				</div>
				<div className="ballots">
					<div className="ballot-choice-type-list">
						<h2>Not Voting</h2>
						{ballots
							.filter((value) => value.ballotChoiceType.slug == 'voting')
							.map((ballot, index) => (
								<li key={index}>{ballot.legislator.displayName} ({ballot.legislator.party.slug}))</li>
							))
						}

					</div>
					<div className="ballot-choice-type-list">
						<h2>Nay</h2>
						{ballots
							.filter((value) => value.ballotChoiceType.slug == 'nay')
							.map((ballot, index) => (
								<li key={index}>{ballot.legislator.displayName} ({ballot.legislator.party.slug}))</li>
							))
						}

					</div>
					<div className="ballot-choice-type-list">
						<h2>Yea</h2>
						{ballots
							.filter((value) => value.ballotChoiceType.slug == 'yea')
							.map((ballot, index) => (
								<li key={index}>{ballot.legislator.displayName} ({ballot.legislator.party.slug}))</li>
							))
						}

					</div>
					<div className="ballot-choice-type-list">
						<h2>Present</h2>
						{ballots
							.filter((value) => value.ballotChoiceType.slug == 'present')
							.map((ballot, index) => (
								<li key={index}>{ballot.legislator.displayName} ({ballot.legislator.party.slug}))</li>
							))
						}

					</div>
				</div>

			</Card>
		</div>

	);
}
