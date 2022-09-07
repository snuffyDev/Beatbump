(() => {
	var B = Symbol("Comlink.proxy"),
		K = Symbol("Comlink.endpoint"),
		L = Symbol("Comlink.releaseProxy"),
		x = Symbol("Comlink.thrown"),
		M = (e) => (typeof e == "object" && e !== null) || typeof e == "function",
		U = {
			canHandle: (e) => M(e) && e[B],
			serialize(e) {
				let { port1: t, port2: s } = new MessageChannel();
				return T(e, t), [s, [s]];
			},
			deserialize(e) {
				return e.start(), F(e);
			},
		},
		N = {
			canHandle: (e) => M(e) && x in e,
			serialize({ value: e }) {
				let t;
				return (
					e instanceof Error
						? (t = { isError: !0, value: { message: e.message, name: e.name, stack: e.stack } })
						: (t = { isError: !1, value: e }),
					[t, []]
				);
			},
			deserialize(e) {
				throw e.isError ? Object.assign(new Error(e.value.message), e.value) : e.value;
			},
		},
		E = new Map([
			["proxy", U],
			["throw", N],
		]);
	function T(e, t = self) {
		t.addEventListener("message", function s(r) {
			if (!r || !r.data) return;
			let { id: o, type: a, path: n } = Object.assign({ path: [] }, r.data),
				l = (r.data.argumentList || []).map(f),
				i;
			try {
				let c = n.slice(0, -1).reduce((u, g) => u[g], e),
					d = n.reduce((u, g) => u[g], e);
				switch (a) {
					case "GET":
						i = d;
						break;
					case "SET":
						(c[n.slice(-1)[0]] = f(r.data.value)), (i = !0);
						break;
					case "APPLY":
						i = d.apply(c, l);
						break;
					case "CONSTRUCT":
						{
							let u = new d(...l);
							i = _(u);
						}
						break;
					case "ENDPOINT":
						{
							let { port1: u, port2: g } = new MessageChannel();
							T(e, g), (i = V(u, [u]));
						}
						break;
					case "RELEASE":
						i = void 0;
						break;
					default:
						return;
				}
			} catch (c) {
				i = { value: c, [x]: 0 };
			}
			Promise.resolve(i)
				.catch((c) => ({ value: c, [x]: 0 }))
				.then((c) => {
					let [d, u] = w(c);
					t.postMessage(Object.assign(Object.assign({}, d), { id: o }), u),
						a === "RELEASE" && (t.removeEventListener("message", s), v(t));
				});
		}),
			t.start && t.start();
	}
	function $(e) {
		return e.constructor.name === "MessagePort";
	}
	function v(e) {
		$(e) && e.close();
	}
	function F(e, t) {
		return A(e, [], t);
	}
	function h(e) {
		if (e) throw new Error("Proxy has been released and is not useable");
	}
	function A(e, t = [], s = function () {}) {
		let r = !1,
			o = new Proxy(s, {
				get(a, n) {
					if ((h(r), n === L))
						return () =>
							y(e, { type: "RELEASE", path: t.map((l) => l.toString()) }).then(() => {
								v(e), (r = !0);
							});
					if (n === "then") {
						if (t.length === 0) return { then: () => o };
						let l = y(e, { type: "GET", path: t.map((i) => i.toString()) }).then(f);
						return l.then.bind(l);
					}
					return A(e, [...t, n]);
				},
				set(a, n, l) {
					h(r);
					let [i, c] = w(l);
					return y(e, { type: "SET", path: [...t, n].map((d) => d.toString()), value: i }, c).then(f);
				},
				apply(a, n, l) {
					h(r);
					let i = t[t.length - 1];
					if (i === K) return y(e, { type: "ENDPOINT" }).then(f);
					if (i === "bind") return A(e, t.slice(0, -1));
					let [c, d] = D(l);
					return y(e, { type: "APPLY", path: t.map((u) => u.toString()), argumentList: c }, d).then(f);
				},
				construct(a, n) {
					h(r);
					let [l, i] = D(n);
					return y(e, { type: "CONSTRUCT", path: t.map((c) => c.toString()), argumentList: l }, i).then(f);
				},
			});
		return o;
	}
	function q(e) {
		return Array.prototype.concat.apply([], e);
	}
	function D(e) {
		let t = e.map(w);
		return [t.map((s) => s[0]), q(t.map((s) => s[1]))];
	}
	var S = new WeakMap();
	function V(e, t) {
		return S.set(e, t), e;
	}
	function _(e) {
		return Object.assign(e, { [B]: !0 });
	}
	function w(e) {
		for (let [t, s] of E)
			if (s.canHandle(e)) {
				let [r, o] = s.serialize(e);
				return [{ type: "HANDLER", name: t, value: r }, o];
			}
		return [{ type: "RAW", value: e }, S.get(e) || []];
	}
	function f(e) {
		switch (e.type) {
			case "HANDLER":
				return E.get(e.name).deserialize(e.value);
			case "RAW":
				return e.value;
		}
	}
	function y(e, t, s) {
		return new Promise((r) => {
			let o = z();
			e.addEventListener("message", function a(n) {
				!n.data || !n.data.id || n.data.id !== o || (e.removeEventListener("message", a), r(n.data));
			}),
				e.start && e.start(),
				e.postMessage(Object.assign({ id: o }, t), s);
		});
	}
	function z() {
		return new Array(4)
			.fill(0)
			.map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
			.join("-");
	}
	var k = {
			normal: "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",
			alternative: "useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict",
		},
		H = {
			generate: (e = 16, t = "normal") => {
				let s = "",
					r = e;
				for (; r--; ) s += k[t][(Math.random() * k[t].length) | 0];
				return s;
			},
		};
	function m(e = 16, t = "normal") {
		return H.generate(e, t);
	}
	var G = typeof globalThis < "u";
	var W = {},
		b = class {
			constructor(t, s = 1) {
				this.DB_NAME = t;
				this.DB_VER = s;
			}
			$$;
			init() {
				this.$$ ||
					(this.$$ = new Promise((t, s) => {
						let r = indexedDB.open(this.DB_NAME, this.DB_VER);
						(r.onerror = () => s(r.error)),
							(r.onsuccess = () => t(r.result)),
							(r.onupgradeneeded = () => {
								if (r.result.objectStoreNames.contains("playlists")) {
									let o = r.transaction.objectStore("playlists").getAll();
									o.onsuccess = (a) => {
										Array.isArray(a.target.result) &&
											((W.playlists = [...a.target.result]), r.result.deleteObjectStore("playlists")),
											r.result.createObjectStore("playlists", { keyPath: "id" });
									};
								}
								r.result.objectStoreNames.contains("favorites") ||
									r.result.createObjectStore("favorites", { keyPath: "videoId" }),
									r.result.objectStoreNames.contains("playlists") ||
										r.result.createObjectStore("playlists", { keyPath: "id" });
							});
					}));
			}
			transaction(t, s, r) {
				if (!!G)
					return (
						this.init(),
						this.$$.then(
							(o) =>
								new Promise((a, n) => {
									let l = o.transaction(t, s);
									(l.oncomplete = () => a()), (l.onabort = l.onerror = () => n(l.error)), r(l.objectStore(t));
								}),
						)
					);
			}
		};
	function I(e, t) {
		let s = e.length,
			r = -1;
		for (; ++r < s; ) t(e[r], r, e);
		r = null;
	}
	var P = {},
		p = new b("beatbump", 3);
	function X(e) {
		let t;
		return new Promise((s) => {
			p.transaction("playlists", "readwrite", (r) => {
				try {
					let o = r.openCursor(e.id);
					o.onsuccess = (a) => {
						let n = a.target.result;
						if (
							(n &&
								n.update({
									...n.value,
									name: e?.name ?? n?.value?.name,
									thumbnail: e?.thumbnail ?? n?.value?.thumbnail,
									description: e?.description ?? n?.value?.description,
									length: Array.isArray(e?.items) ? e?.items.length : n?.value?.items.length,
									items: Array.isArray(e?.items) ? [...e.items] : [...n.value.items],
								}),
							!e.hideAlert)
						) {
							s({ message: "Successfully updated playlist!" });
							return;
						}
						s({ data: a?.target.result });
					};
				} catch (o) {
					s({ error: !0, message: "Failed to update playlist. Reason: " + o });
				}
			});
		});
	}
	function Q(e) {
		return new Promise((t) => {
			p.transaction("playlists", "readwrite", (s) => {
				try {
					let r = s.put(
						Object.assign(e, { id: m(32), length: Array.isArray(e?.items) ? [...e.items].length : [e?.items].length }),
					);
					(r.onsuccess = () => {
						t({ message: "Created Playlist!" });
					}),
						(r.onerror = () => {
							t({ error: !0, message: "Error: " + r.error });
						});
				} catch (r) {
					t({ message: "Error: " + r });
				}
			});
		});
	}
	function Z(e) {
		return new Promise((t) => {
			p.transaction("favorites", "readwrite", (s) => {
				try {
					let r = s.put(e);
					r.onsuccess = () => {
						t({ message: "Added to favorites!" });
					};
				} catch (r) {
					t({ message: "Error setting favorite. Reason: " + r });
				}
			});
		});
	}
	function ee(e) {
		if (!e) throw new Error("No item was provided!");
		return new Promise((t) =>
			p.transaction("favorites", "readwrite", (s) => {
				try {
					s.delete(e.videoId || e.playlistId), t({ message: "Item removed from favorites!" });
				} catch (r) {
					t({ message: "Error removing item from favorites. Reason: " + r });
				}
			}),
		);
	}
	function te(e) {
		if (!e) throw new Error("No playlist name was provided!");
		return new Promise((t) =>
			p.transaction("playlists", "readwrite", (s) => {
				try {
					s.delete(e), t({ message: "Deleted playlist!" });
				} catch (r) {
					t({ message: "Error deleting playlist. Reason: " + r });
				}
			}),
		);
	}
	function re() {
		return new Promise((e) =>
			p.transaction("playlists", "readwrite", (t) => {
				try {
					t.clear().onsuccess = () => {
						e({ message: "Deleted playlists!" });
					};
				} catch (s) {
					e({ message: "Error deleting playlists. Reason: " + s });
				}
			}),
		);
	}
	function O() {
		let e = [];
		return new Promise((t) =>
			p.transaction("favorites", "readwrite", (s) => {
				try {
					let r = s.getAll();
					r.onsuccess = (o) => {
						Array.isArray(o?.target?.result) && t({ data: o.target.result });
					};
				} catch (r) {
					t({ message: r });
				}
			}),
		);
	}
	function se(e) {
		return new Promise((t) =>
			p.transaction("playlists", "readwrite", (s) => {
				try {
					let r = s.openCursor(e);
					(r.onsuccess = (o) => {
						t({ data: o.target.result.value });
					}),
						(r.onerror = (o) => {});
				} catch (r) {
					console.error(r), t({ message: r });
				}
			}),
		);
	}
	function j() {
		return new Promise((e) => {
			p.transaction("playlists", "readwrite", (t) => {
				try {
					P.playlists &&
						Array.isArray(P.playlists) &&
						I(P.playlists, (r) => {
							t.put(r);
						});
					let s = t.getAll();
					s.onsuccess = (r) => {
						let o = [];
						Array.isArray(r?.target?.result) &&
							((o = r.target.result),
							I(o, (a, n) => {
								if (
									(a.id || ((o[n].id = m(32)), t.put({ ...o[n] })), Array.isArray(a?.items) && a?.items.length !== 0)
								) {
									let i = a?.items.length;
									for (; i--; )
										if (Array.isArray(a?.items[i])) {
											let c = a?.items[i];
											o[n].items.splice(i, 1), (o[n].items = [...o[n].items, ...c]);
										}
									(o[n].length = a?.items.length ?? a?.length), t.put({ ...o[n] });
								}
							}),
							e({ data: o }));
					};
				} catch (s) {
					console.error(s), e({ message: s });
				}
			});
		});
	}
	var ne = {
			updatePlaylist: X,
			deletePlaylist: te,
			createPlaylist: Q,
			deleteFavorite: ee,
			getFavorites: O,
			getPlaylist: se,
			getPlaylists: j,
			deletePlaylists: re,
			createFavorite: Z,
		},
		R = (e, t, ...s) => {
			let r = `${e}${t[0].toUpperCase() + t.slice(1)}`;
			return ne[`${r}`](...s);
		};
	async function C(e, t, ...s) {
		return await R(e, t, ...s);
	}
	function _e() {
		return console.log(this, self), { tx: C };
	}
	T({ tx: C });
})();
