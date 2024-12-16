import { useSearchParams } from "@remix-run/react";
import React from 'react';
import tinyinvariant from 'tiny-invariant';

export interface ISelectOption {
	id: number | string;
	name: string;
}

export interface ISelectProps {
	name: string;
	placeholder: string;
	options: ISelectOption[];
	className?: string;
}

export const Select: React.FC<ISelectProps> = ({ name, placeholder, options, className="" }) => {
	tinyinvariant(options, "Options required for select.");

	const [searchParams] = useSearchParams();
	const [selected, setSelected] = React.useState(
		searchParams
				.get(name)
	);

	React.useEffect(() => {
		setSelected(searchParams.get(name));
	}, [name, searchParams]);

	return (
			<label className={`form-control ${className}`}>
				<span className="sr-only">{placeholder}</span>
				<select
					name={name}
					className="select select-primary w-full max-w-xs"
					value={selected || ""}
					onReset={() => {
						// TODO: When resetting, there's a brief moment where the old values flash up before page reloads
						setSelected(searchParams.get(""));
					}}
					onChange={(e) => {
						setSelected(e.currentTarget.value);
					}}
				>
					{ placeholder ? <option value="">{placeholder}</option> : null }
					{
						options.map((option) => {
							return <option
								key={option.id}
								value={option.id}
							>{option.name}</option>
						})}
				</select>
			</label>
	);
}