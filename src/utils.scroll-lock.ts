import { ScrollKeys } from "./consts";

function preventDefault(e: Event): void {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e: KeyboardEvent) {
  if (ScrollKeys[e.key]) {
    preventDefault(e);
    return false;
  }
}

const wheelOpt = { passive: false };
const wheelEvent = "onwheel" in document.createElement("div")
  ? "wheel"
  : "mousewheel";

export const lockScroll = (el: HTMLElement) => {
  el.addEventListener("DOMMouseScroll", preventDefault, false);
  el.addEventListener(wheelEvent, preventDefault, wheelOpt);
  el.addEventListener("touchmove", preventDefault, wheelOpt);
  el.addEventListener("keydown", preventDefaultForScrollKeys, false);
};

export const unlockScroll = (el: HTMLElement) => {
  el.removeEventListener("DOMMouseScroll", preventDefault, false);
  el.removeEventListener(wheelEvent, preventDefault, false);
  el.removeEventListener("touchmove", preventDefault, false);
  el.removeEventListener("keydown", preventDefaultForScrollKeys, false);
};
