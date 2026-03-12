import { redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "My Fat Senator" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  return redirect(`/votes${url.search}`);
};

export default function Index() {
  return null;
}
