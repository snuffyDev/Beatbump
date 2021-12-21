/* eslint-disable no-inner-declarations */
export default function observer(node: HTMLElement) {
	let once = true
	let frame = undefined
	if (IntersectionObserver) {
		const observer = new IntersectionObserver(onIntersect, {
			threshold: 0,
			rootMargin: '100px 180px'
		})
		function onIntersect(entries: IntersectionObserverEntry[]) {
			entries.forEach((entry, i) => {
				if (entry.isIntersecting && once == true) {
					// console.log('intersecting!!!', i)
					frame = requestAnimationFrame(() => {
						node.style.visibility = 'visible'
					})
					once = false
					observer.unobserve(node)
				}
			})
		}
		observer.observe(node)
		return {
			destroy() {
				if (frame !== undefined) {
					cancelAnimationFrame(frame)
				}
				observer && observer.unobserve(node)
			}
		}
	}
}
