export default function drag(node) {
	let x
	let y

	function handleMousedown(event) {
		if (event.type == 'touchstart') {
			x = event.touches[0].clientX
			y = event.touches[0].clientY
		}
		x = event.clientX
		y = event.clientY
		// console.log(x, y)

		node.dispatchEvent(
			new CustomEvent('startDrag', {
				detail: { x, y }
			})
		)

		window.addEventListener('touchmove', handleMousemove, { passive: true })
		window.addEventListener('touchend', handleMouseup, { passive: true })
		window.addEventListener('mousemove', handleMousemove, { passive: true })
		window.addEventListener('mouseup', handleMouseup, { passive: true })
	}

	function handleMousemove(event) {
		let dx, dy
		if (event.type == 'touchmove') {
			// console.log(event)
			dx = event.touches[0].clientX - x
			dy = event.touches[0].clientY - y
			// console.log(x, y, dx, dy)
			x = event.touches[0].clientX
			y = event.touches[0].clientY
			node.dispatchEvent(
				new CustomEvent('dragMove', {
					detail: { x, y, dx, dy }
				})
			)
		} else {
			dx = event.clientX - x
			dy = event.clientY - y
			x = event.clientX
			y = event.clientY

			// console.log(x, y, dx, dy)
			node.dispatchEvent(
				new CustomEvent('dragMove', {
					detail: { x, y, dx, dy }
				})
			)
		}
	}

	function handleMouseup(event) {
		if (event.type == 'touchend') {
			// console.log(event)
			x = event.changedTouches[0].clientX
			y = event.changedTouches[0].clientY
		} else {
			x = event.clientX
			y = event.clientY
		}

		node.dispatchEvent(
			new CustomEvent('dragEnd', {
				detail: { x, y }
			})
		)

		window.removeEventListener('touchmove', handleMousemove)
		window.removeEventListener('touchend', handleMouseup)
		window.removeEventListener('mousemove', handleMousemove)
		window.removeEventListener('mouseup', handleMouseup)
	}

	node.addEventListener('touchstart', handleMousedown, { passive: true })
	node.addEventListener('mousedown', handleMousedown, { passive: true })

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown)
			node.removeEventListener('touchstart', handleMousedown)
		}
	}
}
