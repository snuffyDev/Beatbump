import { objectKeys } from "$lib/utils/collections/objects";

export type ParameterSchema = Record<string, string>;
type ParsedParameters<T> = {
	[Key in keyof T]-?: undefined extends Extract<T[Key], undefined>
		? NonNullable<T[Key]> | null
		: T[Key];
};

export type OptionalKeys<T> = {
	[K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];
export type DefaultsFor<T> = Required<{
	[K in OptionalKeys<T>]: Exclude<T[K], undefined>;
}>;

export const parseParams = <
	Schema extends ParameterSchema,
	Keys extends keyof Schema = keyof Schema,
>(
	keys: Keys[],
): ((
	params: IterableIterator<[string, string]>,
) => ParsedParameters<Schema>) => {
	return (params) => {
		const result: Partial<ParsedParameters<Schema>> = {};
		for (const [key, value] of params) {
			if (!keys.includes(key as never)) continue;
			result[key as keyof Schema] = (value ??
				null) as ParsedParameters<Schema>[keyof ParsedParameters<Schema>];
		}
		return result as ParsedParameters<Schema>;
	};
};
