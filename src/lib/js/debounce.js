export default function debounce(cb, timeout = 500) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			cb.apply(this, args)
		}, timeout)
	}
}
