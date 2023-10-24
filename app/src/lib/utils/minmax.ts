export const clamp = (min: number, value: number, max: number) =>
	Math.min(Math.max(value, min), max);
