import { type Deferred, deferred } from "./deferred";

export default class Queue<T> {
  #list: Array<Deferred<T>>;
  #limit: number;
  #top = 0;
  #bottom = 0;
  #destroyed = false;

  #move(n: number): number {
    return n === this.#limit ? 0 : n + 1;
  }

  constructor(limit = 1024) {
    this.#limit = limit;
    this.#init();
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    for (; !this.#destroyed;) {
      yield this.pop();
    }
  }

  #init() {
    this.#list = new Array(this.#limit + 100);
    this.#list[0] = deferred();
    this.#top = this.#bottom = 0;
  }

  pop(): Deferred<T> {
    const dataDeferred = this.#list[this.#top];
    this.#top = this.#move(this.#top);
    return dataDeferred;
  }

  push(data: T) {
    this.#list[this.#bottom].resolve(data);
    this.#bottom = this.#move(this.#bottom);
    this.#list[this.#bottom] = deferred();
  }

  refresh() {
    this.#init();
  }

  destroy() {
    if (!this.#destroyed) {
      this.#destroyed = true;
      this.#list[this.#bottom].resolve();
    }
  }
}
