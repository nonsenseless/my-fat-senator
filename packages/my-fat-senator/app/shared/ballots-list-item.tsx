import React, { useEffect, useState } from 'react';

import { LegislatorViewModel } from "~/routes/votes.$id";

import { CardBorder } from './layout/card';

interface BallotsListItemProps {
	avatarImageSrc?: string;
	showAsList: boolean;
	legislator: LegislatorViewModel;
}
export const BallotsListItem: React.FC<BallotsListItemProps> = (props) => {
	const legislator = props.legislator;
	const avatarImageSrc = props.avatarImageSrc || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
	const [ x, setX ] = useState(0);
	const [ xVelocity ] = useState(Math.floor(Math.random() * 5));
	const [ y, setY ] = useState(0);
	const [ yVelocity ] = useState(Math.floor(Math.random() * 5));

	useEffect(() => {
    const intervalId = setInterval(() => {
      setX(x => x + xVelocity);
      setY(y => y + yVelocity);
    }, 300);
    return () => clearInterval(intervalId);
  }, [xVelocity, yVelocity]);

	if (props.showAsList) {
		return (
			<div className={`${CardBorder.Two} pr-4 mb-1 w-100 flex flex-row items-center`}>

				<div className="bg-neutral text-neutral-content w-1/3">
					<img alt="Stock Avatar" src={avatarImageSrc} />
				</div>

				<div className='pl-2 w-full'>
					<span className="text-l"> {`${props.legislator.lastName}, ${props.legislator.firstName}`}</span>
					<div className="flex justify-between">
						<span>{legislator.state.name}</span>
						<span>{legislator.party.name}</span>
					</div>
				</div>
			</div>
		)
	} else {
		return (
			<div className={`avatar`} style={{top: x, left: y}}>
				<div className="w-12 rounded-full">
					<img src={avatarImageSrc} alt="Stock avatar" />
				</div>
			</div>
		)
	}

}