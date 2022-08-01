export default function longpress(node: Node): SvelteActionReturnType {
	let timer;
	let isTouching;
	function startPress(e) {
		if (node && node.contains(e.target)) {
			isTouching = true;
			timer = setTimeout(() => {
				node.dispatchEvent(new CustomEvent("longpress"));
			}, 515);
			node.addEventListener("touchend", cancelPress, {
				passive: true,
				capture: true,
			});
			node.addEventListener("touchmove", touchMove, {
				passive: true,
				capture: true,
			});
			node.addEventListener("mouseup", cancelPress, {
				passive: true,
				capture: true,
			});
		}
	}
	function touchMove() {
		if (isTouching === true) cancelPress();
	}
	function cancelPress() {
		clearTimeout(timer);
		node.removeEventListener("touchend", cancelPress);
		node.removeEventListener("mouseup", cancelPress);
	}

	node.addEventListener("touchstart", startPress, {
		passive: true,
		capture: true,
	});
	node.addEventListener("mousedown", startPress);
	return {
		destroy() {
			node.removeEventListener("touchstart", startPress);

			node.removeEventListener("mousedown", startPress);
		},
	};
}
