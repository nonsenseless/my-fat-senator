import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "My Fat Senator" }];

export default function Index() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
