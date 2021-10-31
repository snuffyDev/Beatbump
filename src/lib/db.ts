import { browser } from '$app/env'
import { writable } from 'svelte/store'

import { alertHandler } from './stores/stores'

import type { Item } from './types'
type IDBPlaylist = { name: string; thumbnail?: any; items: Item[] }

const notify = (msg: string, type: string) => {
	alertHandler.set({
		msg: msg,
		type: type
	})
}
let DB_VER = 1
const openDB = (ver: number) => {
	if (!browser) {
		return
	}
	return indexedDB.open('beatbump', ver)
}

const createStores = (db: IDBDatabase) => {
	if (!db.objectStoreNames.contains('favorites')) {
		db.createObjectStore('favorites', {
			keyPath: 'videoId' || 'playlistId'
		})
	}
	if (!db.objectStoreNames.contains('playlists')) {
		db.createObjectStore('playlists', {
			keyPath: 'name'
		})
	}
	return db
}
export default {
	createPlaylist({ name, items, thumbnail }: IDBPlaylist) {},
	addToPlaylist({ name, items, thumbnail }: IDBPlaylist) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			// console.log(name, items)
			if (!name) reject('No name was provided!')
			const request = openDB(DB_VER)

			let db: IDBDatabase

			request.onupgradeneeded = function (event) {
				db = request.result
				// const res = request.result
				db = createStores(db)
			}

			request.onsuccess = async function (e) {
				db = request.result
				if (!thumbnail) {
					thumbnail =
						'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4='
				}
				try {
					const tx = db.transaction('playlists', 'readwrite')

					tx.objectStore('playlists').put({
						name,
						items: items,
						length: items.length,
						thumbnail
					})
					notify('Created Playlist!', 'success')
				} catch (e) {
					console.error(e)
					notify('Error! ' + e, 'error')
				}
			}
			resolve('transaction complete')
		})
	},
	setNewFavorite(item: Item) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!item) reject('No item was provided!')
			// const request = openDB();

			const request = openDB(DB_VER)
			let db: IDBDatabase

			request.onupgradeneeded = function (e) {
				db = request.result
				db = createStores(db)
			}
			request.onsuccess = function (e) {
				db = request.result

				try {
					db.transaction(['favorites'], 'readwrite')
						.objectStore('favorites')
						.put(item)
					notify('Added to favorites!', 'success')
				} catch (e) {
					console.log(e)
				}
			}
			resolve('transaction complete')
		})
	},
	setMultiple(items: Item[]) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!items) reject('No item was provided!')
			// const request = openDB();

			const request = openDB(DB_VER)
			let db: IDBDatabase

			request.onupgradeneeded = function (e) {
				db = request.result

				db = createStores(db)
			}
			request.onsuccess = function (e) {
				db = request.result

				try {
					const tx = db.transaction(['favorites'], 'readwrite')

					items.forEach((item) => {
						const request = tx.objectStore('favorites').put(item)
					})
					tx.oncomplete = () => {
						resolve('items complete')

						notify('Added items to favorites!', 'success')
					}
				} catch (e) {
					console.log(e)
				}
			}
			resolve('items complete')
		})
	},
	deleteFavorite(item) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!item) reject('No item was provided!')
			// const request = openDB();

			const request = openDB(DB_VER)
			let db: IDBDatabase

			request.onsuccess = function (e) {
				db = request.result

				try {
					db.transaction(['favorites'], 'readwrite')
						.objectStore('favorites')
						.delete(item.videoId || item.playlistId)
					notify('Item removed from favorites!', 'success')
				} catch (e) {
					console.log(e)
				}
			}
			resolve(item)
		})
	},
	deletePlaylist(name: string) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!name) reject('No playlist name was provided!')
			// const request = openDB();

			const request = openDB()
			let db: IDBDatabase

			request.onsuccess = function (e) {
				db = request.result

				try {
					db.transaction(['favorites'], 'readwrite')
						.objectStore('favorites')
						.delete(item.videoId || item.playlistId)
					notify('Item removed from favorites!', 'success')
				} catch (e) {
					console.log(e)
				}
			}
			resolve(item)
		})
	},
	async getFavorites(): Promise<Item[]> {
		if (!browser) return
		let favorites: Item[] | null
		return new Promise((resolve, reject) => {
			// if (!item) reject('No item was provided!')
			// const request = openDB();

			const request = openDB(DB_VER)
			let db: IDBDatabase

			request.onupgradeneeded = function (e) {
				db = request.result

				db = createStores(db)
			}
			request.onsuccess = function (e) {
				db = request.result

				const transaction = db
					.transaction(['favorites'], 'readonly')
					.objectStore('favorites')
					.getAll()
				transaction.onsuccess = function (e) {
					favorites = transaction.result
					// console.log(e, transaction, transaction.result)

					resolve(favorites)
				}
				transaction.onerror = function (e) {
					console.error(e)
				}
			}
		})
	},
	async getPlaylists() {
		if (!browser) return
		let lists: IDBPlaylist[] | null

		return new Promise((resolve, reject) => {
			// if (!item) reject('No item was provided!')
			// const request = openDB();

			const request = openDB(DB_VER)

			let db: IDBDatabase

			request.onupgradeneeded = function (event) {
				db = request.result
				// const res = request.result
				db = createStores(db)
			}

			request.onsuccess = function (e) {
				db = request.result
				console.log(db, this)
				try {
					const transaction = db
						.transaction(['playlists'], 'readwrite')
						.objectStore('playlists')
						.getAll()
					transaction.onsuccess = function (e) {
						lists = transaction.result
						console.log(this, lists, e, transaction, transaction.result)

						resolve(lists)
					}
					transaction.onerror = function (e) {
						console.error(e)
					}
				} catch (e) {
					console.error(e)
					notify('Error! ' + e, 'error')
				}
			}
		})
	}
}
