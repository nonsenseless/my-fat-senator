import type { MetaFunction } from "@remix-run/node";

import Navbar from '../shared/navbar';

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  return (
    <main>
      <Navbar></Navbar>
    </main>
  );
}
