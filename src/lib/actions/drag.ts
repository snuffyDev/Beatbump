export default function drag(node: HTMLElement) {
	let x, lastY
	let y
	let loop
	let startY
	let initTop, initHeight
	function handleMousedown(event) {
		const { top, height } = node.getBoundingClientRect()

		initTop = top
		initHeight = height
		if (event.type == 'touchstart') {
			x = event.touches[0].pageX
			y = event.touches[0].pageY
		}
		x = event.pageX
		y = event.pageY
		node.dispatchEvent(
			new CustomEvent('dragstart', {
				detail: { x, y }
			})
		)

		window.addEventListener('touchmove', handleMousemove, { passive: true })
		window.addEventListener('touchend', handleMouseup, { passive: true })
		window.addEventListener('mousemove', handleMousemove)
		window.addEventListener('mouseup', handleMouseup, { passive: true })
	}

	function handleMousemove(event) {
		let dx, dy
		if (event.type == 'touchmove') {
			// console.log(x, y, dx, dy)
			x = event.touches[0].pageX
			y = event.touches[0].pageY
			node.dispatchEvent(
				new CustomEvent('dragmove', {
					detail: {
						x,
						y: initHeight + event.touches[0].pageY - initTop,
						my: event.clientY
					}
				})
			)
			lastY = event.touches[0].pageY / 100
		} else {
			dx = event.pageX - x
			dy = event.pageY - y
			x = event.pageX
			y = event.pageY

			// console.log(x, y, dx, dy)
			node.dispatchEvent(
				new CustomEvent('dragmove', {
					detail: {
						x,
						y: initHeight + event.pageY - initTop,
						my: event.clientY,
						dx,
						dy
					}
				})
			)
		}
	}

	function handleMouseup(event) {
		lastY = 0
		if (event.type == 'touchend') {
			// console.log(JSON.stringify(event))
			x = event.changedTouches[0].pageX
			y = event.changedTouches[0].pageY
		} else {
			x = event.pageX
			y = event.pageY
		}

		node.dispatchEvent(
			new CustomEvent('dragend', {
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
			node.removeEventListener('mousedown', handleMousedown, true)
			node.removeEventListener('touchstart', handleMousedown, true)
		}
	}
}
