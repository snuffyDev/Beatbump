export default function keyboardHandler(
	node: Node,
	params: { shortcut }
): SvelteActionReturnType {
	function keyDown(event: KeyboardEvent) {
		if (
			event.ctrlKey ||
			event.shiftKey ||
			event.metaKey ||
			event.altKey ||
			event.code == 'Tab'
		)
			return
		if (
			!document.activeElement.tagName.match(/SELECT|INPUT|BUTTON/i) &&
			!document.activeElement.classList.contains('select')
		) {
			event.preventDefault()
			// node.dispatchEvent(new CustomEvent('longpress', no
			Object.keys(params.shortcut).forEach((key) => {
				if (event.code === key) {
					if (Array.isArray(params.shortcut[key])) {
						params.shortcut[key].forEach((fn) => fn(event))
					} else {
						params.shortcut[key](event)
					}
				}
			})
		}
	}
	window.addEventListener('keydown', keyDown)
	return {
		destroy() {
			window.removeEventListener('keydown', keyDown)
		}
	}
}
