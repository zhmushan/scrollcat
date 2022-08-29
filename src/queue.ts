import { type Deferred, deferred } from "./deferred";

export default class Queue<T> {
  #list: Array<Deferred<T>>;
  #limit: number;
  #top = 0;
  #bottom = 0;
  #freed = false;

  #move(n: number): number {
    return n === this.#limit ? 0 : n + 1;
  }

  constructor(limit = 1024) {
    this.#limit = limit;
    this.#list = new Array(limit + 100);
    this.#list[0] = deferred();
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    for (; !this.#freed;) {
      yield this.pop();
    }
  }

  pop(): Deferred<T> {
    const dataDeferred = this.#list[this.#top];
    this.#top = this.#move(this.#top);
    return dataDeferred;
  }

  push(data: T): void {
    this.#list[this.#bottom].resolve(data);
    this.#bottom = this.#move(this.#bottom);
    this.#list[this.#bottom] = deferred();
  }

  free(): void {
    this.#freed = true;
    this.#list[this.#bottom].resolve();
  }
}
