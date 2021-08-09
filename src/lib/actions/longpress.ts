export default function longpress(node: Node): SvelteActionReturnType {
	let timer
	let isTouching
	function startPress(e) {
		if (node && node.contains(e.target)) {
			node.addEventListener('touchmove', touchMove, { passive: true })
			isTouching = true
			timer = setTimeout(() => {
				node.dispatchEvent(new CustomEvent('longpress', node))
			}, 750)
		}
	}
	function touchMove() {
		if (isTouching === true) cancelPress()
	}
	function cancelPress() {
		clearTimeout(timer)
	}

	node.addEventListener('touchstart', startPress, { passive: true })
	node.addEventListener('touchend', cancelPress, { passive: true })
	node.addEventListener('mousedown', startPress, { passive: true })
	node.addEventListener('mouseup', cancelPress, { passive: true })
	return {
		destroy() {
			node.removeEventListener('touchstart', startPress)

			node.removeEventListener('touchend', cancelPress)
			node.removeEventListener('mousedown', startPress)
			node.removeEventListener('mouseup', cancelPress)
		}
	}
}
