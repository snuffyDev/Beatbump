export const skipFirstInvocation = <T>(callback: (...args: T[]) => void) => {
	let firstInvocation = true;
	return (...args: T[]) => {
		if (firstInvocation) {
			firstInvocation = false;
			return;
		}
		callback(...args);
	};
};
