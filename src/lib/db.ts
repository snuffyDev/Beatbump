import { browser } from '$app/env'
import { writable } from 'svelte/store'

import { alertHandler } from './stores/stores'

import type { Item } from './types'
const notify = (msg: string, type: string) => {
	alertHandler.set({
		msg: msg,
		type: type
	})
}
let favorites = []
const list = writable([])
const favoriteList = () => {
	const { subscribe } = writable(list)

	return {
		subscribe
	}
}
export default {
	setNewFavorite(item: Item) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!item) reject('No item was provided!')
			// let request = indexedDB.open('beatbump', 1)

			const request = indexedDB.open('beatbump', 1)
			request.onupgradeneeded = (e) => {
				const db = request.result
				db.createObjectStore('favorites', {
					keyPath: 'videoId' || 'playlistId'
				})
			}
			request.onsuccess = (e) => {
				const db = request.result

				try {
					db.transaction('favorites', 'readwrite')
						.objectStore('favorites')
						.put(item)
					notify('Added to favorites!', 'success')
				} catch (e) {
					console.log(e)
				}
			}
			resolve(item)
		})
	},
	setMultiple(items: Item[]) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!items) reject('No item was provided!')
			// let request = indexedDB.open('beatbump', 1)

			const request = indexedDB.open('beatbump', 1)
			request.onupgradeneeded = (e) => {
				const db = request.result
				db.createObjectStore('favorites', {
					keyPath: 'videoId' || 'playlistId'
				})
			}
			request.onsuccess = (e) => {
				const db = request.result

				try {
					const tx = db.transaction('favorites', 'readwrite')
					items.forEach((item) => {
						let request = tx.objectStore('favorites').put(item)
					})
					tx.oncomplete = () => {
						resolve(items)
						notify('Added items to favorites!', 'success')
					}
				} catch (e) {
					console.log(e)
				}
			}
			resolve(items)
		})
	},
	deleteFavorite(item) {
		if (!browser) return
		return new Promise((resolve, reject) => {
			if (!item) reject('No item was provided!')
			// let request = indexedDB.open('beatbump', 1)

			const request = indexedDB.open('beatbump', 1)

			request.onsuccess = (e) => {
				const db = request.result

				try {
					db.transaction('favorites', 'readwrite')
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
			// let request = indexedDB.open('beatbump', 1)

			const request = indexedDB.open('beatbump', 1)
			request.onupgradeneeded = (e) => {
				const db = request.result
				db.createObjectStore('favorites', {
					keyPath: 'videoId' || 'playlistId'
				})
			}
			request.onsuccess = (e) => {
				const db = request.result

				const transaction = db
					.transaction('favorites', 'readonly')
					.objectStore('favorites')
					.getAll()
				transaction.onsuccess = (e) => {
					favorites = transaction.result
					// console.log(e, transaction, transaction.result)
					resolve(favorites)
				}
				transaction.onerror = (e) => {
					console.error(e)
				}
			}
		})
	}
}
