import { assertEquals } from '@std/assert'
import { Generator } from './generator.ts'

Deno.test('Generator class should work like native Generator', () => {
	function* nativeGeneratorFn() {
		let i = 0
		const value: number = yield i++
		return value 
	}
	function customGeneratorFn() {
		return new Generator<number, number, number>(async (yieldFn) => {
			let i = 0;
      const value = await yieldFn(i++)
      return value
		})
	}
	const nativeGenerator = nativeGeneratorFn()
	const customGenerator = customGeneratorFn()

	assertEquals(nativeGenerator.next().value, 0)
	assertEquals(nativeGenerator.next(2).value, 1)
	assertEquals(nativeGenerator.next().done, true)
  assertEquals(nativeGenerator.next().value, 2)

	assertEquals(customGenerator.next().value, 0)
	assertEquals(customGenerator.next(2).value, 1)
	assertEquals(customGenerator.next().done, true)
  assertEquals(customGenerator.next().value, 2)
})
