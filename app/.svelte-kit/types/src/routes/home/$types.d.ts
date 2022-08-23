import type * as Kit from '@sveltejs/kit';

interface RouteParams extends Partial<Record<string, string>> {}

export type Errors = undefined;
export type PageData = Omit<import('../$types.js').LayoutData, keyof Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+page.js').load>>>> & Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+page.js').load>>>;
export type PageLoad<OutputData extends Record<string, any> | void = Record<string, any> | void> = Kit.Load<RouteParams, null, import('../$types.js').LayoutData, OutputData>;
export type PageLoadEvent = Parameters<PageLoad>[0];
export type PageServerData = null;