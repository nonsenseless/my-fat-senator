import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteCongressVoteImport, getCongressVoteImport } from "~/models/importer.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const importId = parseInt(params.importId || "");
  invariant(importId, "importId not found");

  const voteImport = await getCongressVoteImport({ id: importId });
  if (!voteImport) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ voteImport });
};

export const action = async ({ params }: ActionFunctionArgs) => {
  const importId = parseInt(params.importId || "");
  invariant(importId, "importId not found");

  await deleteCongressVoteImport({ id: importId });

  return redirect("/notes");
};

export default function ImportDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">Import: {data.voteImport.id}</h3>
      <h3 className="text-xl font-bold">Processed: {data.voteImport.processed}</h3>
      <p className="py-6">{data.voteImport.rawData}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

// TODO Extract to helper
export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}