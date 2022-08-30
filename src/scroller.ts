import Scene, { DefaultSceneConfig, type SceneConfig } from "./scene";
import { lockScroll, p2n, type Percent, unlockScroll } from "./utils";

type ScrollDirection = "forward" | "reverse" | "paused";

const doc = window.document;

export default class Scroller {
  #el?: HTMLElement;
  #scenes = new Set<Scene>();
  #prevScrollTop?: number;
  #locker?: number;

  scrollTop?: number;
  direction?: ScrollDirection;

  get clientHeight(): number {
    return window.innerHeight || doc.documentElement.clientHeight;
  }

  get locked(): boolean {
    return !!this.#locker;
  }

  #update() {
    // #region updateScrollTop

    this.#prevScrollTop = this.scrollTop;
    this.scrollTop = typeof this.#el?.scrollTop === "number"
      ? this.#el.scrollTop
      : window.scrollY;

    if (!this.#prevScrollTop) {
      this.#prevScrollTop = this.scrollTop;
    }

    // #endregion updateScrollTop

    // #region updateDirection

    const delta = this.scrollTop - this.#prevScrollTop;
    this.direction = delta > 0 ? "forward" : delta < 0 ? "reverse" : "paused";

    // #endregion updateDirection

    for (const scene of this.#scenes) {
      if (scene.isActive) {
        scene.update();
      }
    }
  }

  destroy: () => void;

  constructor(el?: HTMLElement) {
    this.#el = el;

    doc.addEventListener("scroll", this.#update.bind(this));
    this.destroy = () => {
      doc.removeEventListener("scroll", this.#update.bind(this));
      this.unlock();
    };
  }

  addScene(el: HTMLElement, cfg: SceneConfig): Scene {
    const scene = new Scene(this, el, cfg);
    this.#scenes.add(scene);
    return scene;
  }

  addSceneWithDefault(el: HTMLElement): Scene {
    return this.addScene(el, DefaultSceneConfig);
  }

  removeScene(scene: Scene): void {
    if (this.#scenes.has(scene)) {
      this.#scenes.delete(scene);
      scene.removeSelf();
    }
  }

  scrollTo(n: Percent | number): void {
    if (typeof n === "string") {
      n = p2n(n);
    }
    if (this.#el === undefined) {
      window.scrollTo({ top: n });
    }
  }

  lock(duration?: number): void {
    if (this.#locker) {
      this.unlock();
    }
    const currentScrollTop = this.scrollTop;
    lockScroll(this.#el || doc.body);
    this.#locker = setInterval(() => {
      this.scrollTo(currentScrollTop);
    }, 0);
    if (duration) {
      setTimeout(this.unlock.bind(this), duration);
    }
  }
  unlock(): void {
    unlockScroll(this.#el || doc.body);
    if (this.#locker) {
      clearInterval(this.#locker);
      this.#locker = undefined;
    }
  }
}
