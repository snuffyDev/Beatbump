import { browser } from '$app/env'
import { writable } from 'svelte/store'

import type { Item } from './types'
import { notify } from './utils'
export type IDBPlaylist = {
	name?: string
	description?: string
	thumbnail?: any
	items?: Item | Item[]
	id?: string
	hideAlert?: boolean
}
type IDBRequestTarget = Event & {
	target: EventTarget & { result: IDBRequest & IDBCursorWithValue }
}
const mod = {
	charset: 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict',
	generate: (size = 16) => {
		let id = ''
		let i = size
		while (i--) {
			id += mod.charset[(Math.random() * mod.charset.length) | 0]
		}
		return id
	}
}

let db: IDBDatabase
let DB_VER = 1
let items: Array<any> = []

const accessDB = () => {
	if (!browser) return
	return new Promise(function (resolve, reject) {
		if (db != undefined) {
			return resolve()
		}
		const request = indexedDB.open('beatbump', 2)

		function error(error) {
			reject(error.target.error.message)
			console.error(error, error.target.error.message)
		}
		request.onupgradeneeded = function (
			event: IDBVersionChangeEvent & {
				target: EventTarget & {
					result: IDBDatabase
					transaction: IDBTransaction
				}
			}
		) {
			db = event.target.result
			db.onerror = error
			if (
				db.objectStoreNames.contains('playlists') &&
				event.target?.transaction.objectStore('playlists').keyPath !== 'id'
			) {
				const getOldPlaylists = event.target?.transaction
					.objectStore('playlists')
					.getAll()
				getOldPlaylists.onsuccess = function (e: IDBRequestTarget) {
					const results = e.target.result
					if (Array.isArray(results)) {
						items = [...results]
						// console.log(e, results)

						event.target.result.deleteObjectStore('playlists')
					}

					event.target.result.createObjectStore('playlists', {
						keyPath: 'id'
					})
				}
			}

			if (!db.objectStoreNames.contains('favorites')) {
				db.createObjectStore('favorites', {
					keyPath: 'videoId' || 'playlistId'
				})
			}
			if (!db.objectStoreNames.contains('playlists')) {
				db.createObjectStore('playlists', {
					keyPath: 'id'
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
					// console.log(items)
					const tx = db.transaction('playlists', 'readwrite')
					tx.objectStore('playlists').put({
						name,
						description,
						items: Array.isArray(items) ? [...items] : [items],
						length: Array.isArray(items) ? [...items].length : [items].length,
						thumbnail,
						id: mod.generate(32)
					}).onsuccess = resolve
					tx.addEventListener('complete', function () {
						resolve({ name, description, items, thumbnail })
						notify('Created Playlist!', 'success')
					})
					tx.addEventListener('error', function (e) {
						notify('Error: ' + e, 'error')
						reject(e)
					})
				} catch (err) {
					notify('Error: ' + err, 'error')
					reject(err)
					// throw new Error(err)
				}
			})
		})
	},
	updatePlaylist({
		id,
		thumbnail,
		description,
		items,
		name,
		hideAlert = false
	}: IDBPlaylist) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					let tx = db.transaction('playlists', 'readwrite')
					tx.objectStore('playlists').openCursor(id).onsuccess = function (
						e: IDBRequestTarget
					) {
						const cursor = e.target.result
						if (cursor) {
							const playlistItem = cursor.value
							const request = cursor.update({
								...playlistItem,
								name: name ?? playlistItem.name,
								thumbnail: thumbnail ?? playlistItem?.thumbnail,
								description: description ?? playlistItem.description,
								length: items.length,
								items: Array.isArray(items)
									? [...items]
									: [...playlistItem.items]
							})

							request.onsuccess = function (e: IDBRequestTarget) {
								resolve(e.target)
							}

							// console.log(e.target.result, list)
						}

						// list
						if (!hideAlert) notify('Updated Playlist!', 'success')
						// return resolve()
					}
					tx.addEventListener('complete', () => {
						if (!hideAlert) notify('Updated Playlist!', 'success')
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
				new Error(e)
			})
		} catch (e) {
			console.error(e)
		}
	},
	setMultipleFavorites(items: Item[]) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				const tx = db.transaction(['favorites'], 'readwrite')

				items.forEach((item) => {
					const request = tx.objectStore('favorites').put(item)
				})
				tx.oncomplete = () => {
					notify('Added items to favorites!', 'success')
				}
				tx.onerror = function (e) {
					console.error(e)
					reject(e)
				}
			})
		})
	},
	setMultiplePlaylists(items: IDBPlaylist[]) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				const tx = db.transaction(['playlists'], 'readwrite')

				items.forEach((item) => {
					const request = tx.objectStore('playlists').put(item)
				})
				tx.oncomplete = () => {
					notify(`Added ${items.length} new playlists!`, 'success')
				}
				tx.onerror = function (e) {
					console.error(e)
					reject(e)
				}
			})
		})
	},
	async deleteFavorite(item) {
		if (!item) return 'No item was provided!'
		await accessDB()

		try {
			db.transaction(['favorites'], 'readwrite')
				.objectStore('favorites')
				.delete(item.videoId || item.playlistId)
			notify('Item removed from favorites!', 'success')
		} catch (e) {
			console.error(e)
		}
	},
	async deleteAllPlaylists() {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				const tx = (db
					.transaction(['playlists'], 'readwrite')
					.objectStore('playlists')
					.clear().onsuccess = function (e) {
					notify('Playlists Deleted!', 'success')
					resolve('deleted')
				})
			})
		})
	},
	async deletePlaylist(name: string) {
		if (!name) return 'No playlist name was provided!'
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					db.transaction(['playlists'], 'readwrite')
						.objectStore('playlists')
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

					transaction.getAll().onsuccess = function (e: IDBRequestTarget) {
						if (e.target.result) {
							const result = e.target.result
							if (Array.isArray(result)) {
								lists = result
								resolve([...lists])
							}
						}
					}
				} catch (e) {
					notify('Error! ' + e, 'error')
					reject([])
				}
			})
		})
	},
	getPlaylist(id) {
		return new Promise(function (resolve, reject) {
			accessDB().then(function () {
				try {
					const transaction = db
						.transaction('playlists', 'readonly')
						.objectStore('playlists')

					transaction.openCursor(id).onsuccess = function (
						e: Event & { target: EventTarget & { result: IDBCursorWithValue } }
					) {
						if (e.target.result) {
							const playlist = e.target.result.value
							resolve(playlist)
						}
					}
				} catch (e) {
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
				let transaction: IDBObjectStore

				try {
					transaction = db
						.transaction('playlists', 'readwrite')
						.objectStore('playlists')
					if (items.length > 0) {
						items.forEach((item) => {
							transaction.put(item)
						})
					}
					transaction.getAll().onsuccess = function (e: IDBRequestTarget) {
						if (e.target.result) {
							const result = e.target.result
							if (Array.isArray(result)) {
								lists = result
								lists.forEach((item, i, array) => {
									let id
									if (!item?.id) {
										id = mod.generate(32)
										array[i].id = id
										transaction.put({ ...array[i] })
									}
								})
								resolve([...lists])
							} else {
								reject([])
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
