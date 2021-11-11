import { browser } from '$app/env'
import { writable } from 'svelte/store'

import { alertHandler } from './stores/stores'

import type { Item } from './types'
type IDBPlaylist = {
	name: string
	description?: string
	thumbnail?: any
	items: Item | Item[]
}
const notify = (msg: string, type: string) => {
	alertHandler.set({
		msg: msg,
		type: type
	})
}
let db: IDBDatabase
let DB_VER = 1

const accessDB = () => {
	if (!browser) return
	return new Promise(function (resolve, reject) {
		if (db != undefined) {
			return resolve()
		}
		const request = indexedDB.open('beatbump', 1)

		function error(error) {
			reject(error.target.error.message)
			console.error(error.target.error.message)
		}
		request.onupgradeneeded = function (
			event: IDBVersionChangeEvent & {
				target: EventTarget & { result: IDBDatabase }
			}
		) {
			db = event.target.result
			db.onerror = error
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
		}
		request.onerror = error
		request.onsuccess = function (
			e: IDBVersionChangeEvent & {
				target: EventTarget & { result: IDBDatabase }
			}
		) {
			db = e.target.result
			db.onerror = error
			db.addEventListener('close', function (e) {
				db = undefined
			})
			resolve(db)
		}
	})
}

export default {
	createNewPlaylist({ name, description, items, thumbnail }: IDBPlaylist) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					let tx = db.transaction('playlists', 'readwrite')
					tx.objectStore('playlists').put({
						name,
						description,
						items: Array.isArray(items) ? [...items] : items,
						length: items.length,
						thumbnail
					}).onsuccess = resolve
					tx.addEventListener('complete', function () {
						resolve({ name, description, items, thumbnail })
						notify('Created Playlist!', 'success')
					})
					tx.addEventListener('error', function (e) {
						notify('Error: ' + e, 'error')
						reject()
					})
				} catch (err) {
					notify('Error: ' + err, 'error')
					reject()
					// throw new Error(err)
				}
			})
		})
	},
	addToPlaylist(name, { playlist, item }) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					let tx = db.transaction('playlists', 'readwrite')
					tx.objectStore('playlists').openCursor().onsuccess = function (
						e: Event & { target: EventTarget & { result: IDBCursorWithValue } }
					) {
						const cursor = e.target.result
						if (cursor) {
							const playlistItem = cursor.value
							if (Array.isArray(item)) {
								const request = cursor.update({
									...playlistItem,
									items: [...playlistItem?.items, ...item],
									length: [...playlistItem?.items, ...item].length
								})

								request.onsuccess = function (e) {
									resolve(request)
								}
							} else {
								const request = cursor.update({
									...playlistItem,
									items: [...playlistItem?.items, item],
									length: [...playlistItem?.items, item].length
								})
								request.onsuccess = function (e) {
									resolve(request)
								}
							}
							// console.log(e.target.result, list)
						}

						// list
						notify('Added to Playlist!', 'success')
						// return resolve()
					}
					tx.addEventListener('complete', () => {
						notify('Added to Playlist!', 'success')
					})
					tx.addEventListener('error', function (e) {
						throw new Error(e)
					})
				} catch (err) {
					throw new Error(err)
				}
			})
		})
	},
	async setNewFavorite(item: Item) {
		await accessDB()
		if (!item) return new Error('No item was provided!')

		try {
			const tx = db.transaction(['favorites'], 'readwrite')

			tx.objectStore('favorites').put(item)
			tx.addEventListener('complete', () => {
				notify('Added to favorites!', 'success')
			})
			tx.addEventListener('error', function (e) {
				throw new Error(e)
			})
		} catch (e) {
			console.log(e)
		}
	},
	async setMultiple(items: Item[]) {
		await accessDB()

		try {
			const tx = db.transaction(['favorites'], 'readwrite')

			items.forEach((item) => {
				const request = tx.objectStore('favorites').put(item)
			})
			tx.oncomplete = () => {
				notify('Added items to favorites!', 'success')
			}
		} catch (e) {
			console.error(e)
		}
	},
	async deleteFavorite(item) {
		if (!item) return 'No item was provided!'
		await accessDB()
		// const request = openDB();

		try {
			db.transaction(['favorites'], 'readwrite')
				.objectStore('favorites')
				.delete(item.videoId || item.playlistId)
			notify('Item removed from favorites!', 'success')
		} catch (e) {
			console.error(e)
		}
	},
	async deletePlaylist(name: string) {
		if (!name) return 'No playlist name was provided!'
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					db.transaction(['playlist'], 'readwrite')
						.objectStore('playlist')
						.delete(name)
					notify('Playlist Deleted!', 'success')
				} catch (e) {
					console.error(e)
				}
			})
		})
	},
	getFavorites(): Promise<Item[]> {
		let lists: Item[] | null = []
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					const transaction = db
						.transaction('favorites', 'readonly')
						.objectStore('favorites')

					transaction.getAll().onsuccess = function (
						e: Event & { target: EventTarget & { result: IDBCursorWithValue } }
					) {
						if (e.target.result) {
							const result = e.target.result
							if (Array.isArray(result)) {
								lists = result
								// console.log(lists, e.target.result.value)
								// e.target.result.continue()
								resolve([...lists])
							}
						}
					}
				} catch (e) {
					// console.error(e)
					notify('Error! ' + e, 'error')
					reject([])
				}
			})
		})
	},
	getPlaylist(name) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					const transaction = db
						.transaction('playlists', 'readonly')
						.objectStore('playlists')

					transaction.openCursor(name).onsuccess = function (
						e: Event & { target: EventTarget & { result: IDBCursorWithValue } }
					) {
						if (e.target.result) {
							const playlist = e.target.result.value
							console.log(playlist, e.target.result)
							resolve(playlist)
						}
					}
				} catch (e) {
					// console.error(e)
					notify('Error! ' + e, 'error')
					reject([])
				}
			})
		})
	},
	getPlaylists(): Promise<IDBPlaylist[]> {
		let lists: IDBPlaylist[] | null = []
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					const transaction = db
						.transaction('playlists', 'readonly')
						.objectStore('playlists')

					transaction.getAll().onsuccess = function (
						e: Event & { target: EventTarget & { result: IDBRequest } }
					) {
						if (e.target.result) {
							const result = e.target.result
							if (Array.isArray(result)) {
								lists = result
								resolve([...lists])
							}
						}
					}
					// resolve([...lists])
				} catch (e) {
					notify('Error! ' + e, 'error')
					reject([])
				}
			})
		})
	}
}
