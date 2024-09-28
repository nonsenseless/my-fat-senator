import { PrismaClient } from '@prisma/client';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ColDef } from 'ag-grid-community';
import { AgGridReact} from 'ag-grid-react';
import { useState } from 'react';
import "ag-grid-community/styles/ag-grid.css";

export const loader = async () => {
	const prisma = new PrismaClient();
	const voteTypes = await prisma.voteType.findMany(); 

	return json({ voteTypes });
};

export default function VoteTypeIndex() {
	const { voteTypes } = useLoaderData<typeof loader>();

	 // Row Data: The data to be displayed.
	 const [rowData] = useState(voteTypes);
	
	// Column Definitions: Defines the columns to be displayed.
	const [colDefs] = useState<ColDef[]>([
		{ field: "name" },
		{ field: "slug" },
		{ field: "reviewed" }
	]);

	return (
		<div className="container mx-auto">
			<div className="prose">
				<h1 className='mb-4'>Vote Types</h1>
			</div>
				<div
  className="ag-theme-quartz" // applying the Data Grid theme
  style={{ height: 500, width: "100%" }} // the Data Grid will fill the size of the parent container
 >
   <AgGridReact
       rowData={rowData}
       columnDefs={colDefs}
   />
 </div>
		</div>
		
	)
}