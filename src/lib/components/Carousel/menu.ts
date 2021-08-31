export default function menu(node: Node): SvelteActionReturnType {
	function startPress(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement
			target: EventTarget & HTMLDivElement
		}
	) {
		console.log(e, node)
		if (!e.target.contains(node)) return
		if (node && node.contains(e.target)) {
			node.dispatchEvent(new CustomEvent('menutouch', node))
			node.addEventListener('touchend', cancelPress, {
				passive: true,
				capture: true
			})

			node.addEventListener('mouseup', cancelPress, {
				passive: true,
				capture: true
			})
		}
	}

	function cancelPress() {
		node.removeEventListener('touchend', cancelPress)
		node.removeEventListener('mouseup', cancelPress)
	}

	node.addEventListener('touchstart', startPress, {
		passive: true,
		capture: true
	})
	node.addEventListener('mousedown', startPress)
	return {
		destroy() {
			node.removeEventListener('touchstart', startPress)

			node.removeEventListener('mousedown', startPress)
		}
	}
}
