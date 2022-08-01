export class Logger {
	static info(...args: Array<unknown>) {
		console.info(...args);
	}
	static log(...args: Array<unknown>) {
		console.log(...args);
	}
	static err(...args: Array<unknown>) {
		console.error(...args);
	}
}
