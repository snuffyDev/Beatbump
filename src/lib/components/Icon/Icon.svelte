<script lang="ts">
	export let name
	export let size = '1.5rem'
	export let focusable = false
	export let color = 'currentColor'
	export let fill = 'none'
	export let style = ''
	export let width: string | number = 0
	let box = 24
	let icons = [
		{
			name: 'frown',
			svg: `
  <circle cx="12" cy="12" r="10" />
  <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
  <line x1="9" y1="9" x2="9.01" y2="9" />
  <line x1="15" y1="9" x2="15.01" y2="9" />`
		},
		{
			name: 'shuffle',
			svg: `  <polyline points="16 3 21 3 21 8" />
  <line x1="4" y1="20" x2="21" y2="3" />
  <polyline points="21 16 21 21 16 21" />
  <line x1="15" y1="15" x2="21" y2="21" />
  <line x1="4" y1="4" x2="9" y2="9" />`
		},
		{
			name: 'trending',
			svg: `
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  <polyline points="17 6 23 6 23 12" />`
		},
		{
			name: 'share',
			svg: `<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
  <polyline points="16 6 12 2 8 6" />
  <line x1="12" y1="2" x2="12" y2="15" />`
		},
		{
			name: 'volume',
			svg: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />`
		},
		{
			name: 'music',
			svg: `  <path d="M9 18V5l12-2v13" />
  <circle cx="6" cy="18" r="3" />
  <circle cx="18" cy="16" r="3" />`
		},
		{
			name: 'play',
			svg: `<polygon points="5 3 19 12 5 21 5 3" />`
		},
		{
			name: 'pause',
			svg: `<rect x="6" y="4" width="4" height="16" />
  <rect x="14" y="4" width="4" height="16" />`
		},
		{
			name: 'dots',
			svg: `<circle cx="12" cy="12" r="1" />
  <circle cx="12" cy="5" r="1" />
  <circle cx="12" cy="19" r="1" />`
		},
		{
			name: 'settings',
			svg: ` <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
`
		},
		{
			name: 'artist',
			svg: `  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />`
		},
		{
			name: 'search',
			svg: `  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />`
		},
		{
			name: 'album',
			svg: `<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>`
		},
		{
			name: 'queue',
			svg: ` <g>
  <line stroke="currentColor" id="svg_1" y2="6" x2="21" y1="6" x1="3"/>
  <line stroke="currentColor" id="svg_2" y2="12" x2="21" y1="12" x1="3"/>
  <line stroke="currentColor" id="svg_3" y2="18" x2="19.57594" y1="18" x1="3"/>
  <g stroke-opacity="0.3" stroke="null" stroke-width="0.75" id="svg_11">
   <polygon stroke="currentColor" fill="currentColor" id="svg_10" points="14.77114200592041,11.925364971160889 22.75658416748047,17.058862686157227 14.77114200592041,22.19236183166504 14.77114200592041,11.925364971160889 "/>
  </g>
 </g>
`
		},
		{
			name: 'heart',
			svg: `<path xmlns="http://www.w3.org/2000/svg" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`
		},
		{
			name: 'list',
			svg: `<line x1="8" y1="6" x2="21" y2="6" />
  <line x1="8" y1="12" x2="21" y2="12" />
  <line x1="8" y1="18" x2="21" y2="18" />
  <line x1="3" y1="6" x2="3.01" y2="6" />
  <line x1="3" y1="12" x2="3.01" y2="12" />
  <line x1="3" y1="18" x2="3.01" y2="18" />`
		},
		{
			name: 'folder',
			svg: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />`
		},
		{
			name: 'skip-forward',
			svg: `  <polygon points="5 4 15 12 5 20 5 4" />
  <line x1="19" y1="5" x2="19" y2="19" />`
		},
		{
			name: 'home',
			svg: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />`
		},
		{
			name: 'search',
			svg: `<circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />`
		},
		{
			name: 'playlist-add',
			svg: ` <g>
    <line stroke="currentColor" id="svg_1" y2="6" x2="21" y1="6" x1="3"/>
    <line stroke="currentColor" id="svg_2" y2="12" x2="21" y1="12" x1="3"/>
    <line stroke="currentColor" id="svg_3" y2="18" x2="19.57594" y1="18" x1="3"/>
  </g>
  <path d="M -18.57 -22.149 H -16.529 V -18.067 H -12.448 V -16.027 H -16.529 V -11.946 H -18.57 V -16.027 H -22.651 V -18.067 H -18.57 Z" style="stroke-width: 1px;fill: currentColor;paint-order: fill;" transform="matrix(-1, 0, 0, -1, 0, 0)"/>
`
		},
		{
			name: 'x',
			svg: `
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />`
		},
		{
			name: 'skip-back',
			svg: `<polygon points="19 20 9 12 19 4 19 20" />
  <line x1="5" y1="19" x2="5" y2="5" />`
		},
		{ name: 'minus', svg: `  <line x1="-100" y1="50%" x2="100" y2="50%" />` },
		{
			name: 'import',
			svg: `<circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>`
		},
		{
			name: 'send',
			svg: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`
		},
		{
			name: 'radio',
			svg: `<circle cx="12" cy="12" r="2" />
  <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />`
		},
		{ name: 'chevron-right', svg: `<polyline points="9 18 15 12 9 6" />` },
		{
			name: 'chevron-left',
			svg: `<polyline points="15 18 9 12 15 6" />
`
		}
	]
	let displayIcon = icons.find((e) => e.name === name)
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class={$$props.class}
	{focusable}
	width={width !== 0 ? width : size}
	height={size}
	{fill}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	style="stroke: {color} !important; {style}; transition: stroke linear 50ms;"
	viewBox="0 0 {box} {box}">{@html displayIcon.svg}</svg
>

<style>
</style>
