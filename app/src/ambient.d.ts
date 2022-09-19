import type Hls from "hls.js";

interface CustomWindow extends Window {
	bbAudio: (audio: HTMLAudioElement) => { duration: number; src: string; };
	bbPlayer: { src: string; duration: number; title: string; };
}
declare global {
	interface Window {
		bbAudio: (audio: HTMLAudioElement) => { duration: number; src: string; };
		hls: Hls;
		bbPlayer: { src?: string; duration?: number; title?: string; };
	}
}
export { };
