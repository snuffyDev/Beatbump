/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onclick_outside?: () => void
		ondragmove?: (e: any) => void
		onenterViewport?: () => void
		onlosefocus?: () => void
	}
}
declare global {
	declare interface Window {
		bbAudio: () => void
	}
}
interface BBAudioWindow extends Window {
	bbAudio: (audio: HTMLAudioElement) => { duration: any; src: any }
	bbPlayer: Readonly<HTMLAudioElement>
}
declare var window: BBAudioWindow
const customWindow: BBAudioWindow = window
customWindow.bbAudio = customWindow.bbAudio || {}
customWindow.bbPlayer = customWindow.bbPlayer || {}
const bbAudio = ((audio: HTMLAudioElement) => ({
	duration: audio.duration,
	src: audio.src
}))()
globalThis.bbAudio = (audio: HTMLAudioElement) => bbAudio(audio)
var bbPlayer = globalThis.bbAudio()
interface Array<T> {
	at(index: number): T | undefined
}
if (!Array.prototype.at) {
	Array.prototype.at = function (index: number) {
		return this[this.length - index]
	}
}
declare let Audio: {
	prototype: void
	new (src?: string): void
}
