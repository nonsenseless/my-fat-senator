import { PrismaClient } from "@prisma/client";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ColDef } from 'ag-grid-community';
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { useState } from "react";
import "ag-grid-community/styles/ag-grid.css";

export const meta: MetaFunction = () => [{ title: "Votes" }];

// this comp gets inserted into the Cell
export const TableLinkComponent = (props: CustomCellRendererProps) => {
	return <><a href={props.data.sourceUrl}>Link</a></>;
};

export const loader = async() => {
	const prisma = new PrismaClient();
	const votes = await prisma.vote.findMany({
		select: {
			id: true,
			session: true,
			sourceUrl: true,
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

	const mapped = votes.map((vote) => ({
		id: vote.id,
		sourceUrl: vote.sourceUrl,
		session: vote.session,
		categoryName: vote.category.name,
		chamberName: vote.chamber.name,
		congressionalSessionName: vote.congressionalSession.name,
		requiresTypeName: vote.requiresType.name,
		resultTypeName: vote.resultType.name,
		voteTypeName: vote.voteType.name,
	}));

	return json({ votes: mapped });
}

export default function Index() {
	const { votes } = useLoaderData<typeof loader>();

	// Row Data: The data to be displayed.
	const [rowData] = useState(votes);

	// Column Definitions: Defines the columns to be displayed.
	const [colDefs] = useState<ColDef[]>([
		{ headerName: "", cellRenderer: (props: CustomCellRendererProps) => {
			return <><a href={`/votes/${props.data.id}`}>View</a></>;
		}},
		{ field: "session" },
		{
			headerName: "Source", cellRenderer: TableLinkComponent,
		},
		{ field: "voteTypeName", headerName: "Type" }
	]);
  return (
		<div className="container mx-auto">
			<div className="prose">
				<h1 className='mb-4'>Votes</h1>
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
  );
}
