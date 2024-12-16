import { useSearchParams } from "@remix-run/react";
import React from 'react';


export interface IInputProps {
	name: string;
	placeholder: string;
	className?: string;
}

export const Input: React.FC<IInputProps> = ({ name, placeholder, className="" }) => {

	const [searchParams] = useSearchParams();
	const [text, setText] = React.useState(
		searchParams
				.get(name)
	);

	React.useEffect(() => {
		setText(searchParams.get(name));
	}, [name, searchParams]);

	return (
		<label className={`form-control ${className}`}>
			<span className="sr-only">{placeholder}</span>
			<input 
				type="text" 
				value={text || undefined}
				name={name} 
				placeholder={placeholder} 
				onReset={() => {
					setText("");
				}}
				onChange={(e) => {
					setText(e.currentTarget.value)
				}}
				className="input input-primary input-bordered"/>
		</label>
	);
}