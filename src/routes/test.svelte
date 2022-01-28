<script lang="ts">
	import { tweened } from 'svelte/motion';

	// const progress = tweened(0, { duration: 125 });
	let progress = 0;
	let pressure;
	function timer(node: HTMLElement) {
		let frame;

		function loop(t) {
			if (progress == 1) return;
			progress += 0.1;

			frame = requestAnimationFrame(loop);
		}
		function handleDown(event: TouchEvent) {
			event.preventDefault();
			pressure = event.targetTouches[0].force;
			// if (event.targetTouches[0].force < 0.5) return;
			node.style.setProperty('--duration', '500ms');
			requestAnimationFrame(loop);
			node.addEventListener('touchmove', handleHold);
			node.addEventListener('touchend', cancel);
			node.addEventListener('touchcancel', cancel);
		}

		function handleHold(event: TouchEvent) {
			event.preventDefault();

			pressure = event.changedTouches[0].force;
			// if (event.targetTouches[0].force < 0.5) return;
		}

		function cancel(event: TouchEvent) {
			event.preventDefault();

			if (frame) {
				cancelAnimationFrame(frame);
				frame = undefined;
				node.style.setProperty('--duration', '100ms');
			}
			progress = 0;
			node.removeEventListener('touchend', cancel);
			node.removeEventListener('touchmove', handleHold);
		}
		node.addEventListener('touchstart', handleDown);

		return {
			destroy() {
				if (frame) {
					cancelAnimationFrame(frame);
					frame = undefined;
					progress = 0;
				}
				node.removeEventListener('touchstart', handleDown);
			}
		};
	}
</script>

<div use:timer class="testbox" style="--bg: {progress}; --" />
{pressure}

<style lang="scss">
	.testbox {
		margin-top: 2rem;
		position: relative;
		height: 7rem;
		width: 100%;
		outline: red 1px solid;
		overflow: hidden;
		&::before {
			background: rgb(90, 90, 90);
			position: absolute;
			content: '';
			border-radius: 50%;
			inset: 0;
			opacity: var(--bg);
			transform: scale(var(--bg));
			transition: opacity linear 200ms, transform linear var(--duration);
		}
		&:active::before {
			// transition: opacity linear 200ms, transform var(--duration) !important;
		}
	}
</style>
