import { assertEquals } from '@std/assert'
import { Future } from './future.ts'

Deno.test('Future class should be thenable', async () => {
	const future = new Future<number>()
	future.resolve(1)
	const value = await future.then((value) => {
		return value
	})
	assertEquals(value, 1)
})
Deno.test('Future class should be catchable', async () => {
	const future = new Future<number>()
	future.reject(1)
	const value = await future.catch((value) => {
		return value
	})
	assertEquals(value, 1)
})
Deno.test('Future class should be finallisable', async () => {
	const future = new Future<number>()
	let value = 0
	await future.finally(() => {
		value = 1
	})
	assertEquals(value, 1)
})
