export type Dict<T> = Record<string, T>;

export type Nullable<T> = T | null;

export type IObject<T> = {
	[Property in keyof T]: T[Property];
};

export type IsObject<T> = T extends object ? (T extends any[] ? false : true) : false;

export type IMergedObject<T, U> = IsObject<T> & IsObject<U> extends true
	? {
			[K in keyof T]: K extends keyof U ? IMergedObject<T[K], U[K]> : T[K];
	  } & U
	: U;
