import type * as Kit from '@sveltejs/kit';

interface RouteParams extends Partial<Record<string, string>> {}
interface LayoutParams extends RouteParams {}

export type Errors = undefined;
export type PageData = Omit<LayoutData, keyof Kit.AwaitedProperties<Awaited<ReturnType<typeof import('../../../../src/routes/+page.js').load>>>> & Kit.AwaitedProperties<Awaited<ReturnType<typeof import('../../../../src/routes/+page.js').load>>>;
export type PageLoad<OutputData extends Record<string, any> | void = Record<string, any> | void> = Kit.Load<RouteParams, null, LayoutData, OutputData>;
export type PageLoadEvent = Parameters<PageLoad>[0];
export type PageServerData = null;
export type LayoutData = Omit<Record<never, never>, keyof Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+layout.js').load>>>> & Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+layout.js').load>>>;
export type LayoutLoad<OutputData extends Record<string, any> | void = Record<string, any> | void> = Kit.Load<LayoutParams, Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+layout.server.js').load>>>, Record<never, never>, OutputData>;
export type LayoutLoadEvent = Parameters<LayoutLoad>[0];
export type LayoutServerData = Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+layout.server.js').load>>>;
export type LayoutServerLoad<OutputData extends Record<string, any> | void = Record<string, any> | void> = Kit.ServerLoad<LayoutParams, Record<never, never>, OutputData>;
export type LayoutServerLoadEvent = Parameters<LayoutServerLoad>[0];