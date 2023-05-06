export const a11y = (node: HTMLElement) => {
	function handleKeypress(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (node.isSameNode(document.activeElement) && (event.key.match("Space") || event.key.match("Enter"))) {
			event.preventDefault();
			node.dispatchEvent(new CustomEvent("kbClick"));
		}
	}
	node.addEventListener("keyup", handleKeypress, {
		passive: true,
		capture: true,
	});
	return {
		destroy() {
			node.removeEventListener("keyup", handleKeypress, true);
		},
	};
};
