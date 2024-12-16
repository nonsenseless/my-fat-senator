import { useSearchParams } from "@remix-run/react";
import React from 'react';


export interface ITextInputProps {
	name: string;
	placeholder: string;
}

export const TextInput: React.FC<ITextInputProps> = ({ name, placeholder }) => {

	const [searchParams] = useSearchParams();
	const [text, setText] = React.useState(
		searchParams
				.get(name)
	);

	React.useEffect(() => {
		setText(searchParams.get(name));
	}, [name, searchParams]);

	return (
		<label className="form-control mb-5">
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