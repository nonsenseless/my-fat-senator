import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { PropsWithChildren } from "react";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";

import Drawer from "./shared/layout/drawer";
import Navbar from "./shared/layout/navbar";
import { ModelRendererProps } from "./shared/model-renderer-props";
import styles from './styles/shared.css';


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) });
};


export function Layout (props: PropsWithChildren<ModelRendererProps>)
{
  return (
    <html lang="en" className="h-full" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <main className="bg-slate-100">
          <Navbar></Navbar>
          <Drawer>
              { props.children }
          </Drawer>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Outlet />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <>
        <h1>Error!</h1>
        <p>{error.message }</p>
      </>
    );
  }

  if (typeof error === 'string') {
    return (
      <>
        <h1>Error!</h1>
        <p>{error}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>Unknown error</p>
    </>
  );
}