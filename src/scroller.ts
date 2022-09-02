import Scene, { DefaultSceneConfig, type SceneConfig } from "./scene";
import { lockScroll, p2n, type Percent, unlockScroll } from "./utils";
import { type Deferred, deferred } from "./deferred";

type ScrollDirection = "forward" | "reverse" | "paused";

const doc = self.document;

export default class Scroller {
  #el?: HTMLElement;
  #scenes = new Set<Scene>();
  #prevScrollTop?: number;
  #locker?: [timer: number, future: Deferred<void>];

  scrollTop?: number;
  direction?: ScrollDirection;

  get clientHeight(): number {
    return self.innerHeight || doc.documentElement.clientHeight;
  }

  get locked(): boolean {
    return !!this.#locker;
  }

  get el(): HTMLElement {
    return this.#el || doc.body;
  }

  #update() {
    // #region updateScrollTop

    this.#prevScrollTop = this.scrollTop;
    this.scrollTop = self.scrollY;

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

  scrollTo(n: Percent | number, cfg: ScrollOptions = {}): void {
    if (typeof n === "string") {
      n = p2n(n);
    }

    // TODO: Scroller can be a part of the page.
    if (this.#el === undefined) {
      self.scrollTo({ top: n, ...cfg });
    }
    this.#update();
  }

  lock(duration?: number): Promise<void> {
    if (this.#locker) {
      this.unlock();
    }
    const future = deferred<void>();
    const currentScrollTop = this.scrollTop;
    lockScroll(this.el);
    let ticking = false;
    this.#locker = [
      setInterval(() => {
        if (!ticking) {
          self.requestAnimationFrame(() => {
            this.scrollTo(currentScrollTop);
            ticking = false;
          });
          ticking = true;
        }
      }, 0),
      future,
    ];
    if (duration) {
      setTimeout(this.unlock.bind(this), duration);
    }
    return future;
  }
  unlock(): void {
    unlockScroll(this.el);
    if (this.#locker) {
      clearInterval(this.#locker[0]);
      this.#locker[1].resolve();
      this.#locker = undefined;
    }
  }
}
