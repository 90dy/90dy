
export class Future<T> implements Promise<T> {
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
