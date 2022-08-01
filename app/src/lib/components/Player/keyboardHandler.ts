export default function keyboardHandler(node: Node, params: { shortcut }): SvelteActionReturnType {
	function keyDown(event: KeyboardEvent) {
		if (
			!Object.keys(params.shortcut).includes(event.code) ||
			event.ctrlKey ||
			event.shiftKey ||
			event.metaKey ||
			event.altKey ||
			event.key.match(/F[1-9]+/) ||
			event.code == "Tab"
		)
			return;
		if (
			!document.activeElement.tagName.match(/SELECT|INPUT|BUTTON|A/i) &&
			!document.activeElement.attributes.getNamedItem("tabindex") &&
			!document.activeElement.classList.contains("select") &&
			!document.activeElement.classList.contains("dd-menu") &&
			!document.activeElement.classList.contains("dd-item") &&
			!document.activeElement.classList.contains("dd-button")
		) {
			event.preventDefault();
			// node.dispatchEvent(new CustomEvent('longpress', no
			Object.keys(params.shortcut).forEach((key) => {
				if (event.code === key) {
					if (Array.isArray(params.shortcut[key])) {
						params.shortcut[key].forEach((fn) => fn(event));
					} else {
						params.shortcut[key](event);
					}
				}
			});
		}
	}
	window.addEventListener("keydown", keyDown);
	return {
		destroy() {
			window.removeEventListener("keydown", keyDown);
		},
	};
}
