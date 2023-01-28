export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["android/android-launchericon-144-144.png","android/android-launchericon-192-192.png","android/android-launchericon-48-48.png","android/android-launchericon-512-512.png","android/android-launchericon-72-72.png","android/android-launchericon-96-96.png","apple-touch-icon-120x120.png","apple-touch-icon-152x152.png","apple-touch-icon-180x180.png","apple-touch-icon-60x60.png","apple-touch-icon-76x76.png","apple-touch-icon.png","assets/android-chrome-192x192.png","assets/android-chrome-256x256.png","assets/browserconfig.xml","assets/favicon-16x16.png","assets/favicon-32x32.png","assets/favicon.ico","assets/favicon.png","assets/mstile-150x150.png","assets/safari-pinned-tab.svg","favicon.ico","favicon.png","icons.svg","logo.png","logo.svg","manifest.json","mask.svg","maskable.svg","robots.txt","service-worker.js"]),
	mimeTypes: {".png":"image/png",".xml":"application/xml",".ico":"image/vnd.microsoft.icon",".svg":"image/svg+xml",".json":"application/json",".txt":"text/plain"},
	_: {
		entry: {"file":"_app/immutable/start-01584729.js","imports":["_app/immutable/start-01584729.js","_app/immutable/chunks/index-4a84906d.js","_app/immutable/chunks/singletons-4b4b4944.js","_app/immutable/chunks/index-8fd0dbbf.js","_app/immutable/chunks/preload-helper-41c905a7.js","_app/immutable/chunks/control-f5b05b5f.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			() => import('../output/server/nodes/0.js'),
			() => import('../output/server/nodes/1.js'),
			() => import('../output/server/nodes/2.js'),
			() => import('../output/server/nodes/3.js'),
			() => import('../output/server/nodes/4.js'),
			() => import('../output/server/nodes/5.js'),
			() => import('../output/server/nodes/6.js'),
			() => import('../output/server/nodes/7.js'),
			() => import('../output/server/nodes/8.js'),
			() => import('../output/server/nodes/9.js'),
			() => import('../output/server/nodes/10.js'),
			() => import('../output/server/nodes/11.js'),
			() => import('../output/server/nodes/12.js'),
			() => import('../output/server/nodes/13.js'),
			() => import('../output/server/nodes/14.js'),
			() => import('../output/server/nodes/15.js'),
			() => import('../output/server/nodes/16.js'),
			() => import('../output/server/nodes/17.js'),
			() => import('../output/server/nodes/18.js'),
			() => import('../output/server/nodes/19.js'),
			() => import('../output/server/nodes/20.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/v1/get_queue.json",
				pattern: /^\/api\/v1\/get_queue\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/get_queue.json/_server.ts.js')
			},
			{
				id: "/api/v1/get_search_suggestions.json",
				pattern: /^\/api\/v1\/get_search_suggestions\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/get_search_suggestions.json/_server.ts.js')
			},
			{
				id: "/api/v1/main.json",
				pattern: /^\/api\/v1\/main\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/main.json/_server.ts.js')
			},
			{
				id: "/api/v1/next.json",
				pattern: /^\/api\/v1\/next\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/next.json/_server.ts.js')
			},
			{
				id: "/api/v1/player.json",
				pattern: /^\/api\/v1\/player\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/player.json/_server.ts.js')
			},
			{
				id: "/api/v1/playlist.json",
				pattern: /^\/api\/v1\/playlist\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/playlist.json/_server.ts.js')
			},
			{
				id: "/api/v1/related.json",
				pattern: /^\/api\/v1\/related\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/related.json/_server.ts.js')
			},
			{
				id: "/api/v1/search.json",
				pattern: /^\/api\/v1\/search\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/search.json/_server.ts.js')
			},
			{
				id: "/api/v1/stats.json",
				pattern: /^\/api\/v1\/stats\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/api/v1/stats.json/_server.ts.js')
			},
			{
				id: "/artist/[slug]",
				pattern: /^\/artist\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 3 },
				endpoint: null
			},
			{
				id: "/artist/[slug]/releases.json",
				pattern: /^\/artist\/([^/]+?)\/releases\.json\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/artist/_slug_/releases.json/_server.ts.js')
			},
			{
				id: "/artist/[slug]/releases",
				pattern: /^\/artist\/([^/]+?)\/releases\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 4 },
				endpoint: null
			},
			{
				id: "/explore.json",
				pattern: /^\/explore\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/explore.json/_server.ts.js')
			},
			{
				id: "/explore",
				pattern: /^\/explore\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 5 },
				endpoint: null
			},
			{
				id: "/explore/[slug].json",
				pattern: /^\/explore\/([^/]+?)\.json\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/explore/_slug_.json/_server.ts.js')
			},
			{
				id: "/explore/[slug]",
				pattern: /^\/explore\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 6 },
				endpoint: null
			},
			{
				id: "/home.json",
				pattern: /^\/home\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/home.json/_server.ts.js')
			},
			{
				id: "/home",
				pattern: /^\/home\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 7 },
				endpoint: null
			},
			{
				id: "/library",
				pattern: /^\/library\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 8 },
				endpoint: null
			},
			{
				id: "/library/playlists",
				pattern: /^\/library\/playlists\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 9 },
				endpoint: null
			},
			{
				id: "/library/playlists/[slug]",
				pattern: /^\/library\/playlists\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 10 },
				endpoint: null
			},
			{
				id: "/library/songs",
				pattern: /^\/library\/songs\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 11 },
				endpoint: null
			},
			{
				id: "/listen",
				pattern: /^\/listen\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 12 },
				endpoint: null
			},
			{
				id: "/playlist/[slug]",
				pattern: /^\/playlist\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 13 },
				endpoint: null
			},
			{
				id: "/release",
				pattern: /^\/release\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 14 },
				endpoint: null
			},
			{
				id: "/search/[slug]",
				pattern: /^\/search\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 15 },
				endpoint: null
			},
			{
				id: "/session",
				pattern: /^\/session\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 16 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 17 },
				endpoint: null
			},
			{
				id: "/test",
				pattern: /^\/test\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 18 },
				endpoint: null
			},
			{
				id: "/trending.json",
				pattern: /^\/trending\.json\/?$/,
				params: [],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/trending.json/_server.ts.js')
			},
			{
				id: "/trending",
				pattern: /^\/trending\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 19 },
				endpoint: null
			},
			{
				id: "/trending/new/[slug].json",
				pattern: /^\/trending\/new\/([^/]+?)\.json\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: () => import('../output/server/entries/endpoints/trending/new/_slug_.json/_server.ts.js')
			},
			{
				id: "/trending/new/[slug]",
				pattern: /^\/trending\/new\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 20 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
