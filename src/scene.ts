import type Scroller from "./scroller";
import Queue from "./queue";
import { p2n, type Percent } from "./utils";

export type SceneState = "before" | "after" | "during";
export type SceneEventType = "update" | "enter" | "leave";
export type SceneEvent = {
  target: HTMLElement;
  progress: number;
  scrollTop: number;
};
export type SceneEmitter = Queue<[SceneEventType, SceneEvent]>;

export interface SceneConfig {
  // Position to start playing this scene (relative to the viewport).
  play: number | Percent;

  // Relative to itself.
  duration: number | Percent;
}

export const DefaultSceneConfig: SceneConfig = {
  play: "100%",
  duration: "100%",
};

export default class Scene {
  #scroller: Scroller;
  #el: HTMLElement;
  #events = new Queue<[SceneEventType, SceneEvent]>();
  #eventsMap = new Map<SceneEventType, Set<(ev: SceneEvent) => void>>();
  #prevState?: SceneState;
  #state?: SceneState;
  #cfg: SceneConfig;
  #rect: DOMRect;
  #playStart: number;
  isActive = true;
  duration: number;
  get #stateChanged(): boolean {
    return this.#prevState !== this.#state;
  }
  get #isEnter(): boolean {
    if (this.#stateChanged) {
      const direction = this.#scroller.direction;
      return (
        (direction === "forward" && this.#prevState === "before") ||
        (direction === "reverse" && this.#prevState === "after")
      );
    }

    return false;
  }
  get #isLeave(): boolean {
    return this.#stateChanged && this.#prevState === "during";
  }

  get emitter(): SceneEmitter {
    return this.#events;
  }

  get scrollTop(): number {
    return this.#playStart - this.#rect.top;
  }

  get progress(): number {
    return this.scrollTop / this.duration;
  }

  get state(): SceneState {
    return this.#state!;
  }

  #preUpdate() {
    const clientHeight = this.#scroller.clientHeight;
    const rect = this.#rect = this.#el.getBoundingClientRect();
    const { top, bottom } = rect;

    // #region updatePlayAndDuration

    let playStart = this.#cfg.play;
    if (typeof playStart === "string") {
      playStart = clientHeight * p2n(playStart);
    }
    this.#playStart = playStart;

    let duration = this.#cfg.duration;
    if (typeof duration === "string") {
      duration = (bottom - top) * p2n(duration);
    }
    this.duration = duration;

    // #endregion updatePlayAndDuration

    // #region updateState

    this.#prevState = this.#state;

    const newState: SceneState =
      (top <= playStart && (top + duration) >= playStart)
        ? "during"
        : top < playStart
        ? "after"
        : "before";
    if (!this.#state) {
      this.#prevState = newState;
    }
    this.#state = newState;

    // #endregion updateState
  }

  #trigger(type: SceneEventType, event: SceneEvent): void {
    this.#events.push([type, event]);
    const cbs = this.#eventsMap.get(type);
    if (cbs) {
      for (const cb of cbs) {
        cb(event);
      }
    }
  }

  constructor(scroller: Scroller, el: HTMLElement, cfg: SceneConfig) {
    this.#scroller = scroller;
    this.#el = el;
    this.#cfg = cfg;
    this.#preUpdate();
  }

  update() {
    this.#preUpdate();
    const event: SceneEvent = {
      target: this.#el,
      scrollTop: this.scrollTop,
      progress: this.progress,
    };
    this.#trigger("update", event);
    if (this.#isEnter) {
      this.#trigger("enter", event);
    } else if (this.#isLeave) {
      this.#trigger("leave", event);
    }
  }

  removeSelf() {
    this.#events.destroy();
    this.#scroller.removeScene(this);
  }

  scrollTo(n: Percent | number, cfg?: ScrollOptions) {
    if (typeof n === "string") {
      n = this.duration * p2n(n);
    }
    this.#scroller.scrollTo(this.#el.offsetTop - this.#playStart + n, cfg);
  }

  on(eventType: SceneEventType, cb: (ev: SceneEvent) => void) {
    let cbs = this.#eventsMap.get(eventType);
    if (!cbs) {
      cbs = new Set();
      this.#eventsMap.set(eventType, cbs);
    }
    cbs.add(cb);
  }

  off(eventType: SceneEventType, cb?: (ev: SceneEvent) => void) {
    const cbs = this.#eventsMap.get(eventType);
    if (!cbs?.size) {
      return;
    }

    if (cb) {
      cbs.delete(cb);
    } else {
      cbs.clear();
    }
  }

  once(eventType: SceneEventType, cb: (ev: SceneEvent) => void) {
    const handler = (ev: SceneEvent) => {
      cb(ev);
      this.off(eventType, handler);
    };

    this.on(eventType, handler);
  }
}
