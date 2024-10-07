import { Bars4Icon } from '@heroicons/react/24/solid';
import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "Vote Types" }];

export default function Index() {
  return (
    <main>
      <nav className="navbar bg-base-100">
        <div className="flex-1">
          <button className="btn btn-ghost text-xl">My Fat Senators</button>
        </div>
        <div className="flex-none gap-2">
          <div className="form-control">
            <label htmlFor="my-drawer" aria-label="open sidebar" className="btn drawer-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
        </div>
      </nav>
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content p-5">
          <Outlet />
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
            <li><a href="/votes">Votes</a></li>
            <li><a href="/vote-types">Vote Types</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
