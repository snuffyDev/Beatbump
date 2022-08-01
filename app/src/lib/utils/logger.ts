function debug(...message: any[]): void;
function debug(message: string): void {
	if (Array.isArray(message)) {
		console.log(`[DEBUG]`, ...message);
	} else {
		console.log(`[DEBUG]`, message);
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
export const Logger = {
	debug,
	log,
	err,
};
