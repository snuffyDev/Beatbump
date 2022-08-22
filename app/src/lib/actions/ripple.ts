export function ripple(node: HTMLElement) {
	let elm: HTMLElement;
	function applyRipple(event: UIEvent) {
		if (elm && node.contains(elm)) {
			node.removeChild(elm);
		}
		elm = document.createElement("div");
		elm.className = "anim-ripple";
		// node.classList.add("anim-ripple");
		elm.addEventListener("animationcancel", removeAnim);
		elm.addEventListener("animationend", removeAnim);
		node.appendChild(elm);
		console.log(node.getAnimations({ subtree: true }));
	}
	function removeAnim(event) {
		// node.classList.toggle("anim-ripple", true);
		elm.removeEventListener("animationcancel", removeAnim);
		elm.removeEventListener("animationend", removeAnim);
		elm.remove();
	}
	node.addEventListener("click", applyRipple);
	return {
		destroy: () => {
			node.removeEventListener("click", applyRipple);
		},
	};
}
