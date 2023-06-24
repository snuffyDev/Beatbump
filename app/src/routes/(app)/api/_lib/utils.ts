type ParameterSchema = Record<string, string | boolean>;

type ParsedParameters<T> = {
	[Key in keyof T]-?: undefined extends Extract<T[Key], undefined>
		? NonNullable<T[Key]> | null
		: T[Key];
};
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

		// Validate each entry in the query parameter iterator
		for (const [key, value] of params) {
			if (!value || !keys.includes(key as never)) continue;

			// Key is valid - assign 'null' if the value is nullish
			result[key as keyof Schema] = (decodeURIComponent(value ?? "") ??
				null) as ParsedParameters<Schema>[keyof ParsedParameters<Schema>];
		}

		return result as ParsedParameters<Schema>;
	};
};
