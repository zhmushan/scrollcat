import Scene, { DefaultSceneConfig, type SceneConfig } from "./scene";

type ScrollDirection = "forward" | "reverse" | "paused";

const doc = window.document;

export default class Scroller {
  #el?: HTMLElement;
  #scenes = new Map<HTMLElement, Scene>();
  #prevScollY: number;

  scrollY: number;
  direction: ScrollDirection;

  get clientHeight(): number {
    return window.innerHeight || doc.documentElement.clientHeight;
  }

  #update() {
    // #region updateScrollY

    this.#prevScollY = this.scrollY;
    this.scrollY = typeof this.#el?.scrollTop === "number"
      ? this.#el.scrollTop
      : window.scrollY;

    if (!this.#prevScollY) {
      this.#prevScollY = this.scrollY;
    }

    // #endregion updateScrollY

    // #region updateDirection

    const delta = this.scrollY - this.#prevScollY;
    this.direction = delta > 0 ? "forward" : delta < 0 ? "reverse" : "paused";

    // #endregion updateDirection

    for (const [, scene] of this.#scenes) {
      scene.update();
    }
  }

  destory: () => void;

  constructor(el?: HTMLElement) {
    this.#el = el;

    const update = () => {
      this.#update();
    };
    doc.addEventListener("scroll", update);
    this.destory = () => {
      doc.removeEventListener("scroll", update);
    };
  }

  addScene(el: HTMLElement, cfg: SceneConfig): Scene {
    const scene = new Scene(this, el, cfg);
    this.#scenes.set(el, scene);
    return scene;
  }

  addSceneWithDefault(el: HTMLElement): Scene {
    return this.addScene(el, DefaultSceneConfig);
  }
}
