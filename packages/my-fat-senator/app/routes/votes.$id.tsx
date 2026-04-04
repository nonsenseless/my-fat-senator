import { LegislatorViewModel, BallotViewModel } from "@my-fat-senator/lib/interfaces";
import { Ballot, BallotChoiceType, PrismaClient } from "@prisma/client";
import { json, LoaderFunctionArgs, SerializeFrom, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BallotsList } from "~/shared/ballots-list";
import { NayYeaScale } from "~/shared/nay-yea-scale";
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
					slug: true,
					census: true
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
			ballots: {
				include: {
					legislator: {
						include: {
							party: true,
							state: true,
							depiction: true
					}
				},
				ballotChoiceType: true,
			},
			}
		}
	});

	if (!vote) {
		throw new Response("Not Found", { status: 404 });
	}

	if (!vote.congressionalSession.census) {
		// TODO: Will a 200 response return some generic view through remix? Need to trigger.
		throw new Response("No census found for this vote. Senate proportions cannot be rendered.", {status: 200 });
	}

	const stateCensusData = await prisma.stateCensus.findMany({
		include: {
			state: true,
			census: true,
		},
		where: {
			census: {
				id: vote.congressionalSession.census.id
			},
		}
	});

	const totalPopulation = stateCensusData.reduce((sum, state) => sum + state.population, 0);

	const voteDetail = {
		id: vote.id,
		ballots: vote.ballots,
		sourceUrl: vote.sourceUrl,
		session: vote.session,
		updatedAt: vote.updatedAt,
		updatedAtFormatted: new Date(vote.updatedAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}),
		categoryName: vote.category.name,
		chamberName: vote.chamber.name,
		congressionalSessionName: vote.congressionalSession.name,
		congressionalVoteId: vote.congressional_vote_id, // TODO Probably better to pick a uniform casing rule
		requiresTypeName: vote.requiresType.name,
		resultTypeName: vote.resultType.name,
		voteTypeName: vote.voteType.name,
	} as IVoteDetail;

	return json({ vote: voteDetail, stateCensusData, totalPopulation});
}

export interface IVoteDetail {
	id: number;
	ballots: Ballot[];
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

// The loader selects ballot relations (legislator, ballotChoiceType) that the
// raw Prisma Ballot type doesn't include. Cast at the call site to keep the
// IVoteDetail interface stable until a broader type refactor is done.
type LoadedBallot = { legislator: LegislatorViewModel; ballotChoiceType: BallotChoiceType };

const mapBallot = (ballot: LoadedBallot,
	stateCensusData: SerializeFrom<typeof loader>['stateCensusData']) => {
	return {
			x: 0,
			y: 0,
			radius: 0,
			legislator: ballot.legislator,
			ballotChoiceType: ballot.ballotChoiceType,
			stateCensus: stateCensusData.find((census) => census.state.id === ballot.legislator.state.id)
	} as BallotViewModel;
}

// The stacked Not Voting / Present column takes a small proportion of the container;
// the Nay+Yea scale fills the remainder.
const OTHER_PROPORTION = 0.12;

export default function VoteDetail() {
	const { vote, stateCensusData, totalPopulation } = useLoaderData<typeof loader>();
	const [showAsList, setShowAsList] = useState(true);

	const ballotsContainerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = ballotsContainerRef.current;
		if (!el) { return; }
		const observer = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			setContainerSize({ width, height });
		});
		observer.observe(el);
		return () => { observer.disconnect(); };
	}, []);

	const ballotGroups = useMemo(() => {
		const typed = vote.ballots as unknown as LoadedBallot[];
		const filter = (slug: string) =>
			typed
				.filter(b => b.ballotChoiceType.slug === slug)
				.map(b => mapBallot(b, stateCensusData));
		return {
			nay: filter('nay'),
			yea: filter('yea'),
			notVoting: filter('not_voting'),
			present: filter('present'),
		};
	}, [vote.ballots, stateCensusData]);

	const otherWidth = Math.floor(containerSize.width * OTHER_PROPORTION);

	const toggleShowAsList = () => {
		setShowAsList(!showAsList);
	};

	return (
		<div className="grid grid-cols-5 gap-3">
			<Card
				className="overflow-auto"
				title={`${vote.congressionalVoteId} - ${vote.chamberName} - ${vote.congressionalSessionName}`}
				width={CardWidth.Full}>
				<dl className='prose-sm'>
					<hr/>
					<div className="form-control">
						<label className="label cursor-pointer">
							<span className="label-text">Show as List</span>
							<input type="checkbox" className="toggle toggle-primary" checked={showAsList} onChange={toggleShowAsList} />
						</label>
					</div>
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
				<div
					ref={ballotsContainerRef}
					className="ballots flex w-full h-[600px]"
				>
					{containerSize.width > 0 && (
						<>
							<NayYeaScale
								nayBallots={ballotGroups.nay}
								yeaBallots={ballotGroups.yea}
								totalPopulation={totalPopulation}
								height={containerSize.height}
							/>
							<div className="flex flex-col" style={{ width: otherWidth }}>
								<BallotsList
									ballotChoiceType="not_voting"
									showAsList={showAsList}
									ballots={ballotGroups.notVoting}
									totalPopulation={totalPopulation}
									width={otherWidth}
									height={Math.floor(containerSize.height / 2)}
								/>
								<BallotsList
									ballotChoiceType="present"
									showAsList={showAsList}
									ballots={ballotGroups.present}
									totalPopulation={totalPopulation}
									width={otherWidth}
									height={Math.floor(containerSize.height / 2)}
								/>
							</div>
						</>
					)}
				</div>
			</Card>
		</div>
	);
}
