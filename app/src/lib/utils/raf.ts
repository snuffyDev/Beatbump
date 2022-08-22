let frame: number;

export function requestFrameSingle(callback: FrameRequestCallback) {
	if (frame) cancelAnimationFrame(frame);
	frame = requestAnimationFrame(callback);
}
