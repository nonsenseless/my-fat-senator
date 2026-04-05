import { BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React, { useEffect, useRef, useState } from 'react';

import { NayYeaScale } from './nay-yea-scale';
import { VoteBallotsAnimation } from './vote-ballots-animation';
import { VoteBallotsList } from './vote-ballots-list';

export interface BallotGroups {
	nay: BallotViewModel[];
	yea: BallotViewModel[];
	notVoting: BallotViewModel[];
	present: BallotViewModel[];
}

interface VoteBallotsProps {
	ballotGroups: BallotGroups;
	totalPopulation: number;
	format: 'scale' | 'list';
}

const OTHER_PROPORTION = 0.12;

export const VoteBallots: React.FC<VoteBallotsProps> = ({ ballotGroups, totalPopulation, format }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = containerRef.current;
		if (!el) { return; }
		const observer = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			setContainerSize({ width, height });
		});
		observer.observe(el);
		return () => { observer.disconnect(); };
	}, []);

	const otherWidth = Math.floor(containerSize.width * OTHER_PROPORTION);

	return (
		<div className="flex flex-col w-full h-full">
			<div ref={containerRef} className="flex flex-1 min-h-0">
				{format === 'list' ? (
					<VoteBallotsList
						ballotGroups={ballotGroups}
						height={containerSize.height}
					/>
				) : (
					containerSize.width > 0 ? <>
						<NayYeaScale
							nayBallots={ballotGroups.nay}
							yeaBallots={ballotGroups.yea}
							totalPopulation={totalPopulation}
							height={containerSize.height}
						/>
						<div className="flex flex-col" style={{ width: otherWidth }}>
							<VoteBallotsAnimation
								ballotChoiceType="not_voting"
								ballots={ballotGroups.notVoting}
								totalPopulation={totalPopulation}
								width={otherWidth}
								height={Math.floor(containerSize.height / 2)}
							/>
							<VoteBallotsAnimation
								ballotChoiceType="present"
								ballots={ballotGroups.present}
								totalPopulation={totalPopulation}
								width={otherWidth}
								height={Math.floor(containerSize.height / 2)}
							/>
						</div>
					</> : null
				)}
			</div>
		</div>
	);
};
