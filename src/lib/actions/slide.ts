export default function slide(node) {
	let x
	let y

	function handleMousedown(event) {
		x = event.clientX || event.touches[0].clientX
		y = event.clientY || event.touches[0].clientY

		node.dispatchEvent(
			new CustomEvent('panstart', {
				detail: { x, y }
			})
		)

		window.addEventListener('touchstart', handleMousemove)
		window.addEventListener('touchmove', handleMouseup)
		window.addEventListener('mousemove', handleMousemove, { passive: true })
		window.addEventListener('mouseup', handleMouseup, { passive: true })
	}

	function handleMousemove(event) {
		const dx = event.clientX - x || event.changedTouches[0].clientX
		const dy = event.clientY - y || event.changedTouches[0].clientY
		x = event.clientX || event.touches[0].clientX
		y = event.clientY || event.touches[0].clientY

		node.dispatchEvent(
			new CustomEvent('panmove', {
				detail: { x, y, dx, dy }
			})
		)
	}

	function handleMouseup(event) {
		x = event.clientX || event.touches[0].clientX
		y = event.clientY || event.touches[0].clientY

		node.dispatchEvent(
			new CustomEvent('panend', {
				detail: { x, y }
			})
		)

		window.removeEventListener('touchmove', handleMousemove)
		window.removeEventListener('touchend', handleMousemove)
		window.removeEventListener('mousemove', handleMousemove)
		window.removeEventListener('mouseup', handleMouseup)
	}

	node.addEventListener('touchstart', handleMousedown)
	node.addEventListener('mousedown', handleMousedown, { passive: true })

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown)
			node.removeEventListener('touchstart', handleMousedown)
		}
	}
}
