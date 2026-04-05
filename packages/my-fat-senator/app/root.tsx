import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
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
import { PropsWithChildren, useState } from "react";

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


export function Layout (props: PropsWithChildren<ModelRendererProps>)
{
  const [chromeVisible, setChromeVisible] = useState(true);

  return (
    <html lang="en" className="h-full" data-theme="senator">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <main className="bg-base-100">
          <div className={`transform transition-transform duration-300 ${chromeVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <Navbar onToggleChrome={() => setChromeVisible(false)}></Navbar>
          </div>
          <Drawer fullScreen={!chromeVisible}>
              { props.children }
          </Drawer>
          {chromeVisible ? null : (
            <button
              onClick={() => setChromeVisible(true)}
              className="fixed bottom-4 right-4 z-50 btn btn-circle btn-sm btn-primary shadow-lg opacity-70 hover:opacity-100 transition-opacity duration-300"
              aria-label="Exit full screen"
              title="Exit full screen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              </svg>
            </button>
          )}
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