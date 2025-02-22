/**
 * This class implement the Generator interface.
 * The goal of a generator is not to store the state of the computation, but to provide a way to resume the computation at a later point.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 *
 * @example
 * ```ts
 * const generator = new Generator(async (next) => {
 *   let i = 0;
 *   const value = await next(i++)
 *   return value
 * });
 *
 * for (const value of generator) {
 *   console.log(value);
 * }
 * ```
 */
class GeneratorDone {}
export class Generator<T = unknown, TReturn = void, TNext = void>
	implements globalThis.Generator<T, TReturn, TNext> {
	/**
	 * The future given by the next method, returned by the yieldFn method.
	 */
	private nextFuture: Future<TNext> = new Future<TNext>()
	/**
	 * The value returned by the return method.
	 */
	private iteratorResult?: IteratorResult<T, TReturn>

	/**
	 * The yield function return a promise given by the next method.
	 * If the yieldFn is not awaited, the value will be possibly lost.
	 * @param value The value to yield, it will be passed to the next method.
	 * @returns A promise given by the next method containing its value.
	 */
	private async yieldFn(value: T): Promise<TNext> {
		// If the generator has already ended, we throw an error.
		if (this.iteratorResult?.done) {
			// Stop the executor
			throw new GeneratorDone()
		}
		// First, we store the value yielded by the executor.
		this.iteratorResult = { value, done: false }
		// Get the next value from the future.
		const nextValue = await this.nextFuture
		// Reset the future, to be able to yield a new value.
		this.nextFuture = new Future<TNext>()
		return nextValue
	}

	/**
	 * Create a new generator.
	 * @param executor The executor function where we implement the logic of the generator.
	 */
	constructor(
		private executor: (
			yieldFn: Generator<T, TReturn, TNext>['yieldFn'],
		) => Promise<TReturn>,
	) {
		this.executor(this.yieldFn)
			.then((value) => {
				this.iteratorResult = { value, done: true }
			})
			.catch((e) => {
				// Clean up the executor
				if (e instanceof GeneratorDone) {
					return
				}
				throw e
			})
	}

	/**
	 * The next() method is used to iterate through the generator, yielding values and resuming execution.
	 * @param value The value to yield, it will be passed to the next method, can be omitted.
	 * @returns
	 */
	public next(...args: [] | [TNext]): IteratorResult<T, TReturn> {
		// If the generator has already ended, we return undefined.
		if (this.iteratorResult?.done) {
			return this.iteratorResult as IteratorReturnResult<TReturn>
		} else {
			if (args.length > 0) {
				this.nextFuture.resolve(args[0]!)
			}
			return this.iteratorResult as IteratorYieldResult<T>
		}
	}

	/**
	 * The return() method allows early termination of the generator, optionally providing a final value.
	 * @param value The value to return.
	 * @returns { value, done: true }
	 */
	public return(value: TReturn): IteratorResult<T, TReturn> {
		this.iteratorResult = { value, done: true }
		return this.iteratorResult
	}

	/**
	 * The throw() method can be used to inject an error into the generator, which can be caught and handled within the generator function
	 * @param e
	 * @returns { value: undefined, done: true }
	 */
	public throw(e: any): IteratorResult<T, TReturn> {
		// If the generator has already ended, we return undefined.
		if (this.iteratorResult?.done) {
			return this.iteratorResult as IteratorReturnResult<TReturn>
		} else {
			this.nextFuture.reject(e)
			return this.iteratorResult as IteratorYieldResult<T>
		}
	}

	public [Symbol.iterator](): globalThis.Generator<T, TReturn, TNext> {
		return this
	}
}

class Future<T> implements Promise<T> {
	private promise: Promise<T>
	public resolve: (value: T) => void = () => {}
	public reject: (reason?: any) => void = () => {}

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}

	[Symbol.toStringTag] = 'Future'
	then<TResult1 = T, TResult2 = never>(
		onfulfilled?:
			| ((value: T) => TResult1 | PromiseLike<TResult1>)
			| undefined
			| null,
		onrejected?:
			| ((reason: any) => TResult2 | PromiseLike<TResult2>)
			| undefined
			| null,
	): Promise<TResult1 | TResult2> {
		return this.promise.then(onfulfilled, onrejected)
	}

	catch<TResult = never>(
		onrejected?:
			| ((reason: any) => TResult | PromiseLike<TResult>)
			| undefined
			| null,
	): Promise<T | TResult> {
		return this.promise.catch(onrejected)
	}

	finally(onfinally?: (() => void) | undefined | null): Promise<T> {
		return this.promise.finally(onfinally)
	}
}
