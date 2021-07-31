import { writable } from 'svelte/store'

const AudioPlayer: HTMLAudioElement = new Audio()

let PlayerTime

export const PlayerState = writable({
	time: PlayerTime
})
AudioPlayer.addEventListener('timeupdate', () => {
	PlayerTime = AudioPlayer.currentTime
})

export default {
	play() {
		AudioPlayer.play()
	},
	pause() {
		AudioPlayer.pause()
	},
	time: PlayerState
}
