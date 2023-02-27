import { dev as isDev } from "$app/environment";

const LOG_TYPES = {
	dev: `[DEV] `,
	debug: `[DEBUG] `,
	log: `[LOG] `,
	err: `[ERROR] `,
} as const;

function debug(...message: any[]): void;
function debug(message: string): void {
	if (Array.isArray(message)) {
		console.log(LOG_TYPES.debug, ...message);
	} else {
		console.log(LOG_TYPES.debug, message);
	}
}
function log(...message: any[]): void {
	if (arguments.length > 1) {
		console.log(`[LOG]`, ...message);
	} else {
		console.log(`[LOG]`, message);
	}
}
function err(...message: any[]): void {
	if (arguments.length > 1) {
		console.error(`[ERROR]`, ...message);
	} else {
		console.error(`[ERROR]`, message);
	}
}
function dev(...message: any[]) {
	if (!isDev) return;
	console.log(LOG_TYPES.dev, ...message);
}

export const Logger = {
	dev,
	debug,
	log,
	err,
};
