import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "My Fat Senator" }];

export {loader, default } from './votes._index';