import { Scroller } from "https://unpkg.com/scrollcat";

const life = new Scroller(document.body);
catchScene(document.querySelector("#a"));
catchScene(document.querySelector("#b"));

async function catchScene(el) {
  const scene = life.addSceneWithDefault(el);

  for await (const [type, event] of scene.emitter) {
    const { progress, target } = event;
    if (type !== "update") {
      console.log(type, event);
    }
    target.textContent = `${(progress * 100).toFixed(2)}%`;
  }
}
