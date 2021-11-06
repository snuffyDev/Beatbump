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
let db: IDBDatabase
let DB_VER = 1

const accessDB = () => {
	if (!browser) return
	return new Promise((resolve, reject) => {
		if (db !== undefined) {
			resolve(undefined)
			return
		}
		const request = indexedDB.open('beatbump', 1)

		request.addEventListener('upgradeneeded', (event) => {
			db = request.result
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
		})
		request.addEventListener('success', (e) => {
			db = request.result
			db.addEventListener('close', (e) => {
				db = undefined
			})
			resolve(undefined)
		})
	})
}

export default {
	createPlaylist({ name, items, thumbnail }: IDBPlaylist) {},
	async addToPlaylist({ name, items, thumbnail }: IDBPlaylist) {
		await accessDB()
		const _proxied = await fetch(
			'/api/proxy.json?url=' + encodeURIComponent(thumbnail)
		)
		const _buffer = await _proxied.json()
		const { image: _img } = _buffer
		thumbnail = _img
		try {
			let tx = db.transaction(['playlists'], 'readwrite')
			tx.objectStore('playlists').put({
				name,
				items: items,
				length: items.length,
				thumbnail
			})
			tx.addEventListener('complete', () => {
				notify('Created Playlist!', 'success')
			})
			tx.addEventListener('error', function (e) {
				throw new Error(e)
			})
		} catch (err) {
			throw new Error(err)
		}
	},

	async setNewFavorite(item: Item) {
		await accessDB()
		if (!item) return new Error('No item was provided!')

		try {
			const tx = db.transaction('favorites', 'readwrite')

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
		await accessDB()
		try {
			db.transaction(['playlist'], 'readwrite')
				.objectStore('playlist')
				.delete(name)
			notify('Playlist Deleted!', 'success')
		} catch (e) {
			console.error(e)
		}
	},
	async getFavorites(): Promise<Item[]> {
		let favorites: Item[] | null = []
		await accessDB()
		return new Promise((resolve, reject) => {
			const transaction = db
				.transaction(['favorites'], 'readonly')
				.objectStore('favorites')
				.getAll()
			transaction.onsuccess = function (e) {
				favorites = transaction.result
				// console.log(e, favorites, transaction.result)
				resolve([...favorites])
			}
			transaction.onerror = function (e) {
				reject('rejected')
			}
			if (favorites.length !== 0) {
				resolve([...favorites])
			}
		})
	},
	async getPlaylists(): Promise<IDBPlaylist[]> {
		let lists: IDBPlaylist[] | null = []
		await accessDB()
		return new Promise((resolve, reject) => {
			try {
				const transaction = db
					.transaction('playlists', 'readwrite')
					.objectStore('playlists')
					.getAll()
				transaction.addEventListener('success', function (e) {
					lists = transaction.result
					console.log(lists, transaction.result)
					resolve([...lists])
				})
				transaction.addEventListener('error', function (e) {
					console.error(e)
				})
			} catch (e) {
				console.error(e)
				notify('Error! ' + e, 'error')
				reject(e)
			}
		})
	}
}
