export type Icons =
	| "album"
	| "chevron-left"
	| "chevron-right"
	| "clock"
	| "download"
	| "edit"
	| "folder"
	| "frown"
	| "heart"
	| "home"
	| "image"
	| "import"
	| "list"
	| "minus"
	| "music"
	| "pause"
	| "play"
	| "radio"
	| "repeat"
	| "repeat-1"
	| "search"
	| "send"
	| "settings"
	| "share"
	| "shuffle"
	| "skip-back"
	| "skip-forward"
	| "upload"
	| "user"
	| "users"
	| "dots"
	| "queue"
	| "trending"
	| "volume"
	| ("x" & string);

export default {
	clock: `<circle cx="12" cy="12" r="10" />
	<path d="M12 6v6l4 2" />
`,
	image: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  <circle cx="8.5" cy="8.5" r="1.5" />
  <polyline points="21 15 16 10 5 21" />`,
	upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" y1="3" x2="12" y2="15" />`,
	frown: `
<circle cx="12" cy="12" r="10" />
<path d="M16 16s-1.5-2-4-2-4 2-4 2" />
<line x1="9" y1="9" x2="9.01" y2="9" />
<line x1="15" y1="9" x2="15.01" y2="9" />`,
	shuffle: `<polyline points="16 3 21 3 21 8" />
<line x1="4" y1="20" x2="21" y2="3" />
<polyline points="21 16 21 21 16 21" />
<line x1="15" y1="15" x2="21" y2="21" />
<line x1="4" y1="4" x2="9" y2="9" />`,
	trending: `
<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
<polyline points="17 6 23 6 23 12" />`,
	share: `<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
<polyline points="16 6 12 2 8 6" />
<line x1="12" y1="2" x2="12" y2="15" />`,
	volume: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />`,
	music: `<path d="M9 18V5l12-2v13" />
<circle cx="6" cy="18" r="3" />
<circle cx="18" cy="16" r="3" />`,
	tool: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />`,
	"playlist-add": `<g>
<line stroke="currentColor" id="svg_1" y2="6" x2="21" y1="6" x1="3"/>
<line stroke="currentColor" id="svg_2" y2="12" x2="21" y1="12" x1="3"/>
<line stroke="currentColor" id="svg_3" y2="18" x2="19.57594" y1="18" x1="3"/>
</g>
<path d="M -18.57 -22.149 H -16.529 V -18.067 H -12.448 V -16.027 H -16.529 V -11.946 H -18.57 V -16.027 H -22.651 V -18.067 H -18.57 Z" style="stroke-width: 1px;fill: currentColor;paint-order: fill;" transform="matrix(-1, 0, 0, -1, 0, 0)"/>
`,
	user: `
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />`,
	users: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
	play: `<polygon points="5 3 19 12 5 21 5 3" stroke-width="3" />`,
	"play-player": `<polygon points="5 3 19 12 5 21 5 3" stroke-width="2" />`,
	pause: `<rect x="6" y="4" width="4" height="16" />
<rect x="14" y="4" width="4" height="16" />`,
	dots: `<circle cx="12" cy="12" r="1" />
<circle cx="12" cy="5" r="1" />
<circle cx="12" cy="19" r="1" />`,
	settings: `<circle cx="12" cy="12" r="3" />
<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
`,
	artist: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
<circle cx="12" cy="7" r="4" />`,
	search: `<circle cx="11" cy="11" r="8" />
<line x1="21" y1="21" x2="16.65" y2="16.65" />`,
	album: `<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>`,
	queue: `<g>
<line stroke="currentColor" id="svg_1" y2="6" x2="21" y1="6" x1="3"/>
<line stroke="currentColor" id="svg_2" y2="12" x2="21" y1="12" x1="3"/>
<line stroke="currentColor" id="svg_3" y2="18" x2="19.57594" y1="18" x1="3"/>
<g stroke-opacity="0.3" stroke="null" stroke-width="0.75" id="svg_11">
 <polygon stroke="currentColor" fill="currentColor" id="svg_10" points="14.77114200592041,11.925364971160889 22.75658416748047,17.058862686157227 14.77114200592041,22.19236183166504 14.77114200592041,11.925364971160889 "/>
</g>
</g>`,
	heart: `<path xmlns="http://www.w3.org/2000/svg" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
	list: `<line x1="8" y1="6" x2="21" y2="6" />
<line x1="8" y1="12" x2="21" y2="12" />
<line x1="8" y1="18" x2="21" y2="18" />
<line x1="3" y1="6" x2="3.01" y2="6" />
<line x1="3" y1="12" x2="3.01" y2="12" />
<line x1="3" y1="18" x2="3.01" y2="18" />`,
	edit: `
<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />`,
	folder: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />`,
	"skip-forward": `<polygon points="5 4 15 12 5 20 5 4" />
<line x1="19" y1="5" x2="19" y2="19" />`,
	home: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
<polyline points="9 22 9 12 15 12 15 22" />`,
	x: `
<line x1="18" y1="6" x2="6" y2="18" />
<line x1="6" y1="6" x2="18" y2="18" />`,
	"skip-back": `<polygon points="19 20 9 12 19 4 19 20" />
<line x1="5" y1="19" x2="5" y2="5" />`,
	minus: `<line x1="-100" y1="50%" x2="100" y2="50%" />`,
	import: `<circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>`,
	send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
	radio: `<circle cx="12" cy="12" r="2" />
<path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />`,
	"chevron-right": `<polyline points="9 18 15 12 9 6" />`,
	"chevron-left": `<polyline points="15 18 9 12 15 6" />`,
	download: `  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" y1="15" x2="12" y2="3" />`,
};
