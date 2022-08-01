export const clickOutside = (node: HTMLElement) => {
	function detect({ target }) {
		if (!node.contains(target) && !node.isSameNode(document.activeElement)) {
			node.dispatchEvent(new CustomEvent("click_outside"));
		}
	}
	document.addEventListener("click", detect, { passive: true, capture: true });
	return {
		destroy() {
			document.removeEventListener("click", detect, true);
		},
	};
};
